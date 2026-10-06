import {WORLD,PLACES,SCALE,distance as dist,inside,segmentDistance,roadRoute,snap} from './city-data.js?v=0.17.1';
import {layout,contains,crossing,local,STRIKES,ENEMY_REACH} from './encounters.js?v=0.17.1';
export {WORLD};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const turn=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
const solid=(p,b)=>inside(p,b.poly)&&!(b.holes||[]).some(h=>inside(p,h));
export const CONTRACTS=[
  {id:'witness',type:'rescue',title:'Bring the witness home',from:'jantar',to:'cp',reward:2,story:'Kabir carries testimony from the gathering. Get him out, keep the account safe, and build a route back to the network.'},
  {id:'signal',type:'courier',title:'Restore the signal',from:'tolstoy',to:'gate',reward:2,story:'Sana’s dispatch must reach a volunteer relay. Route choice and losing pursuit matter more than knocking everyone down.'},
  {id:'hold',type:'rally',title:'Hold the gathering',from:'sansad',to:'jantar',reward:3,story:'Reach the gathering and hold its space while people regroup. Resistance means preserving a place where accounts can be heard.'},
  {id:'charter',type:'courier',title:'Replacement is not repair',from:'gate',to:'jantar',reward:4,story:'The charter demands Gyanesh Kumar’s departure through constitutional processes, an end to contested SIR, and transparent inclusion support for every eligible voter. Carry it back to the assembly.'},
];
export class City{
  constructor(){
    this.network={completed:[],credits:0,total:0,bests:{},upgrades:[],cycle:1};this.serial=0;this.reset();
  }
  reset(){
    const p=snap(PLACES[1]);
    this.mode='menu';this.time=0;this.player={...p,yaw:Math.PI,health:6,stamina:100,hurt:0,dash:0,dashCd:0,attack:0,attackCd:0,combo:0,comboClock:0,vx:0,vz:0,speed:0};
    this.van={x:p.x+1,z:p.z,yaw:Math.PI,speed:0,health:100,hurt:0,occupied:false};
    this.friend={...snap(PLACES[0]),rescued:false,aboard:false};this.record=false;
    this.gate={x:0,z:0,w:8,hp:0,fall:1};this.block={x:0,z:0};
    this.enemies=Array.from({length:5},(_,id)=>({id,x:0,z:0,yaw:0,hp:0,stun:0,windup:0,cooldown:1,route:[],routeAge:0,last:{x:0,z:0},home:{x:0,z:0},down:1}));
    this.car={x:0,z:0,yaw:0,speed:0,active:false,route:[],routeAge:0,windup:0,ram:0,cooldown:1.5,contactCooldown:0,recoil:0,attackYaw:0};
    this.heat=0;this.hidden=0;this.seen=false;this.lastSeen={...p};this.phase='clear';this.roadblock=false;
    this.supplies=WORLD.medkits.map(p=>({...p,taken:false}));this.score=0;this.hits=0;this.crashes=0;this.helped=0;this.message='';this.messageTime=0;this.particles=[];this.checkpoint=null;
    this.input={x:0,z:0,aimX:0,aimZ:-1,sprint:false,attack:false,brake:false};
    this.mission=null;this.hold=0;this.wave=0;this.elapsed=0;this.result=null;this.visited=[];this.discoveries=0;this.readers=[];this.copy=0;this.hitStop=0;this.encounter=layout(null);this.props=[];this.noise=null;
    this.supports=[{id:'cp',...PLACES[1],used:false},{id:'jantar',x:PLACES[0].x-7,z:PLACES[0].z+8,used:false},{id:'gate',x:PLACES[2].x+7,z:PLACES[2].z-8,used:false}];
  }
  start(){
    this.reset();this.mode='playing';
    const source=this.place('jantar'),p=snap({x:source.x-9,z:source.z-12});
    let v=snap({x:source.x-14,z:source.z-16},true);
    const clear=q=>!WORLD.buildings.some(b=>solid(q,b)||b.poly.some((a,i)=>segmentDistance(q,a,b.poly[(i+1)%b.poly.length])<2.5));
    if(!clear(v)){const candidate=WORLD.nodes.filter(n=>n.drive&&dist(n,p)<35).sort((a,b)=>dist(a,p)-dist(b,p)).find(clear);if(candidate)v={x:candidate.x,z:candidate.z};}
    Object.assign(this.player,p);Object.assign(this.van,v,{yaw:0});
    this.say('Aman: Kabir is inside the cordon. We get him out together. Move, strike in short combos, dodge the red tell.',6);
  }
  place(id){const p=PLACES.find(p=>p.id===id);return snap(id==='jantar'?{x:p.x-15,z:p.z-3}:p);}
  accept(id,style='balanced'){
    const spec=CONTRACTS.find(c=>c.id===id);if(!spec||id==='charter'&&this.network.completed.length<3)return false;
    if(this.mission)return false;
    this.serial++;this.mission={...spec,style,source:this.place(spec.from),destination:this.place(spec.to),variant:this.serial%3,tier:Math.min(3,this.network.cycle),started:this.time};
    this.elapsed=0;this.result=null;this.score=0;this.hits=0;this.crashes=0;this.hold=0;this.wave=0;this.copy=0;this.readers=[];this.record=false;this.friend.rescued=false;this.friend.aboard=false;this.supports.forEach(s=>s.used=false);
    this.friend.x=this.mission.source.x;this.friend.z=this.mission.source.z;
    WORLD.record={...this.mission.source};WORLD.safe={...this.mission.destination};
    const source=this.mission.source;
    this.encounter=layout(this.mission);this.props=this.encounter.props;
    // A new operation must not materialise furniture through a parked vehicle
    // or the player. Preserve the authored layout except for the conflicting prop.
    for(const o of this.props)if(contains(this.van,o,1.4)||contains(this.player,o,.7)){
      const candidates=[];
      for(let r=2;r<=10;r+=2)for(let i=0;i<16;i++){
        const angle=i*Math.PI/8,q={...o,x:o.x+Math.sin(angle)*r,z:o.z+Math.cos(angle)*r};
        if(!contains(this.van,q,1.4)&&!contains(this.player,q,.7)&&dist(q,source)>2.2&&this.valid(q.x,q.z,.7,true,o.id)&&!this.props.some(b=>b!==o&&contains(q,b,1.5)))candidates.push(q);
      }
      if(candidates.length){o.x=candidates[0].x;o.z=candidates[0].z;}
    }
    this.gate={x:source.x,z:source.z-3,w:6,hp:spec.type==='rescue'?3:0,fall:spec.type==='rescue'?0:1};
    const returnRoute=roadRoute(snap(source,true),snap(this.mission.destination,true),{vehicle:true});
    this.block={...returnRoute[Math.floor(returnRoute.length*.45)]};this.roadblock=false;this.blockActivated=false;
    this.mission.zones=this.encounter.zones||[source,snap({x:source.x+14,z:source.z-6}),snap({x:source.x-14,z:source.z+9})];
    this.spawn(source,spec.type==='rally'?3:spec.type==='rescue'?this.network.total?4:3:3);
    Object.assign(this.car,{active:false,windup:0,ram:0,cooldown:1.5,contactCooldown:0,recoil:0});this.heat=0;this.checkpoint=null;this.mode='playing';
    this.say(this.encounter.hint,7);return true;
  }
  spawn(p,count){
    this.enemies.forEach((e,i)=>{
      const angle=(i+.5)*Math.PI*2/count+this.serial*.7,q=snap({x:p.x+Math.sin(angle)*10,z:p.z+Math.cos(angle)*10});
      const authored=this.encounter.stages?.[this.wave]?.[i]||(this.wave===0?this.encounter.guards?.[i]:null);
      const role=authored?.role||['guard','rush','flank','brawler','rush'][i],hp=role==='guard'?4:3;
      let home=authored?{x:authored.x,z:authored.z}:q;
      if(!this.valid(home.x,home.z,.4)){
        const options=[];for(let x=-5;x<=5;x++)for(let z=-5;z<=5;z++)if(this.valid(home.x+x,home.z+z,.4))options.push({x:home.x+x,z:home.z+z});
        home=options.sort((a,b)=>dist(a,home)-dist(b,home))[0]||home;
      }
      Object.assign(e,{...home,hp:i<count?hp:0,maxHp:hp,role,active:i<count,stun:0,windup:0,windupTotal:0,guardBreak:0,lunge:0,attackYaw:0,cooldown:1.8+i*.15,route:[],routeAge:0,home:{...home},last:{...home},down:0,recovery:0,strikeTime:0,strikeDuration:0,strikeHit:false,state:role==='guard'?'hold':'patrol',regroup:0});
    });
  }
  say(t,seconds=3){this.message=t;this.messageTime=seconds;}
  valid(x,z,r=.38,ignoreGate=false,ignoreProp=null){
    if(x<-124+r||x>138-r||z<-174+r||z>207-r)return false;
    const p={x,z};
    // Road widths are expanded for mobile play. OSM footprints still block off-road movement.
    if(!WORLD.segments.some(s=>(r<=1||!s.walkOnly)&&segmentDistance(p,s.a,s.b)<s.width/2-r*.3)){
      for(const b of WORLD.buildings)if(Math.abs(b.x-x)<30&&Math.abs(b.z-z)<30&&(solid(p,b)||[b.poly,...b.holes].some(h=>h.some((a,i)=>segmentDistance(p,a,h[(i+1)%h.length])<r))))return false;
    }
    if(this.props.some(o=>o.id!==ignoreProp&&contains(p,o,r)))return false;
    if(!ignoreGate&&this.gate.hp>0&&Math.abs(x-this.gate.x)<this.gate.w/2+r&&Math.abs(z-this.gate.z)<.45+r)return false;
    if(!ignoreGate&&this.roadblock&&Math.abs(x-this.block.x)<4+r&&Math.abs(z-this.block.z)<.5+r)return false;
    return true;
  }
  line(a,b,opaqueOnly=true){
    if(this.props.some(o=>(!opaqueOnly||o.height>1.2)&&crossing(a,b,o)))return false;
    // Buildings occlude vision, including when arcade-width streets overlap a footprint.
    for(const house of WORLD.buildings){
      if(Math.min(dist(a,house),dist(b,house))>60)continue;
      const n=Math.ceil(dist(a,b)/2);
      for(let i=1;i<n;i++)if(solid({x:a.x+(b.x-a.x)*i/n,z:a.z+(b.z-a.z)*i/n},house))return false;
    }
    if(!opaqueOnly){const n=Math.ceil(dist(a,b));for(let i=1;i<n;i++)if(!this.valid(a.x+(b.x-a.x)*i/n,a.z+(b.z-a.z)*i/n,.1))return false;}
    return true;
  }
  route(a,b,vehicle=false){return roadRoute(a,b,{vehicle});}
  move(e,dx,dz,r=.38){
    const x=e.x,z=e.z;
    if(this.valid(x+dx,z,r))e.x+=dx;if(this.valid(e.x,z+dz,r))e.z+=dz;
    return Math.hypot(e.x-x,e.z-z);
  }
  chase(e,target,dt,speed,r=.4){
    if(dist(e,target)>50)return 0;
    e.routeAge=(e.routeAge||0)-dt;
    const direct=this.line(e,target,false);
    if(!direct&&(!e.route?.length||e.routeAge<=0)){e.route=this.route(e,target,r>1);e.routeAge=2;}
    const n=direct?target:e.route?.[0];if(!n)return 0;
    const d=dist(e,n),step=Math.min(d,speed*dt);e.yaw=Math.atan2(n.x-e.x,n.z-e.z);
    let travel=this.move(e,(n.x-e.x)/Math.max(d,.001)*step,(n.z-e.z)/Math.max(d,.001)*step,r);
    // A local obstacle is not a graph edge. Try a consistent side around it.
    if(travel<step*.25&&d>1){
      for(const angle of [e.id%2===0?.9:-.9,e.id%2===0?-.9:.9,1.7,-1.7]){
        const yaw=e.yaw+angle,dx=Math.sin(yaw)*step,dz=Math.cos(yaw)*step;
        if(this.valid(e.x+dx*4,e.z+dz*4,r)){travel+=this.move(e,dx,dz,r);break;}
      }
    }
    if(d<1)e.route?.shift();return travel;
  }
  burst(x,z,color='gold',count=8){for(let i=0;i<count;i++)this.particles.push({x,z,y:.8,vx:Math.sin(i*2.399)*2.5,vz:Math.cos(i*2.399)*2.5,vy:2+i%3,life:.55,color});}
  attack(){
    const p=this.player;if(this.mode!=='playing'||p.attackCd>0||p.traversal||this.van.occupied||p.dash>0)return false;
    const combo=p.comboClock>0?p.combo%3+1:1,move=STRIKES[combo-1],cost=move.cost;
    if(p.stamina<cost+18){if(this.message!=='Dodge energy reserved. Release Strike and reposition to recover.')this.say('Dodge energy reserved. Release Strike and reposition to recover.',1.6);return false;}
    p.combo=combo;p.comboClock=1.2;p.stamina-=cost;
    const tempo=this.network.upgrades.includes('tempo')?.9:1;
    p.swing={clip:move.clip,time:0,duration:move.duration*tempo,contact:move.contact*tempo,reach:move.reach,advance:0,hit:false,combo};
    p.attack=p.swing.duration;p.attackCd=p.swing.duration+.06;p.yaw=p.attackYaw=Math.atan2(this.input.aimX,this.input.aimZ);this.hits++;
    return true;
  }
  contact(){
    const p=this.player,swing=p.swing;if(!swing||swing.hit)return;
    swing.hit=true;
    let hit=false;p.contactKind='miss';
    for(const e of this.enemies)if(e.hp>0&&dist(p,e)<swing.reach&&this.line(p,e,false)&&Math.abs(turn(p.attackYaw,Math.atan2(e.x-p.x,e.z-p.z)))<.85){
      const frontal=Math.abs(turn(e.yaw,Math.atan2(p.x-e.x,p.z-e.z)))<1;
      if(e.role==='guard'&&frontal&&p.combo<3&&e.guardBreak<=0){
        hit=true;p.contactKind='shield';this.burst(e.x,e.z,'gold',5);this.say('Shield facing you: flank it or finish a three-strike combo.',1.5);continue;
      }
      e.hp=Math.max(0,e.hp-(swing.combo===3?2:1));e.stun=swing.combo===3?1.1:.4;e.windup=0;e.lunge=0;e.strikeDuration=0;e.cooldown=.9;e.guardBreak=swing.combo===3?1.5:e.guardBreak;e.state='stagger';
      this.move(e,Math.sin(p.attackYaw)*(swing.combo===3?1.3:.4),Math.cos(p.attackYaw)*(swing.combo===3?1.3:.4));hit=true;p.contactKind='body';this.hitStop=.045;this.burst(e.x,e.z,'teal',swing.combo===3?12:7);this.heat=Math.max(1,this.heat+.15);
      if(e.hp<=0){this.score+=60;for(const ally of this.enemies)if(ally!==e&&ally.hp>0&&dist(ally,e)<9){ally.regroup=1.4;ally.cooldown=Math.max(ally.cooldown,1.4);}}
    }
    const edge=this.gateContact();
    if(this.gate.hp>0&&dist(p,edge)<swing.reach&&Math.abs(turn(p.attackYaw,Math.atan2(edge.x-p.x,edge.z-p.z)))<.85){this.gate.hp--;hit=true;p.contactKind='barrier';this.burst(edge.x,edge.z);if(!this.gate.hp){this.score+=100;for(const e of this.enemies)if(e.hp>0&&dist(e,this.gate)<5){e.stun=1.2;e.guardBreak=1.3;}this.say('Front line opened. The guard is off balance: get Kabir clear.');}}
    if(this.roadblock&&dist(p,this.block)<5){this.roadblock=false;hit=true;this.burst(p.x,p.z);this.say('Roadblock opened.');}
    if(!hit&&this.messageTime<=0)this.say('Close the gap. Dodge as the red tell fills.',1);
    p.contactSerial=(p.contactSerial||0)+1;p.contactHit=hit;
  }
  dash(){
    const p=this.player;if(this.mode!=='playing'||p.traversal||this.van.occupied||p.dashCd>0||p.stamina<18)return false;
    const m=Math.hypot(this.input.x,this.input.z);p.dashX=m>.1?this.input.x/m:Math.sin(p.yaw);p.dashZ=m>.1?this.input.z/m:Math.cos(p.yaw);
    p.dash=.27;p.dashCd=.95;p.stamina-=18;p.attack=0;p.swing=null;p.attackCd=Math.min(.16,p.attackCd);
    for(const e of this.enemies)if(e.hp>0&&dist(e,p)<5&&e.windup>0&&e.windup<.32){e.windup=0;e.lunge=0;e.stun=1.3;e.guardBreak=1.5;e.cooldown=2;this.score+=20;this.say('Clean evasion. Their guard is open.',1.8);}
    this.burst(p.x,p.z,'teal',7);return true;
  }
  assistedTarget(){
    const p=this.player,enemy=this.enemies.filter(e=>e.hp>0&&dist(e,p)<3.2&&this.line(p,e,false)).sort((a,b)=>dist(a,p)-dist(b,p))[0];
    const gate=this.gate.hp>0&&dist(p,this.gateContact())<2?this.gateContact():null;
    return gate&&(!enemy||dist(p,gate)<dist(p,enemy))?gate:enemy;
  }
  gateContact(){return{x:clamp(this.player.x,this.gate.x-this.gate.w/2,this.gate.x+this.gate.w/2),z:this.gate.z};}
  nearby(){
    if(this.van.occupied)return{id:'exit',label:'EXIT VAN'};
    if(this.player.traversal)return null;
    if(this.mission?.type==='courier'&&!this.record&&dist(this.player,this.mission.source)<3)return{id:'copy',label:'HOLD · COPY DISPATCH'};
    if(this.mission?.type==='rally'&&this.wave===1&&dist(this.player,this.mission.zones[1])<4)return{id:'aid',label:'HOLD · RESTORE AID'};
    if(this.mission?.type==='rescue'&&!this.friend.rescued&&dist(this.player,this.friend)<3.2)return{id:'rescue',label:'RESCUE KABIR'};
    if(dist(this.player,this.van)<4.2)return{id:'van',label:'ENTER VAN'};
    const o=this.props.filter(o=>contains(this.player,o,1.4)&&Math.abs(turn(this.player.yaw,Math.atan2(o.x-this.player.x,o.z-this.player.z)))<1.4).sort((a,b)=>dist(a,this.player)-dist(b,this.player))[0];
    if(o)return{id:o.kind==='screen'?'screen':'vault',prop:o.id,label:o.kind==='screen'?'MOVE BANNER SCREEN':'VAULT · SIDE ROUTE'};
    const support=this.supports.find(s=>!s.used&&dist(s,this.player)<3.5);
    if(support)return{id:'support',label:'VOLUNTEER SUPPORT',support:support.id};
    return null;
  }
  interact(){
    if(this.mode!=='playing')return;
    const p=this.player,v=this.van;
    if(v.occupied){
      for(const side of[-1,1]){const x=v.x+Math.cos(v.yaw)*2.3*side,z=v.z-Math.sin(v.yaw)*2.3*side;if(this.valid(x,z)){v.occupied=false;v.speed=0;p.x=x;p.z=z;this.friend.aboard=false;if(this.friend.rescued){this.friend.x=x+1;this.friend.z=z+1;}this.say('On foot. Your van stays here.');return;}}
      this.say('Move away from the wall to exit.');return;
    }
    const n=this.nearby();
    if(n?.id==='vault'){this.vault(this.props.find(o=>o.id===n.prop));return;}
    if(n?.id==='screen'){
      const o=this.props.find(o=>o.id===n.prop),next={x:o.x-Math.sin(o.yaw)*3.3*(o.shift?-1:1),z:o.z-Math.cos(o.yaw)*3.3*(o.shift?-1:1)};
      if(!this.valid(next.x,next.z,.2,true,o.id)){this.say('The screen cannot move into this wall.');return;}
      p.yaw=Math.atan2(o.x-p.x,o.z-p.z);
      p.traversal={kind:'Help',time:0,duration:.7,from:{x:p.x,z:p.z},to:{x:p.x,z:p.z},prop:o.id,push:{from:{x:o.x,z:o.z},to:next},shift:!o.shift};
      p.swing=null;p.attack=0;this.noise={x:o.x,z:o.z,remaining:4};this.say('Screen moving. It blocks sight; guards investigate the sound.',3);return;
    }
    if(n?.id==='support'){
      const s=this.supports.find(s=>s.id===n.support);if(this.seen||this.heat>=.7){this.say('Break sight first. Do not bring pursuit into this space.');return;}
      s.used=true;p.health=Math.min(6,p.health+2);p.stamina=100;this.van.health=Math.min(100,this.van.health+35);this.score+=40;this.say('Volunteers restore condition and repair your van. This stop is used for this operation.',4);return;
    }
    if(n?.id==='rescue'){
      if(this.enemies.some(e=>e.hp>0&&dist(e,this.friend)<4.5)){this.say('Interrupt the guards or draw them away before the rescue.');return;}
      this.friend.rescued=true;this.record=true;this.score+=250;p.health=Math.min(6,p.health+1);this.saveCheckpoint();this.say('Kabir: I can speak for myself. Get us to the CP volunteers, not just out of this street.',5);return;
    }
    if(n?.id==='van'){
      if(this.friend.rescued&&dist(this.friend,v)>8){this.say('Kabir is behind. Wait or regroup.');return;}
      v.occupied=true;this.friend.aboard=this.friend.rescued;
      if(this.record&&(this.heat>=.7||!this.blockActivated)){this.car.active=true;const q=snap({x:v.x-Math.sin(v.yaw)*20,z:v.z-Math.cos(v.yaw)*20});Object.assign(this.car,q,{route:[],routeAge:0});this.heat=Math.max(2,this.heat);if(!this.blockActivated){this.roadblock=this.mission?.variant===2;this.blockActivated=true;}}
      this.saveCheckpoint();this.say(this.record?'Route choice matters. Hide behind blocks to lose pursuit, then reach the green destination.':'Drive to the gold mission marker. You can exit and explore anywhere.',4);
    }
  }
  vault(o){
    const p=this.player;if(!o||p.traversal||p.stamina<12)return false;
    const q=local(p,o),side=q.z<0?-1:1,c=Math.cos(o.yaw),s=Math.sin(o.yaw),depth=o.d/2+1.1;
    const along=clamp(q.x,-o.w/2+.35,o.w/2-.35),to={x:o.x+along*c-depth*side*s,z:o.z-along*s-depth*side*c};
    // Crossing only this low prop is allowed; buildings, gates and other props remain solid.
    const steps=Math.ceil(dist(p,to)/.2);
    if(!this.valid(to.x,to.z,.4,false,o.id)||dist(p,to)>4||Array.from({length:steps},(_,i)=>({x:p.x+(to.x-p.x)*(i+1)/steps,z:p.z+(to.z-p.z)*(i+1)/steps})).some(q=>!this.valid(q.x,q.z,.4,false,o.id))){this.say('No clear landing here. Approach the long side of the furniture.');return false;}
    p.yaw=Math.atan2(to.x-p.x,to.z-p.z);p.stamina-=12;p.swing=null;p.attack=0;
    p.traversal={kind:'Vault',time:0,duration:.84,from:{x:p.x,z:p.z},to,prop:o.id};return true;
  }
  saveCheckpoint(){this.checkpoint={x:this.player.x,z:this.player.z,van:{...this.van},record:this.record,rescued:this.friend.rescued,gate:this.gate.hp,hold:this.hold,wave:this.wave,readers:this.readers.map(r=>({...r})),roadblock:this.roadblock,blockActivated:this.blockActivated,props:this.props.map(o=>({...o}))};}
  hurt(){const p=this.player;if(p.hurt>0||p.dash>0||this.mode!=='playing')return;p.health--;p.hurt=1.2;p.swing=null;p.attack=0;this.burst(p.x,p.z,'red',5);if(p.health<=0){this.mode='caught';this.say('Caught. Retry the checkpoint or try a different mission.');}else this.say('Red warning: dodge, interrupt, or use another route.',2);}
  carHit(amount){if(this.van.hurt>0)return;this.van.health=Math.max(0,this.van.health-amount*(this.network.upgrades.includes('reinforce')?.7:1));this.van.hurt=1;this.van.speed*=.3;this.crashes++;if(this.van.health<=0){this.mode='caught';this.say('Van disabled. Your earned network progress is safe.');}}
  readyWin(){
    const m=this.mission;if(!m)return false;
    if(m.type==='rally')return this.wave===2&&this.readers.length===2&&this.readers.every(r=>dist(r,m.destination)<6)&&dist(this.player,m.destination)<5&&!this.enemies.some(e=>e.hp>0&&dist(e,this.player)<4);
    return this.record&&dist(this.player,m.destination)<6&&this.heat<.7&&(!this.van.occupied||this.van.speed<4)&&(m.type!=='rescue'||this.friend.rescued&&(this.friend.aboard||dist(this.friend,m.destination)<8));
  }
  win(){
    if(this.mode!=='playing'||!this.mission)return;
    const m=this.mission;
    const medal=this.player.health>=5&&this.crashes===0?'GOLD':this.player.health>=3?'SILVER':'BRONZE';
    this.score=Math.round(this.score+this.player.health*100+this.van.health*2+Math.max(0,480-this.elapsed));
    this.network.total++;this.network.credits+=m.reward+(medal==='GOLD'?1:0);
    if(!this.network.completed.includes(m.id))this.network.completed.push(m.id);
    this.network.bests[m.id]=Math.max(this.network.bests[m.id]||0,this.score);
    if(m.id==='charter'){this.network.cycle++;this.network.completed=[];}
    this.result={title:m.title,medal,reward:m.reward,score:this.score,seconds:Math.round(this.elapsed),type:m.type};
    this.mode='won';this.say('The network grows. Choose another operation or explore the city.');
  }
  continue(){if(this.mode==='won'){this.mission=null;this.props=[];this.player.swing=null;this.player.traversal=null;this.player.height=0;this.record=false;this.friend.rescued=false;this.friend.aboard=false;this.car.active=false;this.enemies.forEach(e=>e.hp=0);this.heat=0;this.gate.hp=0;this.player.health=6;this.van.health=100;this.supplies.forEach(s=>s.taken=false);this.mode='playing';}}
  abandon(){const failed=this.mode==='caught'||this.player.health<=0||this.van.health<=0;this.mission=null;this.props=[];this.player.swing=null;this.player.traversal=null;this.player.height=0;this.readers=[];this.result=null;this.enemies.forEach(e=>e.hp=0);this.car.active=false;this.record=false;this.friend.rescued=false;this.friend.aboard=false;this.heat=0;this.gate.hp=0;this.roadblock=false;if(failed){this.player.health=6;this.player.stamina=100;this.van.health=100;this.van.speed=0;}this.mode='playing';}
  retry(){
    const m=this.mission,c=this.checkpoint;if(!m){this.start();return;}
    const spec=m.id,style=m.style;this.abandon();this.serial--;this.accept(spec,style);this.mission.variant=m.variant;
    this.player.health=6;this.van.health=100;this.player.hurt=2;
    this.player.swing=null;this.player.traversal=null;this.player.attack=0;
    if(c){this.player.x=c.x;this.player.z=c.z;Object.assign(this.van,c.van,{health:100,hurt:2,speed:0});this.record=c.record;this.friend.rescued=c.rescued;this.friend.aboard=c.rescued&&c.van.occupied;if(c.rescued){this.friend.x=c.x;this.friend.z=c.z;}this.gate.hp=c.gate;this.hold=c.hold;this.wave=c.wave||0;this.readers=(c.readers||[]).map(r=>({...r}));this.roadblock=c.roadblock;this.blockActivated=!!c.blockActivated;this.props=(c.props||this.props).map(o=>({...o}));this.checkpoint=c;if(this.wave)this.spawn(this.mission.zones[this.wave],m.style==='hard'||m.tier>1?3+this.wave:3);}
    if(c?.record&&c.van.occupied){
      this.car.active=true;Object.assign(this.car,snap({x:c.van.x-Math.sin(c.van.yaw)*20,z:c.van.z-Math.cos(c.van.yaw)*20}),{route:[],routeAge:0});
      this.heat=2;this.lastSeen={x:c.x,z:c.z};this.roadblock=c.roadblock;
    }
    this.say('Checkpoint restored. Earned upgrades remain. Try a different approach.');
  }
  upgrade(id){const prices={tempo:4,reinforce:4,stamina:3};if(!prices[id]||this.network.upgrades.includes(id)||this.network.credits<prices[id])return false;this.network.credits-=prices[id];this.network.upgrades.push(id);return true;}
  save(){return btoa(JSON.stringify({version:1,network:this.network}));}
  load(code){
    try{
      const s=JSON.parse(atob(code.trim())),n=s.network;
      if(s.version!==1||!n||!Array.isArray(n.completed)||!Array.isArray(n.upgrades)||!Number.isInteger(n.credits)||n.credits<0||n.credits>100000||!Number.isInteger(n.total)||n.total<0||!Number.isInteger(n.cycle)||n.cycle<1||n.cycle>1000||typeof n.bests!=='object')return false;
      const bests={};for(const c of CONTRACTS)if(Number.isFinite(n.bests[c.id])&&n.bests[c.id]>=0)bests[c.id]=n.bests[c.id];
      this.network={completed:[...new Set(n.completed.filter(id=>CONTRACTS.some(c=>c.id===id)))],upgrades:[...new Set(n.upgrades.filter(id=>['tempo','reinforce','stamina'].includes(id)))],credits:n.credits,total:n.total,cycle:n.cycle,bests};return true;
    }catch{return false;}
  }
  objective(){
    const m=this.mission;if(!m)return 'EXPLORE DELHI · open Missions to join the network';
    if(m.type==='rally')return this.wave===0?`SECURE THE GATHERING · ${Math.floor(this.hold)} / 8 s · keep guards outside the circle`:this.wave===1?`RESTORE THE AID POINT · hold Action · ${Math.round((this.hold-8)/8*100)}%`:'ESCORT THE READERS · stay on foot and bring both to the assembly';
    if(!this.record&&!this.van.occupied&&dist(this.player,m.source)>35&&dist(this.player,this.van)<6)return 'BOARD THE VAN · travel to '+PLACES.find(p=>p.id===m.from).name.toUpperCase();
    if(!this.record)return m.type==='rescue'?'REACH KABIR · short combos, flank shields, dodge the red tell':`COPY THE DISPATCH · hold Action at the gold marker · ${Math.round(this.copy/1.8*100)}%`;
    if(m.type==='rescue'&&!this.van.occupied)return 'REGROUP AT THE VAN · bring Kabir with you';
    if(this.heat>=.7)return this.seen?'BREAK SIGHT · use the city blocks':'STAY HIDDEN · let the search cool';
    return 'DELIVER TO '+PLACES.find(p=>p.id===m.to).name.toUpperCase();
  }
  target(){return this.mission?(this.mission.type==='rally'?this.wave===2?this.mission.destination:this.mission.zones[this.wave]:!this.record?this.mission.source:this.mission.type==='rescue'&&!this.van.occupied?this.van:this.mission.destination):PLACES[0];}
  update(dt){
    if(this.mode!=='playing')return;dt=Math.min(.05,dt);this.time+=dt;if(this.mission)this.elapsed+=dt;this.messageTime=Math.max(0,this.messageTime-dt);
    const p=this.player,v=this.van,i=this.input,mag=Math.min(1,Math.hypot(i.x,i.z)),dx=i.x/Math.max(1,Math.hypot(i.x,i.z)),dz=i.z/Math.max(1,Math.hypot(i.x,i.z));
    for(const k of['hurt','dash','dashCd','attack','attackCd','comboClock'])p[k]=Math.max(0,p[k]-dt);v.hurt=Math.max(0,v.hurt-dt);this.hitStop=Math.max(0,this.hitStop-dt);
    if(this.noise){this.noise.remaining-=dt;if(this.noise.remaining<=0)this.noise=null;}
    if(p.swing){
      p.swing.time+=dt;
      const advance=.16*Math.min(1,p.swing.time/p.swing.contact),delta=advance-p.swing.advance;
      if(delta>0)this.move(p,Math.sin(p.attackYaw)*delta,Math.cos(p.attackYaw)*delta);
      p.swing.advance=advance;
      if(!p.swing.hit&&p.swing.time>=p.swing.contact)this.contact();if(p.swing.time>=p.swing.duration)p.swing=null;
    }
    if(v.occupied){
      let corner=0;if(mag>.12){const desired=Math.atan2(dx,dz);corner=Math.abs(turn(v.yaw,desired));v.yaw+=turn(v.yaw,desired)*Math.min(1,dt*12);}
      const desired=i.brake?0:mag*14*(corner>.35?Math.max(.22,Math.cos(corner)):1);
      v.speed+=(desired-v.speed)*Math.min(1,dt*(i.brake?12:mag<.1?10:corner>.65?7:3.5));
      const travel=this.move(v,Math.sin(v.yaw)*v.speed*dt,Math.cos(v.yaw)*v.speed*dt,1.05);
      if(v.speed>7&&travel<v.speed*dt*.2){this.carHit(clamp((v.speed-4)*.35,2,5));v.speed=0;v.hurt=Math.max(v.hurt,2);this.burst(v.x,v.z,'gold',6);this.say('Impact. Release to stop, then steer away from the wall.',1.6);}
      p.x=v.x;p.z=v.z;p.yaw=v.yaw;if(this.friend.aboard){this.friend.x=v.x;this.friend.z=v.z;}
    }else if(p.traversal){
      const t=p.traversal;t.time=Math.min(t.duration,t.time+dt);const f=t.time/t.duration,u=t.kind==='Vault'?clamp((f-.16)/.64,0,1):f,s=u*u*(3-2*u);
      p.x=t.from.x+(t.to.x-t.from.x)*s;p.z=t.from.z+(t.to.z-t.from.z)*s;p.speed=0;p.vx=p.vz=0;
      p.height=t.kind==='Vault'?Math.sin(Math.PI*clamp((f-.16)/.64,0,1))*.68:0;
      if(t.push){const o=this.props.find(o=>o.id===t.prop);o.x=t.push.from.x+(t.push.to.x-t.push.from.x)*s;o.z=t.push.from.z+(t.push.to.z-t.push.from.z)*s;}
      if(f>=1){if(t.push)this.props.find(o=>o.id===t.prop).shift=t.shift;p.traversal=null;p.height=0;}
    }else{
      const sprint=i.sprint&&p.stamina>26&&mag>.1,speed=p.dash>0?15:sprint?6.8:4.6;
      const vx=(p.dash>0?p.dashX:dx)*speed,vz=(p.dash>0?p.dashZ:dz)*speed;
      const commitment=p.swing?(p.swing.time<p.swing.contact ? .65 : .75):1;
      p.vx+=(vx*commitment-p.vx)*Math.min(1,dt*18);p.vz+=(vz*commitment-p.vz)*Math.min(1,dt*18);p.speed=this.move(p,p.vx*dt,p.vz*dt)/Math.max(.001,dt);
      if(mag>.1&&p.attack<=0)p.yaw=Math.atan2(dx,dz);
      p.stamina=clamp(p.stamina+(sprint?-(this.network.upgrades.includes('stamina')?8:12):p.attack>0?0:26)*dt,0,100);
      if(i.attack)this.attack();
      if(this.mission?.type==='courier'&&!this.record&&dist(p,this.mission.source)<3&&i.interact&&p.hurt<=0&&p.attack<=0){
        this.copy=Math.min(1.8,this.copy+dt);
        if(this.copy>=1.8){this.record=true;this.score+=200;this.heat=1.4;this.saveCheckpoint();this.say('Sana: the account is copied. Reach the relay with it, not just a score.',4);}
      }
      if(this.friend.rescued&&!this.friend.aboard)this.companion(this.friend,p,dt,6.5);
      if(this.mission?.type==='rally'&&this.wave===2)for(const r of this.readers)this.companion(r,p,dt,5.1);
    }
    if(this.mission&&!this.mission.arrived&&!v.occupied&&dist(p,this.mission.source)<12){this.mission.arrived=true;this.saveCheckpoint();}
    for(const s of this.supplies)if(!s.taken&&dist(p,s)<2){s.taken=true;p.health=Math.min(6,p.health+2);p.stamina=100;this.burst(p.x,p.z,'teal');this.say('Volunteer aid restored condition.');}
    for(const q of PLACES)if(!this.visited.includes(q.id)&&dist(p,q)<18){this.visited.push(q.id);this.discoveries++;this.say('Discovered '+q.name+' · '+q.role,4);}
    let visible=false;
    for(const e of this.enemies){
      e.stun=Math.max(0,e.stun-dt);e.cooldown=Math.max(0,e.cooldown-dt);e.guardBreak=Math.max(0,e.guardBreak-dt);e.regroup=Math.max(0,e.regroup-dt);e.recovery=Math.max(0,e.recovery-dt);
      if(e.hp<=0){e.down=1;e.state='down';continue;}if(e.stun>0){e.state='stagger';continue;}
      const d=dist(e,p),sight=d<18&&this.line(e,p);
      if(sight){visible=true;e.last={x:p.x,z:p.z};this.lastSeen={...e.last};}
      if(e.strikeDuration>0){
        e.state='strike';e.strikeTime+=dt;
        if(e.role==='rush'&&e.strikeTime<.3){const step=Math.min(7*dt,Math.max(0,dist(e,p)-1.05));this.move(e,Math.sin(e.attackYaw)*step,Math.cos(e.attackYaw)*step);}
        if(!e.strikeHit&&e.strikeTime>=e.strikeDuration*.55){e.strikeHit=true;if(dist(e,p)<ENEMY_REACH[e.role]&&!v.occupied&&this.line(e,p,false)&&Math.abs(turn(e.attackYaw,Math.atan2(p.x-e.x,p.z-e.z)))<.8)this.hurt();}
        if(e.strikeTime>=e.strikeDuration){e.strikeDuration=0;e.recovery=e.role==='rush'?1.2:.85;e.cooldown=1.3;e.state='recover';}
        continue;
      }
      if(e.recovery>0){e.state='recover';continue;}
      if(e.regroup>0){e.state='regroup';this.chase(e,e.home,dt,2.2);continue;}
      if(e.windup>0){e.state='telegraph';e.windup=Math.max(0,e.windup-dt);if(e.windup<=0){e.strikeDuration=.48;e.strikeTime=0;e.strikeHit=false;}continue;}
      const reach=e.role==='rush'?3:e.role==='guard'?1.65:1.5,committed=this.enemies.filter(q=>q.hp>0&&(q.windup>0||q.strikeDuration>0)).length;
      if(!v.occupied&&d<reach&&e.cooldown<=0&&sight&&committed<(this.mission?.style==='hard'||this.network.cycle>1?2:1)){e.windup=e.windupTotal=(this.mission?.style==='hard'?.5:.75)+(e.role==='guard'?.12:0);e.attackYaw=e.yaw=Math.atan2(p.x-e.x,p.z-e.z);e.state='telegraph';continue;}
      const investigating=!sight&&this.noise&&dist(e,this.noise)<18;
      const holding=e.role==='guard'&&e.guardBreak<=0&&!investigating&&(d>4.5||dist(p,e.home)>7);
      const target=investigating?this.noise:holding?e.home:sight&&e.role==='flank'&&d>2.5?{x:p.x+Math.cos(p.yaw)*3,z:p.z-Math.sin(p.yaw)*3}:sight?p:this.hidden<4?e.last:e.home;
      e.state=investigating?'investigate':holding?'hold':sight&&e.role==='flank'?'flank':sight?'approach':'search';
      if(d<1.1&&sight&&!v.occupied)e.yaw=Math.atan2(p.x-e.x,p.z-e.z);else if(dist(e,target)>.5)this.chase(e,target,dt,(e.role==='guard'?2:e.role==='flank'?3.5:2.8)+(this.mission?.style==='hard'?.5:0)+Math.max(0,(this.mission?.tier||1)-1)*.2);
    }
    for(let a=0;a<5;a++)for(let b=a+1;b<5;b++){const e=this.enemies[a],f=this.enemies[b],d=dist(e,f);if(e.hp>0&&f.hp>0&&d<.9){const dx=(e.x-f.x)/(d||1),dz=(e.z-f.z)/(d||1);this.move(e,dx*dt,dz*dt);this.move(f,-dx*dt,-dz*dt);}}
    if(this.car.active){
      const c=this.car,d=dist(c,p),sight=d<28&&this.line(c,p);if(sight){visible=true;this.lastSeen={x:p.x,z:p.z};}
      c.cooldown=Math.max(0,c.cooldown-dt);c.contactCooldown=Math.max(0,c.contactCooldown-dt);
      if(c.recoil>0){c.recoil-=dt;c.speed=-4;this.move(c,-Math.sin(c.attackYaw)*4*dt,-Math.cos(c.attackYaw)*4*dt,1.05);}
      else if(c.ram>0){
        c.ram-=dt;c.yaw=c.attackYaw;c.speed=16;this.move(c,Math.sin(c.attackYaw)*16*dt,Math.cos(c.attackYaw)*16*dt,1.05);
        if(v.occupied&&dist(c,p)<2.5&&c.contactCooldown<=0){this.carHit(12);c.contactCooldown=4;c.recoil=.7;c.ram=0;c.cooldown=5;this.say('Ram landed. It must recover: take a different street.',2);}
      }else{
        const following=sight&&v.occupied?{x:p.x-Math.sin(v.yaw)*5,z:p.z-Math.cos(v.yaw)*5}:sight?p:this.lastSeen;
        c.speed=this.chase(c,following,dt,sight?8.5:5,1.05)/dt;
        if(c.windup>0){c.windup-=dt;if(c.windup<=0){c.attackYaw=Math.atan2(c.ramTarget.x-c.x,c.ramTarget.z-c.z);c.ram=.65;c.cooldown=5;}}
        else if(v.occupied&&sight&&d>4&&d<14&&c.cooldown<=0){c.windup=.85;c.ramTarget={x:p.x+Math.sin(v.yaw)*v.speed*.25,z:p.z+Math.cos(v.yaw)*v.speed*.25};c.attackYaw=Math.atan2(c.ramTarget.x-c.x,c.ramTarget.z-c.z);this.say('Patrol committing to a ram. Turn out of the red path.',1.6);}
      }
    }
    this.seen=visible;
    if(visible){this.hidden=0;this.heat=Math.min(5,Math.max(this.heat,.8)+dt*.04);this.phase='pursuit';}
    else{this.hidden+=dt;this.phase=this.heat<.7?'clear':'search';if(this.hidden>4)this.heat=Math.max(0,this.heat-dt*.42);}
    if(this.car.active&&!visible&&this.hidden>8&&this.heat<.7){this.car.active=false;this.car.windup=0;this.car.ram=0;this.say('Pursuit lost. The patrol has stood down; return to the network.',3);}
    const m=this.mission;
    if(m?.type==='rally'){
      const nearby=this.enemies.some(e=>e.hp>0&&dist(e,m.zones[this.wave])<3.5);
      if(this.wave<2&&!v.occupied&&dist(p,m.zones[this.wave])<4.5&&!nearby){
        if(this.wave===0||i.interact&&p.hurt<=0&&p.attack<=0){this.hold+=dt*(this.wave===1?8/2.8:1);this.score+=dt*10;}
      }
      const wave=Math.min(2,Math.floor(this.hold/8));
      if(wave>this.wave){this.wave=wave;this.hold=wave*8;this.spawn(m.zones[wave],m.style==='hard'||m.tier>1?3+wave:3);
        if(wave===2){this.readers=[-1,1].map(s=>({...snap({x:m.zones[2].x+s,z:m.zones[2].z}),yaw:0}));this.say('Anita: Together. Stay close. We leave nobody behind. Lead both readers to the assembly.',5);}
        else this.say('Gathering secured. Clear the aid point, then hold Action to restore support.',4);
        this.saveCheckpoint();}
    }
    if(this.readyWin())this.win();
    if(this.gate.hp<=0)this.gate.fall=Math.min(1,this.gate.fall+dt*2);
    for(const q of this.particles){q.life-=dt;q.x+=q.vx*dt;q.z+=q.vz*dt;q.y+=q.vy*dt;q.vy-=9*dt;}this.particles=this.particles.filter(q=>q.life>0);
  }
  companion(r,p,dt,speed){
    const threat=this.enemies.find(e=>e.hp>0&&(e.windup>0||e.strikeDuration>0)&&dist(e,r)<5);
    r.fear=Math.max(0,(r.fear||0)-dt);
    if(threat){r.fear=.8;const d=Math.max(.1,dist(r,threat));r.state='shelter';this.move(r,(r.x-threat.x)/d*2.8*dt,(r.z-threat.z)/d*2.8*dt);r.yaw=Math.atan2(r.x-threat.x,r.z-threat.z);return;}
    if(r.fear>0){r.state='brace';return;}
    r.state=dist(p,r)>2.1?'follow':'wait';if(r.state==='follow')this.chase(r,p,dt,speed);
  }
  text(){return{mode:this.mode,coordinates:'x east, z south; OSM central Delhi, 0.14 game units / real metre; roads widened for play',time:+this.time.toFixed(2),player:{...this.player},van:{...this.van},friend:{...this.friend},readers:this.readers,encounter:{name:this.encounter.name,props:this.props},record:this.record,gate:{...this.gate},heat:+this.heat.toFixed(2),seen:this.seen,hidden:+this.hidden.toFixed(2),phase:this.phase,roadblock:this.roadblock,objective:this.objective(),target:this.target(),near:this.nearby(),enemies:this.enemies.map(({id,x,z,hp,stun,windup,state,strikeTime,strikeDuration,recovery,regroup,role,guardBreak,yaw})=>({id,x,z,hp,stun,windup,state,strikeTime,strikeDuration,recovery,regroup,role,guardBreak,yaw})),car:{x:this.car.x,z:this.car.z,active:this.car.active,windup:this.car.windup,ram:this.car.ram,cooldown:this.car.cooldown},strikes:this.hits,score:Math.round(this.score),crashes:this.crashes,checkpoint:this.checkpoint,mission:this.mission,hold:+this.hold.toFixed(2),network:this.network,visited:this.visited,result:this.result};}
}
