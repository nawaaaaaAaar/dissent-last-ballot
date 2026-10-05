import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const base=process.env.DISSENT_URL||'http://127.0.0.1:5173/';
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
const checks=[],errors=[];
const state=p=>p.evaluate(()=>JSON.parse(render_game_to_text()));
const tick=(p,ms)=>p.evaluate(ms=>advanceTime(ms),ms);
async function ready(ctx){
  const p=await ctx.newPage();p.setDefaultTimeout(30000);p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+(base.includes('?')?'&':'?')+'quality=low&qa=street',{waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>typeof render_game_to_text==='function',null,{timeout:120000});await tick(p,0);return p;
}
async function slow(p){if(await p.locator('#sprint').evaluate(e=>e.classList.contains('active')))await p.locator('#sprint').click();}
async function walk(p,x,z){
  for(let i=0;i<40;i++){
    const v=await state(p),dx=x-v.position.x,dz=z-v.position.z;if(Math.hypot(dx,dz)<.35)return;
    // Rally is a real control used to avoid close pursuit during the route.
    if(v.police.some(a=>Math.hypot(a.x-v.position.x,a.z-v.position.z)<4)&&v.street.cooldown===0&&v.street.energy>=30)await p.keyboard.press('f');
    const k=Math.abs(dx)>.25?(dx>0?'d':'a'):(dz>0?'s':'w'),d=Math.abs(dx)>.25?Math.abs(dx):Math.abs(dz);
    await p.keyboard.down(k);await tick(p,Math.min(8000,d/2.6*1000));await p.keyboard.up(k);
    assert.equal((await state(p)).mode,'playing',JSON.stringify(await state(p)));
  }throw Error('Blocked route '+x+','+z+' '+JSON.stringify(await state(p)));
}
async function use(p,id,ms=0){
  await tick(p,0);assert.equal((await state(p)).near,id);
  await p.keyboard.down('e');await tick(p,ms);await p.keyboard.up('e');
  assert.notEqual((await state(p)).mode,'review','No mandatory quiz should open');
}
try{
  await mkdir('qa/v11',{recursive:true});
  const ctx=await browser.newContext({viewport:{width:1280,height:800}}),p=await ready(ctx);
  await p.locator('#start').click();await tick(p,0);await slow(p);assert.equal((await state(p)).action.active,true);
  const before=await state(p);await p.keyboard.press('f');const after=await state(p);
  assert.equal(after.street.pulses,1);assert.equal(after.street.energy,before.street.energy-30);
  assert(after.officers.some(a=>a.stun>0));assert(after.police.some((a,i)=>Math.hypot(a.x-before.police[i].x,a.z-before.police[i].z)>1));
  await p.keyboard.press('f');assert.equal((await state(p)).street.pulses,1);
  await p.screenshot({path:'qa/v11/rally.png'});checks.push('Rally costs energy, creates actual space/stun and cannot bypass cooldown');
  await walk(p,-3,31);await walk(p,-3,24);await use(p,'organiser',1100);
  assert((await state(p)).action.rescued.includes('organiser'));assert.equal((await state(p)).electoral.reviewed.length,0);
  await walk(p,3,24.2);
  await p.keyboard.down('Shift');await p.keyboard.press('Space');await p.keyboard.down('w');await tick(p,800);await p.keyboard.up('w');await p.keyboard.up('Shift');
  assert((await state(p)).position.z<22.2,JSON.stringify(await state(p)));
  checks.push('Live help replaces quiz; actual sprint-jump clears a physical hurdle');
  await walk(p,3,16);assert.equal((await state(p)).street.packets.length,1);
  await walk(p,3,7);await walk(p,-20,7);assert.equal((await state(p)).street.packets.length,2);
  await walk(p,4.4,7);await walk(p,4.4,-14);await walk(p,3,-14);assert.equal((await state(p)).street.packets.length,3);await use(p,'recorder');
  await walk(p,0,-14);await walk(p,0,-29.6);await walk(p,-3,-29.6);await use(p,'barrier',2000);
  await walk(p,-6,-29.6);await walk(p,-6,-36);await use(p,'companion');await walk(p,-2,-36);await walk(p,-2,-45);await use(p,'assembly');
  assert.equal((await state(p)).mode,'won');await p.screenshot({path:'qa/v11/jantar-ending.png'});
  checks.push('Auto-pickup packets, recorder, breakthrough, companion and Jantar completion with zero case quizzes');
  await p.locator('#next-district').click();await slow(p);
  await walk(p,-18,31);await walk(p,-18,20);await use(p,'organiser',1100);
  await walk(p,18,20);await walk(p,18,16);await use(p,'companion');
  await walk(p,20.2,16);await walk(p,20.2,-23);await walk(p,0,-23);assert.equal((await state(p)).street.packets.length,3);
  await walk(p,0,-29.6);
  for(let i=0;i<15;i++){const v=await state(p);if(v.party.every(a=>Math.hypot(a.x-v.position.x,a.z-v.position.z)<6))break;await tick(p,300);}
  await use(p,'barrier',2000);await walk(p,0,-43);
  for(let i=0;i<15;i++){if((await state(p)).party.every(a=>Math.hypot(a.x,a.z+43)<6))break;await tick(p,300);}
  await use(p,'assembly');assert.equal((await state(p)).mode,'won');checks.push('Packet route and obstacle-aware two-person escort complete without mandatory reading');
  await p.locator('#next-district').click();await slow(p);
  await walk(p,-18,31);await walk(p,-18,18);await use(p,'organiser',1100);
  await walk(p,-18,12);await walk(p,18,12);await walk(p,18,5);await use(p,'aid',1100);
  await walk(p,4,5);await walk(p,4,-18);await walk(p,-18,-18);await use(p,'protest',1100);
  assert.equal((await state(p)).street.packets.length,3);const outside=(await state(p)).action.settle;await tick(p,1000);assert.equal((await state(p)).action.settle,outside);
  await walk(p,-6,-18);await walk(p,-6,-36);await p.screenshot({path:'qa/v11/gathering-zone.png'});
  for(let i=0;i<4&&(await state(p)).action.settle<20;i++){await walk(p,6,-36);await walk(p,-6,-36);}
  assert.equal((await state(p)).action.settle,20);await walk(p,0,-36);await use(p,'assembly');
  assert.equal((await state(p)).mode,'won');assert.equal(Object.keys((await state(p)).campaign).length,3);
  assert.deepEqual((await state(p)).electoral.mandate,['accountability','sir','inclusion']);
  await p.screenshot({path:'qa/v11/campaign-ending.png'});checks.push('Sustain progresses only inside the gathering; full campaign ends with no required charter quiz');
  await p.reload({waitUntil:'domcontentloaded'});await p.waitForFunction(()=>typeof render_game_to_text==='function',null,{timeout:120000});await tick(p,0);
  assert.equal(Object.keys((await state(p)).campaign).length,3);await p.locator('#city-map-start').click();await p.locator('#play-jantar').click();await slow(p);
  await walk(p,0,16);await walk(p,3,16);assert.equal((await state(p)).street.packets.length,1);
  await tick(p,30000);assert.equal((await state(p)).mode,'caught');assert.equal((await state(p)).street.chain,0);
  await p.locator('#retry').click();assert.equal((await state(p)).mode,'playing');assert.equal((await state(p)).street.packets.length,1);
  await p.keyboard.press('j');await p.locator('#case-organiser').click();assert.equal((await state(p)).mode,'review');
  await p.locator('#review-include').click();assert.equal((await state(p)).mode,'journal');assert.equal((await state(p)).electoral.reviewed.length,1);
  const optionalScore=(await state(p)).action.score;await p.locator('#case-organiser').click();assert.equal((await state(p)).mode,'journal');assert.equal((await state(p)).action.score,optionalScore);
  await p.locator('#journal-close').click();await p.locator('#pause').click();const t=(await state(p)).action.time;await tick(p,3000);assert.equal((await state(p)).action.time,t);await p.locator('#resume').click();
  checks.push('Saved campaign, replay/reset, deliberate capture/retry keeps packet, damage clears chain, optional case cannot be farmed, pause/resume');
  const mc=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),m=await ready(mc),cdp=await mc.newCDPSession(m);
  await m.locator('#start').tap();await tick(m,0);assert.equal(await m.locator('#sprint').isVisible(),false);assert.equal(await m.locator('#rally-power').isVisible(),true);
  await m.locator('#rally-power').tap();assert.equal((await state(m)).street.pulses,1);assert((await state(m)).officers.some(a=>a.stun>0));
  const jr=await m.locator('#joystick').boundingBox();
  const move=async(dx,dy,ms)=>{
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:jr.x+jr.width/2,y:jr.y+jr.height/2}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:jr.x+jr.width/2+dx,y:jr.y+jr.height/2+dy}]});await tick(m,ms);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  };
  await move(0,-20,1000);const w=(await state(m)).position.z;await move(0,-38,1000);const r=(await state(m)).position.z;assert(31-w<w-r);
  await m.locator('#evade').tap();const z=(await state(m)).position.z;await tick(m,350);assert((await state(m)).position.z<z);await tick(m,500);
  await m.locator('#jump').tap();await tick(m,100);assert((await state(m)).position.y>0);await tick(m,700);
  await m.locator('#pause').tap();await m.locator('#resume').tap();await m.screenshot({path:'qa/v11/mobile.png'});
  await m.locator('#journal').tap();await m.locator('#play-shaheen').tap();await m.setViewportSize({width:844,height:390});await m.waitForTimeout(300);await tick(m,0);
  assert(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await m.screenshot({path:'qa/v11/landscape.png'});
  checks.push('Actual mobile Rally, walk/run, moving dodge, jump, pause/resume and district switch; portrait/landscape fit');
  assert.deepEqual(errors,[]);
  await writeFile('qa/v11/results.json',JSON.stringify({version:'0.10',pass:true,checks,errors,physicalPhoneTested:false,humanEnjoymentTested:false},null,2));console.log(JSON.stringify({pass:true,checks,errors}));
}finally{await browser.close();}
