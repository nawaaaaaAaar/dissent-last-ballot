import {chromium} from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const out='qa/v12';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:800}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base=process.env.DISSENT_URL||'http://127.0.0.1:5173/';
const log=[];
try{
 await page.goto(base+(base.includes('?')?'&':'?')+'quality=low&qa=v12');
 await page.waitForFunction(()=>typeof render_game_to_text==='function',null,{timeout:120000});
 const tick=async ms=>page.evaluate(ms=>advanceTime(ms),ms);
 const state=async()=>JSON.parse(await page.evaluate(()=>render_game_to_text()));
 const key=async(k,ms=0)=>{await page.keyboard.down(k);await tick(ms);await page.keyboard.up(k);};
 const record=async name=>{const s=await state();log.push({name,state:s});console.log(name,JSON.stringify({mode:s.mode,p:s.player,gate:s.gate,friend:s.friend,heat:s.heat,seen:s.seen,van:s.van}));return s;};
 await tick(0);await page.locator('#start').click();await tick(0);
 await page.locator('#pause').click();const t=(await state()).time;await tick(1000);assert.equal((await state()).time,t);
 await page.locator('#pause-help').click();await page.locator('#help-close').click();assert.equal((await state()).mode,'paused');await page.locator('#resume').click();
 // Keyboard only: sprint down the centre street, strike the barrier, rescue and board.
 await page.keyboard.down('Shift');await key('w',3660);await page.keyboard.up('Shift');await record('Approaching barricade');
 for(let j=0;j<4;j++)await key('Space',520);
 await record('Barrier strikes');
 await page.keyboard.down('Shift');await key('w',1700);await page.keyboard.up('Shift');
 await record('At rescue');
 // Fight nearby guards without teleporting or editing rules.
 for(let j=0;j<18;j++){await key('Space',480);await key('e');if((await state()).friend.rescued)break;}
 await record('Rescue attempted');
 const s=await state();assert(s.friend.rescued,'Kabir must be rescued through actual input');
 // Return to recording at x -2,z6.
 async function footTo(x,z){
  for(let j=0;j<15;j++){const s=await state();if(s.mode!=='playing')break;const dx=x-s.player.x,dz=z-s.player.z;if(Math.hypot(dx,dz)<.6)break;
   const k=Math.abs(dx)>Math.abs(dz)?dx>0?'d':'a':dz>0?'s':'w';await key(k,Math.min(400,Math.max(30,Math.max(Math.abs(dx),Math.abs(dz))/4.2*1000)));
  }
 }
 await footTo(-2,6);await footTo(0,0);await footTo(10,0);await footTo(10,-4);await tick(500);await key('e');await record('Boarded');assert((await state()).van.occupied);
 await page.screenshot({path:out+'/local-boarded.png'});
 // Arcade world-direction steering, turning before the crossing.
 async function driveAxis(axis,value){
  const initial=(await state()).van,sign=Math.sign(value-initial[axis]),k=axis==='x'?(sign>0?'d':'a'):(sign>0?'s':'w');
  await page.keyboard.down(k);
  for(let j=0;j<90;j++){const s=await state();if(s.mode!=='playing'||sign*(value-s.van[axis])<Math.max(1,s.van.speed/7))break;await tick(100);}
  await page.keyboard.up(k);await key('Space',450);await record('Driving '+axis+' '+value);
 }
 await driveAxis('x',34);await driveAxis('z',-32);await driveAxis('x',-34);await driveAxis('z',-48);await tick(3000);
 await record('Final route');await page.screenshot({path:out+'/local-final.png'});
 assert.equal((await state()).mode,'won','Complete mission through keyboard driving');
 await page.locator('#again').click();await tick(0);
 await page.keyboard.down('Shift');await key('w',3660);await page.keyboard.up('Shift');
 for(let j=0;j<4;j++)await key('Space',520);
 await page.keyboard.down('Shift');await key('w',1700);await page.keyboard.up('Shift');await key('e');
 assert((await state()).friend.rescued);
 await footTo(-2,6);await footTo(0,0);await footTo(10,0);await footTo(10,-4);await tick(500);await key('e');
 await driveAxis('x',-34);await driveAxis('z',-13.4);await key('e');assert(!(await state()).van.occupied);
 await footTo(-34,-15.1);await key('Space',500);assert(!(await state()).roadblock,'Roadblock clears through actual strike');
 await key('e');await tick(0);assert((await state()).van.occupied);assert(!(await state()).roadblock,'Reboarding must not regenerate it');
 await driveAxis('z',-32);await record('Western roadblock route passed');
 await page.screenshot({path:out+'/local-west-route.png'});
 // Fail by collision and restore the last earned boarding location.
 await driveAxis('x',-16);await page.keyboard.down('w');await tick(30000);await page.keyboard.up('w');
 assert.equal((await state()).mode,'caught');await page.locator('#retry').click();await tick(0);
 assert((await state()).van.occupied&&!(await state()).roadblock);await record('Actual boarding checkpoint restored');
 await page.locator('#pause').click();await page.locator('#restart').click();
 await tick(45000);assert.equal((await state()).mode,'caught');
 await page.locator('#retry').click();await tick(0);assert.equal((await state()).mode,'playing');assert.equal((await state()).player.health,6);
 await record('Capture and fresh retry');
 assert.equal(errors.length,0);
 fs.writeFileSync(out+'/local-results.json',JSON.stringify({passed:true,errors,log},null,2));
}catch(e){console.error(e);log.push({error:e.message});fs.writeFileSync(out+'/local-results.json',JSON.stringify({passed:false,errors,log},null,2));await page.screenshot({path:out+'/local-failure.png'});process.exitCode=1;}
finally{await browser.close();}
