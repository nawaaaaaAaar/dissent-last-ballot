import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {materials as M,box,cylinder,sign,bus,barricade,observatory,bench,lamp,tent,mergeStatic} from './world-props.js';
import {human,loadPeople,poseHuman,poseMotion,resetHuman} from './people.js?v=0.17.2';
export async function buildLine(container,low){
 const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,low?1:1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;container.appendChild(renderer.domElement);
 renderer.domElement.className='game';
 const scene=new THREE.Scene();scene.background=new THREE.Color('#bec7c1');scene.fog=new THREE.Fog('#bec7c1',38,90);
 const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,140);
 const hemi=new THREE.HemisphereLight('#dfeaf3','#776352',1.6);scene.add(hemi);
 const sun=new THREE.DirectionalLight('#fff0d6',3.5);sun.position.set(-15,28,-14);sun.castShadow=true;sun.shadow.mapSize.set(low?1024:2048,low?1024:2048);Object.assign(sun.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:1,far:80});sun.shadow.bias=-.0002;sun.shadow.normalBias=.02;scene.add(sun,sun.target);
 const asset=n=>'./assets/'+n;
 const texture=async(n,color=false)=>{const t=await new THREE.TextureLoader().loadAsync(asset(n));t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;return t;};
 const [road,norm,rough,wall,concrete,peopleResult,tree,sky]=await Promise.all([
  texture('asphalt-diff.webp',true),texture('asphalt-normal.webp'),texture('asphalt-rough.webp'),texture('limewash.webp',true),texture('concrete-diff.webp',true),
  loadPeople(asset),new GLTFLoader().loadAsync(asset('tree-review.glb')),new RGBELoader().loadAsync(asset('delhi-sky.hdr')),
 ]);
 const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(sky).texture;scene.environmentIntensity=.45;sky.dispose();pmrem.dispose();
 const asphalt=new THREE.MeshStandardMaterial({map:road,normalMap:norm,roughnessMap:rough,normalScale:new THREE.Vector2(.16,.16),roughness:.9,color:'#aaa9a2'});
 const stone=new THREE.MeshStandardMaterial({map:wall,color:'#ceb98f',roughness:.94});
 const paving=new THREE.MeshStandardMaterial({map:concrete,color:'#d2cbc0',roughness:.96});
 const rust=new THREE.MeshStandardMaterial({map:wall,color:'#aa5f45',roughness:.94});
 const fence=new THREE.MeshStandardMaterial({color:'#43544f',metalness:.55,roughness:.55});
 function ground(mat,x,z,w,d,y=.01,tile=4){const g=new THREE.PlaneGeometry(w,d),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/tile,uv.getY(i)*d/tile);const p=new THREE.Mesh(g,mat);p.rotation.x=-Math.PI/2;p.position.set(x,y,z);p.receiveShadow=true;scene.add(p);}
 ground(asphalt,0,-25,13,104,.01,2.8);ground(paving,-7.3,-25,3,104,.015,2);ground(paving,7.3,-25,3,104,.015,2);
 const stat=new THREE.Group();
 for(const side of[-1,1]){
  box(stat,stone,side*9,.4,-25,.55,.8,104);
  for(let z=-76;z<25;z+=1.6){box(stat,stone,side*9,1.1,z,.7,2.2,.7);for(let k=0;k<5;k++)cylinder(stat,fence,side*9,1.55,z+k*.24,.023,1.4);}
  for(let y of[1,2])box(stat,fence,side*9,y,-25,.035,.035,104);
  for(let z=-76;z<25;z+=.75)box(stat,z%3===0?M.dark:M.cream,side*6.15,.06,z,.23,.12,.73);
  for(let z=-65;z<23;z+=12)lamp(stat,side*7.5,z);
 }
 for(let z=-75;z<23;z+=5)box(stat,M.cream,0,.018,z,.12,.015,2.1);
 const monument=observatory();monument.scale.setScalar(.55);monument.position.set(-22,0,-8);scene.add(monument);
 ground(new THREE.MeshStandardMaterial({color:'#7b8463',roughness:1}),-20,-25,23,104,0);
 for(const side of[-1,1])for(let n=0;n<8;n++){
  const g=tree.scene.clone(true);g.position.set(side*11.6,0,20-n*12);g.rotation.y=n*2.399;g.scale.setScalar(1.25+(n%3)*.13);
  g.traverse(o=>{if(o.isMesh){o.castShadow=!low;o.receiveShadow=true;}});scene.add(g);
 }
 // Site boundary and recognisable Delhi street vocabulary, not claimed survey geometry.
 const entry=new THREE.Group();entry.position.set(-9,0,-2);entry.rotation.y=Math.PI/2;
 box(entry,stone,0,2.4,0,5,.45,1);sign(entry,'JANTAR MANTAR',0,2.4,.52,4.6,.4,'#c9b48c','#3e4237','जंतर मंतर');scene.add(entry);
 tent(stat,-6.7,11);sign(stat,'हर योग्य मतदाता',-6.7,2.5,12.82,3.7,.4,'#e2d5b8','#364b40','EVERY ELIGIBLE VOTER');
 box(stat,M.wood,-6,.82,8,2,.1,1);
 for(const x of[-6.8,-5.2])for(const z of[7.6,8.4])box(stat,fence,x,.4,z,.04,.8,.04);
 box(stat,M.white,-6,.9,8,.45,.12,.32);box(stat,M.red,-6,.969,8,.28,.018,.07);box(stat,M.red,-6,.97,8,.07,.018,.25);
 for(let i=0;i<3;i++)cylinder(stat,M.chrome,-5.4+i*.12,.93,8.1,.045,.16);
 bench(stat,-7,3,Math.PI);bench(stat,7,15,Math.PI);
 for(const z of[16,13,-12,-27]){cylinder(stat,rust,-7,.22,z,.34,.44);cylinder(stat,M.leaf,-7,.6,z,.42,.25);}
 const truck=bus();truck.position.set(5.8,0,-7);truck.rotation.y=Math.PI;scene.add(truck);
 // Curated small items ground the scene: drain grilles, access hatches, cables, bins.
 for(let z=-60;z<23;z+=9){
  box(stat,M.dark,-5.8,.024,z,.38,.025,.7);
  for(let j=0;j<6;j++)box(stat,M.chrome,-5.8,.04,z-.28+j*.1,.31,.013,.02);
 }
 cylinder(stat,M.dark,-4,.02,14,.46,.035);cylinder(stat,M.metal,-4,.044,14,.37,.013);
 for(const z of[8,-22]){box(stat,fence,7,.5,z,.6,1,.6);box(stat,M.chrome,7,1,z,.62,.06,.62);}
 const rail=new THREE.Group();
 for(const x of[-2.5,.1,2.7]){const b=barricade();b.scale.set(.86,.78,1);b.position.x=x;rail.add(b);}rail.position.z=-18;scene.add(rail);
 for(const x of[-7.4,6.2]){const b=barricade();b.scale.set(x<0?.7:1.55,.78,1);b.position.set(x,0,-18);stat.add(b);}
 const vault=new THREE.Group();vault.position.set(-5.6,0,-18);
 for(const x of[-.48,.48])box(vault,fence,x,.35,0,.07,.7,.6);box(vault,M.wood,0,.7,0,1.1,.09,.6);scene.add(vault);
 for(const x of[0,1.2,2.4,3.6,4.8]){
  const cone=new THREE.Mesh(new THREE.ConeGeometry(.22,.65,12),M.red);cone.position.set(x,.34,-47);stat.add(cone);box(stat,M.cream,x,.37,-47,.22,.07,.22);
 }
 box(stat,rust,2,.20,-48,5,.4,1.5);sign(stat,'WORKS / KEEP LEFT',2,1.2,-48,3.7,.5,'#d8b861','#413a2c');
 const shelter=new THREE.Group();shelter.position.set(0,0,-73);box(shelter,stone,0,1.5,0,15,3,.6);box(shelter,stone,-7.4,1.5,2,.6,3,4);sign(shelter,'PUBLIC ACCOUNT / COMMUNITY SHELTER',0,2.1,.35,8,.5,'#2b5147','#e8dab8');scene.add(shelter);
 scene.add(mergeStatic(stat));
 // Original material-driven cloth screen, movable and collision-linked.
 const cart=new THREE.Group();cart.position.set(-2.7,0,-3);
 const cloth=new THREE.MeshStandardMaterial({color:'#6b8071',roughness:1,side:THREE.DoubleSide});
 const clothGeo=new THREE.PlaneGeometry(2.1,1.4,18,8);const pos=clothGeo.attributes.position;
 for(let i=0;i<pos.count;i++)pos.setZ(i,Math.sin(pos.getX(i)*12)*.03);
 clothGeo.computeVertexNormals();const fabric=new THREE.Mesh(clothGeo,cloth);fabric.position.y=1;cart.add(fabric);
 for(const x of[-1,1]){cylinder(cart,fence,x,.9,0,.035,1.8);box(cart,fence,x,.13,0,.1,.1,1.1);for(const z of[-.4,.4])cylinder(cart,M.dark,x,.13,z,.11,.08,Math.PI/2);}
 sign(cart,'आवाज़ बचाओ',0,1,.04,1.75,.35,'#6b8071','#f0e4c8','KEEP THE ACCOUNT');scene.add(cart);
 function vehicle(police=false){
  const g=new THREE.Group(),paint=new THREE.MeshStandardMaterial({color:police?'#304b56':'#ded9cd',metalness:.25,roughness:.47});
  const shell=new THREE.Mesh(new RoundedBoxGeometry(2.2,1.3,4.7,3,.16),paint);shell.position.y=1;g.add(shell);
  box(g,paint,0,1.85,.2,2.15,.9,3.8);box(g,M.glass,0,1.9,.95,1.91,.67,.03);
  // Model forward is local +z; the game rotates it along travel direction.
  box(g,M.glass,0,1.9,2.13,1.93,.61,.04);box(g,M.chrome,0,.73,2.37,2.22,.15,.15);
  for(const s of[-1,1]){
   for(const z of[-.6,.95])box(g,M.glass,s*1.086,1.9,z,.03,.62,1.2);
   box(g,cloth,s*1.12,1.1,0,.04,.18,4.3);
   const v=sign(g,police?'PATROL':'VOLUNTEER',s*1.125,1.43,-.1,1.4,.27,police?'#304b56':'#ded9cd',police?'#e8dab8':'#395b4e');v.rotation.y=s*Math.PI/2;
   for(const z of[-1.45,1.45]){cylinder(g,M.dark,s*1.10,.43,z,.43,.22,Math.PI/2);cylinder(g,M.chrome,s*1.23,.43,z,.22,.035,Math.PI/2);}
   box(g,M.white,s*.72,1,2.38,.32,.2,.035);box(g,M.red,s*.72,1,-2.38,.25,.25,.035);
  }if(police){box(g,M.chrome,0,2.35,0,.9,.08,.22);box(g,M.red,-.25,2.44,0,.3,.12,.2);box(g,M.glass,.25,2.44,0,.3,.12,.2);}return g;
 }
 const van=vehicle();scene.add(van);
 const patrol=vehicle(true);scene.add(patrol);patrol.visible=false;
 const hero=human('#75816b',false,{localWardrobe:false}),friend=human('#b8936d',false,{localWardrobe:true});
 const enemies=Array.from({length:6},(_,i)=>human('#9f8c70',true));scene.add(hero.group,friend.group,...enemies.map(p=>p.group));
 for(let i=0;i<6;i++){
  const p=enemies[i];p.shield=box(p.group,fence,0,.92,.38,.58,.92,.09);p.shield.visible=i===2;
  if(i===2){box(p.shield,M.dark,0,0,.05,.52,.12,.035);box(p.shield,M.chrome,0,.42,.05,.56,.035,.035);}
  p.condition=new THREE.Group();p.condition.position.y=2.1;p.group.add(p.condition);
  for(let k=0;k<(i===2?4:3);k++)box(p.condition,M.cream,(k-1.5)*.15,0,0,.12,.035,.02);
 }
 const supporters=[];
 for(let i=0;i<5;i++){const p=human(i%2?'#b17b54':'#879b80',false,{localWardrobe:true,female:i===1||i===4});p.group.position.set(-5.5+(i%2)*1.6,0,14-Math.floor(i/2)*1.4);p.group.rotation.y=i*.8;scene.add(p.group);supporters.push(p);
  if(i<3){const placard=sign(p.group,i===0?'हर योग्य मतदाता':'आवाज़ नहीं मिटेगी',0,2.1,.05,1.1,.65,'#e6d7b7','#384c41');box(p.group,M.wood,0,1.65,0,.035,.9,.035);}}
 const playerMark=new THREE.Mesh(new THREE.RingGeometry(.38,.41,48),new THREE.MeshBasicMaterial({color:'#e4d6ad',transparent:true,opacity:.6,depthWrite:false}));playerMark.rotation.x=-Math.PI/2;scene.add(playerMark);
 const tells=enemies.map(()=>{const m=new THREE.Mesh(new THREE.RingGeometry(.08,1.6,24,1,-.85,1.7),new THREE.MeshBasicMaterial({color:'#db7057',transparent:true,opacity:.33,depthWrite:false,side:THREE.DoubleSide}));scene.add(m);return m;});
 const sparks=[],mat=new THREE.MeshBasicMaterial({color:'#efd9a4'});
 for(let i=0;i<24;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.028,4,3),mat);m.visible=false;scene.add(m);sparks.push({m,life:0,v:new THREE.Vector3()});}
 let focus=new THREE.Vector3(0,1,17),shake=0;
 function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}
 function person(p,state,t){
  p.group.position.set(state.x,state.height||0,state.z);p.group.rotation.set(0,state.yaw,0);p.worldSpeed=state.speed||0;p.poseTimeDivisor=1;
  poseHuman(p,t,state.speed>2.5?1:state.speed>.1?.5:0);
 }
 function update(game,dt){
  const t=game.time;person(hero,game.p,t);person(friend,game.friend,t);hero.group.visible=!game.van.occupied;friend.group.visible=!game.friend.aboard;
  const a=game.p.attack;if(a){
   const target=game.enemies.filter(e=>e.hp>0&&Math.hypot(e.x-game.p.x,e.z-game.p.z)<1.8).sort((a,b)=>Math.hypot(a.x-game.p.x,a.z-game.p.z)-Math.hypot(b.x-game.p.x,b.z-game.p.z))[0];
   const at=target?new THREE.Vector3(target.x,1.25,target.z):new THREE.Vector3(game.p.x+Math.sin(a.yaw)*1.1,1.2,game.p.z+Math.cos(a.yaw)*1.1);
   poseMotion(hero,a.clip,a.time/a.duration,{target:at});
  }
  else if(game.p.traversal)poseMotion(hero,'Vault',game.p.traversal.time/game.p.traversal.duration,{right:new THREE.Vector3(-5.3,.73,-18),left:new THREE.Vector3(-5.9,.73,-18)});
  else if(game.p.dodge>0)poseMotion(hero,'Dodge',1-game.p.dodge/.29);
  else if(game.p.hurt>0)poseMotion(hero,'Hurt',1-game.p.hurt/.8);
  if(game.friend.state==='brace')poseMotion(friend,'Brace',.5);
  if(game.friend.traversal)poseMotion(friend,'Vault',game.friend.traversal.time/.8);
  enemies.forEach((p,i)=>{
   const e=game.enemies[i];person(p,{...e,speed:e.state==='advance'?2.3:0},t);
   p.group.visible=e.active;
   p.condition.visible=e.hp>0&&e.state!=='watch';p.condition.children.forEach((b,k)=>b.visible=k<e.hp);p.condition.rotation.y=-e.yaw;
   if(e.hp<=0){p.group.rotation.z=Math.min(1,e.downTime*2)*1.35;p.group.position.y=-.35*Math.min(1,e.downTime*2);}
   else if(e.wind>0)poseMotion(p,'EnemyStrike',.12+(1-e.wind/(e.role==='shield'?.85:.68))*.30);
   else if(e.attack>0)poseMotion(p,'EnemyStrike',.42+(1-e.attack/.4)*.58);
   else if(e.stun>0)poseMotion(p,'Hurt',1-e.stun/1.1);
   tells[i].visible=e.wind>0;tells[i].position.set(e.x,.036,e.z);tells[i].rotation.set(-Math.PI/2,0,-e.yaw+Math.PI/2);tells[i].material.opacity=.18+(e.wind<.25?.32:.1);
  });
  supporters.forEach((p,i)=>{p.worldSpeed=0;p.poseTimeDivisor=1;poseHuman(p,t,0);if(game.phase!=='reach')poseMotion(p,'Brace',.5);});
  van.position.set(game.van.x,0,game.van.z);van.rotation.y=game.van.yaw;van.rotation.z=game.van.occupied?Math.sin(t*11)*.003:0;
  patrol.visible=game.van.occupied&&game.mode!=='won';
  const approach=game.sirenTime%7;
  patrol.position.set(2,0,game.van.z+(approach<4.5?9:approach<5.3?9-(approach-4.5)*7:3.4+(approach-5.3)*3));patrol.rotation.y=Math.PI;
  rail.rotation.x=game.gateFall*1.45;cart.position.z=-3+game.cartShift;
  playerMark.visible=!game.van.occupied;playerMark.position.set(game.p.x,.025,game.p.z);
  const target=new THREE.Vector3(game.p.x*.68,1,game.p.z-1.4);focus.lerp(target,1-Math.exp(-dt*5));
  const portrait=innerHeight>innerWidth,drive=game.van.occupied;
  const offset=new THREE.Vector3(portrait?1.5:4.2,drive?12:portrait?11:9.5,drive?17:portrait?15:12.5);
  const expected=focus.clone().add(offset);camera.position.copy(expected);if(shake>0){camera.position.x+=Math.sin(t*120)*shake;shake=Math.max(0,shake-dt*2);}
  camera.lookAt(focus);sun.position.set(focus.x-15,28,focus.z-14);sun.target.position.set(focus.x,0,focus.z);sun.target.updateMatrixWorld();
  for(const s of sparks)if(s.life>0){s.life-=dt;s.m.visible=s.life>0;s.m.position.addScaledVector(s.v,dt);s.v.y-=dt*8;}
  renderer.render(scene,camera);
 }
 function impact(e){
  if(['body','barrier','hurt'].includes(e.type)){shake=.08;for(let i=0;i<8;i++){const s=sparks.find(s=>s.life<=0);if(!s)break;s.life=.16+i*.018;s.m.visible=true;s.m.position.set(e.x,.9,e.z);s.v.set(Math.cos(i*2.4)*1.5,1.1+i*.14,Math.sin(i*2.4)*1.5);}}
 }
 function reset(){[hero,friend,...enemies].forEach(resetHuman);focus.set(0,1,17);sparks.forEach(s=>{s.life=0;s.m.visible=false;});}
 resize();return {renderer,scene,camera,update,resize,impact,reset};
}
