import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {ActionGame} from './docs/action-game.js';
import {CASES} from './docs/electoral-story.js';
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const base=process.env.DISSENT_URL||'http://127.0.0.1:5173/';
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
const errors=[],checks=[];
const state=p=>p.evaluate(()=>JSON.parse(render_game_to_text()));
const tick=(p,ms)=>p.evaluate(ms=>advanceTime(ms),ms);
async function ready(ctx){
  const p=await ctx.newPage();p.setDefaultTimeout(30000);p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+(base.includes('?')?'&':'?')+'quality=low&qa=campaign',{waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>typeof advanceTime==='function',{timeout:120000});await tick(p,0);return p;
}
async function walk(p,x,z){
  for(let i=0;i<35;i++){
    const v=(await state(p)).position,dx=x-v.x,dz=z-v.z;
    if(Math.hypot(dx,dz)<.4)return;
    const k=Math.abs(dx)>.28?(dx>0?'d':'a'):(dz>0?'s':'w'),d=Math.abs(dx)>.28?Math.abs(dx):Math.abs(dz);
    await p.keyboard.down(k);await tick(p,Math.min(12000,d/2.6*1000));await p.keyboard.up(k);
    if((await state(p)).mode==='caught'){throw Error('captured during route '+JSON.stringify(await state(p)));}
  }throw Error('route blocked '+x+','+z+' '+JSON.stringify(await state(p)));
}
async function use(p,id,hold=0){
  await tick(p,0);assert.equal((await state(p)).near,id);
  await p.keyboard.down('e');if(hold)await tick(p,hold);await p.keyboard.up('e');await tick(p,0);
  if((await state(p)).mode==='review'){
    const v=await state(p);assert.equal(v.electoral.activeCase,id);
    const paused=v.action.time;await tick(p,2000);assert.equal((await state(p)).action.time,paused);
    if(v.district==='jantar'&&id==='organiser'){
      await p.locator('#review-duplicate').click();assert.equal((await state(p)).mode,'review');assert.equal((await state(p)).electoral.reviewed.length,0);
      await p.screenshot({path:'qa/v09/case-feedback.png'});
      await p.locator('#review-back').click();assert.equal((await state(p)).electoral.reviewed.length,0);
      await p.keyboard.down('e');await tick(p,1100);await p.keyboard.up('e');assert.equal((await state(p)).mode,'review');
    }
    await p.locator('#review-'+CASES[v.district][id].answer).click();assert.equal((await state(p)).mode,'playing');
  }
}
async function noAutoRun(p){if(await p.locator('#sprint').evaluate(e=>e.classList.contains('active')))await p.locator('#sprint').click();}
try{
  await mkdir('qa/v09',{recursive:true});
  const ctx=await browser.newContext({viewport:{width:1280,height:800}}),p=await ready(ctx);
  await p.locator('#city-map-start').click();assert.equal((await state(p)).mode,'citymap');
  await p.screenshot({path:'qa/v09/city-map.png'});await p.locator('#play-jantar').click();await noAutoRun(p);
  await walk(p,3,31);await walk(p,3,-14);await use(p,'recorder');
  await walk(p,-3,-14);await walk(p,-3,24);await use(p,'organiser',1100);
  await walk(p,-3,5);await walk(p,-23,5);await use(p,'aid',1100);
  await walk(p,-18,5);await walk(p,-18,-7);await use(p,'protest',1100);await walk(p,-3,-7);
  await walk(p,-3,-14);await walk(p,-3,-29.6);await use(p,'barrier',2000);await tick(p,500);
  await walk(p,-6,-29.6);await walk(p,-6,-36);await use(p,'companion');await walk(p,-2,-36);await walk(p,-2,-45);await use(p,'assembly');
  assert.equal((await state(p)).mode,'won');assert((await state(p)).campaign.jantar);
  assert.equal((await state(p)).electoral.reviewed.length,3);
  checks.push('Jantar: three correct referrals, wrong-answer feedback, cancel without completion, paused review, breakthrough and saved chapter');
  await p.locator('#next-district').click();await tick(p,0);await noAutoRun(p);
  assert.equal((await state(p)).district,'jamia');await p.screenshot({path:'qa/v09/jamia-arrival.png'});
  await walk(p,-18,31);await walk(p,-18,20);await use(p,'organiser',1100);
  await walk(p,-8,20);await walk(p,18,20);await walk(p,18,16);await use(p,'companion');
  assert.equal((await state(p)).companion,true);
  await walk(p,18,20);await walk(p,-24,20);await walk(p,-24,-5);await walk(p,-22,-5);await use(p,'aid',1100);
  await walk(p,-24,-5);await walk(p,-24,-21);await walk(p,22,-21);await walk(p,22,-16);await walk(p,18,-16);await use(p,'protest',1100);
  // Take the east lane, then cross below the student-centre block.
  await walk(p,22,-16);await walk(p,22,-21);await walk(p,0,-21);await walk(p,0,-29.6);
  // Companions must route around buildings; wait while advancing safely near the gate.
  for(let i=0;i<12;i++){
    const v=await state(p);if(v.party.every(a=>Math.hypot(a.x-v.position.x,a.z-v.position.z)<6))break;
    await tick(p,500);
  }
  assert((await state(p)).party.every(a=>Math.hypot(a.x,a.z+29.6)<6),JSON.stringify(await state(p)));
  await use(p,'barrier',2000);assert((await state(p)).tasks.barrier);
  await walk(p,0,-43);
  for(let i=0;i<14;i++){if((await state(p)).party.every(a=>Math.hypot(a.x,a.z+43)<6))break;await tick(p,400);}
  await use(p,'assembly');assert.equal((await state(p)).mode,'won');
  assert.equal((await state(p)).electoral.reviewed.length,3);
  await p.screenshot({path:'qa/v09/jamia-ending.png'});checks.push('Bihar help camp: omitted, first-time and duplicate referrals; two companions finish together');
  await p.locator('#next-district').click();await tick(p,0);await noAutoRun(p);
  assert.equal((await state(p)).district,'shaheen');await p.screenshot({path:'qa/v09/shaheen-arrival.png'});
  assert.equal((await state(p)).action.support,1);
  await walk(p,-18,31);await walk(p,-18,18);await use(p,'organiser',1100);
  await walk(p,-5,18);await walk(p,18,18);await walk(p,18,5);await use(p,'aid',1100);
  await walk(p,4,5);await walk(p,4,-18);await walk(p,-18,-18);await use(p,'protest',1100);
  assert.equal((await state(p)).action.rescued.length,3);
  // Keep moving in the clear southern plaza while the supported gathering settles.
  await walk(p,-4,-18);await walk(p,-4,-36);await walk(p,10,-36);await walk(p,10,-44);await walk(p,-8,-44);
  assert.equal((await state(p)).action.settle,20);
  await walk(p,0,-44);await walk(p,0,-36);await use(p,'assembly');assert.equal((await state(p)).mode,'charter');
  assert.equal(Object.keys((await state(p)).campaign).length,3);
  await p.locator('#demand-accountability').check();await p.locator('#charter-confirm').click();assert.equal((await state(p)).mode,'charter');
  await p.screenshot({path:'qa/v09/charter-incomplete.png'});
  await p.locator('#demand-sir').check();await p.locator('#demand-inclusion').check();await p.locator('#charter-confirm').click();
  assert.equal((await state(p)).mode,'won');assert.equal((await state(p)).electoral.mandate.length,3);
  await p.screenshot({path:'qa/v09/campaign-ending.png'});checks.push('Bengal help camp: appeal/inclusion/new-voter files, sustain, resignation-only charter rejected, all three commitments finish');
  await p.reload({waitUntil:'domcontentloaded'});await p.waitForFunction(()=>typeof advanceTime==='function',{timeout:120000});await tick(p,0);
  assert.equal(Object.keys((await state(p)).campaign).length,3);await p.locator('#city-map-start').click();await p.locator('#play-jamia').click();
  assert.equal((await state(p)).action.rescued.length,0);assert.equal((await state(p)).companion,false);
  await noAutoRun(p);await walk(p,-3,31);const resumePosition=(await state(p)).position;
  await p.locator('#pause').click();await p.locator('#title').click();assert.equal((await state(p)).mode,'menu');
  await p.locator('#start').click();assert.deepEqual((await state(p)).position,resumePosition);
  checks.push('reload restores completed districts; replay resets mission; title Resume retains current in-session position');
  const mc=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),m=await ready(mc);
  await m.locator('#city-map-start').tap();await m.locator('#play-jamia').tap();await tick(m,0);
  assert.equal(await m.locator('#sprint').isVisible(),false);
  const cdp=await mc.newCDPSession(m),r=await m.locator('#joystick').boundingBox();
  const move=async(dx,dy,ms)=>{
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width/2,y:r.y+r.height/2}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:r.x+r.width/2+dx,y:r.y+r.height/2+dy}]});
    await tick(m,ms);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  };
  await move(0,-20,1000);const walkZ=(await state(m)).position.z;
  await move(0,-38,1000);const runZ=(await state(m)).position.z;
  assert(31-walkZ<walkZ-runZ);assert((await state(m)).action.stamina<100);
  await m.locator('#evade').tap();assert((await state(m)).action.dodge>0);await m.locator('#pause').tap();assert.equal((await state(m)).mode,'paused');await m.locator('#resume').tap();
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:330,y:410}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:300,y:420}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await tick(m,0);assert.notEqual((await state(m)).cameraYaw,0);
  await m.screenshot({path:'qa/v09/mobile-campus.png'});
  await m.locator('#journal').tap();await m.locator('#play-jamia').tap();
  await move(-20,0,18/(2.6*20/38)*1000);await move(0,-20,11/(2.6*20/38)*1000);
  assert.equal((await state(m)).near,'organiser');const ir=await m.locator('#interact').boundingBox();
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:ir.x+ir.width/2,y:ir.y+ir.height/2}]});await tick(m,1100);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal((await state(m)).mode,'review');
  await m.screenshot({path:'qa/v09/mobile-case.png'});await m.locator('#review-appeal').tap();assert.equal((await state(m)).mode,'review');
  await m.locator('#review-include').tap();assert.equal((await state(m)).mode,'playing');assert.equal((await state(m)).electoral.reviewed.length,1);
  await m.locator('#journal').tap();assert.equal((await state(m)).mode,'citymap');await m.locator('#play-shaheen').tap();await tick(m,0);
  await m.locator('#journal').tap();await m.locator('#city-journal').tap();assert.equal((await state(m)).mode,'journal');
  await m.locator('#journal-close').tap();assert.equal((await state(m)).mode,'citymap');await m.locator('#city-close').tap();
  await m.setViewportSize({width:844,height:390});await m.waitForTimeout(500);await tick(m,0);await m.screenshot({path:'qa/v09/mobile-market-landscape.png'});
  assert(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  checks.push('mobile joystick walk/run, dodge, pause, camera, held review, incorrect/correct touch referral, map/journal, portrait/landscape fit');
  let failures=0;
  const rule=new ActionGame(new THREE.Scene(),{tone:()=>{},toast:()=>{},fail:()=>failures++});
  rule.support=1;rule.health=1;rule.damage({});assert.equal(rule.health,2);assert.equal(rule.support,0);assert.equal(failures,0);
  rule.hurt=0;rule.health=1;rule.damage({});assert.equal(failures,1);
  checks.push('campaign help grants next-mission support; isolated damage-rule test consumes it once, not indefinitely');
  assert.deepEqual(errors,[]);
  await writeFile('qa/v09/results.json',JSON.stringify({version:'0.9',pass:true,checks,errors,physicalPhoneTested:false,humanEnjoymentTested:false},null,2));
  console.log(JSON.stringify({pass:true,checks,errors}));
}finally{await browser.close();}
