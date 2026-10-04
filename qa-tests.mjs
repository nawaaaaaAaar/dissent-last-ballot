const {default:assert} = await import('node:assert/strict');
const {default:fs} = await import('node:fs/promises');

const dir=new URL('./qa/',import.meta.url).pathname;
const read = async p => JSON.parse(await p.evaluate(()=>window.render_game_to_text()));
const step = async (p,ms) => p.evaluate(ms=>window.advanceTime(ms),ms);
const key = async (p,k) => p.keyboard.press(k);
async function laneTo(p,target){
  let s=await read(p);
  while(s.lane!==target){
    await key(p,s.lane<target?'ArrowRight':'ArrowLeft');s=await read(p);
  }
}
export async function mobileQA(p){
  const result={};
  if((await read(p)).mode!=='paused')await p.tap('#pause-btn');
  const before=await read(p);await step(p,2000);
  assert.equal((await read(p)).distance,before.distance);result.pause=true;
  await p.tap('#resume-btn');await p.tap('[data-action=right]');
  await step(p,300);assert.equal((await read(p)).lane,0);
  await p.tap('[data-action=slide]');await step(p,50);assert.equal((await read(p)).sliding,true);
  await step(p,1100);assert.equal((await read(p)).sliding,false);result.touchButtons=true;
  const cdp=await p.context().newCDPSession(p);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:150,y:430}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:235,y:435}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.equal((await read(p)).lane,1);result.realTouchSwipe=true;
  await p.tap('#sound-btn');assert.equal((await read(p)).muted,false);
  await p.tap('#sound-btn');assert.equal((await read(p)).muted,true);result.soundToggle=true;
  const fit=await p.evaluate(()=>({w:innerWidth,h:innerHeight,scroll:document.documentElement.scrollWidth,
    controls:[...document.querySelectorAll('[data-action]')].map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};})}));
  assert.ok(fit.scroll<=fit.w);
  assert.ok(fit.controls.every(r=>r.x>=0&&r.y>=0&&r.x+r.w<=fit.w&&r.y+r.h<=fit.h));
  result.portraitFit=fit;
  await p.screenshot({path:`${dir}/game-mobile.png`});
  await p.setViewportSize({width:844,height:390});
  await p.screenshot({path:`${dir}/game-landscape.png`});
  const land=await p.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(land.scroll<=land.w);result.landscapeFit=true;
  await p.setViewportSize({width:390,height:844});await cdp.detach();
  await fs.writeFile(`${dir}/mobile-results.json`,JSON.stringify(result,null,2));
  return result;
}
export async function desktopQA(p){
  const result={};
  let delhiCaptured=false,landmarkCaptured=false;
  await p.reload();await p.waitForFunction(()=>window.render_game_to_text);
  await p.selectOption('#quality','low');assert.equal((await read(p)).quality,'low');
  await p.selectOption('#quality','high');assert.equal((await read(p)).quality,'high');
  await p.selectOption('#quality','low');result.graphicsCycle=true;
  await p.check('#reduced-motion');assert.equal((await read(p)).reducedMotion,true);
  await p.uncheck('#reduced-motion');assert.equal((await read(p)).reducedMotion,false);
  await p.check('#assist');assert.equal((await read(p)).assist,true);
  await p.uncheck('#assist');assert.equal((await read(p)).assist,false);result.accessibilityCycle=true;
  await p.click('#start-btn');
  await key(p,'ArrowLeft');await step(p,350);assert.equal((await read(p)).lane,-1);
  await key(p,'ArrowRight');await step(p,350);assert.equal((await read(p)).lane,0);
  await key(p,'Space');await step(p,180);assert.ok((await read(p)).jump>.2);
  await step(p,1000);await key(p,'ArrowDown');await step(p,80);assert.equal((await read(p)).sliding,true);
  await step(p,1100);assert.equal((await read(p)).sliding,false);result.keyboard=true;
  await key(p,'Escape');const paused=await read(p);await step(p,2000);
  assert.equal((await read(p)).distance,paused.distance);await p.click('#resume-btn');result.pauseResume=true;
  // Complete with real keyboard/click inputs; advanceTime controls simulation time.
  for(let i=0;i<170;i++){
    let s=await read(p);
    if(s.mode==='dialogue'){
      await p.screenshot({path:`${dir}/${s.dialogue}-dialogue.png`});
      await p.click('#interact-btn');await step(p,2000);continue;
    }
    if(s.mode==='won')break;
    assert.equal(s.mode,'running',JSON.stringify(s));
    if(!delhiCaptured&&s.distance>635){
      await p.screenshot({path:`${dir}/delhi-protest-bus.png`});delhiCaptured=true;
    }
    if(!landmarkCaptured&&s.distance>716){
      await p.screenshot({path:`${dir}/delhi-observatory.png`});landmarkCaptured=true;
    }
    const dangerous=s.obstacles.filter(o=>o.ahead>-1&&o.ahead<19);
    const safe=[-1,0,1].filter(l=>!dangerous.some(o=>o.lane===l));
    let desired=s.lane;
    if(safe.length){
      const packet=s.packets.find(p=>p.ahead<16&&safe.includes(p.lane));
      desired=packet?packet.lane:safe.includes(s.lane)?s.lane:safe[0];
    }
    await laneTo(p,desired);
    await step(p,900);
  }
  const won=await read(p);assert.equal(won.mode,'won');assert.ok(won.evidence>=3);assert.ok(won.footage);
  result.completeMission=won;await p.screenshot({path:`${dir}/mission-complete.png`});
  await p.click('#retry-btn');assert.equal((await read(p)).mode,'running');result.replay=true;
  // Intentionally collide with successive obstacles; verify loss and retry.
  for(let i=0;i<160;i++){
    let s=await read(p);
    if(s.mode==='dialogue'){await p.click('#interact-btn');await step(p,2000);continue;}
    if(s.mode==='lost')break;
    assert.equal(s.mode,'running');
    const next=s.obstacles.find(o=>o.ahead>0&&o.ahead<22);
    if(next)await laneTo(p,next.lane);
    await step(p,900);
  }
  assert.equal((await read(p)).mode,'lost');result.collisionFailure=true;
  await p.screenshot({path:`${dir}/failure.png`});await p.click('#retry-btn');
  assert.equal((await read(p)).condition,100);assert.equal((await read(p)).mode,'running');
  result.retry=true;
  // Reach first checkpoint safely, then fail again to validate checkpoint restoration.
  for(let i=0;i<100;i++){
    let s=await read(p);
    if(s.mode==='dialogue'){await p.click('#interact-btn');await step(p,2000);break;}
    assert.equal(s.mode,'running');
    const dangers=s.obstacles.filter(o=>o.ahead>-1&&o.ahead<19);
    const safe=[-1,0,1].find(l=>!dangers.some(o=>o.lane===l));
    if(safe!==undefined)await laneTo(p,safe);
    await step(p,900);
  }
  assert.ok((await read(p)).checkpoint>=244);
  for(let i=0;i<120;i++){
    let s=await read(p);
    if(s.mode==='dialogue'){await p.click('#interact-btn');await step(p,2000);continue;}
    if(s.mode==='lost')break;
    const next=s.obstacles.find(o=>o.ahead>0&&o.ahead<22);
    if(next)await laneTo(p,next.lane);
    await step(p,900);
  }
  assert.equal((await read(p)).mode,'lost');const saved=(await read(p)).checkpoint;
  await p.click('#retry-btn');const retried=await read(p);
  assert.ok(Math.abs(retried.distance-saved)<4);assert.equal(retried.condition,100);
  result.checkpointRetry={checkpoint:saved,distance:retried.distance};
  await p.click('#pause-btn');await p.click('#restart-pause');
  assert.ok((await read(p)).distance<4);result.restart=true;
  await p.click('#pause-btn');await p.click('#menu-btn');assert.equal((await read(p)).mode,'menu');
  result.returnToMenu=true;
  await fs.writeFile(`${dir}/desktop-results.json`,JSON.stringify(result,null,2));
  return result;
}
