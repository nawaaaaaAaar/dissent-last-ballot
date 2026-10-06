// Original fictional encounter. Local metre-like coordinates, not an exact map.
export const WALLS=[
 {id:'west',x:-9,z:-18,w:1,d:86},{id:'east',x:9,z:-18,w:1,d:86},
 {id:'bus',x:5.8,z:-7,w:2.9,d:9},
 {id:'aid',x:-6,z:8,w:2,d:1},
 {id:'cart',x:-2.7,z:-3,w:2.1,d:1.1},
 {id:'rail-west',x:-7.3,z:-18,w:2.3,d:.4},
 {id:'vault',x:-5.6,z:-18,w:1.1,d:.65},
 {id:'rail-east',x:6,z:-18,w:5,d:.4},
 {id:'gate',x:.1,z:-18,w:7.6,d:.45},
 {id:'roadwork',x:2,z:-48,w:5,d:1.5},
];
const len=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const turns=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
export class Line{
 constructor(){this.mode='menu';this.reset();}
 reset(){
  this.time=0;this.phase='reach';this.mode='menu';this.events=[];this.message='';this.messageTime=0;
  this.p={x:0,z:17,yaw:Math.PI,hp:6,stamina:100,speed:0,attack:null,dodge:0,dodgeCd:0,hurt:0,counter:0,combo:0,comboTime:0,traversal:null};
  this.friend={x:-3.8,z:-8.8,yaw:0,rescued:false,aboard:false,state:'captive',speed:0};
  this.van={x:2.5,z:-31,yaw:Math.PI,speed:0,hp:100,occupied:false};
  this.props=WALLS.map(o=>({...o}));this.gateHp=3;this.gateFall=0;this.cartShift=0;
  this.enemies=[
   {x:-1.8,z:7,role:'patrol',hp:3},{x:2.1,z:4.2,role:'rush',hp:3},
   {x:-3.4,z:-6,role:'shield',hp:4},{x:.4,z:-9.6,role:'patrol',hp:3},
   {x:1.2,z:-24,role:'rush',hp:3},{x:6.5,z:-25,role:'patrol',hp:3},
  ].map((e,i)=>({...e,id:i,yaw:0,active:i<4,state:'watch',stun:0,cool:1+i*.25,wind:0,attack:0,recovery:0,broken:0,downTime:0,target:null}));
  this.input={x:0,z:0,attack:false,action:false,run:false,brake:false};
  this.checkpoint=null;this.distance=0;this.rams=0;this.sirenTime=0;this.rescueHold=0;this.contactSerial=0;this.hitstop=0;this.aidUsed=false;
 }
 start(){this.reset();this.mode='playing';this.say('Sana: Kabir is by the bus. Get him out. I’ll keep the van ready.',5);}
 say(text,t=3.6){this.message=text;this.messageTime=t;}
 event(type,x=this.p.x,z=this.p.z){this.events.push({type,x,z});}
 obstacles(){
  return this.props.filter(o=>o.id!=='gate'||this.gateHp>0).map(o=>o.id==='cart'?{...o,z:o.z+this.cartShift}:o);
 }
 blocked(x,z,r=.3,ignore=''){
  if(z>23||z<-77)return true;
  return this.obstacles().some(o=>o.id!==ignore&&Math.abs(x-o.x)<o.w/2+r&&Math.abs(z-o.z)<o.d/2+r);
 }
 move(o,dx,dz,r=.3,ignore='',body=false){
  const blocks=(x,z)=>this.blocked(x,z,r,ignore)||(body&&this.enemies.some(e=>e.hp>0&&Math.hypot(e.x-x,e.z-z)<.72&&Math.hypot(e.x-o.x,e.z-o.z)>=.70));
  if(!blocks(o.x+dx,o.z))o.x+=dx;
  if(!blocks(o.x,o.z+dz))o.z+=dz;
 }
 visible(a,b){
  const d=len(a,b);
  for(let i=1;i<d*3;i++){const t=i/(d*3);if(this.blocked(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,.02))return false;}
  return true;
 }
 nearest(){
  return this.enemies.filter(e=>e.hp>0&&e.active&&len(e,this.p)<2.3&&this.visible(this.p,e)).sort((a,b)=>len(a,this.p)-len(b,this.p))[0];
 }
 strike(){
  const p=this.p;if(this.mode!=='playing'||this.van.occupied||p.attack||p.dodge>0||p.traversal||p.stamina<10)return;
  p.combo=p.comboTime>0?(p.combo+1)%3:0;p.comboTime=1.1;
  const e=this.nearest();if(e)p.yaw=Math.atan2(e.x-p.x,e.z-p.z);
  else if(Math.abs(p.z+18)<2&&Math.abs(p.x)<4)p.yaw=p.z>-18?Math.PI:0;
  p.attack={time:0,duration:p.combo===2?.62:.43,contact:p.combo===2?.28:.17,resolved:false,yaw:p.yaw,clip:['Jab','Cross','Push'][p.combo]};
  p.stamina-=10;p.speed=0;
 }
 dodge(){
  const p=this.p;if(this.mode!=='playing'||this.van.occupied||p.dodgeCd>0||p.stamina<18||p.traversal)return;
  p.attack=null;p.dodge=.29;p.dodgeCd=.68;p.stamina-=18;
  const d=Math.hypot(this.input.x,this.input.z);p.dodgeYaw=d>.1?Math.atan2(this.input.x,this.input.z):p.yaw;
  this.event('miss');
 }
 context(){
  if(this.mode!=='playing'||this.van.occupied)return this.van.occupied?{id:'brake',label:'BRAKE'}:null;
  const p=this.p;
  if(!this.friend.rescued&&len(p,this.friend)<1.7)return {id:'rescue',label:'HOLD · FREE KABIR'};
  if(this.friend.rescued&&len(p,this.van)<2.8)return {id:'van',label:len(this.friend,this.van)<4?'GET IN TOGETHER':'WAIT FOR KABIR'};
  if(Math.abs(p.x+5.6)<1.4&&Math.abs(p.z+18)<1.6)return {id:'vault',label:'VAULT THE SIDE RAIL'};
  const cart=this.props.find(o=>o.id==='cart');
  if(len(p,{x:cart.x,z:cart.z+this.cartShift})<2)return {id:'cart',label:this.cartShift?'PULL SCREEN BACK':'PUSH THE SCREEN'};
  if(!this.aidUsed&&len(p,{x:-6,z:8})<1.5&&p.hp<6)return {id:'aid',label:'TAKE A BREATH'};
  return null;
 }
 action(){
  const c=this.context(),p=this.p;if(!c||p.attack||p.traversal)return;
  if(c.id==='cart'){this.cartShift=this.cartShift?0:2.6;this.event('wheel');this.say('A moved screen blocks sight. A side approach stays open.',2.5);}
  if(c.id==='vault'){
   p.traversal={time:0,duration:.8,from:{x:p.x,z:p.z},to:{x:-5.6,z:p.z>-18?-19.5:-16.4}};
   p.attack=null;p.yaw=p.z>-18?Math.PI:0;this.event('miss');
  }
  if(c.id==='aid'){p.hp=Math.min(6,p.hp+2);this.aidUsed=true;this.say('Volunteer: Stay with your friend. The van is beyond the line.');}
  if(c.id==='van'&&len(this.friend,this.van)<4){
   this.friend.aboard=true;this.van.occupied=true;this.phase='drive';p.x=this.van.x;p.z=this.van.z;
   this.checkpoint='drive';this.sirenTime=0;this.say('Sana: Drive. The works block the right lane. Take the left, then the shelter.',4);
  }
 }
 resolve(){
  const p=this.p,a=p.attack,reach=p.combo===2?1.5:1.35;
  let hit=false;
  for(const e of this.enemies){
   if(!e.active||e.hp<=0||len(p,e)>reach||Math.abs(turns(a.yaw,Math.atan2(e.x-p.x,e.z-p.z)))>.95)continue;
   if(!this.visible(p,e))continue;
   const guarded=e.role==='shield'&&e.broken<=0&&Math.abs(turns(e.yaw,Math.atan2(p.x-e.x,p.z-e.z)))<1.2;
   if(guarded&&p.combo!==2&&p.counter<=0){e.stun=.12;this.event('shield',e.x,e.z);}
   else{
    e.hp-=p.counter>0?2:1;e.stun=p.combo===2?1.1:.45;e.wind=0;e.attack=0;e.cool=.8;e.broken=p.combo===2?2:e.broken;
    this.move(e,Math.sin(a.yaw)*(p.combo===2?1.2:.35),Math.cos(a.yaw)*(p.combo===2?1.2:.35),.33);
    this.event('body',e.x,e.z);this.hitstop=.035;
    if(e.hp<=0){e.state='down';e.downTime=0;}
   }
   hit=true;break;
  }
  if(!hit&&this.gateHp>0&&Math.abs(p.x)<4.1&&Math.abs(p.z+18)<reach+.3&&Math.abs(turns(a.yaw,p.z>-18?Math.PI:0))<.8){
   this.gateHp--;this.event('barrier',p.x,-18);hit=true;
   if(!this.gateHp)this.say('The line is open. Keep Kabir with you.',2.6);
  }
  if(!hit)this.event('miss');
  p.counter=0;this.contactSerial++;
 }
 retry(){
  if(this.checkpoint==='drive'){
   this.p.hp=6;this.van.hp=100;this.van.x=2.5;this.van.z=-31;this.van.speed=0;this.van.yaw=Math.PI;this.van.occupied=true;
   this.p.x=2.5;this.p.z=-31;this.sirenTime=0;this.mode='playing';this.input={x:0,z:0,attack:false,action:false,run:false,brake:false};this.say('Sana: Left of the works. We’re still together.');return;
  }this.start();
 }
 update(dt){
  if(this.mode!=='playing')return;
  if(this.hitstop>0){this.hitstop-=dt;return;}
  this.time+=dt;this.messageTime=Math.max(0,this.messageTime-dt);
  const p=this.p,i=this.input;for(const key of['dodge','dodgeCd','hurt','counter','comboTime'])p[key]=Math.max(0,p[key]-dt);
  p.stamina=Math.min(100,p.stamina+dt*(p.attack?4:26));
  if(this.gateHp<=0)this.gateFall=Math.min(1,this.gateFall+dt*2);
  if(this.van.occupied){this.drive(dt);return;}
  if(p.traversal){
   const t=p.traversal;t.time+=dt;const f=clamp((t.time/t.duration-.12)/.72,0,1),s=f*f*(3-2*f);
   p.x=t.from.x+(t.to.x-t.from.x)*s;p.z=t.from.z+(t.to.z-t.from.z)*s;p.height=Math.sin(f*Math.PI)*.65;
   if(t.time>=t.duration){p.traversal=null;p.height=0;this.event('land');}
  }else if(p.dodge>0){this.move(p,Math.sin(p.dodgeYaw)*dt*7,Math.cos(p.dodgeYaw)*dt*7);}
  else if(p.attack){
   const a=p.attack;a.time+=dt;p.yaw=a.yaw;
   if(a.time<a.contact)this.move(p,Math.sin(a.yaw)*dt*.6,Math.cos(a.yaw)*dt*.6,.3,'',true);
   if(!a.resolved&&a.time>=a.contact){a.resolved=true;this.resolve();}
   if(a.time>=a.duration)p.attack=null;
  }else{
   const d=Math.hypot(i.x,i.z),speed=d>.05?(i.run?4.4:3.1)*Math.min(1,d):0;
   p.speed=speed;if(d>.05){p.yaw+=turns(p.yaw,Math.atan2(i.x,i.z))*Math.min(1,dt*15);this.move(p,i.x/Math.max(d,1)*speed*dt,i.z/Math.max(d,1)*speed*dt,.3,'',true);}
  }
  if(i.attack&&!p.attack)this.strike();
  if(i.action&&this.context()?.id==='rescue'){
   this.rescueHold+=dt;
   if(this.rescueHold>.65){
    this.friend.rescued=true;this.friend.state='follow';this.phase='escape';
    this.enemies.forEach(e=>e.active=true);this.event('wheel');
    this.say('Kabir: I have the recording. They cannot erase every account. Together, to the van.',4);this.rescueHold=0;
   }
  }else this.rescueHold=Math.max(0,this.rescueHold-dt*.5);
  this.enemyUpdate(dt);this.companionUpdate(dt);
  if(p.hp<=0){this.mode='failed';this.say('Caught at the line. Retry the encounter.');}
 }
 enemyUpdate(dt){
  const p=this.p;
  const attacking=this.enemies.filter(e=>e.hp>0&&(e.wind>0||e.attack>0)).length;
  let reserved=attacking;
  for(const e of this.enemies){
   if(e.hp<=0){e.downTime+=dt;continue;}if(!e.active)continue;
   for(const k of['stun','cool','broken','recovery'])e[k]=Math.max(0,e[k]-dt);
   if(e.stun>0){e.state='stagger';continue;}
   const d=len(e,p);if(e.wind>0){
    e.wind-=dt;e.state='windup';
    if(e.wind<=0){e.attack=.4;e.hit=false;e.target={x:p.x,z:p.z};}continue;
   }
   if(e.attack>0){
    e.attack-=dt;e.state='strike';
    if(e.attack<.21&&!e.hit){
     e.hit=true;
     if(d<1.6&&Math.abs(turns(e.yaw,Math.atan2(p.x-e.x,p.z-e.z)))<.9&&!p.traversal){
      if(p.dodge>0){p.counter=.8;e.broken=2;e.stun=.8;this.say('OPENING · strike now',1);this.event('miss');}
      else if(p.hurt<=0){p.hp--;p.hurt=.8;p.attack=null;this.event('hurt');this.move(p,Math.sin(e.yaw)*.65,Math.cos(e.yaw)*.65);}
     }
    }
    if(e.attack<=0){e.cool=1.1;e.recovery=.45;}continue;
   }
   if(e.recovery>0){e.state='recover';continue;}
   if(d>9||!this.visible(e,p)){e.state='watch';continue;}
   e.yaw+=turns(e.yaw,Math.atan2(p.x-e.x,p.z-e.z))*Math.min(1,dt*8);
   if(d<1.55&&e.cool<=0&&reserved<2){e.wind=e.role==='shield'?.85:.68;e.state='windup';reserved++;continue;}
   if(d>1.12){
    let ax=(p.x-e.x)/d,az=(p.z-e.z)/d;
    for(const other of this.enemies)if(other!==e&&other.hp>0){const nd=len(e,other);if(nd<1.1&&nd>.01){ax+=(e.x-other.x)/nd*.55;az+=(e.z-other.z)/nd*.55;}}
    const n=Math.hypot(ax,az),speed=e.role==='rush'?2.9:2.1;this.move(e,ax/Math.max(1,n)*speed*dt,az/Math.max(1,n)*speed*dt,.32);e.state='advance';
   }else e.state='guard';
  }
 }
 companionUpdate(dt){
  const f=this.friend,p=this.p;if(!f.rescued||f.aboard)return;
  if(f.traversal){const v=f.traversal;v.time+=dt;const t=Math.min(1,v.time/.8);f.z=v.from+(v.to-v.from)*(t*t*(3-2*t));f.height=Math.sin(t*Math.PI)*.6;f.state='vault';f.speed=0;if(t>=1){f.traversal=null;f.height=0;}return;}
  const threat=this.enemies.find(e=>e.hp>0&&(e.wind>0||e.attack>0)&&len(e,f)<2.5);
  if(threat){f.state='brace';f.speed=0;return;}
  const d=len(f,p);f.state=d>2?'follow':'ready';f.speed=d>2?3.45:0;
  if(d>2){f.yaw=Math.atan2(p.x-f.x,p.z-f.z);let dx=(p.x-f.x)/d*f.speed*dt,dz=(p.z-f.z)/d*f.speed*dt;
   if(this.blocked(f.x+dx,f.z+dz,.3)){
    // Deliberate side-rail route when the middle line remains closed.
    const q=this.gateHp>0&&f.z>-18&&p.z<-18?{x:-5.6,z:-16}:null;
    if(q){const nd=len(f,q);dx=(q.x-f.x)/Math.max(.1,nd)*f.speed*dt;dz=(q.z-f.z)/Math.max(.1,nd)*f.speed*dt;
     if(nd<1){f.x=-5.6;f.traversal={time:0,from:f.z,to:-19.5};}}
    else if(this.blocked(f.x+dx,f.z,.3))dx=-Math.sign(dx||1)*dt;
   }this.move(f,dx,dz,.3,'vault');
  }
 }
 drive(dt){
  const v=this.van,p=this.p,i=this.input;this.sirenTime+=dt;
  const d=Math.hypot(i.x,i.z),target=d>.1?Math.atan2(i.x,i.z):v.yaw;
  v.yaw+=turns(v.yaw,target)*Math.min(1,dt*3.5);
  const speed=i.brake?0:d>.1?8.5*Math.min(1,d):0;
  v.speed+=(speed-v.speed)*Math.min(1,dt*(i.brake?6:2));
  const dx=Math.sin(v.yaw)*v.speed*dt,dz=Math.cos(v.yaw)*v.speed*dt;
  const ox=v.x,oz=v.z;
  if(!this.blocked(v.x+dx,v.z+dz,.95)){v.x+=dx;v.z+=dz;}
  else{v.speed*=.7;if(this.sirenTime-this.lastCrash>1||!this.lastCrash){v.hp-=8;this.lastCrash=this.sirenTime;this.event('barrier',v.x,v.z);this.say('Give the works more room. Left lane.',2);}}
  p.x=v.x;p.z=v.z;p.yaw=v.yaw;this.distance+=len(v,{x:ox,z:oz});
  const beat=this.sirenTime%7;
  if(beat>4.5&&beat<5.3)this.ramWarning=true;else this.ramWarning=false;
  const k=Math.floor(this.sirenTime/7);
  if(k>this.rams){this.rams=k;if(Math.abs(v.x-2)<1.5){v.hp-=12;this.event('hurt',v.x,v.z);this.say('Patrol on the right. Keep left.',2);}}
  if(v.z<-68&&Math.abs(v.x)<7){this.mode='won';this.phase='safe';this.say('Sana: The account is safe. Now it belongs to everyone.');}
  if(v.hp<=0){this.mode='failed';this.say('The van cannot continue. Retry the escape checkpoint.');}
 }
 get objective(){
  return this.phase==='reach'?'Find Kabir by the police bus':this.phase==='escape'?'Get Kabir through the line and into the van':this.phase==='drive'?'Left of the roadworks. Reach the shelter.':'The account survives';
 }
 state(){return {version:'0.18.0',mode:this.mode,phase:this.phase,time:this.time,coordinates:'x east / z south, authored Jantar Mantar-inspired street; not exact geography',player:this.p,friend:this.friend,van:this.van,enemies:this.enemies,gateHp:this.gateHp,cartShift:this.cartShift,context:this.context(),rescueHold:this.rescueHold,objective:this.objective,message:this.message,ramWarning:this.ramWarning,contactSerial:this.contactSerial};}
}
