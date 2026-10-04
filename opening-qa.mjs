const {chromium}=await import('playwright');
const {writeFile}=await import('node:fs/promises');
const {default:assert}=await import('node:assert/strict');
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
const base=process.env.DISSENT_URL||'http://127.0.0.1:5173';
const results={};
try{
  for(const mobile of [false,true]){
    const ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile});
    const p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
    await p.goto(base);await p.waitForFunction(()=>window.render_game_to_text);
    await p.click('#start-btn');await p.waitForFunction(()=>document.querySelector('#opening-video').currentTime>1);
    assert.equal(JSON.parse(await p.evaluate(()=>render_game_to_text())).mode,'intro');
    await p.keyboard.press('Escape');assert.equal(await p.locator('#opening-video').evaluate(v=>v.paused),true);
    const time=await p.locator('#opening-video').evaluate(v=>v.currentTime);
    await p.waitForTimeout(500);assert.equal(await p.locator('#opening-video').evaluate(v=>v.currentTime),time);
    await p.click('#resume-btn');
    await p.waitForFunction(()=>document.querySelector('#opening-video').currentTime>4);
    await p.screenshot({path:new URL(`./qa/opening-${mobile?'mobile':'desktop'}.png`,import.meta.url).pathname});
    await p.waitForFunction(()=>JSON.parse(render_game_to_text()).mode==='running',null,{timeout:20000});
    await p.evaluate(()=>advanceTime(100));
    const s=JSON.parse(await p.evaluate(()=>render_game_to_text()));
    assert.equal(s.introFallback,false);assert.equal(s.pursuers,3);
    results[mobile?'mobile':'desktop']={inlinePlayback:true,pauseResume:true,naturalHandoff:true,pursuers:s.pursuers,errors};
    assert.deepEqual(errors,[]);
    await ctx.close();
  }
  const ctx=await browser.newContext();const p=await ctx.newPage();
  await p.route('**/assets/opening.mp4',r=>r.abort());
  await p.goto(base);await p.waitForFunction(()=>window.render_game_to_text);await p.click('#start-btn');
  await p.waitForFunction(()=>JSON.parse(render_game_to_text()).introFallback);
  await p.evaluate(()=>advanceTime(5500));
  assert.equal(JSON.parse(await p.evaluate(()=>render_game_to_text())).mode,'running');
  results.forcedFailureFallback=true;
  await ctx.close();
  await writeFile(new URL('./qa/opening-results.json',import.meta.url),JSON.stringify(results,null,2));
  console.log(results);
}finally{await browser.close();}
