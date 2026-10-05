import {WORLD,PLACES,SCALE,distance as dist,inside,segmentDistance,roadRoute,snap} from './city-data.js?v=0.14.0';
export {WORLD};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const turn=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
export const CONTRACTS=[
  {id:'witness',type:'rescue',title:'Bring the witness home',from:'jantar',to:'cp',reward:2,story:'Kabir carries testimony from the gathering. Get him out, keep the account safe, and build a route back to the network.'},
  {id:'signal',type:'courier',title:'Restore the signal',from:'tolstoy',to:'gate',reward:2,story:'Sana’s dispatch must reach a volunteer relay. Route choice and losing pursuit matter more than knocking everyone down.'},
  {id:'hold',type:'rally',title:'Hold the gathering',from:'sansad',to:'jantar',reward:3,story:'Reach the gathering and hold its space while people regroup. Resistance means preserving a place where accounts can be heard.'},
  {id:'charter',type:'courier',title:'Replacement is not repair',from:'gate',to:'jantar',reward:4,story:'The network’s charter demands constitutional accountability, an end to contested SIR, and transparent inclusion support for every eligible voter. Carry it back to the assembly.'},
];
export class City{
  constructor(){
    this.network={completed:[],credits:0,total:0,bests:{},upgrades:[],cycle:1};this.serial=0;this.reset();
  }
  reset(){
    const p=snap(PLACES[1]);
    this.mode='menu';this.time=0;this.player={...p,yaw:Math.PI,health:6,stamina:100,hurt:0,dash:0,dashCd:0,attack:0,attackCd:0};
    this.van={x:p.x+1,z:p.z,yaw:Math.PI,speed:0,health:100,hurt:0,occupied:false};
    this.friend={...snap(PLACES[0]),rescued:false,aboard:false};this.record=false;
    this.gate={x:0,z:0,w:8,hp:0,fall:1};this.block={x:0,z:0};
    this.enemies=Array.from({length:5},(_,id)=>({id,x:0,z:0,yaw:0,hp:0,stun:0,windup:0,cooldown:1,route:[],routeAge:0,last:{x:0,z:0},home:{x:0,z:0},down:1}));
    this.car={x:0,z:0,yaw:0,speed:0,active:false,route:[],routeAge:0};
    this.heat=0;this.hidden=0;this.seen=false;this.lastSeen={...p};this.phase='clear';this.roadblock=false;
    this.supplies=WORLD.medkits.map(p=>({...p,taken:false}));this.score=0;this.hits=0;this.crashes=0;this.helped=0;this.message='';this.messageTime=0;this.particles=[];this.checkpoint=null;
    this.input={x:0,z:0,aimX:0,aimZ:-1,sprint:false,attack:false,brake:false};
    this.mission=null;this.hold=0;this.wave=0;this.elapsed=0;this.result=null;this.visited=[];this.discoveries=0;
  }
  start(){this.reset();this.mode='playing';this.say('CP is your hub. Open Missions to choose a job, or explore Delhi in the van.',6);}
  place(id){return snap(PLACES.find(p=>p.id===id));}
  accept(id,style='balanced'){
    const spec=CONTRACTS.find(c=>c.id===id);if(!spec||id==='charter'&&this.network.completed.length<3)return false;
    if(this.mission)return false;
    this.serial++;this.mission={...spec,style,source:this.place(spec.from),destination:this.place(spec.to),variant:this.serial%3,tier:Math.min(3,this.network.cycle),started:this.time};
    this.elapsed=0;this.score=0;this.hits=0;this.crashes=0;this.hold=0;this.wave=0;this.record=false;this.friend.rescued=false;this.friend.aboard=false;
    this.friend.x=this.mission.source.x;this.friend.z=this.mission.source.z;
    WORLD.record={...this.mission.source};WORLD.safe={...this.mission.destination};
    const source=this.mission.source;
    this.gate={x:source.x,z:source.z+8,w:8,hp:spec.type==='rescue'?4:0,fall:spec.type==='rescue'?0:1};
    this.block={x:source.x+9,z:source.z-9};this.roadblock=false;
    this.spawn(source,spec.type==='rally'?3:spec.type==='rescue'?4:2);
    this.car.active=false;this.heat=0;this.checkpoint=null;this.mode='playing';
    this.say(spec.story,7);return true;
  }
  spawn(p,count){
    this.enemies.forEach((e,i)=>{
      const angle=(i+.5)*Math.PI*2/count+this.serial*.7,q=snap({x:p.x+Math.sin(angle)*10,z:p.z+Math.cos(angle)*10});
      Object.assign(e,{x:q.x,z:q.z,hp:i<count?3:0,stun:0,windup:0,cooldown:1.5,route:[],routeAge:0,home:{...q},last:{...q},down:0});
    });
  }
  say(t,seconds=3){this.message=t;this.messageTime=seconds;}
  valid(x,z,r=.38,ignoreGate=false){
    if(x<-124+r||x>138-r||z<-174+r||z>207-r)return false;
    const p={x,z};
    // Road widths are expanded for mobile play. OSM footprints still block off-road movement.
    if(!WORLD.segments.some(s=>segmentDistance(p,s.a,s.b)<s.width/2-r*.3)){
      for(const b of WORLD.buildings)if(Math.abs(b.x-x)<30&&Math.abs(b.z-z)<30&&(inside(p,b.poly)||b.poly.some((a,i)=>segmentDistance(p,a,b.poly[(i+1)%b.poly.length])<r)))return false;
    }
    if(!ignoreGate&&this.gate.hp>0&&Math.abs(x-this.gate.x)<4+r&&Math.abs(z-this.gate.z)<.45+r)return false;
    if(!ignoreGate&&this.roadblock&&Math.abs(x-this.block.x)<4+r&&Math.abs(z-this.block.z)<.5+r)return false;
    return true;
  }
  line(a,b,opaqueOnly=true){
    // Buildings occlude vision, including when arcade-width streets overlap a footprint.
    for(const house of WORLD.buildings){
      if(Math.min(dist(a,house),dist(b,house))>60)continue;
      const n=Math.ceil(dist(a,b)/2);
      for(let i=1;i<n;i++)if(inside({x:a.x+(b.x-a.x)*i/n,z:a.z+(b.z-a.z)*i/n},house.poly))return false;
    }
    if(!opaqueOnly){const n=Math.ceil(dist(a,b));for(let i=1;i<n;i++)if(!this.valid(a.x+(b.x-a.x)*i/n,a.z+(b.z-a.z)*i/n,.1))return false;}
    return true;
  }
  route(a,b){return roadRoute(a,b);}
  move(e,dx,dz,r=.38){
    const x=e.x,z=e.z;
    if(this.valid(x+dx,z,r))e.x+=dx;if(this.valid(e.x,z+dz,r))e.z+=dz;
    return Math.hypot(e.x-x,e.z-z);
  }
  chase(e,target,dt,speed,r=.4){
    if(dist(e,target)>50)return 0;
    e.routeAge=(e.routeAge||0)-dt;
    const direct=this.line(e,target,false);
    if(!direct&&(!e.route?.length||e.routeAge<=0)){e.route=this.route(e,target);e.routeAge=2;}
    const n=direct?target:e.route?.[0];if(!n)return 0;
    const d=dist(e,n),step=Math.min(d,speed*dt);e.yaw=Math.atan2(n.x-e.x,n.z-e.z);
    const travel=this.move(e,(n.x-e.x)/Math.max(d,.001)*step,(n.z-e.z)/Math.max(d,.001)*step,r);
    if(d<1)e.route?.shift();return travel;
  }
  burst(x,z,color='gold',count=8){for(let i=0;i<count;i++)this.particles.push({x,z,y:.8,vx:Math.sin(i*2.399)*2.5,vz:Math.cos(i*2.399)*2.5,vy:2+i%3,life:.55,color});}
  attack(){
    const p=this.player;if(this.mode!=='playing'||p.attackCd>0||this.van.occupied)return false;
    p.attack=.25;p.attackCd=this.network.upgrades.includes('tempo')?.35:.44;p.yaw=Math.atan2(this.input.aimX,this.input.aimZ);this.hits++;
    let hit=false;
    for(const e of this.enemies)if(e.hp>0&&dist(p,e)<2.9&&Math.abs(turn(p.yaw,Math.atan2(e.x-p.x,e.z-p.z)))<1.25){
      e.hp--;e.stun=.65;e.windup=0;e.cooldown=1.2;this.move(e,Math.sin(p.yaw)*.8,Math.cos(p.yaw)*.8);hit=true;this.burst(e.x,e.z,'teal');this.heat=Math.max(1,this.heat+.15);
      if(e.hp<=0)this.score+=60;
    }
    if(this.gate.hp>0&&dist(p,this.gate)<5){this.gate.hp--;hit=true;this.burst(p.x,p.z);if(!this.gate.hp){this.score+=100;this.say('Route opened. Get Kabir clear.');}}
    if(this.roadblock&&dist(p,this.block)<5){this.roadblock=false;hit=true;this.burst(p.x,p.z);this.say('Roadblock opened.');}
    if(!hit)this.say('Move closer, or dodge the red warning before it lands.',1);
    return true;
  }
  dash(){const p=this.player;if(this.mode!=='playing'||this.van.occupied||p.dashCd>0||p.stamina<15)return false;p.dash=.3;p.dashCd=1.6;p.stamina-=15;this.burst(p.x,p.z,'teal',5);return true;}
  nearby(){
    if(this.van.occupied)return{id:'exit',label:'EXIT VAN'};
    if(this.mission?.type==='rescue'&&!this.friend.rescued&&dist(this.player,this.friend)<3.2)return{id:'rescue',label:'RESCUE KABIR'};
    if(dist(this.player,this.van)<4.2)return{id:'van',label:'ENTER VAN'};
    return null;
  }
  interact(){
    if(this.mode!=='playing')return;
    const p=this.player,v=this.van;
    if(v.occupied){
      for(const side of[-1,1]){const x=v.x+Math.cos(v.yaw)*2.3*side,z=v.z-Math.sin(v.yaw)*2.3*side;if(this.valid(x,z)){v.occupied=false;v.speed=0;p.x=x;p.z=z;this.friend.aboard=false;this.friend.x=x+1;this.friend.z=z+1;this.say('On foot. Your van stays here.');return;}}
      this.say('Move away from the wall to exit.');return;
    }
    const n=this.nearby();
    if(n?.id==='rescue'){
      if(this.enemies.some(e=>e.hp>0&&dist(e,this.friend)<4.5)){this.say('Interrupt the guards or draw them away before the rescue.');return;}
      this.friend.rescued=true;this.record=true;this.score+=250;p.health=Math.min(6,p.health+1);this.saveCheckpoint();this.say('Kabir and testimony secured. Bring him to the van and lose pursuit.');return;
    }
    if(n?.id==='van'){
      if(this.friend.rescued&&dist(this.friend,v)>8){this.say('Kabir is behind. Wait or regroup.');return;}
      v.occupied=true;this.friend.aboard=this.friend.rescued;
      if(this.record){this.car.active=true;const q=snap({x:v.x-Math.sin(v.yaw)*20,z:v.z-Math.cos(v.yaw)*20});Object.assign(this.car,q,{route:[],routeAge:0});this.heat=Math.max(2,this.heat);}
      this.saveCheckpoint();this.say(this.record?'Route choice matters. Hide behind blocks to lose pursuit, then reach the green destination.':'Drive to the gold mission marker. You can exit and explore anywhere.',4);
    }
  }
  saveCheckpoint(){this.checkpoint={x:this.player.x,z:this.player.z,van:{...this.van},record:this.record,rescued:this.friend.rescued,gate:this.gate.hp,hold:this.hold};}
  hurt(){const p=this.player;if(p.hurt>0||p.dash>0||this.mode!=='playing')return;p.health--;p.hurt=1.2;this.burst(p.x,p.z,'red',5);if(p.health<=0){this.mode='caught';this.say('Caught. Retry the checkpoint or try a different mission.');}else this.say('Red warning: dodge, interrupt, or use another route.',2);}
  carHit(amount){if(this.van.hurt>0)return;this.van.health=Math.max(0,this.van.health-amount*(this.network.upgrades.includes('reinforce')?.7:1));this.van.hurt=1;this.van.speed*=.3;this.crashes++;if(this.van.health<=0){this.mode='caught';this.say('Van disabled. Your earned network progress is safe.');}}
  readyWin(){
    const m=this.mission;if(!m)return false;
    if(m.type==='rally')return this.hold>=24;
    return this.record&&dist(this.player,m.destination)<6&&this.heat<.7&&(!this.van.occupied||this.van.speed<4)&&(m.type!=='rescue'||this.friend.rescued&&(this.friend.aboard||dist(this.friend,m.destination)<8));
  }
  win(){
    if(this.mode!=='playing'||!this.mission)return;
    const m=this.mission;
    const medal=this.player.health>=5&&this.crashes===0?'GOLD':this.player.health>=3?'SILVER':'BRONZE';
    this.score+=Math.round(this.player.health*100+this.van.health*2+Math.max(0,480-this.elapsed));
    this.network.total++;this.network.credits+=m.reward+(medal==='GOLD'?1:0);
    if(!this.network.completed.includes(m.id))this.network.completed.push(m.id);
    this.network.bests[m.id]=Math.max(this.network.bests[m.id]||0,this.score);
    if(m.id==='charter'){this.network.cycle++;this.network.completed=[];}
    this.result={title:m.title,medal,reward:m.reward,score:this.score,seconds:Math.round(this.elapsed),type:m.type};
    this.mode='won';this.say('The network grows. Choose another operation or explore the city.');
  }
  continue(){if(this.mode==='won'){this.mission=null;this.record=false;this.friend.rescued=false;this.friend.aboard=false;this.car.active=false;this.enemies.forEach(e=>e.hp=0);this.heat=0;this.gate.hp=0;this.player.health=6;this.van.health=100;this.supplies.forEach(s=>s.taken=false);this.mode='playing';}}
  abandon(){this.mission=null;this.enemies.forEach(e=>e.hp=0);this.car.active=false;this.record=false;this.friend.rescued=false;this.friend.aboard=false;this.heat=0;this.gate.hp=0;this.roadblock=false;this.mode='playing';}
  retry(){
    const m=this.mission,c=this.checkpoint;if(!m){this.start();return;}
    const spec=m.id,style=m.style;this.abandon();this.accept(spec,style);
    this.player.health=6;this.van.health=100;this.player.hurt=2;
    if(c){this.player.x=c.x;this.player.z=c.z;Object.assign(this.van,c.van,{health:100,hurt:2,speed:0});this.record=c.record;this.friend.rescued=c.rescued;this.friend.aboard=c.rescued&&c.van.occupied;this.friend.x=c.x;this.friend.z=c.z;this.gate.hp=c.gate;this.hold=c.hold;this.checkpoint=c;}
    this.say('Checkpoint restored. Earned upgrades remain. Try a different approach.');
  }
  upgrade(id){const prices={tempo:4,reinforce:4,stamina:3};if(!prices[id]||this.network.upgrades.includes(id)||this.network.credits<prices[id])return false;this.network.credits-=prices[id];this.network.upgrades.push(id);return true;}
  save(){return btoa(JSON.stringify({version:1,network:this.network}));}
  load(code){
    try{
      const s=JSON.parse(atob(code.trim())),n=s.network;
      if(s.version!==1||!n||!Array.isArray(n.completed)||!Array.isArray(n.upgrades)||!Number.isInteger(n.credits)||n.credits<0||n.credits>100000||!Number.isInteger(n.total)||n.total<0||!Number.isInteger(n.cycle)||n.cycle<1||n.cycle>1000||typeof n.bests!=='object')return false;
      const bests={};for(const c of CONTRACTS)if(Number.isFinite(n.bests[c.id])&&n.bests[c.id]>=0)bests[c.id]=n.bests[c.id];
      this.network={completed:n.completed.filter(id=>CONTRACTS.some(c=>c.id===id)),upgrades:n.upgrades.filter(id=>['tempo','reinforce','stamina'].includes(id)),credits:n.credits,total:n.total,cycle:n.cycle,bests};return true;
    }catch{return false;}
  }
  objective(){
    const m=this.mission;if(!m)return 'EXPLORE DELHI · open Missions to join the network';
    if(m.type==='rally')return `HOLD THE GATHERING · ${Math.floor(this.hold)} / 24 s · wave ${this.wave+1}`;
    if(!this.record)return m.type==='rescue'?'RESCUE KABIR · clear or evade guards at Jantar Mantar':'RECOVER THE DISPATCH · step out of the van at the gold marker';
    if(this.heat>=.7)return this.seen?'BREAK SIGHT · use the city blocks':'STAY HIDDEN · let the search cool';
    return 'DELIVER TO '+PLACES.find(p=>p.id===m.to).name.toUpperCase();
  }
  target(){return this.mission?(this.mission.type==='rally'?this.mission.source:!this.record?this.mission.source:this.mission.destination):PLACES[0];}
  update(dt){
    if(this.mode!=='playing')return;dt=Math.min(.05,dt);this.time+=dt;if(this.mission)this.elapsed+=dt;this.messageTime=Math.max(0,this.messageTime-dt);
    const p=this.player,v=this.van,i=this.input,mag=Math.min(1,Math.hypot(i.x,i.z)),dx=i.x/Math.max(1,Math.hypot(i.x,i.z)),dz=i.z/Math.max(1,Math.hypot(i.x,i.z));
    for(const k of['hurt','dash','dashCd','attack','attackCd'])p[k]=Math.max(0,p[k]-dt);v.hurt=Math.max(0,v.hurt-dt);
    if(v.occupied){
      let corner=0;if(mag>.12){const desired=Math.atan2(dx,dz);corner=Math.abs(turn(v.yaw,desired));v.yaw+=turn(v.yaw,desired)*Math.min(1,dt*5.8);}
      const desired=i.brake?0:mag*22*(corner>.35?Math.max(.3,Math.cos(corner)):1);
      v.speed+=(desired-v.speed)*Math.min(1,dt*(i.brake?9:mag<.1?5:corner>.65?4.5:2));
      const travel=this.move(v,Math.sin(v.yaw)*v.speed*dt,Math.cos(v.yaw)*v.speed*dt,1.2);
      if(v.speed>4&&travel<v.speed*dt*.2)this.carHit(8);
      p.x=v.x;p.z=v.z;p.yaw=v.yaw;if(this.friend.aboard){this.friend.x=v.x;this.friend.z=v.z;}
    }else{
      const sprint=i.sprint&&p.stamina>8&&mag>.1,speed=p.dash>0?13:sprint?6.5:4.2;
      this.move(p,(p.dash>0&&mag<.1?Math.sin(p.yaw):dx)*speed*dt,(p.dash>0&&mag<.1?Math.cos(p.yaw):dz)*speed*dt);
      if(mag>.1&&p.attack<=0)p.yaw=Math.atan2(dx,dz);
      p.stamina=clamp(p.stamina+(sprint?-(this.network.upgrades.includes('stamina')?9:15):17)*dt,0,100);
      if(i.attack)this.attack();
      if(this.mission?.type==='courier'&&!this.record&&dist(p,this.mission.source)<2.5){this.record=true;this.score+=200;this.heat=1.4;this.saveCheckpoint();this.say('Dispatch secured. Deliver it after losing pursuit.');}
      if(this.friend.rescued&&!this.friend.aboard&&dist(p,this.friend)>1.8)this.chase(this.friend,p,dt,6.5);
    }
    for(const s of this.supplies)if(!s.taken&&dist(p,s)<2){s.taken=true;p.health=Math.min(6,p.health+2);p.stamina=100;this.burst(p.x,p.z,'teal');this.say('Volunteer aid restored condition.');}
    for(const q of PLACES)if(!this.visited.includes(q.id)&&dist(p,q)<18){this.visited.push(q.id);this.discoveries++;this.say('Discovered '+q.name+' · '+q.role,4);}
    let visible=false;
    for(const e of this.enemies){
      e.stun=Math.max(0,e.stun-dt);e.cooldown=Math.max(0,e.cooldown-dt);if(e.hp<=0){e.down=1;continue;}if(e.stun>0)continue;
      const d=dist(e,p),sight=d<18&&this.line(e,p);
      if(sight){visible=true;e.last={x:p.x,z:p.z};this.lastSeen={...e.last};}
      if(e.windup>0){e.windup-=dt;if(e.windup<=0){e.cooldown=1.8;if(d<2.5&&!v.occupied)this.hurt();}continue;}
      if(!v.occupied&&d<2.1&&e.cooldown<=0){e.windup=this.mission?.style==='hard'?.55:.8;continue;}
      if(d<1.6&&sight&&!v.occupied)e.yaw=Math.atan2(p.x-e.x,p.z-e.z);else this.chase(e,sight?p:this.hidden<6?e.last:e.home,dt,this.mission?.style==='hard'?3.4:2.6);
    }
    for(let a=0;a<5;a++)for(let b=a+1;b<5;b++){const e=this.enemies[a],f=this.enemies[b],d=dist(e,f);if(e.hp>0&&f.hp>0&&d<.9){const dx=(e.x-f.x)/(d||1),dz=(e.z-f.z)/(d||1);this.move(e,dx*dt,dz*dt);this.move(f,-dx*dt,-dz*dt);}}
    if(this.car.active){
      const c=this.car,d=dist(c,p),sight=d<28&&this.line(c,p);if(sight){visible=true;this.lastSeen={x:p.x,z:p.z};}
      c.speed=this.chase(c,sight?p:this.lastSeen,dt,sight?11:5,1.1)/dt;
      if(v.occupied&&d<2.9)this.carHit(10);
    }
    this.seen=visible;
    if(visible){this.hidden=0;this.heat=Math.min(5,Math.max(this.heat,.8)+dt*.04);this.phase='pursuit';}
    else{this.hidden+=dt;this.phase=this.heat<.7?'clear':'search';if(this.hidden>4)this.heat=Math.max(0,this.heat-dt*.42);}
    const m=this.mission;
    if(m?.type==='rally'){
      if(!v.occupied&&dist(p,m.source)<10){this.hold+=dt;this.score+=dt*10;}
      const wave=Math.min(2,Math.floor(this.hold/8));
      if(wave>this.wave){this.wave=wave;this.spawn(m.source,3+wave);this.say('Another wave. Dodge, interrupt, and keep the gathering together.');this.saveCheckpoint();}
    }
    if(this.readyWin())this.win();
    if(this.gate.hp<=0)this.gate.fall=Math.min(1,this.gate.fall+dt*2);
    for(const q of this.particles){q.life-=dt;q.x+=q.vx*dt;q.z+=q.vz*dt;q.y+=q.vy*dt;q.vy-=9*dt;}this.particles=this.particles.filter(q=>q.life>0);
  }
  text(){return{mode:this.mode,coordinates:'x east, z south; OSM central Delhi, 0.14 game units / real metre; roads widened for play',time:+this.time.toFixed(2),player:{...this.player},van:{...this.van},friend:{...this.friend},record:this.record,gate:{...this.gate},heat:+this.heat.toFixed(2),seen:this.seen,hidden:+this.hidden.toFixed(2),phase:this.phase,roadblock:this.roadblock,objective:this.objective(),target:this.target(),near:this.nearby(),enemies:this.enemies.map(({id,x,z,hp,stun,windup})=>({id,x,z,hp,stun,windup})),car:{x:this.car.x,z:this.car.z,active:this.car.active},strikes:this.hits,score:Math.round(this.score),crashes:this.crashes,checkpoint:this.checkpoint,mission:this.mission,hold:+this.hold.toFixed(2),network:this.network,visited:this.visited,result:this.result};}
}
