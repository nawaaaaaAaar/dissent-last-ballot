const {chromium}=await import('playwright');
const {writeFile}=await import('node:fs/promises');
const {default:assert}=await import('node:assert/strict');
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
const base=process.env.DISSENT_URL||'http://127.0.0.1:5173/runner.html';
const results={};
const read=async p=>JSON.parse(await p.evaluate(()=>render_game_to_text()));
try{
  for(const mobile of [false,true]){
    const ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile});
    const p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
    p.setDefaultTimeout(15000);p.setDefaultNavigationTimeout(15000);
    await p.goto(base,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.render_game_to_text,null,{timeout:15000});
    assert.equal((await read(p)).riggedCharacter,true);
    await p.click('#start-btn');await p.evaluate(()=>advanceTime(2300));
    assert.equal((await read(p)).mode,'intro');assert.equal((await read(p)).introAct,0);
    assert.equal((await read(p)).introTime,1.8);
    await p.screenshot({path:new URL(`./qa/realtime-opening-${mobile?'mobile':'desktop'}.png`,import.meta.url).pathname});
    if(mobile)await p.tap('#opening-action');else await p.keyboard.press('e');
    await p.evaluate(()=>advanceTime(3500));
    assert.equal((await read(p)).introAct,1);assert.equal((await read(p)).introTime,5);
    await p.keyboard.press('Escape');const t=(await read(p)).introTime;
    await p.evaluate(()=>advanceTime(1000));assert.equal((await read(p)).introTime,t);
    await p.click('#resume-btn');
    await p.screenshot({path:new URL(`./qa/realtime-rescue-${mobile?'mobile':'desktop'}.png`,import.meta.url).pathname});
    await p.click('#opening-action');await p.evaluate(()=>advanceTime(4500));
    const s=await read(p);assert.equal(s.mode,'running');assert.equal(s.pursuers,3);
    await p.screenshot({path:new URL(`./qa/rigged-chase-${mobile?'mobile':'desktop'}.png`,import.meta.url).pathname});
    assert.deepEqual(errors,[]);
    results[mobile?'mobile':'desktop']={realTimeOpening:true,riggedCharacter:true,twoContextualInputs:true,pauseResume:true,chaseHandoff:true,pursuers:s.pursuers,errors};
    await ctx.close();
  }
  const ctx=await browser.newContext();const p=await ctx.newPage();
  await p.route('**/assets/courier-base.glb',r=>r.abort());
  p.setDefaultTimeout(15000);p.setDefaultNavigationTimeout(15000);
  await p.goto(base,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.render_game_to_text,null,{timeout:15000});
  assert.equal((await read(p)).riggedCharacter,false);
  await p.click('#start-btn');await p.click('#skip-opening');
  assert.equal((await read(p)).mode,'running');results.humanAssetFailureFallback=true;
  await ctx.close();
  await writeFile(new URL('./qa/opening-results.json',import.meta.url),JSON.stringify(results,null,2));
  console.log(results);
}finally{await browser.close();}
