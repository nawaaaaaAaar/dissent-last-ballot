import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import {human,loadHuman,poseHuman} from './visuals.js?v=0.5.2';
import {materials as M,box,cylinder,label,sign,mergeStatic,barricade,bus,observatory,ramaYantra,bench,lamp,tent} from './world-props.js?v=0.5.2';
import {EffectComposer,RenderPass,SSAOPass,OutputPass} from './effects.js';

const $=id=>document.getElementById(id),coarse=matchMedia('(pointer:coarse)').matches||innerWidth<700;
const asset=n=>(window.origin==='null'?'https://raw.githubusercontent.com/nawaaaaaAaar/dissent-last-ballot/main/docs/assets/':'./assets/')+n+'?v=0.5.2';
const s={mode:'loading',x:0,z:31,y:0,vy:0,yaw:0,pitch:.35,time:0,move:0,sprint:false,
  tasks:{organiser:false,aid:false,witness:false,barrier:false,assembly:false},solidarity:0,pressure:0,
  quality:coarse?'low':'high',sound:false,near:null,dialog:null,checkpoint:null,capture:0,reduced:false};
const keys=new Set(),joy={x:0,y:0},actors=[],police=[],trees=[],flags=[],colliders=[],events=[];
let renderer,scene,camera,player,composer,ssao,sun,treeSource,barriers=[],clock,manual=false,last=0,anim=0,fps=0,frames=0,frameStart=performance.now(),toastTime=0,cameraDrag=null,ambient;
const rng=seed=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;},rand=rng(5108);
const objectives=[
  ['organiser','Meet the organiser at the gathering'],
  ['aid','Help at the first-aid table'],
  ['witness',"Protect the journalist's account"],
  ['barrier','Confront the barricade'],
  ['assembly','Bring the account to the assembly']
];
function toast(text,time=4){$('toast').textContent=text;toastTime=time;$('toast').classList.add('show');}
function mode(m){
  s.mode=m;$('menu').hidden=m!=='menu';$('hud').hidden=['loading','menu','error'].includes(m);
  $('dialog').hidden=m!=='dialog';$('pause-screen').hidden=m!=='paused';$('ending').hidden=m!=='won'&&m!=='caught';
  $('controls').hidden=m!=='playing';$('pause').hidden=!['playing','dialog','paused'].includes(m);
  $('pause').textContent=m==='paused'?'Resume':'Pause';$('interact').hidden=m!=='playing'||!s.near;
  $('retry').hidden=m!=='caught';
  document.body.classList.toggle('playing',m!=='menu'&&m!=='loading');
}
async function tex(name,repeat=1,srgb=false){
  const t=await new THREE.TextureLoader().loadAsync(asset(name));t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat,repeat);
  t.colorSpace=srgb?THREE.SRGBColorSpace:THREE.NoColorSpace;t.anisotropy=4;return t;
}
async function materials(){
  const [road,norm,rough,wall,wallN,wallR,lime,grass,grassN]=await Promise.all([
    tex('asphalt-diff.webp',1,true),tex('asphalt-normal.webp'),tex('asphalt-rough.webp'),
    tex('concrete-diff.webp',2,true),tex('concrete-nor_gl.webp',2),tex('concrete-rough.webp',2),
    tex('limewash.webp',1.3,true),tex('grass-diff.webp',1,true),tex('grass-normal.webp')
  ]);
  M.road=new THREE.MeshStandardMaterial({map:road,normalMap:norm,roughnessMap:rough,color:'#b4b5ac',roughness:.98,normalScale:new THREE.Vector2(.3,.3)});
  M.cream.map=lime;M.cream.normalMap=wallN;M.cream.roughnessMap=wallR;M.cream.normalScale=new THREE.Vector2(.14,.14);
  M.red.map=lime.clone();M.red.map.repeat.set(.16,.16);M.red.normalMap=wallN;M.red.normalScale=new THREE.Vector2(.09,.09);M.red.color.set('#b5573c');
  M.paving=new THREE.MeshStandardMaterial({map:wall,normalMap:wallN,roughness:1,color:'#b6b2a2',normalScale:new THREE.Vector2(.25,.25)});
  M.grass=new THREE.MeshStandardMaterial({map:grass,normalMap:grassN,color:'#a1b184',roughness:1,normalScale:new THREE.Vector2(.25,.25)});
}
function ground(mat,x,z,w,d,y=0){
  const geo=new THREE.PlaneGeometry(w,d);const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/3,uv.getY(i)*d/3);
  const mesh=new THREE.Mesh(geo,mat);mesh.rotation.x=-Math.PI/2;mesh.position.set(x,y,z);mesh.receiveShadow=true;scene.add(mesh);return mesh;
}
function buildWorld(){
  ground(M.road,0,-7,20,96,.01);ground(M.paving,-19,5,18,36,.15);
  ground(M.paving,-10.2,-7,1.5,96,.16);ground(M.paving,10.2,-7,1.5,96,.16);
  ground(M.sand,29,-12,36,110,-.03);
  ground(M.grass,31,-12,31,104,0);
  const stat=new THREE.Group();
  for(let z=-54;z<41;z+=2.2){
    box(stat,M.cream,11.3,.42,z,.30,.84,2.15);
    for(let k=0;k<5;k++)box(stat,M.metal,11.3,1.36,z-.9+k*.42,.035,1.27,.035);
    box(stat,M.metal,11.3,2.02,z,.038,.035,2.2);
    box(stat,M.cream,-11.25,.10,z,.17,.20,2.16);
  }
  // Compound walls and varied civic façades, not a repeating runner corridor.
  for(let z=-48;z<35;z+=17){
    const x=z>-25?-34:-19,h=z%2?7.4:9.2,width=z>-25?12:13;
    box(stat,M.cream,x,h/2,z,width,h,15);
    box(stat,M.white,x,h+.1,z,width+.25,.25,15.2);
    for(let k=-5;k<6;k+=3.7){
      for(let y=2.1;y<h-.8;y+=2.7){
        box(stat,M.dark,x+width/2+.025,y,z+k,.07,1.8,1.50);
        box(stat,M.glass,x+width/2+.07,y,z+k,.035,1.57,1.29);
        box(stat,M.cream,x+width/2+.16,y-.85,z+k,.33,.13,1.72);
        box(stat,M.wood,x+width/2+.11,y,z+k,.04,1.61,.06);
        box(stat,M.wood,x+width/2+.11,y,z+k,.04,.06,1.37);
      }
      box(stat,M.white,x+width/2+.7,3.2,z+k,1.7,.15,2.4);
      for(let dz of [-1,1])cylinder(stat,M.cream,x+width/2+1.1,1.6,z+k+dz,.105,3.2);
    }
    for(let y of [3.45,6.18])box(stat,M.cream,x+width/2+.07,y,z,.18,.13,14.9);
  }
  for(let z=-48;z<37;z+=14){lamp(stat,-10.5,z);lamp(stat,10.5,z+7);}
  for(let z=-45;z<37;z+=5)box(stat,M.white,0,.026,z,.095,.009,2.2);
  for(let z=-47;z<36;z+=3)for(let x of [-9.9,9.9])box(stat,z%2?M.dark:M.white,x,.18,z,.15,.25,1.5);
  for(let z of [-38,-5,17]){bench(stat,-10,z,Math.PI/2);bench(stat,10,z,-Math.PI/2);}
  tent(stat,-23,3);sign(stat,'FIRST AID',-23,2.94,4.84,3.5,.65,'#d3c6ab','#744637','COMMUNITY SUPPORT');
  tent(stat,-24,-7);sign(stat,'PUBLIC RECORD',-24,2.94,-5.16,3.5,.65,'#d3c6ab','#744637','KEEP THE ACCOUNT INTACT');
  const arch=observatory();arch.position.set(32,0,-17);arch.rotation.y=.08;stat.add(arch);
  for(let z of [13,31]){const r=ramaYantra();r.position.set(37,0,z);stat.add(r);}
  for(let x=17;x<44;x+=3){box(stat,M.sand,x,.08,-35,2.7,.16,1.6);box(stat,M.cream,x,.15,-35,.4,.30,.5);}
  const roadSign=sign(stat,'JANTAR MANTAR ROAD',7,3.15,21,4.1,1,'#244c42','#ede4cd','NEW DELHI • GAME GEOGRAPHY');
  for(let x of [5.1,8.9])cylinder(stat,M.metal,x,1.7,21,.05,3.4);
  sign(stat,'NO SILENCE. NO ERASURE.',-18,2.1,-11.2,6.2,1.35,'#b66244','#f4e7cb','OUR VOICES REMAIN');
  for(let x of [-21,-15])cylinder(stat,M.wood,x,1.3,-11.2,.035,2.6);
  scene.add(mergeStatic(stat));
  const b=bus();b.position.set(7.7,0,-25);scene.add(b);colliders.push({x:7.7,z:-25,w:3.2,d:9.2,name:'transport bus'});
  for(let x=-7.9;x<9;x+=3.15){const g=barricade();g.position.set(x,0,-33);scene.add(g);barriers.push(g);}
  for(let x of [-7,6]){const g=barricade();g.position.set(x,0,36);scene.add(g);}
  const supplies=new THREE.Group();
  for(let i=0;i<7;i++){
    const x=-24.1+i*.35;
    cylinder(supplies,M.glass,x,1.15,3,.075,.36);
    cylinder(supplies,M.white,x,1.34,3,.042,.03);
    cylinder(supplies,M.white,x,1.12,3,.077,.08);
  }
  box(supplies,M.white,-22.4,1.12,3,.52,.34,.35);
  box(supplies,M.red,-22.4,1.13,3.18,.08,.22,.012);
  box(supplies,M.red,-22.4,1.13,3.19,.22,.08,.012);
  for(let z of [1.6,2.4]){
    for(let x of [-24.3,-23.5]){
      box(supplies,M.wood,x,.36,z,.64,.48,.52);
      for(let y of [.18,.30,.42,.54])box(supplies,M.dark,x,y,z+.265,.55,.015,.008);
    }
  }
  for(let x of [-22.8,-22.2,-21.6]){
    box(supplies,M.white,x,.94,-7,.48,.008,.31);
    box(supplies,M.dark,x+.2,.953,-7,.012,.015,.21);
  }
  scene.add(mergeStatic(supplies));
  // Small surface details carry scale: bottles, papers, bins and curb stones.
  for(let i=0;i<36;i++){
    const paper=new THREE.Mesh(new THREE.PlaneGeometry(.18+rand()*.2,.26),M.white);
    paper.rotation.set(-Math.PI/2,0,rand()*6.28);paper.position.set(-8+rand()*16,.025,-31+rand()*60);scene.add(paper);
  }
  for(let z of [-12,10,27]){cylinder(scene,M.metal,-9.5,.55,z,.27,1.1);cylinder(scene,M.dark,-9.5,1.10,z,.29,.035);}
}
function addActor(x,z,color,pol=false){
  const p=human(color,pol,{bag:false,detail:false,skin:['#986748','#a57553','#865b40'][Math.floor(rand()*3)]});
  p.group.position.set(x,0,z);p.group.rotation.y=rand()*6.28;scene.add(p.group);
  const a={p,x,z,phase:rand()*6.28,police:pol,walking:false,poseClock:0};actors.push(a);if(pol)police.push(a);return a;
}
function event(id,x,z,title,prompt,color){
  const a=addActor(x,z,color),marker=new THREE.Group();
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.58,.026,6,32),new THREE.MeshBasicMaterial({color:'#d9af71'}));ring.rotation.x=Math.PI/2;ring.position.y=.028;marker.add(ring);
  const dot=new THREE.Mesh(new THREE.SphereGeometry(.07,12,8),new THREE.MeshBasicMaterial({color:'#e6c486'}));dot.position.y=2.35;marker.add(dot);
  marker.position.set(x,.02,z);scene.add(marker);events.push({id,x,z,title,prompt,a,marker});return a;
}
function populate(){
  event('organiser',-3,24,'THE ORGANISER','Talk to the organiser','#736b52');
  event('aid',-23,5,'COMMUNITY FIRST AID','Help at the first-aid table','#c2ad84');
  event('witness',-4,-20,'THE JOURNALIST','Speak to the journalist','#657387');
  event('barrier',-3,-29.6,'THE CONFRONTATION','Confront the barricade','#a26e55');
  event('assembly',-2,-45,'THE PUBLIC ASSEMBLY','Deliver the account','#677459');
  event('protest',-18,-7,'THE GATHERING','Join the protest','#906748');
  for(let i=0;i<15;i++){
    const clusters=[[-19,-6],[-24,8],[-16,15],[-5,22]];
    const c=clusters[Math.floor(i/4)];
    const x=c[0]+(i%4-1.5)*.9,z=c[1]+(i%2)*1.2+rand()*.5;
    const a=addActor(x,z,['#816251','#85907c','#676b7f','#c4b395','#6b7271'][i%5]);a.p.group.scale.setScalar(.92+rand()*.13);
    if(i===10||i===11)a.walking=true;
    if(i%3===0){const placard=new THREE.Group();cylinder(placard,M.wood,0,1.9,.12,.014,.85);
      const words=['VOTE CHORI BAND KARO','LET JOURNALISTS REPORT','ACCOUNTABILITY NOW','SAVE DEMOCRACY','OUR VOICES REMAIN'][i%5];
      sign(placard,words,0,2.35,.14,.8,.38,'#e5dcc5','#7d3b30');
      a.p.group.add(placard);a.placard=placard;
    }
  }
  for(let i=0;i<3;i++)addActor(4+i*1.3,-37-i,'#948264',true);
  for(let i=0;i<6;i++){
    const flag=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.8,8,3),new THREE.MeshStandardMaterial({color:i%2?'#a8543d':'#b8a37e',side:THREE.DoubleSide,roughness:1}));
    flag.position.set(-26+i*2.4,3.1,-9-i%2*3);flag.rotation.y=.25;scene.add(flag);flags.push(flag);
    cylinder(scene,M.wood,flag.position.x-.6,1.7,flag.position.z,.027,3.4);
  }
}
function addTrees(){
  const positions=[[15,29],[17,11],[15,-6],[17,-28],[21,-46],[-29,20],[-30,1],[-27,-22],[-25,-42],[42,-20],[44,8],[38,36]];
  for(let i=0;i<positions.length;i++){
    const g=treeSource.clone(true);g.position.set(positions[i][0],0,positions[i][1]);g.scale.setScalar(1.7+rand()*.8);g.rotation.y=rand()*6.28;
    g.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;if(o.material.name.includes('leaves')){o.material=o.material.clone();o.material.transparent=false;o.material.alphaTest=.35;o.material.depthWrite=true;o.material.roughness=.92;}}});
    scene.add(g);trees.push(g);
  }
}
function nearest(){
  let best=null,d=3.0;for(const e of events){const dist=Math.hypot(s.x-e.x,s.z-e.z);if(dist<d){best=e;d=dist;}}
  s.near=best;
  $('interact').hidden=s.mode!=='playing'||!best;
  if(best)$('interact').textContent=best.prompt+'  ·  E';
}
function dialog(e){
  const content={
    organiser:['The street is still ours.',"“They want this gathering to disappear. Look around. Help people hold together, protect the journalist's account, and bring it to the assembly beyond the barricade.”",'Stand with the gathering'],
    aid:['People before spectacle.',"“The first-aid point needs water and room to work. Help us make space and get supplies onto the table.” Your support keeps the gathering together.",'Help organise the aid point'],
    witness:['Let the account survive.',"“The crackdown must not erase what people witnessed. I choose to share this account with the assembly. Will you carry it intact?”",'Accept the account'],
    barrier:['The street is contested.',"The fictional state crackdown has blocked the gathering. Protesters push back; the barrier gives way. Take the opening with the witness account. This is an authored game encounter, not a reconstruction.",'Stand with the resistance'],
    assembly:['A gathering becomes a public record.',"People come together to hear the account and demand accountability. Refusing silence is collective work, not a solitary score.",'Share the account'],
    protest:['Our voices remain.',"The gathering demands electoral accountability, the right to protest and the right of journalists to report. Add your voice and help the crowd hold its ground.",'Join the protest']
  };
  if(e.id==='aid'&&!s.tasks.organiser){toast('Meet the organiser first. The gathering needs a shared plan.');return;}
  if(e.id==='witness'&&!s.tasks.aid){toast('Help the first-aid point before taking the journalist’s account.');return;}
  if(e.id==='barrier'&&!s.tasks.witness){toast('The journalist’s account must be secured before this confrontation.');return;}
  if(e.id==='assembly'&&!s.tasks.barrier){toast('The main route is still blocked. Return to the gathering.');return;}
  if(e.id!=='protest'&&s.tasks[e.id]){toast('You have already helped here. Keep exploring.');return;}
  s.dialog=e.id;$('dialog-kicker').textContent=e.title;$('dialog-title').textContent=content[e.id][0];$('dialog-copy').textContent=content[e.id][1];$('dialog-confirm').textContent=content[e.id][2];mode('dialog');
}
function complete(){
  const id=s.dialog;if(!id)return;
  if(id==='protest'){s.solidarity=Math.min(6,s.solidarity+1);toast('The gathering grows louder. Our voices remain.');}
  else{s.tasks[id]=true;s.solidarity++;s.checkpoint={x:s.x,z:s.z};toast('Solidarity is a practice. Keep the account alive.');}
  if(id==='barrier'){s.pressure=1;s.capture=0;toast('The barrier falls. The state is moving to silence the account.',5);}
  s.dialog=null;mode('playing');hud();
  if(id==='assembly'){mode('won');$('ending-title').textContent='The account becomes collective.';$('ending-copy').textContent='The witness account reaches the assembly. People remain together and demand accountability. This completes a fictional chapter, not a claim about an actual protest case.';}
}
function begin(){
  keys.clear();joy.x=joy.y=0;$('sprint').classList.remove('active');
  Object.assign(s,{x:0,z:31,y:0,vy:0,capture:0,pressure:0,solidarity:0,yaw:0,dialog:null,checkpoint:null});
  for(const k in s.tasks)s.tasks[k]=false;
  barriers.forEach(g=>g.rotation.x=0);police.forEach((a,i)=>{a.p.group.position.set(4+i*1.3,0,-37-i);});
  mode('playing');toast('You are free to explore. Start with the organiser at the gathering.',6);hud();
}
function valid(x,z){
  const area=(x>=-10.4&&x<=10.4&&z>=-49&&z<=38)||(x>=-28&&x<=-10.4&&z>=-12&&z<=22);
  if(!area)return false;
  if(!s.tasks.barrier&&z<-32&&z>-34)return false;
  if(!s.tasks.barrier&&s.z>-32&&z<=-34)return false;
  for(const c of colliders)if(Math.abs(x-c.x)<c.w/2+.32&&Math.abs(z-c.z)<c.d/2+.32)return false;
  return true;
}
function step(dt){
  if(['loading','error'].includes(s.mode))return;
  s.time+=dt;
  if(s.mode==='paused'||s.mode==='caught'||s.mode==='won')return;
  if(toastTime>0){toastTime-=dt;if(toastTime<=0)$('toast').classList.remove('show');}
  if(s.mode==='menu'){anim+=dt;poseHuman(player,anim*.5,0);return;}
  if(s.mode==='dialog'){poseHuman(player,0,0);return;}
  let ix=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+joy.x;
  let iz=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-joy.y;
  const mag=Math.hypot(ix,iz);if(mag>1){ix/=mag;iz/=mag;}
  s.sprint=keys.has('ShiftLeft')||keys.has('ShiftRight')||$('sprint').classList.contains('active');
  const speed=s.sprint?5.2:2.9;
  const dx=(ix*Math.cos(s.yaw)-iz*Math.sin(s.yaw))*speed*dt;
  const dz=(-ix*Math.sin(s.yaw)-iz*Math.cos(s.yaw))*speed*dt;
  if(valid(s.x+dx,s.z))s.x+=dx;if(valid(s.x,s.z+dz))s.z+=dz;
  s.move=mag>.08?Math.min(1,mag):0;
  s.vy-=16*dt;s.y=Math.max(0,s.y+s.vy*dt);if(!s.y)s.vy=0;
  player.group.position.set(s.x,s.y,s.z);
  if(s.move){const heading=Math.atan2(dx,dz)+Math.PI;player.group.rotation.y+=Math.atan2(Math.sin(heading-player.group.rotation.y),Math.cos(heading-player.group.rotation.y))*Math.min(1,dt*12);}
  anim+=dt*(s.sprint?10.5:7.5);poseHuman(player,anim,s.move?(s.sprint?1:.65):0);
  for(const a of actors){
    const dist=Math.hypot(a.p.group.position.x-s.x,a.p.group.position.z-s.z);
    a.p.group.visible=s.quality==='high'||dist<28;
    if(!a.p.group.visible)continue;
    if(a.police&&s.pressure){
      const p=a.p.group.position,d=Math.max(.1,Math.hypot(s.x-p.x,s.z-p.z));
      if(d>1.2){const x=p.x+(s.x-p.x)/d*1.7*dt,z=p.z+(s.z-p.z)/d*1.7*dt;if(valid(x,z)){p.x=x;p.z=z;}}
      a.p.group.rotation.y=Math.atan2(s.x-p.x,s.z-p.z)+Math.PI;poseHuman(a.p,s.time*8+a.phase,.7);
      if(d<1.25)s.capture+=dt;
    }else if(a.walking){
      const p=a.p.group.position;p.x=a.x+Math.sin(s.time*.18+a.phase)*2.5;p.z=a.z+Math.cos(s.time*.18+a.phase)*1.8;
      a.p.group.rotation.y=Math.atan2(Math.cos(s.time*.18+a.phase)*2.5,-Math.sin(s.time*.18+a.phase)*1.8)+Math.PI;
      poseHuman(a.p,s.time*4.5+a.phase,.4);
    }else{
      a.poseClock+=dt;if(a.poseClock>.18){a.poseClock=0;poseHuman(a.p,s.time*.75+a.phase,0,(s.solidarity>2&&a.placard)?.3*Math.sin(s.time*.6+a.phase):0);}
    }
  }
  if(s.capture>1.8){mode('caught');$('ending-title').textContent='The account is interrupted.';$('ending-copy').textContent='The fictional crackdown caught up with you. Return to your last completed story point; the people you helped and the account you secured remain remembered for this play session.';}
  barriers.forEach((g,i)=>{if(s.tasks.barrier)g.rotation.x=Math.min(Math.PI/2,g.rotation.x+dt*(1+i*.12));});
  if(!s.reduced)flags.forEach((f,i)=>{const p=f.geometry.attributes.position;for(let j=0;j<p.count;j++)p.setZ(j,Math.sin(s.time*2+p.getX(j)*4+i)*.055*(p.getX(j)+.6));p.needsUpdate=true;});
  events.forEach(e=>{e.marker.visible=!s.tasks[e.id]&&Math.hypot(s.x-e.x,s.z-e.z)<25;});
  nearest();hud();map();
}
function hud(){
  const obj=objectives.find(([id])=>!s.tasks[id]);$('objective').textContent=obj?obj[1]:'Chapter complete';
  $('story-count').textContent=`${objectives.filter(([id])=>s.tasks[id]).length} / 5`;
  $('solidarity').textContent=s.solidarity;
  $('pressure').textContent=s.pressure?'CRACKDOWN ACTIVE':'THE GATHERING';
  $('location').textContent=s.x<-10?'COMMUNITY COURTYARD':s.z<-32?'ASSEMBLY APPROACH':s.z<-10?'JANTAR MANTAR ROAD':'THE GATHERING';
}
function map(){
  const c=$('map').getContext('2d'),w=144;c.clearRect(0,0,w,w);c.fillStyle='rgba(17,26,27,.87)';c.fillRect(0,0,w,w);
  const xy=(x,z)=>[(x+32)/80*w,(z+54)/98*w];
  c.fillStyle='#596463';const a=xy(-10,-49),b=xy(10,38);c.fillRect(a[0],a[1],b[0]-a[0],b[1]-a[1]);
  const d=xy(-28,-12),e=xy(-10,22);c.fillRect(d[0],d[1],e[0]-d[0],e[1]-d[1]);
  c.fillStyle='#51614d';const f=xy(12,-50);c.fillRect(f[0],f[1],144-f[0],144);
  for(const ev of events){const p=xy(ev.x,ev.z);c.fillStyle=s.tasks[ev.id]?'#647567':'#d4b079';c.beginPath();c.arc(...p,3,0,6.28);c.fill();}
  const p=xy(s.x,s.z);c.fillStyle='#faf0d6';c.beginPath();c.arc(...p,3.5,0,6.28);c.fill();
  c.strokeStyle='#faf0d6';c.beginPath();c.moveTo(...p);c.lineTo(p[0]-Math.sin(s.yaw)*8,p[1]-Math.cos(s.yaw)*8);c.stroke();
}
function render(){
  if(!renderer||!player)return;
  const menu=s.mode==='menu';
  const target=new THREE.Vector3(s.x,s.y+1.45,s.z);
  const distance=coarse?6.5:7.0;
  if(menu){camera.position.set(-3.3,3.0,29.5);camera.lookAt(22,5,-13);}
  else {
    const desired=new THREE.Vector3(s.x+Math.sin(s.yaw)*distance,2.2+s.pitch*4+s.y,s.z+Math.cos(s.yaw)*distance);
    camera.position.lerp(desired,manual||s.reduced?1:.14);camera.lookAt(target);
  }
  sun.target.position.set(s.x,0,s.z-5);sun.position.set(s.x-18,30,s.z+17);sun.target.updateMatrixWorld();
  if(s.quality==='high'&&composer)composer.render();else renderer.render(scene,camera);
}
function resize(){
  if(!renderer)return;const w=innerWidth,h=innerHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();
  composer?.setSize(w,h);ssao?.setSize(Math.ceil(w/2),Math.ceil(h/2));
}
function quality(){
  s.quality=$('quality').value==='auto'?(coarse?'low':'high'):$('quality').value;
  renderer.setPixelRatio(Math.min(devicePixelRatio,s.quality==='high'?1.5:1.1));renderer.shadowMap.enabled=true;
  sun.shadow.mapSize.set(s.quality==='high'?2048:1024,s.quality==='high'?2048:1024);
  if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}
  trees.forEach((t,i)=>{t.visible=s.quality==='high'||i<8;});resize();
}
function pause(){
  if(s.mode==='paused'){mode(s.beforePause||'playing');return;}
  if(['playing','dialog'].includes(s.mode)){keys.clear();joy.x=joy.y=0;s.beforePause=s.mode;mode('paused');}
}
function bindings(){
  let lastTouch=-1000;
  document.addEventListener('pointerdown',()=>lastTouch=-1000,true);
  document.addEventListener('click',e=>{if(performance.now()-lastTouch<700&&(e.pointerType==='touch'||e.detail>0)){e.preventDefault();e.stopImmediatePropagation();}},true);
  function button(id,fn){$(id).addEventListener('pointerup',e=>{if(e.pointerType==='touch'){lastTouch=performance.now();fn();}});$(id).onclick=e=>{if(e.detail===0||performance.now()-lastTouch>700)fn();};}
  button('start',begin);button('pause',pause);button('resume',pause);button('restart',begin);button('again',begin);
  button('retry',()=>{const c=s.checkpoint;s.x=c?.x||0;s.z=c?.z||31;s.capture=0;police.forEach((a,i)=>a.p.group.position.set(7+i*.5,0,-37-i));mode('playing');toast('Your completed acts of solidarity remain. Continue the chapter.');});
  button('title',()=>{mode('menu');keys.clear();joy.x=joy.y=0;});
  button('dialog-confirm',complete);button('dialog-back',()=>{s.dialog=null;mode('playing');});
  button('interact',()=>{if(s.near)dialog(s.near);});
  button('jump',()=>{if(s.mode==='playing'&&!s.y)s.vy=5.3;});
  button('sprint',()=>{$('sprint').classList.toggle('active');});
  button('sound',()=>{
    s.sound=!s.sound;$('sound').textContent=s.sound?'Sound on':'Sound off';
    if(s.sound){try{ambient??=new (window.AudioContext||window.webkitAudioContext)();ambient.resume();const o=ambient.createOscillator(),g=ambient.createGain();o.type='sine';o.frequency.value=190;g.gain.value=.015;o.connect(g).connect(ambient.destination);o.start();o.stop(ambient.currentTime+.18);}catch(e){s.sound=false;$('sound').textContent='Sound unavailable';}}
  });
  $('quality').onchange=quality;$('reduced').onchange=()=>s.reduced=$('reduced').checked;
  document.addEventListener('keydown',e=>{
    if(e.target.matches('input,select,summary'))return;
    if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowLeft','ArrowDown','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code)){keys.add(e.code);if(s.mode!=='menu')e.preventDefault();}
    if(e.code==='Space'&&s.mode==='playing'){if(!s.y)s.vy=5.3;e.preventDefault();}
    if(e.code==='KeyE'&&!e.repeat){if(s.mode==='playing'&&s.near)dialog(s.near);else if(s.mode==='dialog')complete();}
    if(['Escape','KeyP'].includes(e.code)){pause();e.preventDefault();}
  });
  document.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();joy.x=joy.y=0;});
  let pointer;
  $('joystick').addEventListener('pointerdown',e=>{pointer=e.pointerId;e.preventDefault();$('joystick').setPointerCapture(pointer);moveStick(e);});
  function moveStick(e){
    const r=$('joystick').getBoundingClientRect();joy.x=Math.max(-1,Math.min(1,(e.clientX-r.x-r.width/2)/38));joy.y=Math.max(-1,Math.min(1,(e.clientY-r.y-r.height/2)/38));
    const d=Math.hypot(joy.x,joy.y);if(d>1){joy.x/=d;joy.y/=d;}$('stick').style.transform=`translate(${joy.x*28}px,${joy.y*28}px)`;
  }
  $('joystick').addEventListener('pointermove',e=>{if(e.pointerId===pointer)moveStick(e);});
  for(const type of ['pointerup','pointercancel'])$('joystick').addEventListener(type,()=>{pointer=null;joy.x=joy.y=0;$('stick').style.transform='';});
  $('viewport').addEventListener('pointerdown',e=>{if(s.mode==='playing'){cameraDrag={id:e.pointerId,x:e.clientX,y:e.clientY};$('viewport').setPointerCapture(e.pointerId);}});
  $('viewport').addEventListener('pointermove',e=>{if(cameraDrag?.id===e.pointerId){s.yaw-=(e.clientX-cameraDrag.x)*.007;s.pitch=Math.max(.15,Math.min(.85,s.pitch+(e.clientY-cameraDrag.y)*.004));cameraDrag.x=e.clientX;cameraDrag.y=e.clientY;}});
  for(const type of ['pointerup','pointercancel'])$('viewport').addEventListener(type,()=>cameraDrag=null);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&['playing','dialog'].includes(s.mode))pause();});
  window.addEventListener('resize',resize);
}
async function init(){
  bindings();
  try{
    scene=new THREE.Scene();scene.fog=new THREE.Fog('#b3b5aa',55,135);scene.background=new THREE.Color('#bcc5c7');
    renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();manual=true;toast('Graphics context interrupted. Reload the page to recover this development build.',60);});
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    $('viewport').appendChild(renderer.domElement);
    camera=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,.1,180);
    sun=new THREE.DirectionalLight('#f4d9b4',3.1);sun.position.set(-18,30,25);sun.target.position.set(0,0,-5);sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-28,right:28,top:28,bottom:-28,near:.2,far:100});sun.shadow.bias=-.00015;sun.shadow.normalBias=.03;scene.add(sun,sun.target);
    scene.add(new THREE.HemisphereLight('#d7e4ed','#716f56',.65));
    $('loading').textContent='Loading clothing, trees and material scans…';
    const preference=new URLSearchParams(location.search).get('quality');if(['low','high'].includes(preference))$('quality').value=preference;
    const tasks=await Promise.allSettled([loadHuman(asset('courier-clothed.glb')),new GLTFLoader().loadAsync(asset(coarse||preference==='low'?'tree-delhi.glb':'tree-delhi-high.glb')),materials(),new RGBELoader().loadAsync(asset('delhi-sky.hdr'))]);
    if(tasks[0].status==='rejected')throw new Error('The human model could not load. Please retry with a working connection.');
    if(tasks[1].status==='fulfilled')treeSource=tasks[1].value.scene;
    if(tasks[2].status==='rejected')throw new Error('The surface textures could not load. Please reload.');
    if(tasks[3].status==='fulfilled'){
      const sky=tasks[3].value;sky.mapping=THREE.EquirectangularReflectionMapping;const gen=new THREE.PMREMGenerator(renderer);
      scene.environment=gen.fromEquirectangular(sky).texture;scene.environmentIntensity=.55;scene.background=sky;scene.backgroundIntensity=.55;scene.backgroundRotation.y=.9;gen.dispose();
    }
    buildWorld();if(treeSource)addTrees();else toast('Tree asset unavailable; the chapter remains playable.');
    player=human('#a86137');player.group.position.set(0,0,31);scene.add(player.group);populate();
    composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));ssao=new SSAOPass(scene,camera,innerWidth,innerHeight);
    ssao.kernelRadius=.5;ssao.minDistance=.002;ssao.maxDistance=.08;composer.addPass(ssao);composer.addPass(new OutputPass());
    quality();mode('menu');$('start').disabled=false;$('start').textContent='Enter the gathering';$('loading').textContent='Ready • Desktop and touch controls';
    window.render_game_to_text=()=>JSON.stringify({mode:s.mode,coordinates:'x east/right, z south/back; approximate game geography, not surveyed map',position:{x:+s.x.toFixed(2),z:+s.z.toFixed(2),y:+s.y.toFixed(2)},cameraYaw:+s.yaw.toFixed(2),tasks:s.tasks,solidarity:s.solidarity,pressure:s.pressure,near:s.near?.id||null,dialog:s.dialog,quality:s.quality,sound:s.sound,riggedClothing:true,treeAsset:!!treeSource,fps,rendering:{draws:renderer.info.render.calls,triangles:renderer.info.render.triangles},events:events.map(e=>({id:e.id,x:e.x,z:e.z,done:!!s.tasks[e.id]})),police:police.map(a=>({x:+a.p.group.position.x.toFixed(2),z:+a.p.group.position.z.toFixed(2)}))});
    window.advanceTime=ms=>{manual=true;const n=Math.max(1,Math.ceil(ms/16.667));for(let i=0;i<n;i++)step(ms/n/1000);render();$('performance').textContent=`QA STEP • ${s.quality.toUpperCase()} • WORLD / 0.5`;};
    window.resumeRealTime=()=>{manual=false;last=performance.now();};
    function frame(now){requestAnimationFrame(frame);if(manual)return;const dt=Math.min(.05,(now-last)/1000||0);last=now;step(dt);render();frames++;if(now-frameStart>1000){fps=Math.round(frames*1000/(now-frameStart));frames=0;frameStart=now;$('performance').textContent=`${fps} fps • ${s.quality.toUpperCase()} • WORLD / 0.5`;}}
    requestAnimationFrame(frame);
  }catch(e){console.error(e);s.mode='error';$('loading').textContent=e.message;$('start').textContent='Reload to retry';$('start').disabled=false;$('start').onclick=()=>location.reload();}
}
init();
