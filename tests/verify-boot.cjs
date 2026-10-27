// The same injection boundary used by Live Server, plus delayed/missing Vue startup.
const ROOT=require('node:path').join(__dirname,'..');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assets=new Set(['index.html','base.css','core.js','components.js','app.js','canva.css','workspace-next.js','workspace-next.css','studio.css','workspace.css','interaction.css','theme.css','canvas.css','clinical-rules.js','guidance.js','enhancements.js','workspace-next.js','workspace-next.css']);
const output=path.join(os.tmpdir(),'vesando-focused-ui');
const server=http.createServer(async(req,res)=>{
  const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!assets.has(file)){res.writeHead(404);res.end();return}
  try{let content=await fs.readFile(path.join(ROOT,file),'utf8');if(file==='index.html')content=content.replace(/<\/body>/i,'<script>window.__reloadFixture=true</script></body>');res.setHeader('Content-Type',(file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':'text/html')+';charset=utf-8');res.end(content)}catch{res.writeHead(500);res.end()}
});
(async()=>{
  await fs.mkdir(output,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{channel:'chrome'})});
  try{
    const url='http://127.0.0.1:'+server.address().port,context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
    page.setDefaultTimeout(7000);page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url);await page.waitForSelector('#app:not([v-cloak])');
    assert.equal(await page.evaluate(()=>window.__reloadFixture),true);
    assert.equal(await page.locator('.project-home').isVisible(),true);
    assert.equal(await page.locator('.compare-backdrop').count(),0);
    assert.equal(await page.locator('#boot').count(),0);assert.deepEqual(errors,[]);
    // Exported documents still contain valid closing tags after escaping the source literal.
    const exports=await page.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState;return {exam:a.examPackHTML(a.activeCase,'both'),handover:a.handoverHTML()}});
    for(const [kind,html] of Object.entries(exports)){assert.match(html,/<\/body><\/html>$/i,kind+' exported HTML still closes correctly');assert.ok(!html.includes('__reloadFixture'),kind+' export contains no Live Server code')}
    await page.screenshot({path:path.join(output,'boot-live-server-fixed.png')});
    console.log('PASS: Live Server injection no longer breaks JavaScript; home mounts, overlays stay closed, both export documents retain valid HTML');

    const slow=await context.newPage();let release;
    await slow.route('**/vue.global.prod.js',async route=>{await new Promise(r=>release=r);await route.continue()});
    await slow.goto(url,{waitUntil:'commit'});await slow.waitForSelector('#app',{state:'attached'});
    await slow.waitForFunction(()=>!!document.querySelector('#app[v-cloak]'));
    assert.equal(await slow.locator('#app').isVisible(),false);
    assert.equal(await slow.locator('#boot').isVisible(),true);
    assert.equal(await slow.locator('.compare-backdrop').isVisible(),false);
    await slow.screenshot({path:path.join(output,'boot-delayed.png')});
    release();await slow.waitForSelector('#app:not([v-cloak])');
    assert.equal(await slow.locator('.project-home').isVisible(),true);await slow.close();
    const failed=await context.newPage();await failed.route('**/vue.global.prod.js',r=>r.abort());
    await failed.goto(url);await failed.waitForFunction(()=>document.querySelector('#boot')?.textContent.includes('Không tải được Vue'));
    assert.equal(await failed.locator('#app').isVisible(),false);assert.equal(await failed.locator('#boot').isVisible(),true);
    assert.equal(await failed.locator('.compare-backdrop').isVisible(),false);
    await failed.screenshot({path:path.join(output,'boot-offline.png')});await failed.close();
    console.log('PASS: delayed or unavailable Vue shows a loading/error message; raw templates and false overlays remain hidden');
    if(process.env.LIVE_PREVIEW_URL){
      await page.goto(process.env.LIVE_PREVIEW_URL);await page.waitForSelector('#app:not([v-cloak])');
      assert.equal(await page.locator('.project-home').isVisible(),true);assert.equal(await page.locator('.compare-backdrop').count(),0);assert.deepEqual(errors,[]);
      await page.screenshot({path:path.join(output,'live-preview-5501.png')});
      console.log('PASS: actual user preview '+process.env.LIVE_PREVIEW_URL+' mounts without page errors');
    }
    await context.close();
  }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1;server.close()});
