const { chromium }=await import('playwright');
const { mkdir }=await import('node:fs/promises');
const { desktopQA, mobileQA }=await import('./qa-tests.mjs');
await mkdir(new URL('./qa/',import.meta.url),{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
const errors=[];
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:720}});
  const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
  await p.goto(process.env.DISSENT_URL||'http://127.0.0.1:5173');
  await p.waitForFunction(()=>window.render_game_to_text);
  console.log('Desktop:',await desktopQA(p));
  await ctx.close();
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const m=await mobile.newPage();m.on('pageerror',e=>errors.push(e.message));
  await m.goto(process.env.DISSENT_URL||'http://127.0.0.1:5173');
  await m.waitForFunction(()=>window.render_game_to_text);
  await m.tap('#start-btn');await m.tap('#skip-opening');await m.tap('[data-action=left]');await m.tap('#pause-btn');
  console.log('Mobile:',await mobileQA(m));
  if(errors.length)throw new Error(errors.join('\n'));
  console.log('No page errors.');
}finally{
  await browser.close();
}
