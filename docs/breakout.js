import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import {City as Breakout,WORLD,CONTRACTS} from './city-rules.js?v=0.14.3';
import {installMap,PLACES,SCALE,roadRoute} from './city-data.js?v=0.14.3';
import {human,loadPeople,poseHuman,resetHuman} from './people.js?v=0.12.0';
import {materials as M,box,cylinder,sign,mergeStatic,barricade,observatory,bench,lamp,tent} from './world-props.js';
import {WorldAudio} from './world-audio.js';

const $=id=>document.getElementById(id),coarse=matchMedia('(pointer:coarse)').matches||innerWidth<700;
const asset=name=>(window.origin==='null'?'https://raw.githubusercontent.com/nawaaaaaAaar/dissent-last-ballot/main/docs/assets/':'./assets/')+name+'?v=0.12.0';
const game=new Breakout(),keys=new Set(),audio=new WorldAudio();
const sticks={move:{x:0,z:0},aim:{x:0,z:-1}},poses=[],effects=[];
let renderer,scene,camera,sun,player,friend,van,enemyCar,gate,block,recorder,recordRing,safeRing,arrow,treeSource,playerRing,friendRing;
let manual=false,last=0,clock=0,fps=0,frames=0,frameStart=performance.now(),mouseAim=false,helpReturn='menu',engineTone,engineGain,brakeHeld=false,aimBrake=false,crowdClock=0,mouseStrike=false,stickStrike=false,buttonStrike=false,routeClock=0,guideRoute=[];
const particleMeshes=[],medModels=[],crowd=[],enemyModels=[];
const v3=new THREE.Vector3(),ray=new THREE.Raycaster(),groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);

function setMode(mode){game.mode=mode;syncPanels();}
function syncPanels(){
  $('menu').hidden=game.mode!=='menu';$('hud').hidden=['menu','loading','error'].includes(game.mode);
  $('controls').hidden=game.mode!=='playing';$('pause-screen').hidden=game.mode!=='paused';$('help-screen').hidden=game.mode!=='help';
  $('ending').hidden=!['won','caught'].includes(game.mode);$('pause').hidden=!['playing','paused'].includes(game.mode);$('pause').textContent=game.mode==='paused'?'Resume':'Pause';
  $('retry').hidden=game.mode!=='caught';$('toast').hidden=game.messageTime<=0||game.mode!=='playing';
  $('city-screen').hidden=game.mode!=='board';
}
function finish(){
  $('ending-kicker').textContent=game.mode==='won'?'THE NETWORK HOLDS':'THE RUN WAS INTERRUPTED';
  $('ending-title').textContent=game.mode==='won'?`${game.result.medal} · ${game.result.title}`:'Try another route.';
  $('ending-copy').textContent=game.mode==='won'?
    `Operation complete. ${game.network.credits} support credits are available. Choose another job, improve your medal, or explore the city. The fictional network demands Gyanesh Kumar’s departure through constitutional processes, ending contested SIR, and transparent inclusion support for every eligible voter. This is not news of actual resignation, repeal or voter restoration.`:
    game.message+' Recovered recording and rescue/boarding checkpoints are retained within this tab, not after reload.';
  $('results').innerHTML=`<span>SCORE<br><b>${Math.round(game.score)}</b></span><span>JOB TIME<br><b>${Math.floor(game.elapsed/60)}:${String(Math.floor(game.elapsed%60)).padStart(2,'0')}</b></span><span>NETWORK<br><b>${game.network.total} jobs</b></span>`;
}
function clearInput(){keys.clear();sticks.move={x:0,z:0};game.input.attack=false;mouseStrike=stickStrike=buttonStrike=aimBrake=brakeHeld=false;}
function start(){clearInput();mouseAim=false;game.start();game.accept('witness');routeClock=0;step(0);poses.forEach(resetHuman);if(!audio.enabled)toggleAudio();syncPanels();render();}
function help(){helpReturn=game.mode;clearInput();setMode('help');}
function pause(){if(game.mode==='paused')setMode('playing');else if(game.mode==='playing'){clearInput();setMode('paused');}}
function toggleAudio(){
  const on=audio.toggle();$('sound').textContent=on?'Sound on':'Sound off';
  if(on&&!engineTone){engineTone=audio.ctx.createOscillator();engineGain=audio.ctx.createGain();engineTone.type='triangle';engineTone.frequency.value=55;engineGain.gain.value=0;engineTone.connect(engineGain).connect(audio.ctx.destination);engineTone.start();}
  if(engineGain&&!on)engineGain.gain.value=0;
}
function button(id,callback){$(id).addEventListener('click',callback);}
button('start',start);button('tutorial',help);button('pause-help',help);button('help-close',()=>setMode(helpReturn));
button('pause',pause);button('resume',pause);button('restart',()=>{game.abandon();board();});button('again',()=>{game.continue();board();});button('sound',toggleAudio);
function board(){
  clearInput();helpReturn=game.mode;setMode('board');
  $('network-status').textContent=`Cycle ${game.network.cycle} · ${game.network.total} operations · ${game.network.credits} support credits`;
  $('contracts').innerHTML=CONTRACTS.map(c=>`<button data-contract="${c.id}" ${game.mission||c.id==='charter'&&game.network.completed.length<3?'disabled':''}><b>${c.title}</b><span>${c.type.toUpperCase()} · ${PLACES.find(p=>p.id===c.from).name} → ${PLACES.find(p=>p.id===c.to).name}</span><small>${c.id==='charter'&&game.network.completed.length<3?'Complete the three operations to unlock':`${c.reward} credits · best ${game.network.bests[c.id]||'—'}`}</small></button>`).join('');
  $('upgrades').innerHTML=[['tempo','Strike tempo',4],['reinforce','Reinforced van',4],['stamina','Running endurance',3]].map(([id,name,cost])=>`<button data-upgrade="${id}" ${game.network.upgrades.includes(id)||game.network.credits<cost?'disabled':''}>${name} · ${game.network.upgrades.includes(id)?'OWNED':cost+' credits'}</button>`).join('');
  $('board-note').textContent=game.mission?'Active operation: '+game.mission.title+'. Resume it or abandon it to choose another.':'Choose a job or explore. Encounters are fictional; geographic street data is OSM-derived.';
  $('save-code').value='';drawCityMap();render();
}
button('missions',board);button('board-close',()=>setMode(helpReturn==='menu'?'menu':'playing'));
button('operations-jump',()=>$('contracts').scrollIntoView({block:'start',behavior:'smooth'}));
button('explore',()=>{if(game.mode==='board'&&helpReturn==='menu')game.start();else game.abandon();setMode('playing');});
button('export-save',()=>{$('save-code').value=game.save();$('board-note').textContent='Copy this code somewhere safe. Paste it here next visit and press Restore. No browser storage is required.';});
button('import-save',()=>{const ok=game.load($('save-code').value);board();$('board-note').textContent=ok?'Network progress restored. Choose your next operation.':'Invalid save code. Your current progress is unchanged.';});
$('contracts').addEventListener('click',e=>{const b=e.target.closest('[data-contract]');if(!b||b.disabled)return;if(helpReturn==='menu')game.start();if(game.accept(b.dataset.contract,$('difficulty').value)){clearInput();setMode('playing');routeClock=0;}});
$('upgrades').addEventListener('click',e=>{const b=e.target.closest('[data-upgrade]');if(b&&game.upgrade(b.dataset.upgrade))board();});
button('retry',()=>{clearInput();mouseAim=false;game.retry();poses.forEach(resetHuman);syncPanels();render();});
button('action',()=>{game.interact();syncPanels();});
button('strike',()=>{aimNearest();game.attack();audio.tone(230,.08);});
$('strike').addEventListener('pointerdown',()=>{buttonStrike=!game.van.occupied;mouseAim=false;});
for(const event of ['pointerup','pointercancel','pointerleave'])$('strike').addEventListener(event,()=>buttonStrike=false);
button('dash',()=>game.dash());
$('dash').addEventListener('pointerdown',()=>{if(game.van.occupied)brakeHeld=true;});
for(const event of ['pointerup','pointercancel','pointerleave'])$('dash').addEventListener(event,()=>brakeHeld=false);
$('quality').onchange=quality;
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='SELECT')return;
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
  keys.add(e.code);if(e.repeat)return;
  if(e.target.tagName==='TEXTAREA'){keys.delete(e.code);return;}
  if(e.code==='KeyE')game.interact();if(e.code==='KeyQ')game.dash();if(e.code==='Space'&&!game.van.occupied){aimNearest();game.attack();}
  if(e.code==='Escape'||e.code==='KeyP')pause();
  if(e.code==='KeyM')board();
});
document.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{keys.clear();if(game.mode==='playing')pause();});
function aimNearest(){
  if(mouseAim||stickStrike)return;
  const closest=game.enemies.filter(e=>e.hp>0&&Math.hypot(e.x-game.player.x,e.z-game.player.z)<3.2).sort((a,b)=>Math.hypot(a.x-game.player.x,a.z-game.player.z)-Math.hypot(b.x-game.player.x,b.z-game.player.z))[0];
  if(closest){const d=Math.hypot(closest.x-game.player.x,closest.z-game.player.z);game.input.aimX=d>.001?(closest.x-game.player.x)/d:0;game.input.aimZ=d>.001?(closest.z-game.player.z)/d:1;}
  else{game.input.aimX=Math.sin(game.player.yaw);game.input.aimZ=Math.cos(game.player.yaw);}
}
function stick(id,type){
  const el=$(id),knob=el.querySelector('i');let pointer=null;
  const apply=e=>{
    const r=el.getBoundingClientRect(),radius=r.width*.36,dx=e.clientX-r.x-r.width/2,dz=e.clientY-r.y-r.height/2,m=Math.hypot(dx,dz),factor=Math.min(1,m/radius);
    const x=m?dx/m*factor:0,z=m?dz/m*factor:0;sticks[type]={x,z};knob.style.left=`${50+x*36}%`;knob.style.top=`${50+z*36}%`;
    if(type==='aim'){mouseAim=false;game.input.aimX=x;game.input.aimZ=z;stickStrike=factor>.2&&!game.van.occupied;aimBrake=game.van.occupied;}
  };
  el.onpointerdown=e=>{pointer=e.pointerId;el.setPointerCapture(pointer);apply(e);e.preventDefault();};
  el.onpointermove=e=>{if(e.pointerId===pointer)apply(e);};
  const end=()=>{pointer=null;knob.style.left=knob.style.top='50%';if(type==='move')sticks.move={x:0,z:0};else{stickStrike=false;aimBrake=false;}};
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
function ground(material,x,z,w,d,y=.01){
  const geo=new THREE.PlaneGeometry(w,d),uv=geo.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/4,uv.getY(i)*d/4);
  const mesh=new THREE.Mesh(geo,material);mesh.rotation.x=-Math.PI/2;mesh.position.set(x,y,z);mesh.receiveShadow=true;scene.add(mesh);
}
async function textures(){
  const load=async(n,color=false)=>{const t=await new THREE.TextureLoader().loadAsync(asset(n));t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;t.anisotropy=4;return t;};
  const [road,normal,rough,wall]=await Promise.all([load('asphalt-diff.webp',true),load('asphalt-normal.webp'),load('asphalt-rough.webp'),load('limewash.webp',true)]);
  M.road=new THREE.MeshStandardMaterial({map:road,normalMap:normal,roughnessMap:rough,color:'#aeb1a1',normalScale:new THREE.Vector2(.2,.2),roughness:.94});
  M.cream.map=wall;M.red.map=wall;M.cream.roughness=.9;
}
function build(){
  const paving=new THREE.MeshStandardMaterial({map:M.cream.map,color:'#a3a393',roughness:.95});
  ground(paving,5,15,300,420,0);
  const stat=new THREE.Group();
  const positions=[],uvs=[];
  for(const s of WORLD.segments){
    const dx=s.b.x-s.a.x,dz=s.b.z-s.a.z,d=Math.hypot(dx,dz),nx=-dz/d*s.width/2,nz=dx/d*s.width/2;
    const corners=[[s.a.x+nx,s.a.z+nz],[s.a.x-nx,s.a.z-nz],[s.b.x-nx,s.b.z-nz],[s.b.x+nx,s.b.z+nz]];
    for(const i of [0,2,1,0,3,2]){const[x,z]=corners[i];positions.push(x,.025,z);uvs.push(x/4,z/4);}
  }
  const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));rg.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));rg.computeVertexNormals();
  const roads=new THREE.Mesh(rg,M.road);roads.receiveShadow=true;scene.add(roads);
  for(const b of WORLD.buildings){
    const shape=new THREE.Shape(b.poly.map(p=>new THREE.Vector2(p.x,-p.z))),geo=new THREE.ExtrudeGeometry(shape,{depth:b.height,bevelEnabled:false});geo.rotateX(-Math.PI/2);
    const mesh=new THREE.Mesh(geo,M.cream);mesh.castShadow=true;mesh.receiveShadow=true;stat.add(mesh);
  }
  const jm=PLACES[0],cp=PLACES[1],ig=PLACES[2];
  const landmark=observatory();landmark.scale.setScalar(.58);landmark.position.set(jm.x,0,jm.z);scene.add(landmark);
  // Original illustrative arch, not a monument scan; actual landmark coordinate.
  const arch=new THREE.Shape();arch.moveTo(-5,0);arch.lineTo(5,0);arch.lineTo(5,14);arch.lineTo(-5,14);arch.closePath();
  const hole=new THREE.Path();hole.moveTo(-2,0);hole.lineTo(-2,7);hole.absarc(0,7,2,Math.PI,0,true);hole.lineTo(2,0);hole.closePath();arch.holes.push(hole);
  const ag=new THREE.ExtrudeGeometry(arch,{depth:3,bevelEnabled:false});const am=new THREE.Mesh(ag,M.sand);am.position.set(ig.x,0,ig.z-1.5);am.castShadow=true;stat.add(am);
  box(stat,M.sand,ig.x,14.5,ig.z,11,1,4);sign(stat,'INDIA GATE',ig.x,11,ig.z+1.56,5,.8,'#bda987','#4f4b3f');
  for(const p of PLACES){sign(stat,p.name.toUpperCase(),p.x,3,p.z+5,7,.7,'#245045','#dfddc3');lamp(stat,p.x+5,p.z+5);bench(stat,p.x+7,p.z+3);}
  tent(stat,jm.x-10,jm.z+8);sign(stat,'EVERY ELIGIBLE VOTER',jm.x-10,3,jm.z+10,5,.7,'#d5c5a6','#704631','FICTIONAL ASSEMBLY');
  // CP's colonnades get a recognisable rhythm; underlying footprints are OSM-derived.
  for(let i=0;i<32;i++){const a=i*Math.PI/16; cylinder(stat,M.white,cp.x+Math.sin(a)*22,2,cp.z+Math.cos(a)*22,.32,4);}
  scene.add(mergeStatic(stat));
  if(treeSource)for(const p of PLACES)for(const s of[-1,1]){const t=treeSource.clone();t.position.set(p.x+s*13,0,p.z+12);t.scale.setScalar(.75);scene.add(t);}
  gate=new THREE.Group();for(const x of [-3.3,0,3.3]){const b=barricade();b.position.x=x;gate.add(b);}gate.position.set(0,0,17);scene.add(gate);
  block=new THREE.Group();for(const x of [-3.3,0,3.3]){const b=barricade();b.position.x=x;block.add(b);}block.position.set(-34,0,-17);scene.add(block);
  van=vehicle();scene.add(van.g);enemyCar=vehicle(true);scene.add(enemyCar.g);
  player=human('#628978',false,{localWardrobe:false});friend=human('#a89775',false,{localWardrobe:true});scene.add(player.group,friend.group);poses.push(player,friend);
  playerRing=ring('#91d4ba',.55,0,0);friendRing=ring('#dfb279',.5,0,0);
  for(const e of game.enemies){
    const p=human('#998669',true,{bag:false,skin:'#9a6f51',detail:false});scene.add(p.group);
    const ring=new THREE.Mesh(new THREE.RingGeometry(.85,1.08,24),new THREE.MeshBasicMaterial({color:'#ec6d4c',transparent:true,opacity:.7,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.035;p.group.add(ring);
    const bars=new THREE.Group(),segments=[];
    for(let i=0;i<3;i++){const sprite=new THREE.Sprite(new THREE.SpriteMaterial({color:'#dfb279',depthTest:false}));sprite.scale.set(.28,.10,1);sprite.position.x=(i-1)*.32;bars.add(sprite);segments.push(sprite);}
    scene.add(bars);enemyModels.push({p,ring,bars,segments});
  }
  for(let i=0;i<10;i++){const p=human(['#a7ad8c','#8f7660','#739186'][i%3],false,{female:i%2===0,localWardrobe:i%3!==0});p.group.position.set(jm.x-8+(i%5)*2.2,0,jm.z+10+Math.floor(i/5)*3);p.group.rotation.y=Math.PI;scene.add(p.group);crowd.push(p);poses.push(p);}
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
  const c=$('map').getContext('2d'),n=144,span=90,point=p=>[(p.x-game.player.x)/span*n+n/2,(p.z-game.player.z)/span*n+n/2];
  paintMap(c,n,point,false);
}
function paintMap(c,n,point,labels){
  c.fillStyle='#223c31';c.fillRect(0,0,n,n);c.strokeStyle='#85917e';c.lineWidth=labels?2:5;
  c.beginPath();for(const s of WORLD.segments){const a=point(s.a),b=point(s.b);c.moveTo(...a);c.lineTo(...b);}c.stroke();
  c.strokeStyle='#dfb279';c.lineWidth=labels?3:2;c.beginPath();guideRoute.forEach((p,i)=>{const q=point(p);i?c.lineTo(...q):c.moveTo(...q);});c.stroke();
  c.fillStyle='#e38164';for(const b of[game.gate.hp>0?game.gate:null,game.roadblock?game.block:null].filter(Boolean)){const[x,y]=point(b);c.fillRect(x-6,y-2,12,4);}
  for(const [p,color,r] of [[game.target(),'#dfb279',5],[game.van,'#dfe4d2',3],[game.player,'#a9efcc',4],...game.enemies.filter(e=>e.hp>0).map(e=>[e,'#df7a5b',2])]){
    const[x,y]=point(p);c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();
  }
  if(labels){c.font='14px Satoshi';c.fillStyle='#fff0d0';for(const p of PLACES){const[x,y]=point(p);c.fillText(p.name,Math.max(6,Math.min(n-95,x+5)),y-7);}}
}
function drawCityMap(){const c=$('city-map').getContext('2d'),n=420;paintMap(c,n,p=>[(p.x+195)/420*n,(p.z+190)/420*n],true);}
function hud(){
  $('objective').textContent=game.objective();const t=game.target(),p=game.player;
  $('distance').textContent=Math.round(Math.hypot(t.x-p.x,t.z-p.z)/SCALE)+' real-map m · '+(game.mission?game.mission.title:'Delhi free roam');
  const next=guideRoute.find(q=>Math.hypot(q.x-p.x,q.z-p.z)>4)||t;
  $('direction').style.transform=`rotate(${Math.atan2(next.x-p.x,-(next.z-p.z))}rad)`;
  $('health').textContent='HEALTH '+Array.from({length:6},(_,i)=>i<p.health?'●':'○').join('');
  $('stamina').style.width=p.stamina+'%';$('vehicle-status').textContent=game.van.occupied?`VAN ${Math.round(game.van.health)}% · ${Math.round(game.van.speed*3)} GAME km/h`:'ON FOOT · '+(game.friend.rescued?'KABIR WITH YOU':game.mission?.type==='rescue'?'FIND KABIR':game.mission?.type==='rally'?'STAND TOGETHER':game.record?'DISPATCH SECURED':'EXPLORE');
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
    game.input.attack=!game.van.occupied&&(keys.has('Space')||mouseStrike||stickStrike||buttonStrike);
    if(game.input.attack&&!mouseAim&&!stickStrike)aimNearest();
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
    friend.group.visible=game.mission?.type==='rescue'&&!game.friend.aboard;pose(friend,game.friend,dt,game.friend.rescued&&Math.hypot(game.friend.x-game.player.x,game.friend.z-game.player.z)>2?4.5:0);
    playerRing.visible=!game.van.occupied;playerRing.position.set(game.player.x,.045,game.player.z);
    friendRing.visible=friend.group.visible;friendRing.position.set(game.friend.x,.045,game.friend.z);
    for(let i=0;i<game.enemies.length;i++){
      const e=game.enemies[i],m=enemyModels[i];m.p.group.visible=!!game.mission&&e.active&&Math.hypot(e.x-game.player.x,e.z-game.player.z)<38;
      if(m.p.group.visible){pose(m.p,e,dt,e.hp>0&&e.stun<=0?2.6:0);m.p.group.rotation.z=e.hp<=0?Math.PI/2:0;m.p.group.position.y=e.hp<=0?.15:0;}
      m.ring.visible=e.windup>0;m.bars.visible=e.hp>0&&Math.hypot(e.x-game.player.x,e.z-game.player.z)<10;m.bars.position.set(e.x,2.3,e.z);
      m.segments.forEach((s,j)=>s.material.color.set(j<e.hp?(e.stun>0?'#a5e7ce':'#dfb279'):'#443e33'));
    }
    crowdClock+=dt;if(crowdClock>.22){crowdClock=0;crowd.forEach((p,i)=>{p.group.visible=Math.hypot(p.group.position.x-game.player.x,p.group.position.z-game.player.z)<34;if(p.group.visible)poseHuman(p,game.time*.75+i,0);});}
    gate.rotation.x=game.gate.fall*Math.PI/2;gate.position.set(game.gate.x,0,game.gate.z);gate.visible=!!game.mission&&game.gate.hp>0||game.gate.fall<1;block.visible=game.roadblock;block.position.set(game.block.x,0,game.block.z);
    for(const [model,e] of [[van,game.van],[enemyCar,game.car]]){model.g.position.set(e.x,0,e.z);model.g.rotation.y=e.yaw+Math.PI;model.wheels.forEach(w=>w.rotation.y+=e.speed*dt/.43);}
    enemyCar.g.visible=game.car.active;recorder.visible=recordRing.visible=game.mission?.type==='courier'&&!game.record;
    recorder.position.set(WORLD.record.x,0,WORLD.record.z);recordRing.position.set(WORLD.record.x,.04,WORLD.record.z);
    const zone=game.mission?.type==='rally'?game.target():WORLD.safe;
    safeRing.position.set(zone.x,.04,zone.z);safeRing.scale.setScalar(1);safeRing.visible=!!game.mission&&(game.record||game.mission.type==='rally');
    medModels.forEach((m,i)=>m.visible=!game.supplies[i].taken);
    const t=game.target();arrow.position.set(t.x,3+.15*Math.sin(clock*3),t.z);arrow.visible=game.mode==='playing';
    safeRing.material.opacity=.5+.25*Math.sin(clock*2);
    for(let j=0;j<particleMeshes.length;j++){const q=game.particles[j],m=particleMeshes[j];m.visible=!!q;if(q){m.position.set(q.x,Math.max(.06,q.y),q.z);m.material.color.set(q.color==='teal'?'#91cab3':q.color==='red'?'#dd7655':'#e2b578');}}
  }
  routeClock-=dt;if(routeClock<=0){guideRoute=roadRoute(game.player,game.target());routeClock=1.5;}
  if(engineGain){engineGain.gain.setTargetAtTime(audio.enabled&&game.van.occupied&&game.mode==='playing'?.014:0,audio.ctx.currentTime,.1);engineTone.frequency.setTargetAtTime(45+game.van.speed*4,audio.ctx.currentTime,.1);}
}
function render(){
  if(!player)return;
  const p=game.player,look=new THREE.Vector3(p.x,.5,p.z-3),eye=new THREE.Vector3(p.x,32,p.z+22);
  if(game.mode==='menu'){camera.position.set(game.player.x+20,36,game.player.z+30);camera.lookAt(game.player.x,0,game.player.z);}
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
    const response=await fetch('./delhi-map.json?v=0.14.3');if(!response.ok)throw new Error('Delhi map failed to load. Reload to retry.');
    installMap(await response.json());game.reset();build();step(0);quality();const preference=new URLSearchParams(location.search).get('quality');if(['high','low'].includes(preference)){$('quality').value=preference;quality();}
    $('start').disabled=false;$('start').textContent='PLAY · City of accounts';$('loading').textContent='Real central-Delhi street geometry. Fictional operations. Mobile controls.';syncPanels();hud();render();
    renderer.domElement.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||game.mode!=='playing')return;const r=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.x)/r.width*2-1,-(e.clientY-r.y)/r.height*2+1),camera);if(ray.ray.intersectPlane(groundPlane,v3)){const d=Math.hypot(v3.x-game.player.x,v3.z-game.player.z);game.input.aimX=(v3.x-game.player.x)/Math.max(.01,d);game.input.aimZ=(v3.z-game.player.z)/Math.max(.01,d);mouseAim=true;}});
    renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'&&e.button===0&&game.mode==='playing')mouseStrike=true;});window.addEventListener('pointerup',e=>{if(e.pointerType!=='touch')mouseStrike=false;});
    window.render_game_to_text=()=>JSON.stringify({...game.text(),version:'0.14.3',quality:$('quality').value,route:guideRoute.map(p=>({x:p.x,z:p.z})),map:{roads:WORLD.roads.length,footprints:WORLD.buildings.length,landmarks:PLACES},rendering:{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles},avatarModels:4});
    window.advanceTime=ms=>{manual=true;const n=Math.max(1,Math.ceil(ms/16.667));for(let i=0;i<n;i++)step(ms/n/1000);render();$('performance').textContent=`QA STEP · CITY / 0.14 · ${renderer.info.render.calls} draws`;};
    function loop(now){if(!manual){const dt=Math.min(.05,(now-last)/1000||.016);step(dt);render();frames++;if(now-frameStart>1000){fps=frames*1000/(now-frameStart);frames=0;frameStart=now;$('performance').textContent=`${Math.round(fps)} FPS · ${renderer.info.render.calls} draws · ${Math.round(renderer.info.render.triangles/1000)}k tris`;}}last=now;requestAnimationFrame(loop);}
    requestAnimationFrame(loop);
  }catch(e){$('loading').textContent=e.message;$('start').textContent='Reload to retry';$('start').disabled=true;console.error(e);}
}
init();
