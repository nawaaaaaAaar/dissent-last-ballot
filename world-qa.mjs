import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const root=new URL('./qa/',import.meta.url);
await mkdir(root,{recursive:true});
const base=process.env.DISSENT_URL||'http://127.0.0.1:5173/';
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
const errors=[],checks=[];
const state=p=>p.evaluate(()=>JSON.parse(render_game_to_text()));
const tick=(p,ms)=>p.evaluate(ms=>advanceTime(ms),ms);
async function ready(ctx){
  const p=await ctx.newPage();p.setDefaultTimeout(15000);
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+(base.includes('?')?'&':'?')+'quality=low&qa=world',{waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>typeof advanceTime==='function',{timeout:90000});
  await tick(p,0);return p;
}
async function shot(p,name){await p.screenshot({path:new URL(name,root).pathname});}
async function walk(p,x,z){
  for(let i=0;i<16;i++){
    const v=(await state(p)).position,dx=x-v.x,dz=z-v.z;
    if(Math.hypot(dx,dz)<.5)return;
    const k=Math.abs(dx)>.28?(dx>0?'d':'a'):(dz>0?'s':'w');
    const distance=Math.abs(dx)>.28?Math.abs(dx):Math.abs(dz);
    await p.keyboard.down(k);await tick(p,Math.min(14000,distance/1.8*1000));await p.keyboard.up(k);
  }
  throw Error(`Could not walk to ${x},${z}: ${JSON.stringify(await state(p))}`);
}
async function interact(p,id){
  await tick(p,0);assert.equal((await state(p)).near,id);
  await p.keyboard.press('e');assert.equal((await state(p)).dialog,id);
  await p.locator('#dialog-confirm').click();await tick(p,16);
  if(id==='barrier'){
    assert.equal((await state(p)).mode,'rally');
    await p.locator('#pause').click();assert.equal((await state(p)).mode,'paused');
    await tick(p,700);await p.locator('#resume').click();assert.equal((await state(p)).mode,'rally');
    await p.keyboard.press('e');assert.equal((await state(p)).rally.hits,0);
    for(let i=0;i<3;i++){await tick(p,500);await p.keyboard.press('e');}
    await tick(p,16);
  }
  if(id==='companion')assert.equal((await state(p)).companion,true);
  else assert.equal((await state(p)).tasks[id],true);
  console.log('Completed encounter:',id);
}
async function pickup(p,id){
  await tick(p,0);assert.equal((await state(p)).near,id);
  await p.keyboard.press('e');await tick(p,0);assert((await state(p)).items.includes(id));
}
async function supplies(p){
  await walk(p,-8,18);await walk(p,-25,18);await pickup(p,'water1');
  await walk(p,-16,18);await walk(p,-16,15);await pickup(p,'water0');
  await walk(p,-15,15);await walk(p,-15,-3);await pickup(p,'water2');
}
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:800}});
  const p=await ready(ctx);await shot(p,'world-final-title.png');
  await p.locator('#story-start').click();await tick(p,0);await shot(p,'world-final-street.png');
  await p.keyboard.press('Space');await tick(p,180);assert((await state(p)).position.y>0);await tick(p,700);
  await p.locator('#pause').click();const paused=(await state(p)).position;
  await p.keyboard.down('w');await tick(p,500);await p.keyboard.up('w');
  assert.deepEqual((await state(p)).position,paused);await p.locator('#resume').click();
  checks.push('jump and pause/resume preserve position');
  await walk(p,-3,24);await interact(p,'organiser');
  await walk(p,-9,24);await walk(p,-9,13);await pickup(p,'note0');
  await p.keyboard.press('j');assert.equal((await state(p)).mode,'journal');
  await p.locator('#assist-game').uncheck();assert.equal(await p.locator('#storymode').isChecked(),false);
  await p.locator('#assist-game').check();await p.locator('#journal-close').click();
  assert.equal((await state(p)).notes,1);
  await p.reload({waitUntil:'domcontentloaded'});await p.waitForFunction(()=>typeof render_game_to_text==='function',{timeout:90000});await tick(p,0);
  await p.locator('#continue').click();await tick(p,0);
  assert.equal((await state(p)).tasks.organiser,true);assert.equal((await state(p)).notes,1);
  checks.push('optional fragment, journal assist adjustment and local checkpoint after reload');
  await supplies(p);assert.equal((await state(p)).inventory.water,3);
  await walk(p,-23,5);
  await shot(p,'world-final-aid.png');await interact(p,'aid');
  await walk(p,-18,5);await walk(p,-18,-7);
  await p.keyboard.press('e');await p.locator('#dialog-confirm').click();await tick(p,0);
  assert.equal((await state(p)).solidarity,3);checks.push('optional protest event');
  await walk(p,-8,-7);await walk(p,3,-7);await walk(p,3,-14);await pickup(p,'recorder');
  await walk(p,-4,-14);await walk(p,-4,-20);await interact(p,'witness');
  await walk(p,-3,-29.6);await shot(p,'world-final-barricade.png');await interact(p,'barrier');
  await tick(p,20000);assert.equal((await state(p)).mode,'caught');
  await p.locator('#retry').click();await tick(p,0);
  assert.equal((await state(p)).tasks.barrier,true);checks.push('capture and story checkpoint recovery');
  await walk(p,-6,-29.6);await walk(p,-6,-36);await interact(p,'companion');
  await walk(p,-2,-36);
  await p.keyboard.down('Shift');await p.keyboard.down('w');await tick(p,1957);await p.keyboard.up('w');await p.keyboard.up('Shift');
  assert.equal((await state(p)).near,'assembly');await interact(p,'assembly');
  assert.equal((await state(p)).mode,'won');await shot(p,'world-final-ending.png');
  checks.push('supplies, recorder recovery, rhythm misses/hits, companion help and public-story ending');
  await p.locator('#again').click();await tick(p,0);assert.equal((await state(p)).tasks.organiser,false);
  await p.mouse.move(900,450);await p.mouse.down();await p.mouse.move(1000,450,{steps:3});await p.mouse.up();assert.notEqual((await state(p)).cameraYaw,0);
  checks.push('restart clears story; orbit camera changes heading');
  await p.locator('#pause').click();await p.locator('#restart').click();await tick(p,0);
  await walk(p,-3,24);await interact(p,'organiser');await supplies(p);await walk(p,-23,5);await interact(p,'aid');
  await walk(p,-8,5);await walk(p,3,5);await walk(p,3,-14);await pickup(p,'recorder');
  await walk(p,-4,-14);await walk(p,-4,-20);await p.keyboard.press('e');await p.locator('#dialog-alt').click();assert.equal((await state(p)).choice,'archive');
  await walk(p,-3,-29.6);await p.keyboard.press('e');await p.locator('#dialog-confirm').click();await p.locator('#rally-skip').click();await tick(p,0);
  await p.keyboard.down('Shift');await p.keyboard.down('s');await tick(p,4913);await p.keyboard.up('s');await p.keyboard.down('a');await tick(p,4565);await p.keyboard.up('a');await p.keyboard.up('Shift');
  assert.equal((await state(p)).near,'record');await p.keyboard.press('e');await p.locator('#dialog-confirm').click();await tick(p,0);
  assert.equal((await state(p)).mode,'won');await shot(p,'world-archive-ending.png');
  assert.equal((await state(p)).companion,false);checks.push('protected-record branch, assist rhythm skip and companion-absent ending');
  await p.locator('#again').click();await tick(p,0);await p.keyboard.press('j');assert.equal((await state(p)).mode,'journal');await p.keyboard.press('j');assert.equal((await state(p)).mode,'playing');
  checks.push('journal open/close');
  const desktop=await state(p);await ctx.close();
  const mobileCtx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  const m=await ready(mobileCtx);await shot(m,'world-mobile-title.png');await m.locator('#story-start').tap();await tick(m,0);
  const session=await mobileCtx.newCDPSession(m);
  const r=await m.locator('#joystick').boundingBox(),cx=r.x+r.width/2,cy=r.y+r.height/2;
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx,y:cy,id:1}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx,y:cy-38,id:1}]});
  await tick(m,1200);await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert((await state(m)).position.z<30);
  await m.locator('#sound').tap();assert.equal((await state(m)).sound,true);
  await m.locator('#jump').tap();await tick(m,180);assert((await state(m)).position.y>0);await tick(m,700);
  await m.locator('#sprint').tap();assert(await m.locator('#sprint').evaluate(e=>e.classList.contains('active')));
  await m.locator('#pause').tap();assert.equal((await state(m)).mode,'paused');await m.locator('#resume').tap();
  await shot(m,'world-mobile-portrait.png');
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:300,y:430,id:2}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:250,y:430,id:2}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.notEqual((await state(m)).cameraYaw,0);
  await m.setViewportSize({width:844,height:390});await m.waitForTimeout(300);await tick(m,0);await shot(m,'world-mobile-landscape.png');
  assert(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  checks.push('real touch joystick, camera drag, jump, run, sound after swipe, pause/resume; portrait and landscape fit');
  const mobile=await state(m);assert.deepEqual(errors,[]);
  await writeFile(new URL('world-results.json',root),JSON.stringify({version:'0.6',pass:true,checks,errors,desktop,mobile,physicalDeviceTested:false,humanEnjoymentTested:false},null,2));
  console.log(JSON.stringify({pass:true,checks,errors}));
}finally{await browser.close();}
