import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import {human,loadPeople,poseHuman,resetHuman} from './people.js?v=0.11.1';
import {STORY,ITEMS} from './story.js?v=0.11.1';
import {WorldAudio} from './world-audio.js?v=0.11.1';
import {materials as M,box,cylinder,label,sign,mergeStatic,barricade,bus,observatory,ramaYantra,bench,lamp,tent} from './world-props.js';
import {EffectComposer,RenderPass,SSAOPass,OutputPass} from './effects.js';
import {ActionGame} from './action-game.js?v=0.11.1';
import {DISTRICTS,campaign,buildDistrict} from './districts.js?v=0.11.1';
import {route} from './navigation.js?v=0.11.1';
import {CASES,CHOICES,DEMANDS,movement} from './electoral-story.js?v=0.11.1';
import {StreetPlay} from './street-play.js?v=0.11.1';
import {wantsSprint,SPRINT_RULES} from './sprint-controller.js?v=0.11.1';

const $=id=>document.getElementById(id),coarse=matchMedia('(pointer:coarse)').matches||innerWidth<700;
const asset=n=>(window.origin==='null'?'https://raw.githubusercontent.com/nawaaaaaAaar/dissent-last-ballot/main/docs/assets/':'./assets/')+n+'?v=0.11.1';
const s={mode:'loading',x:0,z:31,y:0,vy:0,yaw:0,pitch:.35,time:0,move:0,sprint:false,
  tasks:{organiser:false,aid:false,witness:false,barrier:false,assembly:false},solidarity:0,pressure:0,
  quality:coarse?'low':'high',sound:false,near:null,dialog:null,checkpoint:null,capture:0,reduced:false};
Object.assign(s,{items:[],inventory:{water:0,recorder:false},choice:'public',companion:false,protestDone:false,assist:true,rallyTime:0,rallyHits:0,notes:[]});
const audio=new WorldAudio();
const SAVE_KEY='dissent-world-v06';
function savedGame(){
  try{const v=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');return v?.version===6&&v.tasks&&Array.isArray(v.items)?v:null;}catch{return null;}
}
function saveProgress(){
  try{
    if(s.tasks.assembly){localStorage.removeItem(SAVE_KEY);$('continue').hidden=true;return;}
    localStorage.setItem(SAVE_KEY,JSON.stringify({version:6,tasks:s.tasks,items:s.items,choice:s.choice,companion:s.companion,protestDone:s.protestDone,solidarity:s.solidarity,checkpoint:s.checkpoint||{x:s.x,z:s.z}}));
  }catch{/* Private/opaque browsers may disable storage. The chapter still works. */}
}
function continueGame(){
  const saved=savedGame();if(!saved)return;
  begin();
  for(const id of Object.keys(s.tasks))s.tasks[id]=saved.tasks[id]===true;
  s.items=saved.items.filter(id=>ITEMS.some(i=>i.id===id));
  s.inventory.water=s.items.filter(id=>id.startsWith('water')).length;s.inventory.recorder=s.items.includes('recorder');
  s.notes=ITEMS.filter(i=>i.type==='note'&&s.items.includes(i.id));
  s.choice=saved.choice==='archive'?'archive':'public';s.companion=!!saved.companion;s.protestDone=!!saved.protestDone;
  s.solidarity=Math.min(12,Math.max(0,Number(saved.solidarity)||0));
  const c=saved.checkpoint;if(c&&Number.isFinite(c.x)&&Number.isFinite(c.z)&&valid(c.x,c.z)){s.x=c.x;s.z=c.z;s.checkpoint={x:c.x,z:c.z};}
  s.pressure=s.tasks.barrier?1:0;
  events.filter(e=>e.item).forEach(e=>e.prop.visible=!s.items.includes(e.id));
  if(s.companion)events.find(e=>e.id==='companion').a.p.group.position.set(s.x-.7,0,s.z+1);
  hud();nearest();saveProgress();toast('Your last story checkpoint is restored. Progress stays on this browser.');
}
const keys=new Set(),joy={x:0,y:0},actors=[],police=[],trees=[],flags=[],colliders=[],events=[];
const zoneData=new Map(),collections={actors,police,trees,flags,colliders,events};
let district='jantar',mapReturn='menu',journalReturn='playing',reviewReturn='playing',street,lesson=false,lessonStage=0,guideReturn='menu';
let renderer,scene,camera,player,composer,ssao,sun,treeSource,barriers=[],clock,manual=false,last=0,anim=0,fps=0,frames=0,frameStart=performance.now(),toastTime=0,cameraDrag=null,ambient,action;
const rng=seed=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;},rand=rng(5108);
const objectives=[
  ['organiser','Meet the organiser at the gathering'],
  ['aid','Help at the first-aid table'],
  ['witness',"Protect the journalist's account"],
  ['barrier','Confront the barricade'],
  ['assembly','Bring the account to the assembly']
];
function toast(text,time=4){$('toast').textContent=text;toastTime=time;$('toast').classList.add('show');}
const LESSONS=[
  ['Move two metres', 'Use WASD / arrows, or the left thumbstick. Drag the world to look around.'],
  ['Sprint', 'Hold Shift, or push the phone stick to its outer edge. Sprint uses the stamina bar.'],
  ['Jump', 'Press Space or tap Jump. Use it before a low crate; walking into a crate will stop you.'],
  ['Dodge', 'Press Q or tap Dodge. Without a direction it dashes forward; red warnings tell you when to move.'],
  ['Rally', 'Press F or tap Rally. It costs 30 energy and has a six-second cooldown. Supplies refill energy.'],
  ['Collect your first packet', 'Walk to the gold-ringed packet at the right side of the road ahead. No Action press is needed.'],
  ['Help Mira', 'Return to Mira by the gold ring near the starting area. Stay close and hold E / Action for one second.']
];
function guide(){keys.clear();joy.x=joy.y=0;action.holding=false;guideReturn=s.mode;mode('guide');}
function startLesson(){
  begin(true,'jantar');lesson=true;lessonStage=0;s.pressure=0;action.hurt=1;
  $('sprint').classList.remove('active');$('lesson-result').textContent='No pursuit during practice. Repeat the lesson at any time.';
  $('lesson-tip').hidden=false;updateLesson();
}
function updateLesson(){
  const done=[Math.hypot(s.x,s.z-31)>2,s.sprint&&s.move>0,s.y>.2,action.cooldown>0,street.pulses>0,street.collected.length>0,action.rescued.includes('organiser')];
  if(done[lessonStage])lessonStage++;
  if(lessonStage>=LESSONS.length){lesson=false;action.active=false;action.finish=true;$('lesson-result').textContent='Practice complete. You moved, sprinted, jumped, dodged, rallied, collected a packet and helped Mira. Start a fresh campaign below.';guideReturn='menu';mode('guide');return;}
  $('lesson-title').textContent=`PRACTICE ${lessonStage+1}/7 · ${LESSONS[lessonStage][0]}`;
  $('lesson-copy').textContent=LESSONS[lessonStage][1];
}
function mode(m){
  s.mode=m;$('menu').hidden=m!=='menu';$('hud').hidden=['loading','menu','error'].includes(m);
  if(m==='menu')$('continue').hidden=!savedGame();
  if(m==='menu')$('start').textContent=action?.active&&!action.finish?'RESUME · '+DISTRICTS[district].chapter:campaign.count()?'PLAY · Continue campaign':'PLAY · Start the campaign';
  $('dialog').hidden=m!=='dialog';$('pause-screen').hidden=m!=='paused';$('ending').hidden=m!=='won'&&m!=='caught';
  $('controls').hidden=m!=='playing';$('pause').hidden=!['playing','dialog','paused','rally','journal'].includes(m);
  $('pause').textContent=m==='paused'?'Resume':'Pause';$('interact').hidden=m!=='playing'||!s.near;
  $('retry').hidden=m!=='caught';
  $('next-district').hidden=m!=='won'||!action?.active;
  $('reopen-charter').hidden=m!=='won'||!action?.active||campaign.count()!==3;
  $('journal').hidden=!['playing','journal','menu'].includes(m)||(m==='journal'&&action?.active);
  $('journal').disabled=['loading','error'].includes(m);$('city-map-start').disabled=['loading','error'].includes(m);
  $('journal').textContent=action?.active||m==='menu'?'City map':'Journal';
  $('rally-screen').hidden=m!=='rally';$('journal-screen').hidden=m!=='journal';
  $('city-screen').hidden=m!=='citymap';
  $('review-screen').hidden=m!=='review';$('charter-screen').hidden=m!=='charter';
  $('action-hud').hidden=!action?.active||['menu','loading','error','won','caught'].includes(m);
  $('evade').hidden=!action?.active;
  $('rally-power').hidden=!action?.active;$('street-hud').hidden=!action?.active||m!=='playing';
  $('pickup-pop').hidden=m!=='playing'||!street?.popTime;
  $('guide-screen').hidden=m!=='guide';
  $('lesson-tip').hidden=!lesson||m!=='playing';
  document.body.classList.toggle('playing',m!=='menu'&&m!=='loading');
  document.body.classList.toggle('action-play',!!action?.active);
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
  const slab=document.createElement('canvas');slab.width=slab.height=512;
  const c=slab.getContext('2d');c.fillStyle='#555854';c.fillRect(0,0,512,512);
  for(let row=0;row<4;row++)for(let col=-1;col<3;col++){
    const x=col*256+(row%2)*128,y=row*128,v=148+((row*13+col*7+21)%17);
    c.fillStyle=`rgb(${v},${v+2},${v})`;c.fillRect(x+2,y+2,252,124);
    c.strokeStyle='rgba(238,238,223,.24)';c.strokeRect(x+3,y+3,249,121);
  }
  const data=c.getImageData(0,0,512,512);
  for(let i=0;i<data.data.length;i+=4){const n=(rand()-.5)*12;for(let j=0;j<3;j++)data.data[i+j]+=n;}
  c.putImageData(data,0,0);const paving=new THREE.CanvasTexture(slab);paving.colorSpace=THREE.SRGBColorSpace;paving.wrapS=paving.wrapT=THREE.RepeatWrapping;paving.anisotropy=4;
  M.paving=new THREE.MeshStandardMaterial({map:paving,normalMap:wallN,roughness:.98,color:'#dbdcd5',normalScale:new THREE.Vector2(.1,.1)});
  M.grass=new THREE.MeshStandardMaterial({map:grass,normalMap:grassN,color:'#a1b184',roughness:1,normalScale:new THREE.Vector2(.25,.25)});
}
function ground(mat,x,z,w,d,y=0){
  const geo=new THREE.PlaneGeometry(w,d);const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/3,uv.getY(i)*d/3);
  const mesh=new THREE.Mesh(geo,mat);mesh.rotation.x=-Math.PI/2;mesh.position.set(x,y,z);mesh.receiveShadow=true;scene.add(mesh);return mesh;
}
function buildWorld(){
  ground(M.sand,0,0,180,180,-.08);
  ground(M.road,0,-7,20,96,.01);ground(M.paving,-19,5,18,36,.15);
  ground(M.paving,-10.2,-7,1.5,96,.16);ground(M.paving,10.2,-7,1.5,96,.16);
  ground(M.sand,29,-12,36,110,-.03);
  ground(M.grass,31,-12,31,104,0);
  const stat=new THREE.Group();
  for(let z=-54;z<41;z+=2.2){
    if(z>-18&&z<-11)continue;
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
  tent(stat,-23,3);sign(stat,'VOTER HELP',-23,2.62,5.28,3.5,.65,'#d3c6ab','#744637','CONSENTED FICTIONAL CASES');
  tent(stat,-24,-7);sign(stat,'PUBLIC RECORD',-24,2.62,-4.72,3.5,.65,'#d3c6ab','#744637','KEEP THE ACCOUNT INTACT');
  const arch=observatory();arch.position.set(32,0,-17);arch.rotation.y=.08;stat.add(arch);
  colliders.push({x:32,z:-17,w:24,d:30,h:16,name:'observatory instrument'});
  for(let z of [13,31]){const r=ramaYantra();r.position.set(37,0,z);stat.add(r);}
  for(let z of [13,31])colliders.push({x:37,z,w:10.8,d:10.8,h:5.5,name:'observatory instrument'});
  for(let x=17;x<44;x+=3){box(stat,M.sand,x,.08,-35,2.7,.16,1.6);box(stat,M.cream,x,.15,-35,.4,.30,.5);}
  const roadSign=sign(stat,'JANTAR MANTAR ROAD',7,3.15,21,4.1,1,'#244c42','#ede4cd','NEW DELHI • GAME GEOGRAPHY');
  for(let x of [5.1,8.9])cylinder(stat,M.metal,x,1.7,21,.05,3.4);
  sign(stat,'NO SILENCE. NO ERASURE.',-18,2.1,-11.2,6.2,1.35,'#b66244','#f4e7cb','OUR VOICES REMAIN');
  for(let x of [-21,-15])cylinder(stat,M.wood,x,1.3,-11.2,.035,2.6);
  scene.add(mergeStatic(stat));
  const backdrop=new THREE.Group();box(backdrop,M.cream,0,6,-62,36,12,8);
  for(let x=-15;x<=15;x+=3)for(let y of [2.5,5.5,8.5])box(backdrop,M.dark,x,y,-57.95,1.4,1.9,.07);
  scene.add(mergeStatic(backdrop));
  const b=bus();b.position.set(7.7,0,-25);scene.add(b);colliders.push({x:7.7,z:-25,w:3.2,d:9.2,h:2.8,name:'transport bus'});
  for(let x=-7.9;x<9;x+=3.15){const g=barricade();g.position.set(x,0,-33);scene.add(g);barriers.push(g);}
  for(let x of [-7,6]){const g=barricade();g.position.set(x,0,36);scene.add(g);}
  for(const [x,z] of [[-1,-8],[-8,-19]]){
    const g=barricade();g.position.set(x,.12,z);g.rotation.x=Math.PI/2;scene.add(g);
    colliders.push({x,z,w:3.15,d:.8,h:.4,name:'fallen barricade'});
  }
  const supplies=new THREE.Group();
  for(let i=0;i<7;i++){
    const x=-24.1+i*.35;
    cylinder(supplies,M.glass,x,1.15,3,.075,.36);
    cylinder(supplies,M.white,x,1.34,3,.042,.03);
    cylinder(supplies,M.white,x,1.12,3,.077,.08);
  }
  box(supplies,M.white,-22.4,1.12,3,.52,.34,.35);
  box(supplies,M.leaf,-22.4,1.13,3.18,.08,.22,.012);
  box(supplies,M.leaf,-22.4,1.13,3.19,.22,.08,.012);
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
function addActor(x,z,color,pol=false,options={}){
  const p=human(color,pol,{bag:false,detail:false,...options,skin:['#986748','#a57553','#865b40'][Math.floor(rand()*3)]});
  p.group.position.set(x,0,z);p.group.rotation.y=rand()*6.28;scene.add(p.group);
  const a={p,x,z,phase:rand()*6.28,police:pol,walking:false,poseClock:0,stun:0,windup:0,attackCooldown:1};
  if(pol){a.telegraph=new THREE.Mesh(new THREE.RingGeometry(.62,.78,24),new THREE.MeshBasicMaterial({color:'#ed785c',transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false}));a.telegraph.rotation.x=-Math.PI/2;a.telegraph.position.y=.035;a.telegraph.visible=false;p.group.add(a.telegraph);police.push(a);}
  actors.push(a);return a;
}
function event(id,x,z,title,prompt,color){
  const coords=DISTRICTS[district].coords[id];if(coords)[x,z]=coords;
  const a=addActor(x,z,color,false,{female:['organiser','witness','record'].includes(id),localWardrobe:['witness','aid','assembly','protest','companion'].includes(id)}),marker=new THREE.Group();
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.58,.026,6,32),new THREE.MeshBasicMaterial({color:'#d9af71'}));ring.rotation.x=Math.PI/2;ring.position.y=.028;marker.add(ring);
  const dot=new THREE.Mesh(new THREE.SphereGeometry(.07,12,8),new THREE.MeshBasicMaterial({color:'#e6c486'}));dot.position.y=2.35;marker.add(dot);
  marker.position.set(x,.02,z);scene.add(marker);events.push({id,x,z,title,prompt,a,marker});return a;
}
function populate(){
  event('organiser',-3,24,'MIRA / THE ORGANISER','Talk to Mira','#736b52');
  event('aid',-23,5,'DEV / FIRST AID','Bring water to Dev','#c2ad84');
  event('witness',-4,-20,'SANA / THE JOURNALIST','Speak with Sana','#657387');
  event('barrier',-3,-29.6,'MIRA / THE CONFRONTATION','Join Mira at the line','#a26e55');
  event('assembly',-2,-45,'IQBAL / THE ASSEMBLY','Deliver the statement to Iqbal','#677459');
  event('protest',-18,-7,'THE GATHERING','Join the protest','#906748');
  event('companion',-6,-36,'KABIR / YOUR FRIEND','Help Kabir rejoin you','#7d7058');
  event('record',-24,-7,'LEELA / THE RECORD DESK','Lodge the protected account','#647987');
  for(const source of ITEMS){
    const item={...source},coords=DISTRICTS[district].coords[item.id];if(coords)[item.x,item.z]=coords;
    const g=new THREE.Group();
    if(item.type==='water'){
      cylinder(g,M.glass,0,.28,0,.07,.4);cylinder(g,M.white,0,.50,0,.035,.035);cylinder(g,M.white,0,.28,0,.072,.09);
      box(g,M.wood,0,.035,0,.65,.07,.55);
    }else if(item.type==='recorder'){
      box(g,M.dark,0,.065,0,.24,.10,.15);box(g,M.chrome,0,.125,0,.10,.025,.04);box(g,M.glass,.07,.13,0,.05,.015,.07);
    }else{
      box(g,M.wood,0,.35,0,.65,.055,.48);
      for(let x of [-.25,.25])box(g,M.metal,x,.17,0,.035,.34,.4);
      box(g,M.white,0,.389,0,.30,.008,.23);
    }
    g.position.set(item.x,.17,item.z);scene.add(g);
    const marker=new THREE.Group(),ring=new THREE.Mesh(new THREE.TorusGeometry(.45,.025,6,24),new THREE.MeshBasicMaterial({color:item.type==='note'?'#90aaa3':'#e1b273'}));
    ring.rotation.x=Math.PI/2;marker.add(ring);marker.position.set(item.x,.03,item.z);scene.add(marker);
    events.push({...item,item:true,marker,prop:g});
  }
  for(let i=0;i<15;i++){
    const clusters=district==='jamia'?[[-14,20],[18,14],[-20,-23],[8,-18]]:district==='shaheen'?[[-8,24],[9,6],[-8,-17],[0,-36]]:[[-19,-6],[-24,8],[-16,15],[-5,22]];
    const c=clusters[Math.floor(i/4)];
    const x=c[0]+(i%4-1.5)*.9,z=c[1]+(i%2)*1.2+rand()*.5;
    const a=addActor(x,z,['#c3b58d','#85907c','#676b7f','#c4b395','#6b7271'][i%5],false,{female:district==='shaheen'?i%3!==0:i%4===0,localWardrobe:i%3!==0});a.p.group.scale.setScalar(.92+rand()*.13);
    if(i===10||i===11)a.walking=true;
    if(i%3===0){const placard=new THREE.Group();cylinder(placard,M.wood,0,1.9,.12,.014,.85);
      const words=['VOTE CHORI BAND KARO','END SIR','GYANESH KUMAR: RESIGN','INCLUDE ELIGIBLE VOTERS','SAVE DEMOCRACY'][i%5];
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
  const positions=district==='jamia'?[[-19,8],[16,-15],[-24,29],[22,28],[-24,-25],[23,-25],[-22,-42],[20,-42]]:district==='shaheen'?[[-24,30],[24,25],[-23,-9],[23,-22],[-22,-44],[22,-44]]:[[15,29],[17,11],[15,-6],[17,-28],[21,-46],[-29,20],[-30,1],[-27,-22],[-25,-42],[42,-20],[44,8],[38,36]];
  for(let i=0;i<positions.length;i++){
    const g=treeSource.clone(true);g.position.set(positions[i][0],0,positions[i][1]);g.scale.setScalar(1.7+rand()*.8);g.rotation.y=rand()*6.28;
    g.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;if(o.material.name.includes('leaves')){o.material=o.material.clone();o.material.transparent=false;o.material.alphaTest=.35;o.material.depthWrite=true;o.material.roughness=.92;}}});
    scene.add(g);trees.push(g);
  }
}
function buildDistricts(){
  const realScene=scene;
  for(const id of Object.keys(DISTRICTS)){
    district=id;scene=new THREE.Group();barriers=[];for(const list of Object.values(collections))list.length=0;
    if(id==='jantar')buildWorld();else buildDistrict(scene,id,ground,colliders,barriers);
    if(treeSource)addTrees();populate();
    const data={group:scene,barriers};for(const [name,list] of Object.entries(collections))data[name]=[...list];
    zoneData.set(id,data);realScene.add(scene);scene.visible=false;
  }
  scene=realScene;selectDistrict('jantar');
}
function selectDistrict(id){
  if(!zoneData.has(id))return;
  district=id;for(const [key,d]of zoneData)d.group.visible=key===id;
  const data=zoneData.get(id);barriers=data.barriers;
  for(const [name,list]of Object.entries(collections))list.splice(0,list.length,...data[name]);
  $('district-label').textContent=DISTRICTS[id].name.toUpperCase();
}
function cityMap(){
  if(s.mode==='citymap'){mode(mapReturn);return;}
  if(!['menu','playing','paused','won'].includes(s.mode))return;
  mapReturn=s.mode==='paused'?'playing':s.mode;
  keys.clear();joy.x=joy.y=0;if(action)action.holding=false;
  $('campaign-progress').textContent=`${campaign.count()} / 3 districts completed`;
  for(const id of Object.keys(DISTRICTS))$('district-status-'+id).textContent=campaign.results[id]?`Completed · best ${campaign.results[id].score}`:'Ready to explore';
  mode('citymap');
}
function nearest(){
  let best=null,d=2.7;for(const e of events){
    if(s.tasks[e.id])continue;
    if(action?.active){
      if(['witness','record'].includes(e.id)||action.mission==='hold'&&['barrier','companion'].includes(e.id))continue;
      if(action.rescued.includes(e.id))continue;
    }
    if(e.auto||e.item&&s.items.includes(e.id))continue;
    if(e.id==='companion'&&((!s.tasks.barrier&&action?.mission!=='escort')||s.companion))continue;
    if(e.id==='record'&&(!s.tasks.barrier||s.choice!=='archive'))continue;
    if(e.id==='assembly'&&s.choice==='archive')continue;
    if(e.id==='protest'&&s.protestDone)continue;
    const dist=Math.hypot(s.x-e.x,s.z-e.z);if(dist<d){best=e;d=dist;}
  }
  s.near=best;
  $('interact').hidden=s.mode!=='playing'||!best;
  if(best)$('interact').textContent=action?.active?
    (best.id==='barrier'?`HOLD · ${Math.round(action.barrier*100)}%`:
    ['aid','organiser','protest'].includes(best.id)?'HOLD · HELP':
    best.id==='companion'?(coarse?'REGROUP':'GET KABIR MOVING · E'):best.id==='assembly'?(coarse?'HANDOFF':'FINISH THE RUN · E'):coarse?(best.type==='recorder'?'RECOVER':best.type==='water'?'TAKE WATER':'READ'):best.prompt+' · E'):best.prompt+'  ·  E';
}
function dialog(e){
  if(action?.active){action.interact(s,e);return;}
  if(e.item){
    s.items.push(e.id);e.prop.visible=e.marker.visible=false;
    if(e.type==='water'){s.inventory.water++;toast(`Water secured: ${s.inventory.water} / 3. Bring it to Dev at first aid.`);}
    else if(e.type==='recorder'){s.inventory.recorder=true;toast('Sana’s recorder is recovered. Let her decide how her account is shared.');}
    else{s.notes.push({title:e.title,copy:e.copy});toast(e.title+' added to your journal. Press J to read it.');}
    audio.tone(330,.16);hud();nearest();saveProgress();return;
  }
  if(e.id==='aid'&&!s.tasks.organiser){toast('Meet the organiser first. The gathering needs a shared plan.');return;}
  if(e.id==='witness'&&!s.tasks.aid){toast('Help the first-aid point before taking the journalist’s account.');return;}
  if(e.id==='barrier'&&!s.tasks.witness){toast('The journalist’s account must be secured before this confrontation.');return;}
  if(e.id==='assembly'&&!s.tasks.barrier){toast('The main route is still blocked. Return to the gathering.');return;}
  if(e.id==='aid'&&s.inventory.water<3){toast(`Dev still needs ${3-s.inventory.water} water bottle${s.inventory.water===2?'':'s'}. Follow the gold item markers in the courtyard.`);return;}
  if(e.id==='witness'&&!s.inventory.recorder){toast('Sana’s recorder is on the street near the bus approach. Recover it before choosing a handoff.');return;}
  if(e.id!=='protest'&&s.tasks[e.id]){toast('You have already helped here. Keep exploring.');return;}
  const content=STORY[e.id];
  s.dialog=e.id;$('dialog-kicker').textContent=content.name;$('dialog-title').textContent=content.title;$('dialog-copy').textContent=content.copy;$('dialog-confirm').textContent=content.action;
  $('dialog-alt').hidden=!content.alternate;if(content.alternate)$('dialog-alt').textContent=content.alternate;mode('dialog');
}
function complete(){
  const id=s.dialog;if(!id)return;
  if(id==='barrier'){s.dialog=null;s.rallyTime=0;s.rallyHits=0;mode('rally');document.querySelector('.rally-window').style.left=s.assist?'45%':'78%';$('rally-skip').hidden=!s.assist;return;}
  if(id==='companion'){s.companion=true;s.solidarity++;s.dialog=null;mode('playing');saveProgress();toast('Kabir stays with you. The handoff will remember who made it together.');return;}
  if(id==='protest'){s.protestDone=true;s.solidarity++;toast('A voice beside yours. The gathering holds together.');}
  else if(id==='record'){s.tasks.assembly=true;s.solidarity++;}
  else{s.tasks[id]=true;s.solidarity++;s.checkpoint={x:s.x,z:s.z};toast('Solidarity is a practice. Keep the account alive.');}
  audio.tone(260,.18);
  s.dialog=null;mode('playing');hud();
  saveProgress();
  if(id==='assembly'||id==='record'){
    mode('won');$('ending-title').textContent=id==='record'?'An account without exposed names.':'The account becomes collective.';
    $('ending-copy').textContent=(id==='record'?'Sana’s account reaches the desk with identifying details protected.':'Sana’s authorised statement reaches the public assembly.')+
      (s.companion?' Kabir is beside you. You came looking for a friend, and did not leave him behind.':' Kabir has not rejoined you. The account arrived, but the gathering still has someone to look for.')+
      ` You discovered ${s.notes.length} optional story fragments. The demand for accountability continues beyond this fictional chapter.`;
  }
}
function rallyHit(){
  const phase=Math.abs(Math.sin(s.rallyTime*2));
  if(phase>(s.assist?.45:.78)){s.rallyHits++;s.rallyTime=0;audio.tone(300+s.rallyHits*70,.16);$('rally-feedback').textContent=`Together: ${s.rallyHits} / 3`;if(s.rallyHits>=3)finishRally();}
  else{$('rally-feedback').textContent='Wait for the gold window. There is no penalty for trying again.';audio.tone(150,.08,.01);}
}
function finishRally(){
  s.tasks.barrier=true;s.solidarity++;s.pressure=1;s.capture=0;s.checkpoint={x:s.x,z:s.z};mode('playing');hud();saveProgress();toast('The barrier falls. Kabir is just beyond it. Run, or take time to stay with him.',6);
}
function journal(){
  if(s.mode==='journal'){mode(journalReturn);return;}
  if(!['playing','citymap'].includes(s.mode))return;
  journalReturn=s.mode==='citymap'?'citymap':'playing';
  keys.clear();joy.x=joy.y=0;
  $('assist-game').checked=s.assist;
  $('journal-copy').textContent=`AMAN’S JOURNAL\n\nI came to find Kabir. Mira asked me to make myself useful first.\n\nCURRENT TASK\n${$('objective').textContent}\n\nCOMPLETED\n${objectives.filter(([id])=>s.tasks[id]).map(([id])=>STORY[id].name).join(' • ')||'No story encounters completed yet.'}\n\nWater: ${s.inventory.water}/3 • Recorder: ${s.inventory.recorder?'recovered':'not recovered'}\nHandoff: ${s.choice==='archive'?'protected record desk':'public assembly'}\nKabir: ${s.companion?'staying with me':'still separated'}\n\n`+
    (s.notes.map(n=>n.title+'\n'+n.copy).join('\n\n')||'Explore the benches and courtyard for optional story fragments.');
  if(action?.active)$('journal-copy').textContent=`THE VOTE-CHORI / SIR CAMPAIGN\n\n${DISTRICTS[district].brief}\n\nCURRENT TASK\n${$('objective').textContent}\n\nMOVEMENT DEMANDS\n${DEMANDS.map(d=>d.title+': '+d.copy).join('\n\n')}\n\nREVIEWED FILES\n${movement.outcomes.map(o=>o.case+' • '+o.response+' • '+o.status).join('\n')||'No files referred yet.'}\n\nTHE NETWORK\n${campaign.count()} / 3 chapters completed. Help in another chapter grants one emergency health recovery. Names and records are fictional; no real voter data is collected.\n\nRead the sourced movement dossier through the research link. Claims of partisan deletion are disputed; this campaign does not establish guilt, scrap SIR or change electoral rolls.`;
  $('optional-cases').hidden=!action?.active;
  mode('journal');
}
function begin(playAction=false,region='jantar'){
  lesson=false;lessonStage=0;
  selectDistrict(playAction?region:'jantar');
  movement.reset();
  action?.reset(playAction,DISTRICTS[district].mission);
  street?.reset(playAction,district,events,colliders);
  try{localStorage.removeItem(SAVE_KEY);}catch{}
  keys.clear();joy.x=joy.y=0;$('sprint').classList.remove('active');
  Object.assign(s,{x:0,z:31,y:0,vy:0,capture:0,pressure:0,solidarity:0,yaw:0,dialog:null,checkpoint:null});
  Object.assign(s,{items:[],inventory:{water:0,recorder:false},choice:'public',companion:false,protestDone:false,rallyHits:0,notes:[]});
  events.filter(e=>e.item).forEach(e=>e.prop.visible=true);
  actors.forEach(a=>{a.p.group.position.set(a.x,0,a.z);a.path=[];a.pathClock=0;a.stun=0;a.windup=0;a.attackCooldown=1;if(a.telegraph)a.telegraph.visible=false;resetHuman(a.p);});
  resetHuman(player);anim=0;s.move=0;player.group.position.set(0,0,31);player.group.rotation.y=0;
  const friend=events.find(e=>e.id==='companion');if(friend)friend.a.p.group.position.set(friend.x,0,friend.z);
  for(const k in s.tasks)s.tasks[k]=false;
  barriers.forEach(g=>g.rotation.x=0);police.forEach((a,i)=>{a.p.group.position.set(4+i*1.3,0,-37-i);});
  mode('playing');toast(coarse?'Move with the left joystick. Mira waits by the gold ring ahead.':'WASD to move; drag to look. Meet Mira at the gold ring ahead.',6);hud();
  if(playAction){
    action.support=Object.entries(campaign.results).some(([id,result])=>id!==district&&result.helped>0)?1:0;
    s.pitch=coarse?.20:.30;s.pressure=1;s.checkpoint={x:0,z:31};
    if(district==='shaheen')s.tasks.barrier=true;
    police.forEach((a,i)=>a.p.group.position.set(5+i,0,37-i));
    toast(coarse?'Collect 3 packets. Jump hurdles; Rally opens space. Push the stick farther to run.':'Collect 3 packets · SPACE jump · Q dodge · F Rally · E action',5);
    if(!coarse)$('sprint').classList.add('active');
    $('mission-brief-title').textContent=DISTRICTS[district].chapter;$('mission-brief-copy').textContent=DISTRICTS[district].brief;
    hud();map();
  }
}
function valid(x,z,allowJump=true){
  const area=DISTRICTS[district].area.some(([left,right,top,bottom])=>x>=left&&x<=right&&z>=top&&z<=bottom);
  if(!area)return false;
  if(!s.tasks.barrier&&z<-32&&z>-34)return false;
  if(!s.tasks.barrier&&s.z>-32&&z<=-34)return false;
  for(const c of colliders)if(Math.abs(x-c.x)<c.w/2+.32&&Math.abs(z-c.z)<c.d/2+.32&&!(allowJump&&(c.name==='fallen barricade'||c.street)&&s.y>.65))return false;
  return true;
}
function step(dt){
  if(['loading','error'].includes(s.mode))return;
  s.time+=dt;
  if(s.mode==='paused'||s.mode==='caught'||s.mode==='won')return;
  if(['journal','citymap','brief','review','charter','guide'].includes(s.mode))return;
  if(s.mode==='rally'){s.rallyTime+=dt;const phase=Math.abs(Math.sin(s.rallyTime*2));$('rally-cursor').style.left=`${phase*100}%`;$('rally-count').textContent=`${s.rallyHits} / 3`;return;}
  if(toastTime>0){toastTime-=dt;if(toastTime<=0)$('toast').classList.remove('show');}
  if(s.mode==='menu'){anim+=dt;poseHuman(player,anim*.5,0);return;}
  if(s.mode==='dialog'){poseHuman(player,0,0);return;}
  let ix=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+joy.x;
  let iz=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-joy.y;
  if(action?.active&&action.dodge>0&&Math.hypot(ix,iz)<.1){ix=0;iz=1;}
  const mag=Math.hypot(ix,iz);if(mag>1){ix/=mag;iz/=mag;}
  s.sprint=wantsSprint({shift:keys.has('ShiftLeft')||keys.has('ShiftRight'),toggle:$('sprint').classList.contains('active'),touch:coarse&&action?.active,stickMagnitude:Math.hypot(joy.x,joy.y)})&&(!action?.active||action.sprintAllowed);
  const speed=action?.active&&action.dodge>0?7.5:s.sprint?SPRINT_RULES.runSpeed:action?.active?SPRINT_RULES.walkSpeed:1.8;
  const dx=(ix*Math.cos(s.yaw)-iz*Math.sin(s.yaw))*speed*dt;
  const dz=(-ix*Math.sin(s.yaw)-iz*Math.cos(s.yaw))*speed*dt;
  const previousX=s.x,previousZ=s.z;
  if(valid(s.x+dx,s.z))s.x+=dx;if(valid(s.x,s.z+dz))s.z+=dz;
  const travelled=Math.hypot(s.x-previousX,s.z-previousZ);player.worldSpeed=travelled/Math.max(.0001,dt);
  if(s.y<.1)audio.footstep(travelled);
  s.move=mag>.08&&travelled>.0001?Math.min(1,mag):0;
  s.vy-=16*dt;s.y=Math.max(0,s.y+s.vy*dt);if(!s.y)s.vy=0;
  player.group.position.set(s.x,s.y,s.z);
  if(s.move){const heading=Math.atan2(dx,dz)+Math.PI;player.group.rotation.y+=Math.atan2(Math.sin(heading-player.group.rotation.y),Math.cos(heading-player.group.rotation.y))*Math.min(1,dt*12);}
  anim+=dt*(s.move?(s.sprint?10.5:7.5):.75);poseHuman(player,anim,s.move?(s.sprint?1:.65):0);
  for(const a of actors){
    const dist=Math.hypot(a.p.group.position.x-s.x,a.p.group.position.z-s.z);
    const rescuedEvent=action?.active?events.find(e=>e.a===a&&action.rescued.includes(e.id)):null;
    a.p.group.visible=s.quality==='high'||dist<28||(a.police&&s.pressure>0);
    if(!a.p.group.visible&&!rescuedEvent)continue;
    if((a===events.find(e=>e.id==='companion')?.a&&s.companion)||(action?.mission==='escort'&&rescuedEvent?.id==='organiser')){
      follow(a,dt);
    }else if(rescuedEvent){
      const p=a.p.group.position,target=rescuedEvent.id==='organiser'?{x:-18,z:20}:rescuedEvent.id==='aid'?{x:-27,z:6}:{x:-26,z:-8};
      if(action.mission==='hold'){target.x=rescuedEvent.id==='organiser'?-4:rescuedEvent.id==='aid'?4:0;target.z=-35;}
      const dz=target.z-p.z,dx=Math.abs(dz)>.15?0:target.x-p.x;
      const d=Math.abs(dz)>.15?Math.abs(dz):Math.abs(dx);
      a.p.worldSpeed=d>.15?2.8:0;
      if(d>.15){const nx=p.x+Math.sign(dx)*Math.min(Math.abs(dx),2.8*dt),nz=p.z+Math.sign(dz)*Math.min(Math.abs(dz),2.8*dt);if(valid(nx,nz)){p.x=nx;p.z=nz;}a.p.group.rotation.y=Math.atan2(dx,dz)+Math.PI;}
      poseHuman(a.p,s.time*10.5+a.phase,d>.15?1:0);
    }else if(a.police&&s.pressure){
      const p=a.p.group.position,d=Math.max(.1,Math.hypot(s.x-p.x,s.z-p.z));
      a.attackCooldown=Math.max(0,a.attackCooldown-dt);
      if(a.stun>0){a.stun=Math.max(0,a.stun-dt);a.telegraph.visible=false;poseHuman(a.p,s.time*.5,0);continue;}
      if(action?.active&&a.windup>0){
        a.windup-=dt;a.telegraph.visible=true;a.telegraph.material.opacity=.35+.3*Math.sin(s.time*18);
        if(a.windup<=0){a.telegraph.visible=false;a.attackCooldown=2.6;if(d<2.8&&s.y<.65)action.damage(s);}
        poseHuman(a.p,s.time*2+a.phase,.25);continue;
      }
      if(action?.active&&d<2.4&&a.attackCooldown===0){a.windup=.85;a.telegraph.visible=true;continue;}
      const flank=action?.active&&police.indexOf(a)===2?1.5:0;
      const dx=s.x+flank-p.x,dz=s.z-p.z,length=Math.max(.1,Math.hypot(dx,dz)),speed=action?.active?(s.assist?2.0:2.7):(s.assist?1.3:1.7);
      if(d>1.2){
        const x=p.x+dx/length*speed*dt,z=p.z+dz/length*speed*dt;
        if(valid(x,z,false)){p.x=x;p.z=z;}
        else{
          a.pathClock=(a.pathClock||0)-dt;
          if(!a.path?.length||a.pathClock<=0){a.path=route(p,{x:s.x+flank,z:s.z},(x,z)=>valid(x,z,false));a.pathClock=.8;}
          const n=a.path?.[0];if(n){const q=Math.hypot(n.x-p.x,n.z-p.z),v=Math.min(q,speed*dt),nx=p.x+(n.x-p.x)/Math.max(.001,q)*v,nz=p.z+(n.z-p.z)/Math.max(.001,q)*v;
            if(valid(nx,nz,false)){p.x=nx;p.z=nz;}if(q<.3)a.path.shift();}
        }
      }
      a.p.group.rotation.y=Math.atan2(s.x-p.x,s.z-p.z)+Math.PI;poseHuman(a.p,s.time*8+a.phase,.7);
      if(d<1.25&&!action?.active)s.capture+=dt;
    }else if(a.walking){
      const p=a.p.group.position,oldX=p.x,oldZ=p.z;p.x=a.x+Math.sin(s.time*.18+a.phase)*2.5;p.z=a.z+Math.cos(s.time*.18+a.phase)*1.8;
      a.p.worldSpeed=Math.hypot(p.x-oldX,p.z-oldZ)/Math.max(.0001,dt);a.p.poseTimeDivisor=4.5;
      a.p.group.rotation.y=Math.atan2(Math.cos(s.time*.18+a.phase)*2.5,-Math.sin(s.time*.18+a.phase)*1.8)+Math.PI;
      poseHuman(a.p,s.time*4.5+a.phase,.4);
    }else{
      a.poseClock+=dt;if(a.poseClock>.18){a.poseClock=0;poseHuman(a.p,s.time*.75+a.phase,0,(s.solidarity>2&&a.placard)?.3*Math.sin(s.time*.6+a.phase):0);}
    }
  }
  if(s.capture>(s.assist?3.4:1.8)){mode('caught');$('ending-title').textContent='The account is interrupted.';$('ending-copy').textContent='The fictional crackdown caught up with you. Return to your last completed story point; supplies, recovered items and story choices remain remembered for this play session.';}
  barriers.forEach((g,i)=>{if(s.tasks.barrier)g.rotation.x=Math.min(Math.PI/2,g.rotation.x+dt*(1+i*.12));});
  if(!s.reduced)flags.forEach((f,i)=>{const p=f.geometry.attributes.position;for(let j=0;j<p.count;j++)p.setZ(j,Math.sin(s.time*2+p.getX(j)*4+i)*.055*(p.getX(j)+.6));p.needsUpdate=true;});
  events.forEach(e=>{e.marker.visible=!(e.item?s.items.includes(e.id):s.tasks[e.id])&&Math.hypot(s.x-e.x,s.z-e.z)<25;if(e.id==='companion')e.marker.visible=(s.tasks.barrier||action?.mission==='escort')&&!s.companion;if(e.id==='record')e.marker.visible=s.tasks.barrier&&s.choice==='archive'&&!s.tasks.assembly;if(action?.active&&(e.id==='witness'||e.id==='record'||action.rescued.includes(e.id)))e.marker.visible=action.mission==='hold'&&action.rescued.includes(e.id);if(e.marker.children[0]?.material)e.marker.children[0].material.color.set(action?.mission==='hold'&&action.rescued.includes(e.id)?'#91c697':'#d9af71');});
  nearest();
  if(action?.active){street.update(dt,s,action);if(lesson){s.pressure=0;action.hurt=1;updateLesson();}action.update(dt,s,s.near,police,s.move>0);actionHud();}
  hud();map();
  events.forEach(e=>e.marker.scale.setScalar(e.id===s.target?1.5:1));
}
function follow(a,dt){
  const p=a.p.group.position,d=Math.hypot(s.x-p.x,s.z-p.z);a.pathClock=(a.pathClock||0)-dt;
  if(d>1.8&&a.pathClock<=0){a.path=route(p,{x:s.x,z:s.z},(x,z)=>valid(x,z,false));a.pathClock=.65;}
  const next=a.path?.[0]||{x:s.x,z:s.z},dist=Math.hypot(next.x-p.x,next.z-p.z),speed=action?.mission==='escort'?3.6:4.1;
  a.p.worldSpeed=0;
  if(d>1.8&&dist>.05){const x=p.x+(next.x-p.x)/dist*Math.min(dist,speed*dt),z=p.z+(next.z-p.z)/dist*Math.min(dist,speed*dt);if(valid(x,z,false)){p.x=x;p.z=z;a.p.worldSpeed=speed;}a.p.group.rotation.y=Math.atan2(next.x-p.x,next.z-p.z)+Math.PI;if(dist<.3)a.path?.shift();}
  poseHuman(a.p,s.time*10.5+a.phase,a.p.worldSpeed?1:0);
}
function hud(){
  let id='organiser',text='Meet Mira. Find out where Kabir went.';
  if(s.tasks.organiser){id=ITEMS.find(i=>i.type==='water'&&!s.items.includes(i.id))?.id||'aid';text=s.inventory.water<3?`Find water for first aid (${s.inventory.water} / 3)`:'Deliver the water to Dev';}
  if(s.tasks.aid){id=s.inventory.recorder?'witness':'recorder';text=s.inventory.recorder?'Let Sana choose how her account is shared':'Recover Sana’s dropped recorder';}
  if(s.tasks.witness){id='barrier';text='Stand with Mira at the barricade';}
  if(s.tasks.barrier){id=s.choice==='archive'?'record':'assembly';text=s.choice==='archive'?'Reach Leela at the protected record desk':'Bring Sana’s statement to Iqbal at the assembly';}
  if(s.tasks.assembly)text='Chapter complete';
  if(action?.active){id=action.target(s);text=action.objective(s);}
  if(lesson){id=lessonStage===6?'organiser':'packet-0';text=LESSONS[Math.min(6,lessonStage)][0]+' · safe practice';}
  s.target=id;const target=events.find(e=>e.id===id);$('objective').textContent=text;
  const hint=action?.active&&action.mission==='escort'?'Keep the group together':action?.active&&action.mission==='hold'?'Choose your station order':s.tasks.barrier&&!s.companion?'Kabir can still be helped near the line':'Follow the gold marker';
  $('objective-distance').textContent=target&&!s.tasks.assembly?`${Math.round(Math.hypot(s.x-target.x,s.z-target.z))} m · ${hint}`:'';
  if(target)$('waypoint-arrow').style.transform=`rotate(${Math.atan2(target.x-s.x,-(target.z-s.z))+s.yaw}rad)`;
  $('inventory').textContent=`WATER ${s.inventory.water}/3 • RECORDER ${s.inventory.recorder?'SECURED':'MISSING'}`;
  $('story-count').textContent=`${objectives.filter(([id])=>s.tasks[id]).length} / 5`;
  $('solidarity').textContent=s.solidarity;
  $('pressure').textContent=s.pressure?'CRACKDOWN ACTIVE':'THE GATHERING';
  $('location').textContent=s.x<-10?'COMMUNITY COURTYARD':s.z<-32?'ASSEMBLY APPROACH':s.z<-10?'JANTAR MANTAR ROAD':'THE GATHERING';
  if(action?.active)$('location').textContent=DISTRICTS[district].name.toUpperCase()+' / '+DISTRICTS[district].chapter;
}
function actionHud(){
  $('health').textContent='●'.repeat(Math.max(0,action.health))+'○'.repeat(5-Math.max(0,action.health))+(action.support?' +':'');
  $('stamina').style.width=action.stamina+'%';
  $('action-score').textContent=action.score;
  $('action-time').textContent=Math.floor(action.time/60)+':'+String(Math.floor(action.time%60)).padStart(2,'0');
  $('action-rescues').textContent=action.rescued.length+' / 3 helped';
  $('evade').textContent=action.cooldown>0?'DODGE '+action.cooldown.toFixed(1):coarse?'DODGE':'DODGE · Q';
  document.body.classList.toggle('hurt',action.hurt>1.4);
  $('action-warning').hidden=action.charge<=0;
}
function actionWin(){
  if(lesson){lesson=false;guideReturn='menu';mode('guide');return;}
  campaign.record(district,action.score,action.rescued.length);
  s.tasks.assembly=true;mode('won');
  const medal=action.health>=4&&action.rescued.length>=2?'SOLIDARITY':action.health>=3?'DEFIANCE':'SURVIVOR';
  $('ending-title').textContent=campaign.count()===3?'Replacement is not repair.':DISTRICTS[district].chapter+' · COMPLETE';
  $('ending-copy').textContent=DISTRICTS[district].debrief+` ${campaign.count()} / 3 chapters completed. ${medal} · ${action.score} points. ${street.collected.length} fictional record packets delivered. No actual registration or election result changed.`;
  $('next-district').hidden=false;$('next-district').textContent=campaign.count()===3?'Explore the city map':'Continue to the next district';
  if(campaign.count()===3){movement.mandate=DEMANDS.map(d=>d.id);$('ending-title').textContent='The movement is bigger than one office.';$('ending-copy').textContent=`${action.score} points · ${medal}. You delivered the packets and held the network together. The fictional assembly carries all three demands: Gyanesh Kumar’s exit, ending the contested SIR process, and inclusion with transparent review for every eligible voter. This is not news of actual resignation, repeal or voter restoration.`;}
}
function openReview(e,from='playing'){
  if(movement.reviewed.includes(e.id)){toast('This optional case is already reviewed.',2);return;}
  reviewReturn=from;
  movement.active=e.id;const entry=CASES[district][e.id];
  keys.clear();joy.x=joy.y=0;action.holding=false;
  $('review-title').textContent=entry.name;
  $('review-before').textContent=entry.before;$('review-after').textContent=entry.after;$('review-account').textContent=entry.account;
  $('review-feedback').textContent='Choose the appropriate referral. Reading is paused; there is no penalty for taking time.';
  $('review-feedback').dataset.correct='';mode('review');
}
function reviewAnswer(choice){
  if(s.mode!=='review'||!movement.active)return;
  const result=movement.answer(district,choice);
  $('review-feedback').textContent=result.copy;$('review-feedback').dataset.correct=String(result.correct);
  if(result.correct){action.score+=50;if(reviewReturn==='journal'){const back=journalReturn;mode('playing');journal();journalReturn=back;}else mode('playing');hud();nearest();toast(result.copy,6);}
  else $('review-feedback').scrollIntoView({block:'nearest',behavior:'instant'});
}
function openCharter(){
  keys.clear();joy.x=joy.y=0;movement.mandate=[];document.querySelectorAll('#charter-screen input').forEach(e=>e.checked=false);
  $('charter-feedback').textContent='The fictional assembly will not accept “one resignation and we are done”. Build all three commitments.';
  mode('charter');
}
function finishCharter(){
  movement.mandate=DEMANDS.filter(d=>$('demand-'+d.id).checked).map(d=>d.id);
  if(movement.mandate.length!==3){$('charter-feedback').textContent='A leadership change alone leaves omitted voters and unresolved cases behind. Include all three commitments.';return;}
  mode('won');$('ending-title').textContent='A mandate to repair, not erase.';
  $('ending-copy').textContent='In this fictional ending, the assembly adopts a demand for Gyanesh Kumar’s exit through lawful constitutional processes, ending the contested SIR process, and transparent inclusion and appeal support across affected states. The win is a complete public demand backed by consented case referrals, not a claim that an official resigned, SIR was abolished, voters were registered, or past elections reversed. Keep every eligible voter in view.';
  try{localStorage.setItem('dissent-charter-v09','complete');}catch{}
}
function actionFail(){
  mode('caught');$('ending-title').textContent='Caught in the crackdown.';
  $('ending-copy').textContent='The run is not over. Retry from the last checkpoint with recovered items intact. Keep moving when a red zone appears, manage your sprint, and use Dodge to get space.';
}
function rallyPower(){
  if(s.mode!=='playing'||!action?.active)return;
  if(street.pulse(s,police,(x,z)=>valid(x,z,false))){action.hurt=Math.max(action.hurt,.6);action.stamina=Math.min(100,action.stamina+10);}
  else toast('Rally needs 30 energy and a ready cooldown. Collect supplies or packets.',2);
}
function startCampaign(){
  if(s.mode==='error'){location.reload();return;}
  if(s.mode==='loading')return;
  if(action?.active&&!action.finish&&s.mode==='menu'){mode('playing');return;}
  if(!s.sound){try{s.sound=audio.toggle();$('sound').textContent=s.sound?'Sound on':'Sound off';}catch{}}
  begin(true,campaign.next());
}
function map(){
  const c=$('map').getContext('2d'),w=144;c.clearRect(0,0,w,w);c.fillStyle='rgba(17,26,27,.87)';c.fillRect(0,0,w,w);
  const xy=(x,z)=>[(x+32)/80*w,(z+54)/98*w];
  c.fillStyle='#596463';const a=xy(-10,-49),b=xy(10,38);c.fillRect(a[0],a[1],b[0]-a[0],b[1]-a[1]);
  const d=xy(-28,-12),e=xy(-10,22);c.fillRect(d[0],d[1],e[0]-d[0],e[1]-d[1]);
  c.fillStyle='#51614d';const f=xy(12,-50);c.fillRect(f[0],f[1],144-f[0],144);
  for(const ev of events){if(ev.item&&s.items.includes(ev.id))continue;if(action?.active&&(['witness','record'].includes(ev.id)||action.rescued.includes(ev.id)))continue;const p=xy(ev.x,ev.z);c.fillStyle=ev.item&&ev.type==='note'?'#91b0a7':s.tasks[ev.id]?'#647567':'#d4b079';c.beginPath();c.arc(...p,ev.id===s.target?4.5:ev.item?2:3,0,6.28);c.fill();if(ev.id===s.target){c.strokeStyle='#f6e8c9';c.lineWidth=1;c.stroke();}}
  const p=xy(s.x,s.z);c.fillStyle='#faf0d6';c.beginPath();c.arc(...p,3.5,0,6.28);c.fill();
  c.strokeStyle='#faf0d6';c.beginPath();c.moveTo(...p);c.lineTo(p[0]-Math.sin(s.yaw)*8,p[1]-Math.cos(s.yaw)*8);c.stroke();
}
function render(){
  if(!renderer||!player)return;
  renderer.info.reset();
  const menu=s.mode==='menu';
  const target=new THREE.Vector3(s.x,s.y+1.45,s.z);
  const distance=coarse?5.8:6.2;
  const fov=!s.reduced&&action?.active&&action.dodge>0?57:52;camera.fov+=(fov-camera.fov)*.2;camera.updateProjectionMatrix();
  if(menu){camera.position.set(-3.3,3.0,29.5);camera.lookAt(22,5,-13);}
  else {
    const desired=new THREE.Vector3(s.x+Math.sin(s.yaw)*distance,2.2+s.pitch*4+s.y,s.z+Math.cos(s.yaw)*distance);
    const direction=desired.clone().sub(target),length=direction.length(),ray=new THREE.Ray(target,direction.normalize());let safe=length;
    for(const c of colliders){
      const bounds=new THREE.Box3(new THREE.Vector3(c.x-c.w/2-.15,0,c.z-c.d/2-.15),new THREE.Vector3(c.x+c.w/2+.15,c.h||3,c.z+c.d/2+.15));
      const hit=ray.intersectBox(bounds,new THREE.Vector3());if(hit)safe=Math.min(safe,Math.max(1,hit.distanceTo(target)-.3));
    }
    desired.copy(target).addScaledVector(direction,safe);
    camera.position.lerp(desired,manual||s.reduced||safe<length?1:.14);camera.lookAt(target);
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
  if(['playing','dialog','rally','journal'].includes(s.mode)){keys.clear();joy.x=joy.y=0;if(action)action.holding=false;s.beforePause=s.mode;mode('paused');}
}
function bindings(){
  let lastTouch=-1000;
  document.addEventListener('pointerdown',()=>lastTouch=-1000,true);
  document.addEventListener('click',e=>{if(performance.now()-lastTouch<700&&(e.pointerType==='touch'||e.detail>0)){e.preventDefault();e.stopImmediatePropagation();}},true);
  function button(id,fn){$(id).addEventListener('pointerup',e=>{if(e.pointerType==='touch'){lastTouch=performance.now();fn();}});$(id).onclick=e=>{if(e.detail===0||performance.now()-lastTouch>700)fn();};}
  button('start',startCampaign);button('story-start',()=>begin(false));button('pause',pause);button('resume',pause);button('restart',()=>begin(action?.active,district));button('again',()=>begin(action?.active,district));
  button('learn',guide);button('guide-pause',guide);button('guide-close',()=>mode(guideReturn));
  button('practice',startLesson);button('guide-play',()=>begin(true,'jantar'));button('lesson-exit',()=>{lesson=false;action.active=false;action.finish=true;guideReturn='menu';mode('guide');});
  button('retry',()=>{const c=s.checkpoint;s.x=c?.x||0;s.z=c?.z||31;s.capture=0;if(action.active){action.health=5;action.hurt=2;action.stamina=100;action.charge=0;action.sweep=0;action.warning.visible=false;}police.forEach((a,i)=>{a.p.group.position.set(s.x+4+i*.5,0,s.z+5);a.windup=0;a.stun=0;a.attackCooldown=1;a.telegraph.visible=false;});mode('playing');toast('Checkpoint restored. Keep going.');});
  button('title',()=>{mode('menu');keys.clear();joy.x=joy.y=0;});
  button('dialog-confirm',complete);button('dialog-back',()=>{s.dialog=null;mode('playing');});
  button('dialog-alt',()=>{s.choice='archive';complete();});
  button('continue',continueGame);
  button('rally-input',rallyHit);button('rally-skip',finishRally);button('journal',()=>{if(action?.active||s.mode==='menu')cityMap();else journal();});button('journal-close',journal);
  button('city-map-start',cityMap);button('city-close',cityMap);
  CHOICES.forEach(c=>button('review-'+c.id,()=>reviewAnswer(c.id)));
  button('review-back',()=>{movement.active=null;mode(reviewReturn);});
  for(const id of ['organiser','aid','protest'])button('case-'+id,()=>openReview({id},'journal'));
  button('charter-confirm',finishCharter);button('charter-back',()=>{mode('won');});button('reopen-charter',openCharter);
  button('city-journal',journal);
  button('next-district',()=>{if(campaign.count()===3)cityMap();else begin(true,campaign.next());});
  for(const id of Object.keys(DISTRICTS))button('play-'+id,()=>begin(true,id));
  $('storymode').onchange=()=>s.assist=$('storymode').checked;
  $('assist-game').onchange=()=>{s.assist=$('assist-game').checked;$('storymode').checked=s.assist;};
  button('interact',()=>{if(s.near)dialog(s.near);});
  button('evade',()=>{if(s.mode==='playing')action.evade();});
  button('rally-power',rallyPower);
  $('interact').addEventListener('pointerdown',()=>{if(action?.active&&s.near)action.interact(s,s.near);});
  for(const type of ['pointerup','pointercancel'])$('interact').addEventListener(type,()=>{if(action)action.holding=false;});
  button('jump',()=>{if(s.mode==='playing'&&!s.y)s.vy=5.3;});
  button('sprint',()=>{$('sprint').classList.toggle('active');});
  button('sound',()=>{
    try{s.sound=audio.toggle();$('sound').textContent=s.sound?'Sound on':'Sound off';audio.tone();}catch(e){s.sound=false;$('sound').textContent='Sound unavailable';}
  });
  $('quality').onchange=quality;$('reduced').onchange=()=>s.reduced=$('reduced').checked;
  document.addEventListener('keydown',e=>{
    if(e.target.matches('input,select,summary'))return;
    if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowLeft','ArrowDown','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code)){keys.add(e.code);if(s.mode!=='menu')e.preventDefault();}
    if(e.code==='Space'&&s.mode==='playing'){if(!s.y)s.vy=5.3;e.preventDefault();}
    if(e.code==='KeyE'&&!e.repeat){if(s.mode==='playing'&&s.near)dialog(s.near);else if(s.mode==='dialog')complete();else if(s.mode==='rally')rallyHit();}
    if(e.code==='KeyQ'&&!e.repeat&&s.mode==='playing')action.evade();
    if(e.code==='KeyF'&&!e.repeat)rallyPower();
    if(e.code==='KeyJ'&&!e.repeat)journal();
    if(['Escape','KeyP'].includes(e.code)){pause();e.preventDefault();}
  });
  document.addEventListener('keyup',e=>{keys.delete(e.code);if(e.code==='KeyE'&&action)action.holding=false;});window.addEventListener('blur',()=>{keys.clear();joy.x=joy.y=0;if(action)action.holding=false;});
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
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&['playing','dialog','rally','journal'].includes(s.mode))pause();});
  window.addEventListener('resize',resize);
}
async function init(){
  bindings();
  try{
    scene=new THREE.Scene();scene.fog=new THREE.Fog('#b3b5aa',55,135);scene.background=new THREE.Color('#bcc5c7');
    renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.info.autoReset=false;
    renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();manual=true;toast('Graphics context interrupted. Reload the page to recover this development build.',60);});
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    $('viewport').appendChild(renderer.domElement);
    camera=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,.1,180);
    sun=new THREE.DirectionalLight('#f4d9b4',3.1);sun.position.set(-18,30,25);sun.target.position.set(0,0,-5);sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-28,right:28,top:28,bottom:-28,near:.2,far:100});sun.shadow.bias=-.00015;sun.shadow.normalBias=.03;scene.add(sun,sun.target);
    scene.add(new THREE.HemisphereLight('#d7e4ed','#716f56',.65));
    $('loading').textContent='Loading clothing, trees and material scans…';
    const preference=new URLSearchParams(location.search).get('quality');if(['low','high'].includes(preference))$('quality').value=preference;
    const tasks=await Promise.allSettled([loadPeople(asset),new GLTFLoader().loadAsync(asset(coarse||preference==='low'?'tree-delhi.glb':'tree-delhi-high.glb')),materials(),new RGBELoader().loadAsync(asset('delhi-sky.hdr'))]);
    if(tasks[0].status==='rejected')throw new Error('The human model could not load. Please retry with a working connection.');
    if(tasks[1].status==='fulfilled')treeSource=tasks[1].value.scene;
    if(tasks[2].status==='rejected')throw new Error('The surface textures could not load. Please reload.');
    if(tasks[3].status==='fulfilled'){
      const sky=tasks[3].value;sky.mapping=THREE.EquirectangularReflectionMapping;const gen=new THREE.PMREMGenerator(renderer);
      scene.environment=gen.fromEquirectangular(sky).texture;scene.environmentIntensity=.55;scene.background=sky;scene.backgroundIntensity=.55;scene.backgroundRotation.y=.9;gen.dispose();
    }
    player=human('#c7bda4',false,{localWardrobe:true});player.group.position.set(0,0,31);scene.add(player.group);buildDistricts();campaign.load();
    street=new StreetPlay(scene,{toast,tone:(...args)=>audio.tone(...args),pop:text=>{$('pickup-pop').textContent=text;$('pickup-pop').hidden=false;},hud:v=>{
      $('street-count').textContent=`PACKETS ${v.collected.length}/3 · CHAIN ×${v.chain||1}`;
      $('rally-energy').style.width=v.energy+'%';$('rally-power').textContent=v.cooldown>0?'RALLY '+v.cooldown.toFixed(1):coarse?'RALLY':'RALLY · F';
      $('rally-power').disabled=v.cooldown>0||v.energy<30;$('pickup-pop').hidden=!v.popTime||s.mode!=='playing';
    }});
    action=new ActionGame(scene,{toast,packetTarget:()=>street.target(),packetCount:()=>street.collected.length,inGathering:v=>street.inGathering(v),damage:()=>street.damage(),tone:(...args)=>audio.tone(...args),collect:e=>{
      s.items.push(e.id);e.prop.visible=e.marker.visible=false;
    if(e.type==='recorder'){s.inventory.recorder=true;toast('Recorder secured. Open the line and find Kabir.',3);}
      else if(e.type==='water'){s.inventory.water++;action.health=Math.min(5,action.health+1);toast('Water recovered. Health restored.',2);}
      else{s.notes.push(e);toast(e.title+' added to the journal.',2);}
      audio.tone(480,.12);
    },stations:()=>events.filter(e=>['organiser','aid','protest'].includes(e.id)&&action.rescued.includes(e.id)),escortReady:()=>events.filter(e=>e.id==='companion'||e.id==='organiser').every(e=>Math.hypot(e.a.p.group.position.x-s.x,e.a.p.group.position.z-s.z)<6),win:actionWin,fail:actionFail});
    composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));ssao=new SSAOPass(scene,camera,innerWidth,innerHeight);
    ssao.kernelRadius=.5;ssao.minDistance=.002;ssao.maxDistance=.08;composer.addPass(ssao);composer.addPass(new OutputPass());
    quality();mode('menu');$('start').disabled=false;$('story-start').disabled=false;$('learn').disabled=false;$('start').textContent=campaign.count()?'PLAY · Continue campaign':'PLAY · Start the campaign';$('loading').textContent='Three districts ready • Desktop and touch controls';
    $('continue').hidden=!savedGame();
    window.render_game_to_text=()=>JSON.stringify({mode:s.mode,coordinates:'x east/right, z south/back; approximate game geography, not surveyed map',position:{x:+s.x.toFixed(2),z:+s.z.toFixed(2),y:+s.y.toFixed(2)},cameraYaw:+s.yaw.toFixed(2),tasks:s.tasks,inventory:s.inventory,items:s.items,choice:s.choice,companion:s.companion,notes:s.notes.length,rally:{hits:s.rallyHits,phase:+Math.abs(Math.sin(s.rallyTime*2)).toFixed(2)},solidarity:s.solidarity,pressure:s.pressure,near:s.near?.id||null,dialog:s.dialog,quality:s.quality,sound:s.sound,texturedHumans:true,animationClips:['Idle','Walk','Run'],treeAsset:!!treeSource,fps,rendering:{draws:renderer.info.render.calls,triangles:renderer.info.render.triangles},events:events.map(e=>({id:e.id,x:e.x,z:e.z,done:e.item?s.items.includes(e.id):!!s.tasks[e.id]})),police:police.map(a=>({x:+a.p.group.position.x.toFixed(2),z:+a.p.group.position.z.toFixed(2)}))});
    window.advanceTime=ms=>{manual=true;const n=Math.max(1,Math.ceil(ms/16.667));for(let i=0;i<n;i++)step(ms/n/1000);render();$('performance').textContent=`QA STEP • ${s.quality.toUpperCase()} • WORLD / 0.11`;};
    const baseText=window.render_game_to_text;
    window.render_game_to_text=()=>JSON.stringify({...JSON.parse(baseText()),tutorial:{active:lesson,stage:lessonStage,total:7},cast:{player:'Aman / fictional Indian student',wardrobe:player.wardrobe,avatarModels:4}});
    const worldText=window.render_game_to_text;
    window.render_game_to_text=()=>JSON.stringify({...JSON.parse(worldText()),district,campaign:campaign.results,street:{packets:street.collected,energy:+street.energy.toFixed(1),cooldown:+street.cooldown.toFixed(2),pulses:street.pulses,chain:street.chain,inGathering:street.inGathering(s),obstacles:colliders.filter(c=>c.street).map(c=>({x:c.x,z:c.z}))},officers:police.map(a=>({windup:+a.windup.toFixed(2),stun:+a.stun.toFixed(2)})),electoral:{reviewed:movement.reviewed,outcomes:movement.outcomes,activeCase:movement.active,attempts:movement.attempts,mandate:movement.mandate},party:events.filter(e=>e.id==='companion'||e.id==='organiser').map(e=>({id:e.id,x:+e.a.p.group.position.x.toFixed(2),z:+e.a.p.group.position.z.toFixed(2)})),action:{active:action.active,mission:action.mission,health:action.health,stamina:+action.stamina.toFixed(2),dodge:+action.dodge.toFixed(2),cooldown:+action.cooldown.toFixed(2),time:+action.time.toFixed(2),settle:+action.settle.toFixed(2),contested:action.contested,charge:+action.charge.toFixed(2),rescued:action.rescued,evacuees:events.filter(e=>action.rescued.includes(e.id)).map(e=>({id:e.id,x:+e.a.p.group.position.x.toFixed(2),z:+e.a.p.group.position.z.toFixed(2)})),barrier:+action.barrier.toFixed(2),score:action.score,support:action.support}});
    window.resumeRealTime=()=>{manual=false;last=performance.now();};
    function frame(now){requestAnimationFrame(frame);if(manual)return;const dt=Math.min(.05,(now-last)/1000||0);last=now;step(dt);render();frames++;if(now-frameStart>1000){fps=Math.round(frames*1000/(now-frameStart));frames=0;frameStart=now;$('performance').textContent=`${fps} fps • ${s.quality.toUpperCase()} • WORLD / 0.11`;}}
    requestAnimationFrame(frame);
  }catch(e){console.error(e);s.mode='error';$('loading').textContent=e.message;$('start').textContent='Reload to retry';$('start').disabled=false;$('start').onclick=()=>location.reload();}
}
init();
