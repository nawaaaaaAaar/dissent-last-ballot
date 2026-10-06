import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import {City as Breakout,WORLD,CONTRACTS} from './city-rules.js?v=0.16.2';
import {installMap,PLACES,SCALE,roadRoute,segmentDistance} from './city-data.js?v=0.16.2';
import {human,loadPeople,poseHuman,poseMotion,resetHuman} from './people.js?v=0.16.2';
import {materials as M,box,cylinder,sign,mergeStatic,barricade,observatory,bench,lamp,tent} from './world-props.js';
import {WorldAudio} from './world-audio.js?v=0.16.2';
import {cityArt} from './city-art.js?v=0.16.2';
import {encounterArt} from './encounter-art.js?v=0.16.2';

const $=id=>document.getElementById(id),coarse=matchMedia('(pointer:coarse)').matches||innerWidth<700;
const asset=name=>'./assets/'+name+'?v=0.16.2';
const game=new Breakout(),keys=new Set(),audio=new WorldAudio();
const sticks={move:{x:0,z:0},aim:{x:0,z:-1}},poses=[],effects=[];
let renderer,scene,camera,sun,player,friend,van,enemyCar,gate,block,recorder,recordRing,safeRing,arrow,treeSource,playerRing,friendRing;
let art,encounterView,actionHeld=false,actionHoldOnly=false,carTell;
let wideCamera=false,routeMarks=[],readerModels=[];
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
  const chapter=game.mission?.id==='charter'?'The fictional charter demands constitutional accountability, ending contested SIR, and transparent eligible-voter inclusion. Replacement alone is not repair. This is not news of an actual policy change.':game.mission?.type==='rescue'?'Kabir: “Now the account travels further than the cordon.” You brought both your friend and his account to the network.':game.mission?.type==='rally'?'Anita: “The gathering can speak again.” Both readers reached the assembly together.':'Sana: “Keep it moving.” The copied account reached the next relay.';
  $('ending-copy').textContent=game.mode==='won'?
    `${chapter} ${game.network.credits} support credits are available. Choose another operation or explore.`:
    game.message+' Recovered recording and rescue/boarding checkpoints are retained within this tab, not after reload.';
  $('results').innerHTML=`<span>SCORE<br><b>${Math.round(game.score)}</b></span><span>JOB TIME<br><b>${Math.floor(game.elapsed/60)}:${String(Math.floor(game.elapsed%60)).padStart(2,'0')}</b></span><span>NETWORK<br><b>${game.network.total} jobs</b></span>`;
  $('ending').querySelector('.panel').scrollTop=0;
}
function clearInput(){keys.clear();sticks.move={x:0,z:0};game.input.attack=game.input.interact=false;actionHeld=false;mouseStrike=stickStrike=buttonStrike=aimBrake=brakeHeld=false;}
function start(){clearInput();mouseAim=false;game.start();game.accept('witness');game.say('Kabir is ahead. Move, use short strikes, dodge the red sector. Gold marks the next goal.',4);routeClock=0;step(0);poses.forEach(resetHuman);if(!audio.enabled)toggleAudio();syncPanels();render();}
function help(){helpReturn=game.mode;clearInput();setMode('help');}
function pause(){if(game.mode==='paused')setMode('playing');else if(game.mode==='playing'){clearInput();setMode('paused');}}
function toggleAudio(){
  const on=audio.toggle();$('sound').textContent=on?'Sound on':'Sound off';
  if(on&&!engineTone){engineTone=audio.ctx.createOscillator();engineGain=audio.ctx.createGain();engineTone.type='triangle';engineTone.frequency.value=55;engineGain.gain.value=0;engineTone.connect(engineGain).connect(audio.ctx.destination);engineTone.start();}
  if(engineGain&&!on)engineGain.gain.value=0;
}
function button(id,callback){$(id).addEventListener('click',callback);}
button('start',start);button('tutorial',help);button('pause-help',help);button('help-close',()=>setMode(helpReturn)); 
button('pause',pause);button('resume',pause);button('restart',()=>{game.abandon();board();});button('again',()=>{if(game.mode==='caught')game.abandon();else game.continue();board();});button('sound',toggleAudio);
button('view',()=>{wideCamera=!wideCamera;$('view').textContent=wideCamera?'Close view':'Overview';resize();render();});
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
button('action',()=>{if(!actionHoldOnly)game.interact();actionHoldOnly=false;syncPanels();});
$('action').addEventListener('pointerdown',()=>{actionHeld=true;actionHoldOnly=['copy','aid'].includes(game.nearby()?.id);});
for(const event of ['pointerup','pointercancel','pointerleave'])$('action').addEventListener(event,()=>actionHeld=false);
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
  if(e.code==='KeyE')game.interact();if(e.code==='KeyQ')game.dash();if(e.code==='Space'&&!game.van.occupied){mouseAim=false;aimNearest();game.attack();}
  if(e.code==='Escape'||e.code==='KeyP')pause();
  if(e.code==='KeyM')board();
});
document.addEventListener('keyup',e=>{keys.delete(e.code);if(e.code==='KeyZ')$('view').click();});
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
  g.scale.setScalar(.88);
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
  M.road=new THREE.MeshStandardMaterial({map:road,normalMap:normal,roughnessMap:rough,color:'#8d8a83',normalScale:new THREE.Vector2(.2,.2),roughness:.94});
  M.cream.map=wall;M.red.map=wall;M.cream.roughness=.9;
}
function build(){
  const paving=new THREE.MeshStandardMaterial({map:M.cream.map,color:'#a3a393',roughness:.95});
  ground(paving,5,15,300,420,0);
  const stat=new THREE.Group();
  let positions=[],uvs=[];const caps=new Set(),walkPositions=[],walkUvs=[],roadPositions=positions,roadUvs=uvs;
  for(const s of WORLD.segments){
    positions=s.walkOnly?walkPositions:roadPositions;uvs=s.walkOnly?walkUvs:roadUvs;
    const dx=s.b.x-s.a.x,dz=s.b.z-s.a.z,d=Math.hypot(dx,dz),nx=-dz/d*s.width/2,nz=dx/d*s.width/2;
    const corners=[[s.a.x+nx,s.a.z+nz],[s.a.x-nx,s.a.z-nz],[s.b.x-nx,s.b.z-nz],[s.b.x+nx,s.b.z+nz]];
    for(const i of [0,2,1,0,3,2]){const[x,z]=corners[i];positions.push(x,.025,z);uvs.push(x/4,z/4);}
    // Rounded joins close the triangular holes between bent street segments.
    if(!s.walkOnly)for(const p of[s.a,s.b]){
      const key=p.x+','+p.z;if(caps.has(key))continue;caps.add(key);
      for(let j=0;j<8;j++){
        const a=j*Math.PI/4,b=(j+1)*Math.PI/4,r=s.width/2;
        for(const q of[[p.x,p.z],[p.x+Math.cos(b)*r,p.z+Math.sin(b)*r],[p.x+Math.cos(a)*r,p.z+Math.sin(a)*r]]){positions.push(q[0],.025,q[1]);uvs.push(q[0]/4,q[1]/4);}
      }
    }
  }
  const pathMaterial=new THREE.MeshStandardMaterial({map:M.cream.map,color:'#c7b999',roughness:.96});
  for(const [p,u,material] of [[roadPositions,roadUvs,M.road],[walkPositions,walkUvs,pathMaterial]]){
    const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(p,3));rg.setAttribute('uv',new THREE.Float32BufferAttribute(u,2));rg.computeVertexNormals();
    const mesh=new THREE.Mesh(rg,material);mesh.receiveShadow=true;scene.add(mesh);
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
  if(treeSource){
    const planted=[];
    for(const s of WORLD.segments){
      if(s.walkOnly||Math.hypot(s.a.x-s.b.x,s.a.z-s.b.z)<12)continue;
      const dx=s.b.x-s.a.x,dz=s.b.z-s.a.z,d=Math.hypot(dx,dz);
      for(const side of [-1,1]){
        const p={x:(s.a.x+s.b.x)/2-dz/d*side*5,z:(s.a.z+s.b.z)/2+dx/d*side*5};
        if(p.x<-120||p.x>134||p.z<-170||p.z>203||!game.valid(p.x,p.z,1)||planted.some(q=>Math.hypot(q.x-p.x,q.z-p.z)<12)||WORLD.segments.some(q=>segmentDistance(p,q.a,q.b)<2.5))continue;
        planted.push(p);
      }
      if(planted.length>=100)break;
    }
    const treeChunks=new Map();
    for(const p of planted){const key=Math.floor(p.x/32)+','+Math.floor(p.z/32);if(!treeChunks.has(key))treeChunks.set(key,[]);treeChunks.get(key).push(p);}
    treeSource.updateMatrixWorld(true);
    treeSource.traverse(source=>{
      if(!source.isMesh)return;
      for(const trees of treeChunks.values()){
        const grove=new THREE.InstancedMesh(source.geometry,source.material,trees.length),matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion(),scale=new THREE.Vector3();
        trees.forEach((p,i)=>{rotation.setFromAxisAngle(new THREE.Vector3(0,1,0),i*2.399);scale.setScalar(1.4+(i%4)*.12);matrix.compose(new THREE.Vector3(p.x,0,p.z),rotation,scale).multiply(source.matrixWorld);grove.setMatrixAt(i,matrix);});
        grove.computeBoundingSphere();grove.castShadow=grove.receiveShadow=true;scene.add(grove);
      }
    });
  }
  gate=new THREE.Group();for(const x of [-3.3,0,3.3]){const b=barricade();b.position.x=x;gate.add(b);}gate.position.set(0,0,17);scene.add(gate);
  block=new THREE.Group();for(const x of [-3.3,0,3.3]){const b=barricade();b.position.x=x;block.add(b);}block.position.set(-34,0,-17);scene.add(block);
  van=vehicle();scene.add(van.g);enemyCar=vehicle(true);scene.add(enemyCar.g);
  carTell=new THREE.Mesh(new THREE.CircleGeometry(11,24,-.22,.44),new THREE.MeshBasicMaterial({color:'#ed7758',transparent:true,opacity:.28,depthWrite:false,side:THREE.DoubleSide}));scene.add(carTell);
  player=human('#628978',false,{localWardrobe:false});friend=human('#a89775',false,{localWardrobe:true});scene.add(player.group,friend.group);poses.push(player,friend);
  playerRing=ring('#91d4ba',.55,0,0);friendRing=ring('#dfb279',.5,0,0);
  for(let i=0;i<2;i++){const p=human('#b8875f',false,{female:i===0,localWardrobe:true});scene.add(p.group);readerModels.push(p);}
  for(let i=0;i<12;i++){const m=new THREE.Mesh(new THREE.ConeGeometry(.19,.5,3),new THREE.MeshBasicMaterial({color:'#efce88',depthTest:false}));m.rotation.x=Math.PI/2;scene.add(m);routeMarks.push(m);}
  for(const e of game.enemies){
    const p=human('#998669',true,{bag:false,skin:'#9a6f51',detail:false});scene.add(p.group);
    p.shield=box(p.group,M.metal,0,.95,-.42,.65,1,.08);
    const ring=new THREE.Mesh(new THREE.RingGeometry(.85,1.08,24),new THREE.MeshBasicMaterial({color:'#ec6d4c',transparent:true,opacity:.7,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.035;p.group.add(ring);
    const bars=new THREE.Group(),segments=[];
    for(let i=0;i<4;i++){const sprite=new THREE.Sprite(new THREE.SpriteMaterial({color:'#dfb279',depthTest:false}));sprite.scale.set(.28,.10,1);sprite.position.x=(i-1.5)*.32;bars.add(sprite);segments.push(sprite);}
    const tell=new THREE.Mesh(new THREE.CircleGeometry(1,20,-.95,1.9),new THREE.MeshBasicMaterial({color:'#eb7658',transparent:true,opacity:.25,depthWrite:false,side:THREE.DoubleSide}));tell.rotation.x=-Math.PI/2;scene.add(tell);
    scene.add(bars);enemyModels.push({p,ring,bars,segments,tell});
  }
  for(let i=0;i<20;i++){const anchor=i<10?{x:jm.x-17,z:jm.z+4}:PLACES[1+Math.floor((i-10)/5)%2],p=human(['#a7ad8c','#8f7660','#739186'][i%3],false,{female:i%2===0,localWardrobe:i%3!==0});p.group.position.set(anchor.x+(i%5)*1.7,0,anchor.z+Math.floor(i%10/5)*2);p.group.rotation.y=Math.PI;p.anchor=p.group.position.clone();scene.add(p.group);crowd.push(p);poses.push(p);if(i<10&&i%3===0){box(p.group,M.wood,.4,1.7,0,.035,1.3,.035);sign(p.group,'EVERY VOTER',.4,2.3,.05,1.4,.6,'#eedab3','#334939');}}
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
function viewSpan(){return wideCamera?36:game.van.occupied?(coarse?26:25):21;}
function resize(){const w=innerWidth,h=innerHeight,span=viewSpan();renderer?.setSize(w,h);if(camera){camera.left=-span*w/h/2;camera.right=span*w/h/2;camera.top=span/2;camera.bottom=-span/2;camera.userData.span=span;camera.updateProjectionMatrix();}}
window.addEventListener('resize',()=>{resize();render();});
function pose(p,e,dt,drive=0){
  const speed=p.lastPosition&&dt>0?Math.min(15,Math.hypot(e.x-p.lastPosition.x,e.z-p.lastPosition.z)/dt):drive;
  p.lastPosition={x:e.x,z:e.z};p.poseTimeDivisor=7.5;p.group.position.set(e.x,e.height||0,e.z);p.group.rotation.y=(e.yaw||0)+Math.PI;p.worldSpeed=speed;
  poseHuman(p,game.time*7.5,speed>3?1:speed>.1?.6:0);
  if(e.traversal)poseMotion(p,e.traversal.kind,e.traversal.time/e.traversal.duration);
  else if(e.swing)poseMotion(p,e.swing.clip,e.swing.time/e.swing.duration);
  else if(e.strikeDuration>0)poseMotion(p,'EnemyStrike',e.strikeTime/e.strikeDuration);
  else if(e.windup>0||e.state==='brace'||e.state==='shelter'||e.state==='hold')poseMotion(p,'Brace',.5);
  else if(e.stun>0||e.hurt>.85)poseMotion(p,'Hurt',e.stun>0?Math.max(0,1-e.stun/1.1):Math.max(0,1-(e.hurt-.85)/.35));
  else if(e.dash>0)poseMotion(p,'Dodge',1-e.dash/.27);
  else if(e.recovery>0)poseMotion(p,'EnemyStrike',.9);
}
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
  const next=guideRoute.find(q=>Math.hypot(q.x-p.x,q.z-p.z)>1)||t;
  $('direction').style.transform=`rotate(${Math.atan2(next.x-p.x,-(next.z-p.z))}rad)`;
  $('health').textContent='HEALTH '+Array.from({length:6},(_,i)=>i<p.health?'●':'○').join('');
  $('stamina').style.width=p.stamina+'%';$('vehicle-status').textContent=game.van.occupied?`VAN ${Math.round(game.van.health)}% · ${Math.round(game.van.speed*3)} GAME km/h`:'ON FOOT · '+(game.friend.rescued?'KABIR WITH YOU':game.mission?.type==='rescue'?'FIND KABIR':game.mission?.type==='rally'?'STAND TOGETHER':game.record?'DISPATCH SECURED':'EXPLORE');
  $('phase').textContent=game.phase.toUpperCase();$('heat-note').textContent=game.car.windup>0?'RAM WARNING · turn out of its path':game.seen?'They can see you':game.heat<.7?'Route to safety is clear':`Out of sight · ${game.hidden.toFixed(0)} seconds`;
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
    game.input.interact=keys.has('KeyE')||actionHeld;
    if(game.input.attack&&!mouseAim&&!stickStrike)aimNearest();
    if(!mouseAim&&!game.input.attack&&Math.hypot(game.input.x,game.input.z)>.1){game.input.aimX=game.input.x;game.input.aimZ=game.input.z;}
    game.input.brake=game.van.occupied&&(keys.has('Space')||brakeHeld||aimBrake);
    const contact=game.player.contactSerial||0;
    game.update(dt);if(!game.van.occupied)audio.footstep((game.player.speed||0)*dt);if(health>game.player.health)audio.tone(90,.12);if(contact<(game.player.contactSerial||0))audio.tone(game.player.contactHit?160:280,.07);
    if(before!==game.mode&&['won','caught'].includes(game.mode)){finish();audio.tone(game.mode==='won'?590:100,.5);}
  }
  clock+=dt;
  audio.update(game.heat,game.mode);
  if(player){
    const moving=Math.hypot(game.input.x,game.input.z)>.1&&game.mode==='playing';
    player.group.visible=!game.van.occupied;pose(player,game.player,dt,game.mode==='playing'?game.player.speed||0:0);
    art?.hero.set(game.player.x,game.player.z);
    player.group.rotation.z=0;encounterView?.update(game);
    friend.group.visible=game.mission?.type==='rescue'&&!game.friend.aboard;pose(friend,game.friend,dt,game.friend.rescued&&Math.hypot(game.friend.x-game.player.x,game.friend.z-game.player.z)>2?4.5:0);
    playerRing.visible=!game.van.occupied;playerRing.position.set(game.player.x,.045,game.player.z);
    friendRing.visible=friend.group.visible;friendRing.position.set(game.friend.x,.045,game.friend.z);
    for(let i=0;i<game.enemies.length;i++){
      const e=game.enemies[i],m=enemyModels[i];m.p.group.visible=!!game.mission&&e.active&&Math.hypot(e.x-game.player.x,e.z-game.player.z)<38;
      if(m.p.group.visible){pose(m.p,e,dt,0);m.p.shield.visible=e.role==='guard';m.p.group.rotation.z=e.hp<=0?Math.PI/2:0;m.p.group.position.y=e.hp<=0?.15:0;}
      m.ring.visible=e.hp>0&&(e.windup>0||e.recovery>0);m.ring.scale.setScalar(e.recovery>0?1:e.role==='rush'?2:1+(1-e.windup/Math.max(.01,e.windupTotal||1))*.8);m.ring.material.color.set(e.recovery>0?'#91d4ba':e.role==='guard'?'#e0b96c':'#ed745b');m.bars.visible=e.hp>0&&Math.hypot(e.x-game.player.x,e.z-game.player.z)<10;m.bars.position.set(e.x,2.3,e.z);
      m.tell.visible=m.p.group.visible&&(e.windup>0||e.strikeDuration>0);m.tell.position.set(e.x,.05,e.z);m.tell.rotation.set(-Math.PI/2,0,e.attackYaw-Math.PI/2);m.tell.scale.setScalar(e.role==='rush'?4.2:e.role==='guard'?3:2.7);m.tell.material.opacity=e.strikeDuration>0?.55:.12+.35*(1-e.windup/Math.max(.01,e.windupTotal||1));
      m.segments.forEach((s,j)=>s.material.color.set(j<e.hp?(e.stun>0?'#a5e7ce':'#dfb279'):'#443e33'));
    }
    crowdClock+=dt;if(crowdClock>.22){crowdClock=0;crowd.forEach((p,i)=>{p.group.visible=Math.hypot(p.group.position.x-game.player.x,p.group.position.z-game.player.z)<34;if(p.group.visible){const x=p.anchor.x+Math.sin(game.time*.18+i)*1.2;if(i>=10&&game.valid(x,p.anchor.z)){p.group.position.x=x;p.worldSpeed=.2;poseHuman(p,game.time*.75+i,.3);}else poseHuman(p,game.time*.75+i,0);}});}
    readerModels.forEach((p,i)=>{const r=game.readers[i];p.group.visible=!!r&&game.mission?.type==='rally';if(p.group.visible)pose(p,r,dt,Math.hypot(r.x-game.player.x,r.z-game.player.z)>2.1?5.1:0);});
    gate.rotation.x=game.gate.fall*Math.PI/2;gate.scale.x=game.gate.w/10;gate.position.set(game.gate.x,0,game.gate.z);gate.visible=!!game.mission&&(game.gate.hp>0||game.gate.fall<1);block.visible=game.roadblock;block.position.set(game.block.x,0,game.block.z);
    for(const [model,e] of [[van,game.van],[enemyCar,game.car]]){model.g.position.set(e.x,0,e.z);model.g.rotation.y=e.yaw+Math.PI;model.wheels.forEach(w=>w.rotation.y+=e.speed*dt/.43);}
    enemyCar.g.visible=game.car.active;recorder.visible=recordRing.visible=game.mission?.type==='courier'&&!game.record;
    carTell.visible=game.car.active&&(game.car.windup>0||game.car.ram>0);carTell.position.set(game.car.x,.07,game.car.z);carTell.rotation.set(-Math.PI/2,0,game.car.attackYaw-Math.PI/2);carTell.material.opacity=game.car.ram>0?.5:.12+.25*(1-game.car.windup/.85);
    recorder.position.set(WORLD.record.x,0,WORLD.record.z);recordRing.position.set(WORLD.record.x,.04,WORLD.record.z);
    const zone=game.mission?.type==='rally'?game.target():WORLD.safe;
    safeRing.position.set(zone.x,.04,zone.z);safeRing.scale.setScalar(1);safeRing.visible=!!game.mission&&(game.record||game.mission.type==='rally');
    medModels.forEach((m,i)=>m.visible=!game.supplies[i].taken);
    const t=game.target();arrow.position.set(t.x,3+.15*Math.sin(clock*3),t.z);arrow.visible=game.mode==='playing';
    safeRing.material.opacity=.5+.25*Math.sin(clock*2);
    for(let j=0;j<particleMeshes.length;j++){const q=game.particles[j],m=particleMeshes[j];m.visible=!!q;if(q){m.position.set(q.x,Math.max(.06,q.y),q.z);m.material.color.set(q.color==='teal'?'#91cab3':q.color==='red'?'#dd7655':'#e2b578');}}
  }
  routeClock-=dt;if(routeClock<=0){guideRoute=roadRoute(game.player,game.target(),{vehicle:game.van.occupied});routeClock=1.5;}
  while(guideRoute.length>1&&Math.hypot(guideRoute[0].x-game.player.x,guideRoute[0].z-game.player.z)<1)guideRoute.shift();
  routeMarks.forEach((m,i)=>{const nearby=guideRoute.filter(q=>Math.hypot(q.x-game.player.x,q.z-game.player.z)<24&&Math.hypot(q.x-game.player.x,q.z-game.player.z)>2),q=nearby[i],next=nearby[i+1]||game.target();m.visible=game.mode==='playing'&&!!q;if(q){m.position.set(q.x,.1,q.z);m.rotation.z=-Math.atan2(next.x-q.x,next.z-q.z);}});
  if(engineGain){engineGain.gain.setTargetAtTime(audio.enabled&&game.van.occupied&&game.mode==='playing'?.014:0,audio.ctx.currentTime,.1);engineTone.frequency.setTargetAtTime(45+game.van.speed*4,audio.ctx.currentTime,.1);}
}
function render(){
  if(!player)return;
  if(camera.userData.span!==viewSpan()){const span=viewSpan(),ratio=innerWidth/innerHeight;camera.left=-span*ratio/2;camera.right=span*ratio/2;camera.top=span/2;camera.bottom=-span/2;camera.userData.span=span;camera.updateProjectionMatrix();}
  const p=game.player,closeFoot=!wideCamera&&!game.van.occupied,look=new THREE.Vector3(p.x,.5,p.z-3),eye=new THREE.Vector3(p.x,wideCamera?40:closeFoot?24:32,p.z+(closeFoot?18:22));
  if(game.mode==='menu'){camera.position.set(game.player.x+20,36,game.player.z+30);camera.lookAt(game.player.x,0,game.player.z);}
  else{camera.position.copy(eye);camera.lookAt(look);}
  sun.position.set(p.x-20,55,p.z+15);sun.target.position.set(p.x,0,p.z);sun.target.updateMatrixWorld();
  hud();renderer.info.reset();renderer.render(scene,camera);
}
async function init(){
  try{
    renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.domElement.className='game';renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;$('viewport').appendChild(renderer.domElement);
    scene=new THREE.Scene();scene.background=new THREE.Color('#c6b9a2');scene.fog=new THREE.Fog('#c6b9a2',90,160);camera=new THREE.OrthographicCamera(-20,20,16,-16,.1,180);
    sun=new THREE.DirectionalLight('#ffe3b9',2.6);sun.position.set(-20,55,15);sun.castShadow=true;Object.assign(sun.shadow.camera,{left:-28,right:28,top:28,bottom:-28,near:1,far:100});sun.shadow.bias=-.0003;scene.add(sun,sun.target);scene.add(new THREE.HemisphereLight('#bcd4db','#4e4a32',1.4));
    $('loading').textContent='Loading licensed characters and scanned street materials…';
    const r=await Promise.allSettled([loadPeople(asset),textures(),new GLTFLoader().loadAsync(asset('tree-review.glb')),new RGBELoader().loadAsync(asset('delhi-sky.hdr'))]);
    if(r[0].status!=='fulfilled'||r[1].status!=='fulfilled')throw new Error('Character or surface assets failed to load. Please reload.');
    if(r[2].status==='fulfilled')treeSource=r[2].value.scene;
    if(r[3].status==='fulfilled'){r[3].value.mapping=THREE.EquirectangularReflectionMapping;const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(r[3].value).texture;scene.environmentIntensity=.35;pmrem.dispose();}
    const response=await fetch('./delhi-map.json?v=0.16.2');if(!response.ok)throw new Error('Delhi map failed to load. Reload to retry.');
    installMap(await response.json());game.reset();build();art=await cityArt(scene,WORLD,PLACES);encounterView=encounterArt(scene);step(0);quality();const preference=new URLSearchParams(location.search).get('quality');if(['high','low'].includes(preference)){$('quality').value=preference;quality();}
    $('start').disabled=false;$('start').textContent='PLAY · City of accounts';$('loading').textContent='Real central-Delhi street geometry. Fictional operations. Mobile controls.';syncPanels();hud();render();
    renderer.domElement.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||game.mode!=='playing')return;const r=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.x)/r.width*2-1,-(e.clientY-r.y)/r.height*2+1),camera);if(ray.ray.intersectPlane(groundPlane,v3)){const d=Math.hypot(v3.x-game.player.x,v3.z-game.player.z);game.input.aimX=(v3.x-game.player.x)/Math.max(.01,d);game.input.aimZ=(v3.z-game.player.z)/Math.max(.01,d);mouseAim=true;}});
    renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'&&e.button===0&&game.mode==='playing')mouseStrike=true;});window.addEventListener('pointerup',e=>{if(e.pointerType!=='touch')mouseStrike=false;});
    window.render_game_to_text=()=>JSON.stringify({...game.text(),version:'0.16.2',quality:$('quality').value,route:guideRoute.map(p=>({x:p.x,z:p.z})),map:{roads:WORLD.roads.length,footprints:WORLD.sourceFootprints,displayParts:WORLD.buildings.length,landmarks:PLACES},rendering:{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles},avatarModels:5});
    window.advanceTime=ms=>{manual=true;const n=Math.max(1,Math.ceil(ms/16.667));for(let i=0;i<n;i++)step(ms/n/1000);render();$('performance').textContent=`QA STEP · CITY / 0.14 · ${renderer.info.render.calls} draws`;};
    function loop(now){if(!manual){const dt=Math.min(.05,(now-last)/1000||.016);step(dt);render();frames++;if(now-frameStart>1000){fps=frames*1000/(now-frameStart);frames=0;frameStart=now;$('performance').textContent=`${Math.round(fps)} FPS · ${renderer.info.render.calls} draws · ${Math.round(renderer.info.render.triangles/1000)}k tris`;}}last=now;requestAnimationFrame(loop);}
    requestAnimationFrame(loop);
  }catch(e){$('loading').textContent=e.message;$('start').textContent='Reload to retry';$('start').disabled=true;console.error(e);}
}
init();
