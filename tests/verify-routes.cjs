// Each saved project has its own address (#de/<id>, #theo-doi/<id>): history, reload, new tab, bad id, copy link.
const ROOT=require('node:path').join(__dirname,'..');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assets=new Set(['index.html','base.css','core.js','components.js','app.js','canva.css','canva.js','workspace-next.js','workspace-next.css','studio.css','workspace.css','interaction.css','theme.css','canvas.css','clinical-rules.js','guidance.js','enhancements.js']);
const server=http.createServer(async(req,res)=>{
  const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!assets.has(file)){res.writeHead(404);res.end();return}
  try{res.setHeader('Content-Type',(file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':'text/html')+';charset=utf-8');res.end(await fs.readFile(path.join(ROOT,file)))}catch{res.writeHead(500);res.end()}
});
const app=(p,fn,arg)=>p.evaluate(([src,arg])=>(0,eval)('('+src+')')(document.querySelector('#app')._vnode.component.setupState,arg),[fn.toString(),arg]);
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{channel:'chrome'})});
  try{
    const url='http://127.0.0.1:'+server.address().port+'/';
    const context=await browser.newContext({viewport:{width:1440,height:900},permissions:['clipboard-read','clipboard-write']});
    const p=await context.newPage(),errors=[];p.setDefaultTimeout(8000);p.on('pageerror',e=>errors.push(e.message));
    await p.goto(url);await p.waitForSelector('#app:not([v-cloak])');
    assert.equal(await p.evaluate(()=>location.hash),'');

    // Home shortcuts reach the DOM through setup functions.
    await p.locator('.cv-shortcuts').getByRole('button',{name:'Tạo bằng AI',exact:true}).click();
    assert.equal(await p.evaluate(()=>document.activeElement?.id),'home-ai-brief');
    await p.locator('.cv-shortcuts').getByRole('button',{name:'Ca mẫu',exact:true}).click();
    assert.equal(await p.locator('.home-template-disclosure').evaluate(d=>d.open),true);
    console.log('PASS: Tạo bằng AI focuses the prompt; Ca mẫu opens the template gallery');

    // Opening a template creates a saved project with its own address.
    await p.locator('.template-card').first().click();await p.waitForTimeout(300);
    await app(p,a=>a.saveLibraryProject());await p.waitForTimeout(100);
    const first=await app(p,a=>a.projectIDs.exam);
    assert.ok(first,'project has an id');
    assert.equal(await p.evaluate(()=>location.hash),'#de/'+first);
    assert.match(await p.title(),/· Sản đồ Studio$/);
    console.log('PASS: an open project shows #de/<id> and its title in the tab');

    // Home and Back/Forward.
    await app(p,a=>a.openStartScreen());await p.waitForTimeout(200);
    assert.equal(await p.evaluate(()=>location.hash),'');
    await p.goBack();await p.waitForFunction(()=>!document.querySelector('.project-home'));
    assert.equal(await app(p,a=>a.projectIDs.exam),first);
    await p.goForward();await p.waitForSelector('.project-home');
    console.log('PASS: Back reopens the project, Forward returns home');

    // A second project, then reload on its address.
    await p.locator('.cv-shortcuts').getByRole('button',{name:'Ca mẫu',exact:true}).click();
    await p.locator('.template-card').nth(1).click();await p.waitForTimeout(300);
    await app(p,a=>a.saveLibraryProject());await p.waitForTimeout(100);
    const second=await app(p,a=>a.projectIDs.exam);
    assert.notEqual(second,first);
    const secondTitle=await app(p,a=>a.activeCase.title);
    await p.reload();await p.waitForSelector('#app:not([v-cloak])');await p.waitForTimeout(400);
    assert.equal(await p.evaluate(()=>location.hash),'#de/'+second);
    assert.equal(await app(p,a=>a.activeCase.title),secondTitle);
    console.log('PASS: reload keeps the project in the address');

    // New tab straight to the first project; library cards are real links.
    const tab=await context.newPage();tab.on('pageerror',e=>errors.push(e.message));
    await tab.goto(url+'#de/'+first);await tab.waitForSelector('#app:not([v-cloak])');await tab.waitForTimeout(400);
    assert.equal(await app(tab,a=>a.projectIDs.exam),first);
    assert.equal(await app(tab,a=>a.homeOpen),false);
    await app(tab,a=>a.openStartScreen());await tab.waitForTimeout(200);
    assert.equal(await tab.locator('a.project-open[href="#de/'+first+'"]').count(),1);
    await tab.close();
    console.log('PASS: a new tab opens the linked project; library cards link to #de/<id>');

    // Unknown id: stay put, explain.
    await p.evaluate(()=>{location.hash='#de/khong-ton-tai'});await p.waitForTimeout(400);
    assert.equal(await app(p,a=>a.projectIDs.exam),second);
    assert.equal(await p.evaluate(()=>location.hash),'#de/'+second);
    assert.match(await app(p,a=>a.toast),/Không tìm thấy đề/);
    console.log('PASS: an unknown project id keeps the current project and says so');

    // Page strip: add a case, PageUp/PageDown switch cases, the hover × removes one (undoable).
    if(!await p.locator('.cv-pages.open').count())await p.locator('.cv-pages-toggle').click();
    await p.locator('.cv-page-add').first().click();
    assert.equal(await app(p,a=>a.cases.length),2);
    await p.locator('body').click({position:{x:700,y:20}});await p.keyboard.press('Escape');
    const before=await app(p,a=>a.activeCaseIndex);
    await p.keyboard.press(before?'PageUp':'PageDown');
    assert.notEqual(await app(p,a=>a.activeCaseIndex),before);
    await p.locator('.cv-page-wrap').nth(1).hover();await p.locator('.cv-page-wrap').nth(1).locator('.cv-page-remove').click();
    assert.equal(await app(p,a=>a.cases.length),1);
    console.log('PASS: page strip adds a case, PageUp/PageDown switch cases, hover × removes a case');

    // Copy link.
    await app(p,a=>a.copyProjectLink());await p.waitForTimeout(200);
    assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),url+'#de/'+second);
    console.log('PASS: Sao chép liên kết đề copies the project address');

    assert.deepEqual(errors,[]);
    await context.close();
  }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1;server.close()});
