// Original fictional arcade rules. World units are metres-like, not a surveyed map.
export const WORLD={
  bounds:56,
  buildings:[
    {x:-17,z:16,w:19,d:18,h:7},{x:17,z:16,w:19,d:18,h:9},
    {x:-17,z:-16,w:19,d:18,h:8},{x:17,z:-16,w:19,d:18,h:6},
    {x:-48,z:15,w:13,d:21,h:5},{x:48,z:-15,w:13,d:21,h:7},
    {x:-17,z:-48,w:19,d:17,h:6},{x:17,z:-48,w:19,d:17,h:8}
  ],
  colliders:[{x:-40,z:-49,w:.45,d:11},{x:-28,z:-49,w:.45,d:11},{x:-34,z:-54,w:12,d:.4}],
  friend:{x:2,z:7},record:{x:-2,z:6},van:{x:10,z:-4},
  safe:{x:-34,z:-48},gate:{x:0,z:17,w:10,d:.5},
  medkits:[{x:-4,z:27},{x:34,z:25},{x:-34,z:-34}]
};
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const turn=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
export class Breakout{
  constructor(){this.reset();}
  reset(){
    this.mode='menu';this.time=0;this.player={x:0,z:43,yaw:Math.PI,health:6,stamina:100,hurt:0,dash:0,dashCd:0,attack:0,attackCd:0};
    this.van={...WORLD.van,yaw:Math.PI/2,speed:0,health:100,hurt:0,occupied:false};
    this.friend={...WORLD.friend,rescued:false,aboard:false};this.record=false;this.gate={...WORLD.gate,hp:4,fall:0};
    this.enemies=[[5,32],[-6,30],[4,13],[-5,5],[34,-6]].map(([x,z],id)=>({id,x,z,yaw:0,hp:3,stun:0,windup:0,cooldown:1.2,route:[],routeAge:0,last:{x,z},home:{x,z},down:0}));
    this.car={x:0,z:36,yaw:Math.PI,speed:0,active:false,stun:0,route:[],routeAge:0};
    this.heat=1.25;this.seen=false;this.hidden=0;this.lastSeen={x:0,z:43};this.phase='pursuit';this.roadblock=false;this.escapeStarted=false;
    this.supplies=WORLD.medkits.map(p=>({...p,taken:false}));this.score=0;this.hits=0;this.message='';this.messageTime=0;this.particles=[];this.checkpoint=null;
    this.input={x:0,z:0,aimX:0,aimZ:-1,sprint:false,attack:false,brake:false};this.helped=0;this.crashes=0;
  }
  start(){this.reset();this.mode='playing';this.say('The gathering is being dispersed. Rescue Kabir and recover the recording.',5);}
  say(text,seconds=3){this.message=text;this.messageTime=seconds;}
  valid(x,z,r=.38,ignoreGate=false){
    if(Math.abs(x)>WORLD.bounds-r||Math.abs(z)>WORLD.bounds-r)return false;
    for(const b of [...WORLD.buildings,...WORLD.colliders])if(Math.abs(x-b.x)<b.w/2+r&&Math.abs(z-b.z)<b.d/2+r)return false;
    if(!ignoreGate&&this.gate.hp>0&&Math.abs(x-this.gate.x)<this.gate.w/2+r&&Math.abs(z-this.gate.z)<.45+r)return false;
    if(this.roadblock&&Math.abs(x+34)<5+r&&Math.abs(z+17)<.5+r)return false;
    return true;
  }
  line(a,b,opaqueOnly=true){
    const n=Math.ceil(dist(a,b)/1.2);
    for(let i=1;i<n;i++)if(!this.valid(a.x+(b.x-a.x)*i/n,a.z+(b.z-a.z)*i/n,.05,opaqueOnly))return false;
    return true;
  }
  route(a,b,r=.4){
    const unit=2,key=(x,z)=>x+','+z,ax=Math.round(a.x/unit),az=Math.round(a.z/unit),bx=Math.round(b.x/unit),bz=Math.round(b.z/unit);
    const open=[{x:ax,z:az,g:0,f:0}],best=new Map([[key(ax,az),0]]),parents=new Map();let goal;
    for(let count=0;open.length&&count<2200;count++){
      open.sort((a,b)=>b.f-a.f);const q=open.pop();if(Math.hypot(q.x-bx,q.z-bz)<1.1){goal=q;break;}
      for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const x=q.x+dx,z=q.z+dz;if(!this.valid(x*unit,z*unit,r)||!this.line({x:q.x*unit,z:q.z*unit},{x:x*unit,z:z*unit},false))continue;
        const k=key(x,z),g=q.g+1;if((best.get(k)??Infinity)<=g)continue;
        best.set(k,g);parents.set(k,q);open.push({x,z,g,f:g+Math.abs(x-bx)+Math.abs(z-bz)});
      }
    }
    const result=[];for(let q=goal;q&&key(q.x,q.z)!==key(ax,az);q=parents.get(key(q.x,q.z)))result.push({x:q.x*unit,z:q.z*unit});
    return result.reverse();
  }
  move(entity,dx,dz,r=.38){
    const x=entity.x,z=entity.z;
    if(this.valid(x+dx,z,r))entity.x+=dx;
    if(this.valid(entity.x,z+dz,r))entity.z+=dz;
    return Math.hypot(entity.x-x,entity.z-z);
  }
  chase(e,target,dt,speed,r=.4){
    e.routeAge=(e.routeAge||0)-dt;
    if(!e.route?.length||e.routeAge<=0){e.route=this.route(e,target,r);e.routeAge=.8;}
    const n=this.line(e,target,false)&&this.valid(target.x,target.z,r)?target:e.route[0];
    if(!n)return 0;
    const dx=n.x-e.x,dz=n.z-e.z,d=Math.hypot(dx,dz),step=Math.min(d,speed*dt);
    e.yaw=Math.atan2(dx,dz);
    const travel=this.move(e,dx/Math.max(d,.001)*step,dz/Math.max(d,.001)*step,r);
    if(d<.5)e.route?.shift();return travel;
  }
  burst(x,z,color='gold',count=8){
    for(let i=0;i<count;i++)this.particles.push({x,z,y:.8,vx:Math.sin(i*2.399)*2.5,vz:Math.cos(i*2.399)*2.5,vy:2+i%3,life:.55,color});
  }
  attack(){
    const p=this.player;if(this.mode!=='playing'||p.attackCd>0)return false;
    if(this.van.occupied){this.say('Horn: the road is blocked. Use a side street or exit and clear it.',2);return false;}
    p.attack=.25;p.attackCd=.44;
    const aim=Math.atan2(this.input.aimX,this.input.aimZ);p.yaw=aim;this.hits++;
    let hit=false;
    for(const e of this.enemies){
      if(e.hp<=0||dist(p,e)>2.9)continue;
      if(Math.abs(turn(aim,Math.atan2(e.x-p.x,e.z-p.z)))>1.25)continue;
      const interrupted=e.windup>0;
      e.hp--;e.stun=.65;e.windup=0;e.cooldown=1.2;this.move(e,Math.sin(aim)*.8,Math.cos(aim)*.8);this.burst(e.x,e.z,'teal');hit=true;
      if(interrupted)this.say('Attack interrupted. Move or strike again.',1.3);
      if(e.hp<=0){e.down=1;this.score+=80;}this.heat=Math.min(5,this.heat+.18);
    }
    if(this.gate.hp>0&&Math.abs(p.x)<6&&Math.abs(p.z-17)<3){this.gate.hp--;this.burst(p.x,17);this.heat=Math.min(5,this.heat+.1);hit=true;if(this.gate.hp<=0){this.score+=150;this.say('The line is open. Kabir is ahead.',3);}}
    if(this.roadblock&&Math.abs(p.x+34)<6&&Math.abs(p.z+17)<3){this.roadblock=false;this.burst(-34,-17);this.say('Roadblock cleared.',2);hit=true;}
    if(!hit)this.say('Too far. Close the gap or aim toward a nearby opponent or barricade.',1.4);
    return true;
  }
  dash(){
    const p=this.player;if(this.mode!=='playing')return false;
    if(this.van.occupied){this.input.brake=true;return true;}
    if(p.dashCd>0||p.stamina<15)return false;
    p.dash=.30;p.dashCd=1.6;p.stamina-=15;this.burst(p.x,p.z,'teal',5);return true;
  }
  nearby(){
    if(this.van.occupied)return {id:'exit',label:'EXIT VAN'};
    if(!this.friend.rescued&&dist(this.player,this.friend)<3.2)return {id:'rescue',label:'RESCUE KABIR'};
    if(dist(this.player,this.van)<4.2)return {id:'van',label:'ENTER VAN'};
    return null;
  }
  interact(){
    if(this.mode!=='playing')return;
    if(this.van.occupied){
      if(this.readyWin()){this.win();return;}
      for(const side of [-1,1]){
        const x=this.van.x+Math.cos(this.van.yaw)*2.3*side,z=this.van.z-Math.sin(this.van.yaw)*2.3*side;
        if(this.valid(x,z)){this.van.occupied=false;this.van.speed=0;this.player.x=x;this.player.z=z;this.friend.aboard=false;this.friend.x=x+1;this.friend.z=z+1;this.say('On foot. The van remains where you left it.');return;}
      }this.say('No room to exit. Move the van away from the wall.');return;
    }
    const n=this.nearby();
    if(n?.id==='rescue'){
      if(this.enemies.some(e=>e.hp>0&&dist(e,this.friend)<4.5)){this.say('Clear the nearby guards or draw them away before helping Kabir.',3);return;}
      this.friend.rescued=true;this.helped=1;this.score+=250;this.player.health=Math.min(6,this.player.health+1);this.checkpoint={x:2,z:7,gate:this.gate.hp,record:this.record,rescued:true};
      this.say('Kabir is with you. Take the recording and reach the volunteer van.',4);return;
    }
    if(n?.id==='van'){
      if(!this.friend.rescued||!this.record){this.say('Rescue Kabir and recover the recording before leaving.',3);return;}
      if(dist(this.friend,this.van)>7){this.say('Wait for Kabir to catch up to the van.',3);return;}
      this.van.occupied=true;this.friend.aboard=true;this.car.active=true;this.heat=Math.max(2.6,this.heat);
      if(!this.escapeStarted){this.roadblock=true;this.escapeStarted=true;this.car.x=-4;this.car.z=-4;this.car.yaw=Math.PI/2;this.car.route=[];this.car.routeAge=0;}
      this.checkpoint={x:this.van.x,z:this.van.z,yaw:this.van.yaw,gate:this.gate.hp,roadblock:this.roadblock,record:true,rescued:true,vehicle:true};this.say('Both aboard. Escape through the side streets. Lose sight of the pursuers, then reach the western safe house.',5);
    }
  }
  hurt(amount=1){
    const p=this.player;if(p.hurt>0||p.dash>0||this.mode!=='playing')return;
    p.health-=amount;p.hurt=1.1;this.score=Math.max(0,this.score-30);this.burst(p.x,p.z,'red',5);
    if(p.health<=0){this.mode='caught';this.say('Caught during the crackdown. Retry the last rescue checkpoint.');}
    else this.say('Hit. Strike to interrupt, or dash out of the red circle.',2);
  }
  carHit(amount){
    if(this.van.hurt>0)return;this.van.health=Math.max(0,this.van.health-amount);this.van.hurt=1;this.crashes++;this.van.speed*=.3;
    this.burst(this.van.x,this.van.z,'gold',6);
    if(this.van.health<=0){this.mode='caught';this.say('The van is disabled. Retry from the boarding checkpoint.');}
  }
  readyWin(){return this.van.occupied&&this.friend.aboard&&this.record&&dist(this.van,WORLD.safe)<5&&this.heat<.7&&Math.abs(this.van.speed)<4;}
  win(){this.mode='won';this.score+=Math.round(this.player.health*100+this.van.health*3+Math.max(0,360-this.time)*2);this.say('People and evidence reached safety. The network has a route forward.');}
  retry(){
    const c=this.checkpoint;this.start();if(!c)return;
    this.gate.hp=c.gate;this.record=c.record;this.friend.rescued=c.rescued;this.helped=1;this.player.x=c.x;this.player.z=c.z;this.friend.x=c.x+1;this.friend.z=c.z+1;
    if(c.vehicle){
      this.van.x=c.x;this.van.z=c.z;this.van.yaw=c.yaw??Math.PI/2;this.van.occupied=true;this.friend.aboard=true;this.car.active=true;this.escapeStarted=true;this.heat=2.4;this.roadblock=c.roadblock??true;
      const behind={x:c.x-Math.sin(this.van.yaw)*14,z:c.z-Math.cos(this.van.yaw)*14};
      if(this.valid(behind.x,behind.z,1.1)){this.car.x=behind.x;this.car.z=behind.z;}else{this.car.x=0;this.car.z=clamp(c.z+14,-52,52);}
      this.lastSeen={x:c.x,z:c.z};
    }else this.lastSeen={x:c.x,z:c.z};
    this.enemies.forEach((e,i)=>{e.x=(i%3-1)*4;e.z=c.z+12+i*2;});this.checkpoint=c;this.player.hurt=2;this.say('Checkpoint restored. Try another escape route.',3);
  }
  objective(){
    if(!this.friend.rescued)return 'RESCUE KABIR · clear or evade the guards';
    if(!this.record)return 'RECOVER THE RECORDING · walk over the gold marker';
    if(!this.van.occupied)return 'BOARD THE VOLUNTEER VAN · bring Kabir with you';
    if(this.heat>=.7)return this.seen?'BREAK LINE OF SIGHT · use buildings and side streets':'SEARCH IN PROGRESS · stay out of sight';
    return 'REACH THE WESTERN SAFE HOUSE · park inside the green circle';
  }
  target(){return !this.friend.rescued?this.friend:!this.record?WORLD.record:!this.van.occupied?this.van:WORLD.safe;}
  update(dt){
    if(this.mode!=='playing')return;
    dt=Math.min(dt,.05);this.time+=dt;this.messageTime=Math.max(0,this.messageTime-dt);
    const p=this.player,v=this.van,i=this.input;
    for(const k of ['hurt','dash','dashCd','attack','attackCd'])p[k]=Math.max(0,p[k]-dt);
    v.hurt=Math.max(0,v.hurt-dt);
    const mag=Math.min(1,Math.hypot(i.x,i.z)),dx=i.x/Math.max(1,Math.hypot(i.x,i.z)),dz=i.z/Math.max(1,Math.hypot(i.x,i.z));
    if(v.occupied){
      let corner=0;
      if(mag>.12){const wanted=Math.atan2(dx,dz);corner=Math.abs(turn(v.yaw,wanted));v.yaw+=turn(v.yaw,wanted)*Math.min(1,dt*5.8);}
      const desired=i.brake?0:mag*19*(corner>.35?Math.max(.35,Math.cos(corner)):1);
      v.speed+=(desired-v.speed)*Math.min(1,dt*(i.brake?9:mag<.1?5:corner>.65?4.5:2));
      const travel=this.move(v,Math.sin(v.yaw)*v.speed*dt,Math.cos(v.yaw)*v.speed*dt,1.2);
      if(v.speed>4&&travel<v.speed*dt*.2)this.carHit(8);
      p.x=v.x;p.z=v.z;p.yaw=v.yaw;this.friend.x=v.x;this.friend.z=v.z;
      if(dist(v,WORLD.safe)<5){if(this.readyWin())this.win();else if(this.heat>=.7&&this.messageTime===0)this.say('Do not lead the pursuit to the safe house. Lose them first.');}
    }else{
      const sprint=i.sprint&&p.stamina>8&&mag>.1,speed=p.dash>0?13:sprint?6.5:4.2;
      let mx=dx,mz=dz;if(p.dash>0&&mag<.1){mx=Math.sin(p.yaw);mz=Math.cos(p.yaw);}
      this.move(p,mx*speed*dt,mz*speed*dt);
      if(mag>.1&&p.attack<=0)p.yaw=Math.atan2(dx,dz);
      p.stamina=clamp(p.stamina+(sprint?-15:17)*dt,0,100);
      if(i.attack)this.attack();
      if(!this.record&&dist(p,WORLD.record)<1.7){this.record=true;this.score+=200;this.burst(p.x,p.z);this.say('Recording secured. Nobody is left behind.',3);if(this.checkpoint)this.checkpoint.record=true;}
      for(const s of this.supplies)if(!s.taken&&dist(p,s)<1.5){s.taken=true;p.health=Math.min(6,p.health+2);p.stamina=100;this.say('First aid · recovered health and stamina.',2);}
      if(this.friend.rescued){if(dist(p,this.friend)>1.8)this.chase(this.friend,p,dt,5.6);if(dist(p,this.friend)>13&&this.messageTime===0)this.say('Kabir is falling behind. Slow down and regroup.',2);}
    }
    let visible=false;
    for(const e of this.enemies){
      e.cooldown=Math.max(0,e.cooldown-dt);e.stun=Math.max(0,e.stun-dt);
      if(e.hp<=0){e.down=Math.min(1,e.down+dt*3);continue;}if(e.stun>0)continue;
      const d=dist(e,p),sight=d<19&&this.line(e,p);
      if(sight){visible=true;e.last={x:p.x,z:p.z};this.lastSeen={x:p.x,z:p.z};}
      if(e.windup>0){e.windup-=dt;if(e.windup<=0){e.cooldown=1.8;if(d<2.5&&!v.occupied)this.hurt();}continue;}
      if(!v.occupied&&d<2.1&&e.cooldown<=0){e.windup=.75;continue;}
      const speed=2.6+(this.heat>3?.6:0);
      if(!v.occupied&&sight&&d<1.55){e.yaw=Math.atan2(p.x-e.x,p.z-e.z);}
      else this.chase(e,sight?p:this.hidden<6?e.last:e.home,dt,speed);
    }
    // Separate live opponents so their anticipation and condition remain readable.
    for(let a=0;a<this.enemies.length;a++)for(let b=a+1;b<this.enemies.length;b++){
      const e=this.enemies[a],f=this.enemies[b];if(e.hp<=0||f.hp<=0)continue;
      let dx=e.x-f.x,dz=e.z-f.z,d=Math.hypot(dx,dz);if(d>=.9)continue;
      if(d<.001){dx=a%2?1:-1;dz=.2;d=Math.hypot(dx,dz);}
      const amount=Math.min(.06,dt*1.6);this.move(e,dx/d*amount,dz/d*amount);this.move(f,-dx/d*amount,-dz/d*amount);
    }
    if(this.car.active){
      const c=this.car,d=dist(c,p),sight=d<26&&this.line(c,p);
      if(sight){visible=true;this.lastSeen={x:p.x,z:p.z};}
      c.speed=this.chase(c,sight?p:this.lastSeen,dt,sight?10:6,1.1)/Math.max(.001,dt);
      if(v.occupied&&d<2.9&&v.hurt===0)this.carHit(12);
    }
    this.seen=visible;
    if(visible){this.hidden=0;this.heat=Math.min(5,this.heat+dt*.035);this.phase=this.heat>=3?'roadblock':'pursuit';}
    else{this.hidden+=dt;this.phase=this.hidden>1?'search':'pursuit';if(this.hidden>4)this.heat=Math.max(0,this.heat-dt*.42);if(this.heat<.7)this.phase='clear';}
    if(this.gate.hp<=0)this.gate.fall=Math.min(1,this.gate.fall+dt*2);
    for(const q of this.particles){q.life-=dt;q.x+=q.vx*dt;q.z+=q.vz*dt;q.y+=q.vy*dt;q.vy-=9*dt;}
    this.particles=this.particles.filter(q=>q.life>0);
  }
  text(){return {mode:this.mode,coordinates:'x east, z south; fictional compressed Delhi-inspired grid',time:+this.time.toFixed(2),player:{...this.player},van:{...this.van},friend:{...this.friend},record:this.record,gate:{hp:this.gate.hp},heat:+this.heat.toFixed(2),seen:this.seen,hidden:+this.hidden.toFixed(2),phase:this.phase,roadblock:this.roadblock,objective:this.objective(),target:this.target(),near:this.nearby(),enemies:this.enemies.map(({id,x,z,hp,stun,windup})=>({id,x:+x.toFixed(2),z:+z.toFixed(2),hp,stun:+stun.toFixed(2),windup:+windup.toFixed(2)})),car:{x:this.car.x,z:this.car.z,active:this.car.active},strikes:this.hits,score:this.score,crashes:this.crashes,checkpoint:this.checkpoint};}
}
