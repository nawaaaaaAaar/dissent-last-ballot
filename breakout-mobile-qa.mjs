import {chromium} from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const out='qa/v12';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
const page=await context.newPage(),cdp=await context.newCDPSession(page),errors=[],log=[];
page.on('pageerror',e=>errors.push(e.message));
const base=process.env.DISSENT_URL||'http://127.0.0.1:5173/';
try{
 await page.goto(base+(base.includes('?')?'&':'?')+'quality=low&qa=mobile-v12');
 await page.waitForFunction(()=>typeof render_game_to_text==='function',null,{timeout:120000});
 const tick=async ms=>page.evaluate(ms=>advanceTime(ms),ms);
 const state=async()=>JSON.parse(await page.evaluate(()=>render_game_to_text()));
 const touch=async(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});
 const rect=async sel=>{await page.locator(sel).scrollIntoViewIfNeeded();return page.locator(sel).boundingBox();};
 const tap=async sel=>{const r=await rect(sel);assert(r);await touch('touchStart',[{x:r.x+r.width/2,y:r.y+r.height/2,id:1}]);await touch('touchEnd',[]);await tick(0);};
 const held=async(sel,x,z,ms)=>{const r=await rect(sel),p={x:r.x+r.width/2+x*r.width*.36,y:r.y+r.height/2+z*r.width*.36,id:1};await touch('touchStart',[p]);await tick(ms);await touch('touchEnd',[]);await tick(0);};
 const rec=async name=>{const s=await state();log.push({name,state:s});console.log(name,s.mode,s.player.x.toFixed(1),s.player.z.toFixed(1),s.heat,s.van.health);return s;};
 await tick(0);await tap('#tutorial');assert.equal((await state()).mode,'help');await tap('#help-close');await tap('#start');
 // Actual right-stick combat, followed by a dodge, before a fresh mission.
 await held('#move-stick',0,-1,1500);await tick(400);
 let s=await state(),e=s.enemies.filter(e=>e.hp>0).sort((a,b)=>Math.hypot(a.x-s.player.x,a.z-s.player.z)-Math.hypot(b.x-s.player.x,b.z-s.player.z))[0];
 const dx=e.x-s.player.x,dz=e.z-s.player.z,d=Math.hypot(dx,dz);assert(d<2.9,'close-range setup through movement');
 await held('#aim-stick',dx/d,dz/d,550);assert((await state()).enemies.find(p=>p.id===e.id).hp<e.hp);
 await tap('#dash');await tick(100);assert((await state()).player.dashCd>0);
 await rec('Right-stick melee hit and touch dodge');
 await tap('#pause');await tap('#restart');
 await held('#move-stick',0,-1,3660);
 for(let j=0;j<4;j++){await tap('#strike');await tick(520);}
 assert.equal((await state()).gate.hp,0);
 await held('#move-stick',0,-1,1700);
 for(let j=0;j<18;j++){await tap('#strike');await tick(480);if((await state()).near?.id==='rescue')await tap('#action');if((await state()).friend.rescued)break;}
 assert((await state()).friend.rescued);await rec('Touch rescue');
 async function footTo(x,z){
  for(let j=0;j<50;j++){const s=await state(),dx=x-s.player.x,dz=z-s.player.z;if(Math.hypot(dx,dz)<.5)break;
   const useX=Math.abs(dx)>Math.abs(dz),v=useX?dx:dz;await held('#move-stick',useX?Math.sign(v)*.6:0,useX?0:Math.sign(v)*.6,Math.min(400,Math.abs(v)/2.52*1000));
  }
 }
 await footTo(-2,6);await footTo(0,0);await footTo(10,0);await footTo(10,-4);await tick(500);await tap('#action');assert((await state()).van.occupied);
 await rec('Touch boarding');await page.screenshot({path:out+'/mobile-portrait.png'});
 await page.setViewportSize({width:844,height:390});await tick(0);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.screenshot({path:out+'/mobile-landscape.png'});
 // Destroy the van by driving into the north building: normal input, not health editing.
 await held('#move-stick',0,-1,22000);assert.equal((await state()).mode,'caught');await tap('#retry');
 s=await state();assert(s.van.occupied&&s.friend.aboard&&s.record&&s.van.health===100);await rec('Touch vehicle failure and checkpoint');
 async function driveAxis(axis,value){
  let s=await state();const sign=Math.sign(value-s.van[axis]),r=await rect('#move-stick');
  const p={x:r.x+r.width/2+(axis==='x'?sign*r.width*.36:0),y:r.y+r.height/2+(axis==='z'?sign*r.width*.36:0),id:1};
  await touch('touchStart',[p]);
  for(let j=0;j<100;j++){s=await state();if(s.mode!=='playing'||sign*(value-s.van[axis])<Math.max(1,s.van.speed/7))break;await tick(100);}
  await touch('touchEnd',[]);await held('#dash',0,0,450);
 }
 await driveAxis('x',34);await driveAxis('z',-32);await driveAxis('x',-34);await driveAxis('z',-48);await tick(4000);await rec('Touch mission complete');
 assert.equal((await state()).mode,'won');assert.equal(errors.length,0);
 await page.screenshot({path:out+'/mobile-ending.png'});fs.writeFileSync(out+'/mobile-results.json',JSON.stringify({passed:true,errors,log},null,2));
}catch(e){console.error(e);log.push({error:e.message});fs.writeFileSync(out+'/mobile-results.json',JSON.stringify({passed:false,errors,log},null,2));await page.screenshot({path:out+'/mobile-failure.png'});process.exitCode=1;}
finally{await browser.close();}
