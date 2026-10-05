import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import {Breakout,WORLD} from './breakout-rules.js?v=0.12.0';
import {human,loadPeople,poseHuman,resetHuman} from './people.js?v=0.12.0';
import {materials as M,box,cylinder,sign,mergeStatic,barricade,observatory,bench,lamp,tent} from './world-props.js';
import {WorldAudio} from './world-audio.js';

const $=id=>document.getElementById(id),coarse=matchMedia('(pointer:coarse)').matches||innerWidth<700;
const asset=name=>(window.origin==='null'?'https://raw.githubusercontent.com/nawaaaaaAaar/dissent-last-ballot/main/docs/assets/':'./assets/')+name+'?v=0.12.0';
const game=new Breakout(),keys=new Set(),audio=new WorldAudio();
const sticks={move:{x:0,z:0},aim:{x:0,z:-1}},poses=[],effects=[];
let renderer,scene,camera,sun,player,friend,van,enemyCar,gate,block,recorder,recordRing,safeRing,arrow,treeSource;
let manual=false,last=0,clock=0,fps=0,frames=0,frameStart=performance.now(),mouseAim=false,helpReturn='menu',engineTone,engineGain,brakeHeld=false,aimBrake=false,crowdClock=0;
const particleMeshes=[],medModels=[],crowd=[],enemyModels=[];
const v3=new THREE.Vector3(),ray=new THREE.Raycaster(),groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);

function setMode(mode){game.mode=mode;syncPanels();}
function syncPanels(){
  $('menu').hidden=game.mode!=='menu';$('hud').hidden=['menu','loading','error'].includes(game.mode);
  $('controls').hidden=game.mode!=='playing';$('pause-screen').hidden=game.mode!=='paused';$('help-screen').hidden=game.mode!=='help';
  $('ending').hidden=!['won','caught'].includes(game.mode);$('pause').hidden=!['playing','paused'].includes(game.mode);$('pause').textContent=game.mode==='paused'?'Resume':'Pause';
  $('retry').hidden=game.mode!=='caught';$('toast').hidden=game.messageTime<=0||game.mode!=='playing';
}
function finish(){
  $('ending-kicker').textContent=game.mode==='won'?'THE NETWORK HOLDS':'THE RUN WAS INTERRUPTED';
  $('ending-title').textContent=game.mode==='won'?'People, not paperwork.':'Try another route.';
  $('ending-copy').textContent=game.mode==='won'?
    'Kabir and the recording reached safety. The fictional network carries a broader demand: Gyanesh Kumar’s departure through constitutional processes, ending the contested SIR process, and transparent inclusion support for every eligible voter. This is not news of actual resignation, repeal or voter restoration.':
    game.message+' Recovered recording and rescue/boarding checkpoints are retained within this tab, not after reload.';
  $('results').innerHTML=`<span>RUN SCORE<br><b>${game.score}</b></span><span>TIME<br><b>${Math.floor(game.time/60)}:${String(Math.floor(game.time%60)).padStart(2,'0')}</b></span><span>VAN CONDITION<br><b>${Math.round(game.van.health)}%</b></span>`;
}
function start(){keys.clear();sticks.move={x:0,z:0};game.start();poses.forEach(resetHuman);if(!audio.enabled)toggleAudio();syncPanels();render();}
function help(){helpReturn=game.mode;keys.clear();sticks.move={x:0,z:0};game.input.attack=false;setMode('help');}
function pause(){if(game.mode==='paused')setMode('playing');else if(game.mode==='playing'){keys.clear();sticks.move={x:0,z:0};game.input.attack=false;setMode('paused');}}
function toggleAudio(){
  const on=audio.toggle();$('sound').textContent=on?'Sound on':'Sound off';
  if(on&&!engineTone){engineTone=audio.ctx.createOscillator();engineGain=audio.ctx.createGain();engineTone.type='triangle';engineTone.frequency.value=55;engineGain.gain.value=0;engineTone.connect(engineGain).connect(audio.ctx.destination);engineTone.start();}
  if(engineGain&&!on)engineGain.gain.value=0;
}
function button(id,callback){$(id).addEventListener('click',callback);}
button('start',start);button('tutorial',help);button('pause-help',help);button('help-close',()=>setMode(helpReturn));
button('pause',pause);button('resume',pause);button('restart',start);button('again',start);button('sound',toggleAudio);
button('retry',()=>{keys.clear();sticks.move={x:0,z:0};game.retry();poses.forEach(resetHuman);syncPanels();render();});
button('action',()=>{game.interact();syncPanels();});
button('strike',()=>{aimNearest();game.attack();audio.tone(230,.08);});
button('dash',()=>game.dash());
$('dash').addEventListener('pointerdown',()=>{if(game.van.occupied)brakeHeld=true;});
for(const event of ['pointerup','pointercancel','pointerleave'])$('dash').addEventListener(event,()=>brakeHeld=false);
$('quality').onchange=quality;
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='SELECT')return;
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
  keys.add(e.code);if(e.repeat)return;
  if(e.code==='KeyE')game.interact();if(e.code==='KeyQ')game.dash();if(e.code==='Space'&&!game.van.occupied){aimNearest();game.attack();}
  if(e.code==='Escape'||e.code==='KeyP')pause();
});
document.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{keys.clear();if(game.mode==='playing')pause();});
function aimNearest(){
  if(mouseAim||Math.hypot(sticks.aim.x,sticks.aim.z)>.2&&game.input.attack)return;
  const closest=game.enemies.filter(e=>e.hp>0&&Math.hypot(e.x-game.player.x,e.z-game.player.z)<3.2).sort((a,b)=>Math.hypot(a.x-game.player.x,a.z-game.player.z)-Math.hypot(b.x-game.player.x,b.z-game.player.z))[0];
  if(closest){const d=Math.hypot(closest.x-game.player.x,closest.z-game.player.z);game.input.aimX=(closest.x-game.player.x)/d;game.input.aimZ=(closest.z-game.player.z)/d;}
  else{game.input.aimX=Math.sin(game.player.yaw);game.input.aimZ=Math.cos(game.player.yaw);}
}
function stick(id,type){
  const el=$(id),knob=el.querySelector('i');let pointer=null;
  const apply=e=>{
    const r=el.getBoundingClientRect(),radius=r.width*.36,dx=e.clientX-r.x-r.width/2,dz=e.clientY-r.y-r.height/2,m=Math.hypot(dx,dz),factor=Math.min(1,m/radius);
    const x=m?dx/m*factor:0,z=m?dz/m*factor:0;sticks[type]={x,z};knob.style.left=`${50+x*36}%`;knob.style.top=`${50+z*36}%`;
    if(type==='aim'){mouseAim=false;game.input.aimX=x;game.input.aimZ=z;game.input.attack=factor>.2&&!game.van.occupied;aimBrake=game.van.occupied;}
  };
  el.onpointerdown=e=>{pointer=e.pointerId;el.setPointerCapture(pointer);apply(e);e.preventDefault();};
  el.onpointermove=e=>{if(e.pointerId===pointer)apply(e);};
  const end=()=>{pointer=null;knob.style.left=knob.style.top='50%';if(type==='move')sticks.move={x:0,z:0};else{game.input.attack=false;aimBrake=false;}};
  el.onpointerup=end;el.onpointercancel=end;
}
stick('move-stick','move');stick('aim-stick','aim');

function vehicle(police=false){
  const g=new THREE.Group(),paint=new THREE.MeshStandardMaterial({color:police?'#253d48':'#e3dcca',roughness:.5,metalness:.25}),trim=police?M.yellow:new THREE.MeshStandardMaterial({color:'#428571',roughness:.65});
  const shell=box(g,paint,0,1,0,2.35,1.1,4.8);shell.geometry=new THREE.BoxGeometry(1,1,1);
  box(g,paint,0,1.85,.25,2.22,.95,3.9);box(g,M.glass,0,1.94,-1.78,1.94,.62,.035);
  box(g,M.glass,0,1.94,2.23,1.95,.56,.035);box(g,M.metal,0,.73,-2.45,2.34,.18,.13);
  for(const s of [-1,1]){
    box(g,M.glass,s*1.14,1.94,-.85,.03,.61,1.08);box(g,M.glass,s*1.14,1.94,.55,.03,.61,1.35);
    box(g,trim,s*1.19,1.1,0,.035,.19,4.5);box(g,M.chrome,s*1.2,1.45,.5,.025,.035,.25);
    box(g,M.metal,s*1.34,1.9,-1.6,.26,.20,.18);
    box(g,M.white,s*.8,.99,-2.43,.37,.22,.04);box(g,M.red,s*.83,1,2.43,.23,.3,.04);
    const plate=sign(g,police?'PATROL':'VOLUNTEER',s*1.22,1.48,.7,1.3,.35,police?'#253d48':'#e3dcca',police?'#e8d9b8':'#315749');plate.rotation.y=s*Math.PI/2;
  }
  const wheels=[];
  for(const x of [-1.17,1.17])for(const z of [-1.5,1.47]){
    const w=cylinder(g,M.dark,x,.43,z,.43,.23,Math.PI/2);cylinder(g,M.chrome,x*1.09,.43,z,.22,.035,Math.PI/2);wheels.push(w);
  }
  if(police){box(g,M.metal,0,2.45,.2,1.05,.08,.24);box(g,M.red,-.33,2.53,.2,.30,.1,.23);box(g,trim,.33,2.53,.2,.30,.1,.23);}
  return {g,wheels};
}
function ground(material,x,z,w,d){
  const geo=new THREE.PlaneGeometry(w,d),uv=geo.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/4,uv.getY(i)*d/4);
  const mesh=new THREE.Mesh(geo,material);mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.01,z);mesh.receiveShadow=true;scene.add(mesh);
}
async function textures(){
  const load=async(n,color=false)=>{const t=await new THREE.TextureLoader().loadAsync(asset(n));t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;t.anisotropy=4;return t;};
  const [road,normal,rough,wall]=await Promise.all([load('asphalt-diff.webp',true),load('asphalt-normal.webp'),load('asphalt-rough.webp'),load('limewash.webp',true)]);
  M.road=new THREE.MeshStandardMaterial({map:road,normalMap:normal,roughnessMap:rough,color:'#aeb1a1',normalScale:new THREE.Vector2(.2,.2),roughness:.94});
  M.cream.map=wall;M.red.map=wall;M.cream.roughness=.9;
}
function build(){
  const paving=new THREE.MeshStandardMaterial({map:M.cream.map,color:'#a3a393',roughness:.95});
  ground(paving,0,0,200,200);
  for(const x of [-34,0,34])ground(M.road,x,0,13,114);
  for(const z of [-32,0,32])ground(M.road,0,z,114,13);
  const stat=new THREE.Group();
  const roof=new THREE.MeshStandardMaterial({map:M.cream.map,color:'#9b9d92',roughness:.94});
  for(const b of WORLD.buildings){
    box(stat,M.cream,b.x,b.h/2,b.z,b.w,b.h,b.d);box(stat,roof,b.x,b.h+.16,b.z,b.w+.4,.3,b.d+.4);
    for(const s of [-1,1]){
      box(stat,M.cream,b.x+s*b.w/2,b.h+.5,b.z,.22,.65,b.d);
      box(stat,M.cream,b.x,b.h+.5,b.z+s*b.d/2,b.w,.65,.22);
      box(stat,M.dark,b.x+s*(b.w/2+.07),1.15,b.z,.035,2.3,1.6);
      box(stat,M.chrome,b.x+s*(b.w/2+.12),1.1,b.z+.5,.03,.05,.15);
    }
    for(const s of [-1,1])for(let z=b.z-b.d/2+2;z<b.z+b.d/2;z+=3.5)for(let y=2;y<b.h;y+=2.6){
      box(stat,M.glass,b.x+s*(b.w/2+.03),y,z,.07,1.65,1.25);box(stat,M.dark,b.x+s*(b.w/2+.075),y,z,.035,.035,1.27);
    }
    box(stat,M.red,b.x,b.h+.45,b.z,1.3,.6,1.4);for(const s of [-1,1])box(stat,M.metal,b.x+s*3,b.h+.55,b.z,1,.7,.8);
    for(let x=b.x-b.w/2+2;x<b.x+b.w/2;x+=3.8)for(let y=2;y<b.h;y+=2.6)box(stat,M.glass,x,y,b.z+b.d/2+.03,1.45,1.5,.07);
    ground(M.sand,b.x,b.z,b.w+1.1,b.d+1.1);
  }
  for(const x of [-34,0,34])for(let z=-52;z<55;z+=5){box(stat,M.white,x,.028,z,.09,.012,2);for(const s of [-1,1])box(stat,z%2?M.dark:M.white,x+s*6.6,.12,z,.12,.22,2.8);}
  for(const [x,z] of [[-6,38],[6,24],[-40,27],[40,23],[-40,-28],[40,-23],[-6,-35]])lamp(stat,x,z);
  tent(stat,-6,41);sign(stat,'EVERY ELIGIBLE VOTER',-6,3,43.2,4,.7,'#d5c5a6','#704631','FICTIONAL GATHERING');
  for(const [x,z] of [[-7,35],[40,12],[-40,-8]])bench(stat,x,z,Math.PI/2);
  const landmark=observatory();landmark.scale.setScalar(.42);landmark.position.set(47,0,43);scene.add(landmark);
  sign(stat,'JANTAR MANTAR ROAD',7,2.3,41,5,.65,'#245045','#dfddc3','REFERENCE-INSPIRED · NOT A SURVEYED MAP');
  cylinder(stat,M.metal,7,1.2,41,.055,2.4);
  sign(stat,'RECORD NETWORK',-34,2.5,-54,7,.85,'#234b3d','#e7dfc8','WESTERN SAFE HOUSE');
  for(const x of [-40,-28])box(stat,M.red,x,1.6,-49,.45,3.2,11);
  box(stat,M.red,-34,3.4,-53,12,.4,3);box(stat,M.red,-34,1.6,-54,12,3.2,.4);
  scene.add(mergeStatic(stat));
  if(treeSource)for(const [x,z] of [[-42,40],[42,34],[-6,-38],[8,38],[43,-36],[-41,-42],[43,9],[-42,10]]){const t=treeSource.clone();t.position.set(x,0,z);t.scale.setScalar(.75);scene.add(t);}
  gate=new THREE.Group();for(const x of [-3.3,0,3.3]){const b=barricade();b.position.x=x;gate.add(b);}gate.position.set(0,0,17);scene.add(gate);
  block=new THREE.Group();for(const x of [-3.3,0,3.3]){const b=barricade();b.position.x=x;block.add(b);}block.position.set(-34,0,-17);scene.add(block);
  van=vehicle();scene.add(van.g);enemyCar=vehicle(true);scene.add(enemyCar.g);
  player=human('#c7bda4',false,{localWardrobe:true});friend=human('#7e9c91',false,{localWardrobe:true});scene.add(player.group,friend.group);poses.push(player,friend);
  for(const e of game.enemies){const p=human('#998669',true,{bag:false,skin:'#9a6f51',detail:false});scene.add(p.group);const ring=new THREE.Mesh(new THREE.RingGeometry(.85,1.08,24),new THREE.MeshBasicMaterial({color:'#ec6d4c',transparent:true,opacity:.7,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.035;p.group.add(ring);enemyModels.push({p,ring});}
  for(let i=0;i<10;i++){const p=human(['#a7ad8c','#8f7660','#739186'][i%3],false,{female:i%2===0,localWardrobe:i%3!==0});p.group.position.set((i%5-2)*2.2,0,38+Math.floor(i/5)*3);p.group.rotation.y=Math.PI;scene.add(p.group);crowd.push(p);poses.push(p);}
  recorder=new THREE.Group();box(recorder,M.dark,0,.25,0,.4,.25,.28);box(recorder,M.chrome,0,.38,0,.16,.025,.08);recorder.position.set(WORLD.record.x,0,WORLD.record.z);scene.add(recorder);
  recordRing=ring('#dfb279',1.1,WORLD.record.x,WORLD.record.z);safeRing=ring('#7fc99e',4.5,WORLD.safe.x,WORLD.safe.z);
  for(const s of game.supplies){const g=new THREE.Group();box(g,M.white,0,.35,0,.65,.6,.4);box(g,M.red,0,.67,0,.13,.016,.32);box(g,M.red,0,.67,0,.35,.017,.10);g.position.set(s.x,0,s.z);scene.add(g);medModels.push(g);}
  arrow=new THREE.Mesh(new THREE.ConeGeometry(.35,.8,3),new THREE.MeshBasicMaterial({color:'#eac185'}));arrow.rotation.x=Math.PI;scene.add(arrow);
  for(let i=0;i<40;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.10,.10,.10),new THREE.MeshBasicMaterial({color:'#dfb279'}));m.visible=false;scene.add(m);particleMeshes.push(m);}
}
function ring(color,r,x,z){const m=new THREE.Mesh(new THREE.RingGeometry(r-.06,r,48),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,transparent:true,opacity:.8}));m.rotation.x=-Math.PI/2;m.position.set(x,.05,z);scene.add(m);return m;}
function quality(){
  if(!renderer)return;const q=$('quality').value,low=q==='low'||q==='auto'&&coarse;
  renderer.setPixelRatio(Math.min(devicePixelRatio,low?1:1.5));renderer.shadowMap.enabled=true;resize();
  scene.traverse(o=>{if(o.isDirectionalLight){o.shadow.mapSize.set(low?1024:2048,low?1024:2048);if(o.shadow.map){o.shadow.map.dispose();o.shadow.map=null;}}});
}
function resize(){const w=innerWidth,h=innerHeight,span=coarse?26:25;renderer?.setSize(w,h);if(camera){camera.left=-span*w/h/2;camera.right=span*w/h/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();}}
window.addEventListener('resize',()=>{resize();render();});
function pose(p,e,dt,drive=0){p.group.position.set(e.x,0,e.z);p.group.rotation.y=(e.yaw||0)+Math.PI;p.worldSpeed=drive;poseHuman(p,game.time*7.5,drive>3?1:drive>.1?.6:0);}
function drawMap(){
  const c=$('map').getContext('2d'),n=144,point=p=>[(p.x+58)/116*n,(p.z+58)/116*n];c.fillStyle='#223c31';c.fillRect(0,0,n,n);c.fillStyle='#7b8778';
  for(const x of [-34,0,34])c.fillRect((x+58-6)/116*n,0,12/116*n,n);for(const z of [-32,0,32])c.fillRect(0,(z+58-6)/116*n,n,12/116*n);
  for(const [p,color,r] of [[WORLD.safe,'#81cc9f',4],[game.friend,'#e4bf82',3],[game.van,'#dfe4d2',3],[game.player,'#fff2c6',4],...game.enemies.filter(e=>e.hp>0).map(e=>[e,'#df7a5b',2])]){const [x,y]=point(p);c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
}
function hud(){
  $('objective').textContent=game.objective();const t=game.target(),p=game.player;
  $('distance').textContent=Math.round(Math.hypot(t.x-p.x,t.z-p.z))+' m · gold: objective / green: safe house';
  $('direction').style.transform=`rotate(${Math.atan2(t.x-p.x,-(t.z-p.z))}rad)`;
  $('health').textContent='HEALTH '+Array.from({length:6},(_,i)=>i<p.health?'●':'○').join('');
  $('stamina').style.width=p.stamina+'%';$('vehicle-status').textContent=game.van.occupied?`VAN ${Math.round(game.van.health)}% · ${Math.round(game.van.speed*3)} GAME km/h`:'ON FOOT · '+(game.friend.rescued?'KABIR WITH YOU':'FIND KABIR');
  $('phase').textContent=game.phase.toUpperCase();$('heat-note').textContent=game.seen?'They can see you':game.heat<.7?'Route to safety is clear':`Out of sight · ${game.hidden.toFixed(0)} seconds`;
  $('heat-bars').innerHTML=Array.from({length:5},(_,i)=>`<i class="${i<Math.ceil(game.heat)?'on':''}"></i>`).join('');
  const n=game.nearby();$('action').hidden=!n||game.mode!=='playing';$('action').textContent=n?.label||'ACTION';
  $('dash').textContent=game.van.occupied?'BRAKE':p.dashCd>0?'DODGE '+p.dashCd.toFixed(1):'DODGE';$('strike').textContent=game.van.occupied?'HORN':'STRIKE';$('aim-label').textContent=game.van.occupied?'HOLD BRAKE':'AIM + STRIKE';
  $('toast').textContent=game.message;drawMap();syncPanels();
}
function step(dt){
  const before=game.mode,health=game.player.health,hits=game.hits;
  if(game.mode==='playing'){
    game.input.x=sticks.move.x+(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);
    game.input.z=sticks.move.z+(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0);
    game.input.sprint=keys.has('ShiftLeft')||keys.has('ShiftRight')||coarse&&Math.hypot(sticks.move.x,sticks.move.z)>.85;
    if(!mouseAim&&!game.input.attack&&Math.hypot(game.input.x,game.input.z)>.1){game.input.aimX=game.input.x;game.input.aimZ=game.input.z;}
    game.input.brake=game.van.occupied&&(keys.has('Space')||brakeHeld||aimBrake);
    game.update(dt);if(health>game.player.health)audio.tone(90,.12);if(hits<game.hits)audio.tone(220,.05);
    if(before!==game.mode&&['won','caught'].includes(game.mode)){finish();audio.tone(game.mode==='won'?590:100,.5);}
  }
  clock+=dt;
  if(player){
    const moving=Math.hypot(game.input.x,game.input.z)>.1&&game.mode==='playing';
    player.group.visible=!game.van.occupied;pose(player,game.player,dt,moving?(game.input.sprint?6.5:4.2):0);
    if(game.player.attack>0){const arm=player.model.getObjectByName('Bip01 R UpperArm');if(arm)arm.rotation.z+=Math.sin(game.player.attack/.25*Math.PI)*.8;}
    friend.group.visible=!game.friend.aboard;pose(friend,game.friend,dt,game.friend.rescued&&Math.hypot(game.friend.x-game.player.x,game.friend.z-game.player.z)>2?4.5:0);
    for(let i=0;i<game.enemies.length;i++){const e=game.enemies[i],m=enemyModels[i];m.p.group.visible=Math.hypot(e.x-game.player.x,e.z-game.player.z)<38;if(m.p.group.visible){pose(m.p,e,dt,e.hp>0&&e.stun<=0?2.6:0);m.p.group.rotation.z=e.hp<=0?Math.PI/2:0;m.p.group.position.y=e.hp<=0?.15:0;}m.ring.visible=e.windup>0;}
    crowdClock+=dt;if(crowdClock>.22){crowdClock=0;crowd.forEach((p,i)=>{p.group.visible=Math.hypot(p.group.position.x-game.player.x,p.group.position.z-game.player.z)<34;if(p.group.visible)poseHuman(p,game.time*.75+i,0);});}
    gate.rotation.x=game.gate.fall*Math.PI/2;block.visible=game.roadblock;
    for(const [model,e] of [[van,game.van],[enemyCar,game.car]]){model.g.position.set(e.x,0,e.z);model.g.rotation.y=e.yaw+Math.PI;model.wheels.forEach(w=>w.rotation.y+=e.speed*dt/.43);}
    enemyCar.g.visible=game.car.active;recorder.visible=recordRing.visible=!game.record;medModels.forEach((m,i)=>m.visible=!game.supplies[i].taken);
    const t=game.target();arrow.position.set(t.x,3+.15*Math.sin(clock*3),t.z);arrow.visible=game.mode==='playing';
    safeRing.material.opacity=.5+.25*Math.sin(clock*2);
    for(let j=0;j<particleMeshes.length;j++){const q=game.particles[j],m=particleMeshes[j];m.visible=!!q;if(q){m.position.set(q.x,Math.max(.06,q.y),q.z);m.material.color.set(q.color==='teal'?'#91cab3':q.color==='red'?'#dd7655':'#e2b578');}}
  }
  if(engineGain){engineGain.gain.setTargetAtTime(audio.enabled&&game.van.occupied&&game.mode==='playing'?.014:0,audio.ctx.currentTime,.1);engineTone.frequency.setTargetAtTime(45+game.van.speed*4,audio.ctx.currentTime,.1);}
}
function render(){
  if(!player)return;
  const p=game.player,look=new THREE.Vector3(p.x,.5,p.z-3),eye=new THREE.Vector3(p.x,32,p.z+22);
  if(game.mode==='menu'){camera.position.set(31,36,46);camera.lookAt(0,0,15);}
  else{camera.position.copy(eye);camera.lookAt(look);}
  sun.position.set(p.x-20,55,p.z+15);sun.target.position.set(p.x,0,p.z);sun.target.updateMatrixWorld();
  hud();renderer.info.reset();renderer.render(scene,camera);
}
async function init(){
  try{
    renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.domElement.className='game';renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;$('viewport').appendChild(renderer.domElement);
    scene=new THREE.Scene();scene.background=new THREE.Color('#bdc8b3');scene.fog=new THREE.Fog('#bbc5b0',80,150);camera=new THREE.OrthographicCamera(-20,20,16,-16,.1,180);
    sun=new THREE.DirectionalLight('#fff0d2',3.2);sun.position.set(-20,55,15);sun.castShadow=true;Object.assign(sun.shadow.camera,{left:-28,right:28,top:28,bottom:-28,near:1,far:100});sun.shadow.bias=-.0003;scene.add(sun,sun.target);scene.add(new THREE.HemisphereLight('#cadbe0','#596344',2));
    $('loading').textContent='Loading licensed characters and scanned street materials…';
    const r=await Promise.allSettled([loadPeople(asset),textures(),new GLTFLoader().loadAsync(asset('tree-delhi.glb')),new RGBELoader().loadAsync(asset('delhi-sky.hdr'))]);
    if(r[0].status!=='fulfilled'||r[1].status!=='fulfilled')throw new Error('Character or surface assets failed to load. Please reload.');
    if(r[2].status==='fulfilled')treeSource=r[2].value.scene;
    if(r[3].status==='fulfilled'){r[3].value.mapping=THREE.EquirectangularReflectionMapping;const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(r[3].value).texture;scene.environmentIntensity=.35;pmrem.dispose();}
    build();quality();const preference=new URLSearchParams(location.search).get('quality');if(['high','low'].includes(preference)){$('quality').value=preference;quality();}
    $('start').disabled=false;$('start').textContent='PLAY · Breakout';$('loading').textContent='The city is ready. Keyboard and dual-stick touch controls.';syncPanels();hud();render();
    renderer.domElement.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||game.mode!=='playing')return;const r=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.x)/r.width*2-1,-(e.clientY-r.y)/r.height*2+1),camera);if(ray.ray.intersectPlane(groundPlane,v3)){const d=Math.hypot(v3.x-game.player.x,v3.z-game.player.z);game.input.aimX=(v3.x-game.player.x)/Math.max(.01,d);game.input.aimZ=(v3.z-game.player.z)/Math.max(.01,d);mouseAim=true;}});
    renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'&&e.button===0&&game.mode==='playing')game.input.attack=true;});window.addEventListener('pointerup',()=>{if(!coarse)game.input.attack=false;});
    window.render_game_to_text=()=>JSON.stringify({...game.text(),quality:$('quality').value,rendering:{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles},avatarModels:4});
    window.advanceTime=ms=>{manual=true;const n=Math.max(1,Math.ceil(ms/16.667));for(let i=0;i<n;i++)step(ms/n/1000);render();$('performance').textContent=`QA STEP · BREAKOUT / 0.12 · ${renderer.info.render.calls} draws`;};
    function loop(now){if(!manual){const dt=Math.min(.05,(now-last)/1000||.016);step(dt);render();frames++;if(now-frameStart>1000){fps=frames*1000/(now-frameStart);frames=0;frameStart=now;$('performance').textContent=`${Math.round(fps)} FPS · ${renderer.info.render.calls} draws · ${Math.round(renderer.info.render.triangles/1000)}k tris`;}}last=now;requestAnimationFrame(loop);}
    requestAnimationFrame(loop);
  }catch(e){$('loading').textContent=e.message;$('start').textContent='Reload to retry';$('start').disabled=true;console.error(e);}
}
init();
