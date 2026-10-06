import {Line} from './line-rules.js?v=18';
import {buildLine} from './line-scene.js?v=18';
import {WorldAudio} from './world-audio.js?v=0.17.2';
const $=id=>document.getElementById(id),game=new Line(),keys=new Set(),audio=new WorldAudio();
const coarse=matchMedia('(pointer:coarse)').matches,low=new URLSearchParams(location.search).get('quality')==='low'||coarse;
$('quality').value=low?'low':'high';$('quality').onchange=()=>{const url=new URL(location.href);url.searchParams.set('quality',$('quality').value);location.href=url;};
let view,last=performance.now(),lastPose=0,manual=false,stick={x:0,z:0},attack=false,action=false,brake=false,helpReturn='menu',fpsFrames=0,fpsTime=performance.now(),fps=0,graphicsLost=false;
function clear(){keys.clear();stick={x:0,z:0};attack=action=brake=false;game.input.attack=game.input.action=false;$('move-stick').querySelector('i').style.transform='';}
function panels(){
 $('menu').hidden=game.mode!=='menu';$('pause-screen').hidden=game.mode!=='paused';$('help-screen').hidden=game.mode!=='help';$('ending').hidden=!['failed','won'].includes(game.mode);
 $('hud').hidden=game.mode==='menu'||game.mode==='help';$('controls').hidden=game.mode!=='playing';$('tip').hidden=game.mode!=='playing';$('pause').hidden=!['playing','paused'].includes(game.mode);$('pause').textContent=game.mode==='paused'?'Resume':'Pause';
}
function start(){clear();game.start();view.reset();if(!audio.enabled)toggleSound();panels();}
function pause(){if(game.mode==='playing'){clear();game.mode='paused';}else if(game.mode==='paused')game.mode='playing';panels();}
function toggleSound(){$('sound').textContent=audio.toggle()?'Sound on':'Sound off';}
function help(){helpReturn=game.mode;clear();game.mode='help';panels();}
$('start').onclick=start;$('sound').onclick=toggleSound;$('pause').onclick=pause;$('resume').onclick=()=>graphicsLost?location.reload():pause();$('help').onclick=help;$('pause-help').onclick=help;$('ending-help').onclick=help;
$('help-close').onclick=()=>{game.mode=helpReturn;panels();};$('restart').onclick=start;
$('retry').onclick=()=>{clear();if(game.mode==='won')start();else{game.retry();view.reset();panels();}};
$('dodge').onclick=()=>{if(!game.van.occupied)game.dodge();};
for(const [id,set]of[['attack',v=>attack=v],['action',v=>action=v],['dodge',v=>brake=v]]){
 const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);set(true);if(id==='attack')game.strike();if(id==='action'&&game.context()?.id!=='rescue')game.action();if(id==='dodge'&&!game.van.occupied)game.dodge();});
 for(const event of['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>set(false));
}
let stickPointer=null;
$('move-stick').addEventListener('pointerdown',e=>{e.preventDefault();stickPointer=e.pointerId;$('move-stick').setPointerCapture(e.pointerId);moveStick(e);});
function moveStick(e){if(e.pointerId!==stickPointer)return;const r=$('move-stick').getBoundingClientRect(),rad=r.width*.35;let x=(e.clientX-r.x-r.width/2)/rad,z=(e.clientY-r.y-r.height/2)/rad,d=Math.hypot(x,z);if(d>1){x/=d;z/=d;}stick={x,z};$('move-stick').querySelector('i').style.transform=`translate(${x*rad}px,${z*rad}px)`;}
$('move-stick').addEventListener('pointermove',moveStick);
for(const event of['pointerup','pointercancel','lostpointercapture'])$('move-stick').addEventListener(event,()=>{stickPointer=null;stick={x:0,z:0};$('move-stick').querySelector('i').style.transform='';});
document.addEventListener('keydown',e=>{
 if(e.target.tagName==='SELECT')return;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();keys.add(e.code);
 if(e.repeat)return;if(e.code==='Space')game.strike();if(e.code==='KeyQ')game.dodge();
 if(e.code==='KeyE'&&game.context()?.id!=='rescue')game.action();if(e.code==='KeyP'||e.code==='Escape')pause();
});
document.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{if(game.mode==='playing')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&game.mode==='playing')pause();});
function input(){
 let x=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+stick.x;
 let z=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0)+stick.z;
 const d=Math.hypot(x,z);if(d>1){x/=d;z/=d;}
 game.input={x,z,run:keys.has('ShiftLeft')||Math.hypot(stick.x,stick.z)>.88,attack:attack||keys.has('Space'),action:action||keys.has('KeyE'),brake:brake||keys.has('KeyQ')};
}
function hud(){
 $('objective').textContent=game.objective;$('health').innerHTML=Array.from({length:6},(_,i)=>`<i class="${i<game.p.hp?'':'empty'}"></i>`).join('');
 $('stamina').style.width=game.p.stamina+'%';$('stamina-wrap').hidden=game.van.occupied;
 $('subtitle').hidden=game.messageTime<=0||game.mode!=='playing';$('subtitle').textContent=game.message;
 const c=game.context();$('action').hidden=!c||game.van.occupied;$('action-label').textContent=c?.label||'Action';$('action-progress').style.width=game.rescueHold/.65*100+'%';
 $('attack').hidden=game.van.occupied;$('dodge').textContent=game.van.occupied?'BRAKE':'DODGE';
 $('vehicle').hidden=!game.van.occupied;$('vehicle').textContent=game.ramWarning?'PATROL APPROACH · KEEP LEFT':`VAN · ${Math.ceil(game.van.hp)}%`;
 if(game.mode==='failed'||game.mode==='won'){
  $('ending-kicker').textContent=game.mode==='won'?'THE ACCOUNT SURVIVES':'THE LINE HELD YOU';
  $('ending-title').textContent=game.mode==='won'?'Not erased. Not alone.':'Take another approach.';
  $('ending-copy').textContent=game.mode==='won'?'Kabir and the recording reach the community shelter. The movement’s demand is larger than replacing one official: protect every eligible voter and make the system answer to the public. This is a fictional outcome.':game.message;
  $('retry').textContent=game.mode==='won'?'Replay the encounter':game.checkpoint==='drive'?'Retry the escape':'Retry the encounter';
 }
 panels();
}
function step(dt){
 input();const before=game.mode,ox=game.p.x,oz=game.p.z;
 game.update(dt);if(!game.van.occupied)audio.footstep(Math.hypot(game.p.x-ox,game.p.z-oz));
 for(const event of game.events){audio.foley(event.type);view.impact(event);}game.events=[];
 audio.update(game.phase==='drive'?3:game.phase==='escape'?2:1,game.mode);
 if(before!==game.mode)clear();hud();view.update(game,dt);
}
window.render_game_to_text=()=>JSON.stringify({...game.state(),rendering:view?{calls:view.renderer.info.render.calls,triangles:view.renderer.info.render.triangles,camera:view.camera.position.toArray(),fps}:null});
window.advanceTime=ms=>{manual=true;for(let i=0;i<Math.ceil(ms/16.667);i++)step(1/60);};
async function init(){
 try{
  view=await buildLine($('viewport'),low);window.addEventListener('resize',()=>view.resize());
  view.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();graphicsLost=true;clear();game.mode='paused';$('pause-screen').querySelector('h2').textContent='Graphics interrupted';$('resume').textContent='Reload game';panels();});
  $('start').disabled=false;$('start').textContent='PLAY · At the line';$('loading').textContent='Ready. One complete rescue-and-escape encounter.';view.update(game,.016);
  requestAnimationFrame(function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(!manual)step(dt);fpsFrames++;if(now-fpsTime>1000){fps=fpsFrames*1000/(now-fpsTime);fpsFrames=0;fpsTime=now;}$('debug').textContent=`${Math.round(fps)} FPS · ${view.renderer.info.render.calls} draws · ${Math.round(view.renderer.info.render.triangles/1000)}k tris`;requestAnimationFrame(frame);});
 }catch(e){console.error(e);$('loading').textContent='Could not load the encounter. Please reload or use Mobile / lighter graphics.';$('start').textContent='Loading failed';}
}
init();
