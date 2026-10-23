// Readability and interaction regressions: open panels must remain usable, not merely visible.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const files=new Set(['index.html','studio.css','workspace.css','interaction.css','theme.css','canvas.css','clinical-rules.js','guidance.js','enhancements.js']);
const server=http.createServer(async(req,res)=>{const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(!files.has(file)){res.writeHead(404);res.end();return}try{res.setHeader('Content-Type',(file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':'text/html')+'; charset=utf-8');res.end(await fs.readFile(path.join(__dirname,file)))}catch{res.writeHead(500);res.end()}});
const state=p=>p.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState;return JSON.parse(JSON.stringify({c:a.activeCase,time:a.viewTime,drafts:a.quickDrafts,pending:a.pendingQuickTimes,point:a.dataPoint,tool:a.toolTab,error:a.clinicalError}))});
const hit=(p,t=2,f='cervix')=>p.locator('.case-card:visible [data-point-hit][data-observation-time="'+t+'"][data-observation-field="'+f+'"]');
async function openMoment(p){const menu=p.locator('.case-card:visible .moment-browser');if(!await menu.evaluate(e=>e.open))await menu.locator('summary').click();return menu}
async function geometry(p){return p.locator('.chart-moment-tools:visible').evaluate(nav=>{const body=nav.querySelector('.moment-browser-body'),input=nav.querySelector('.moment-jump input'),table=nav.querySelector('.moment-snapshot'),summary=nav.querySelector('summary');const rect=e=>e.getBoundingClientRect().toJSON();return {nav:rect(nav),body:rect(body),input:rect(input),table:rect(table),summary:rect(summary),native:getComputedStyle(nav.querySelector('details'),'::details-content').display}})}
async function coordinate(p,time,value){return p.evaluate(({time,value})=>{const a=document.querySelector('#app')._vnode.component.setupState,c=window.PartographCore,d=c.buildSVG(a.activeCase,{...a.chartOptions,editable:true}),svg=[...document.querySelectorAll('.case-card .partograph')].find(e=>e.checkVisibility()),r=svg.getBoundingClientRect();return {x:r.x+(c.G.left+d.labelOffset+d.timeline.plot(time)*d.hour)*d.scaleX*r.width/d.width,y:r.y+d.rowLayout.y(c.cervixY(value))*d.scaleY*r.height/d.height}},{time,value})}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
  try{
    browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{channel:'chrome'})});
    const url='http://127.0.0.1:'+server.address().port,errors=[],context=await browser.newContext({viewport:{width:1920,height:1080},reducedMotion:'reduce'}),p=await context.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));
    await p.goto(url);await p.waitForSelector('#app:not([v-cloak])');
    const baseline=(await state(p)).c;await openMoment(p);const g=await geometry(p);await p.screenshot({path:path.join(os.tmpdir(),'vesando-comfort10-open.png'),animations:'disabled'});
    assert.ok(g.body.width>=g.nav.width-32,'Opened moment panel must use the navigation width, not an anonymous first grid column');
    assert.ok(g.input.width>=150,'Clock input must show a complete clock and relative time');
    assert.ok(g.table.width>=280,'Measurement table must remain readable on desktop');
    assert.deepEqual((await state(p)).c,baseline);
    await p.getByRole('button',{name:'Xong',exact:true}).click();
    for(const size of [{width:1440,height:800},{width:1280,height:720}]){
      await p.setViewportSize(size);await hit(p).click();await p.locator('.point-toolbar').waitFor();await p.getByRole('button',{name:'Thêm thao tác với điểm',exact:true}).click();
      const menu=await p.locator('.point-toolbar-menu').boundingBox();await p.screenshot({path:path.join(os.tmpdir(),'vesando-comfort10-menu-'+size.width+'.png')});
      assert.ok(menu.y>=64&&menu.y+menu.height<=size.height-8,'Point actions must fit the visible desktop viewport');
      await p.keyboard.press('Home');await p.keyboard.press('ArrowDown');assert.match(await p.evaluate(()=>document.activeElement.textContent),/Điểm trước/);await p.keyboard.press('ArrowUp');assert.match(await p.evaluate(()=>document.activeElement.textContent),/Đưa điểm/);
      await p.keyboard.press('End');assert.match(await p.evaluate(()=>document.activeElement.textContent),/Xóa điểm/);await p.keyboard.press('Home');assert.match(await p.evaluate(()=>document.activeElement.textContent),/Đưa điểm/);
      await p.keyboard.press('Escape');assert.equal(await p.locator('.point-toolbar-menu').count(),0);assert.equal(await p.locator('.point-toolbar').count(),1);assert.equal(await p.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Thêm thao tác với điểm');await p.keyboard.press('Escape');
    }
    await hit(p).click();await p.getByRole('button',{name:'Sửa số đo tại điểm',exact:true}).click();await p.locator('[data-input-key="cervix"]').fill('6.3');await hit(p,4).focus();await p.keyboard.press('9');assert.equal(await p.locator('[data-input-key="cervix"]').inputValue(),'6.3','A blocked typed edit cannot mutate the previous draft');assert.deepEqual((await state(p)).c,baseline);await p.locator('.case-card:visible .partograph').focus();await p.keyboard.press('Escape');assert.equal(await p.locator('.chart-cell-editor').count(),0,'Escape closes an editor even after focus has left it');
    await hit(p).scrollIntoViewIfNeeded();const pos=await coordinate(p,7,7);await p.mouse.click(pos.x,pos.y,{button:'right'});await p.locator('.chart-context-menu').waitFor();const ctx=await p.locator('.chart-context-menu').boundingBox();assert.ok(ctx.y>=64&&ctx.y+ctx.height<=720-8,'Blank-chart context actions also fit the viewport');await p.keyboard.press('Escape');assert.deepEqual((await state(p)).c,baseline);
    console.log('PASS: point and blank-chart menus fit laptop viewports; Home/End/arrows/Escape and blocked-editor recovery preserve data');
    await p.setViewportSize({width:1440,height:1000});await p.getByRole('radio',{name:'Theo dõi',exact:true}).click();await p.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState;a.openClinical(a.cases[0])});
    const clinical=(await state(p)).c,chart=p.locator('.clinical-chart-card'),aside=p.locator('.bedside-entry'),beforeWidth=(await chart.boundingBox()).width;
    await p.locator('#quick-fhr').fill('146');await p.locator('.bedside-toggle').click();assert.equal(await aside.isVisible(),false);assert.ok((await chart.boundingBox()).width>beforeWidth+200);assert.equal((await state(p)).drafts[0].fhr,'146');await p.getByRole('button',{name:'Ghi mốc',exact:true}).click();assert.equal(await p.locator('#quick-fhr').inputValue(),'146');assert.equal(await p.evaluate(()=>document.activeElement.id),'quick-fhr');
    await p.locator('#quick-pulse').fill('88');await p.locator('#quick-pulse').press('Enter');assert.deepEqual((await state(p)).c,clinical,'Enter at the last numeric input never silently records data');assert.equal(await p.evaluate(()=>document.activeElement===document.querySelector('#bedside-form button[type=submit]')),true);
    await p.locator('.quick-group-jumps').getByRole('button',{name:'Thai & ối',exact:true}).click();assert.equal(await p.locator('#quick-fluid').evaluate(el=>{const e=new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true});el.dispatchEvent(e);return e.defaultPrevented}),false,'Enter on a native select must not be intercepted');
    await p.locator('#quick-fhr').fill('999');await p.locator('#quick-time').selectOption('1');await p.locator('#quick-pulse').fill('84');await p.getByRole('button',{name:'Ghi tất cả 2 mốc',exact:true}).click();assert.equal((await state(p)).time,0,'Batch validation takes the user to the invalid draft');assert.equal(await p.evaluate(()=>document.activeElement.id),'quick-fhr');assert.deepEqual((await state(p)).c,clinical);assert.equal((await state(p)).pending.length,2);assert.ok((await state(p)).error);await p.locator('#quick-fhr').fill('146');assert.equal((await state(p)).error,'','Correcting a draft clears stale feedback');await p.getByRole('button',{name:'Ghi tất cả 2 mốc',exact:true}).click();assert.equal((await state(p)).pending.length,0);
    assert.equal(await p.locator('.toast').isVisible(),false,'Successful quick saves do not cover the chart');await p.locator('.quick-undo').click();assert.deepEqual((await state(p)).c,clinical);assert.equal((await state(p)).time,0);assert.equal(await p.locator('.quick-undo').count(),0,'Undo clears stale success feedback');assert.equal((await state(p)).pending.length,2);await p.getByRole('button',{name:'Ghi tất cả 2 mốc',exact:true}).click();
    console.log('PASS: desktop input collapse/reopen retains drafts and restores chart width; explicit saves, native selects, invalid-draft recovery and unobstructed confirmation/undo work');
    let layouts=0;
    for(const mode of ['exam','clinical']){
      await p.getByRole('radio',{name:mode==='exam'?'Soạn đề':'Theo dõi',exact:true}).click();const original=(await state(p)).c;
      for(const width of [320,390,768,1024,1440,1920])for(const theme of ['light','dark']){
        await p.setViewportSize({width,height:900});await p.evaluate(async theme=>{const a=document.querySelector('#app')._vnode.component.setupState;a.theme=theme;await Vue.nextTick();window.scrollTo(0,0)},theme);
        if(mode==='clinical'&&width<=760&&await aside.evaluate(el=>el.classList.contains('expanded')))await p.locator('.bedside-toggle').click();
        const summary=p.locator('.case-card:visible .moment-browser>summary'),closed=await summary.boundingBox();const panel=await openMoment(p);const g=await geometry(p);assert.ok(Math.abs(closed.x-g.summary.x)<1&&Math.abs(closed.y-g.summary.y)<1,'The disclosure trigger stays in place');assert.ok(g.body.width>=g.nav.width-30,mode+' '+width+' expanded content must span its container');assert.ok(g.table.width>=Math.min(260,g.body.width-8),mode+' '+width+' readable table');assert.ok(g.input.width>=Math.min(150,g.body.width-100),mode+' '+width+' readable input');assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,'No horizontal page overflow');
        const bad=await panel.locator('button:visible,summary:visible,input:visible,select:visible').evaluateAll(els=>els.filter(el=>{const r=el.getBoundingClientRect();return r.height<43.5||r.width<43.5}).map(el=>el.outerHTML.slice(0,90)));assert.deepEqual(bad,[],mode+' '+width+' touch targets');
        const numbers=await panel.locator('.snapshot-number').evaluateAll(els=>els.map(el=>({text:el.textContent,w:el.clientWidth,sw:el.scrollWidth})).filter(x=>x.sw>x.w+1));assert.deepEqual(numbers,[],mode+' '+width+' numbers must not be clipped or wrapped');
        if(mode==='exam'){
          const options=await panel.getByRole('combobox',{name:'Đối chiếu mốc',exact:true}).locator('option').count();if(options>1)await panel.getByRole('combobox',{name:'Đối chiếu mốc',exact:true}).selectOption({index:1});assert.equal(await panel.locator('thead th').count(),3);
          const clipped=await panel.locator('.snapshot-number').evaluateAll(els=>els.filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.textContent));assert.deepEqual(clipped,[],width+' compared numbers');
        }
        await panel.getByRole('button',{name:'Xong',exact:true}).click();assert.equal(await panel.evaluate(el=>el.open),false);assert.equal(await summary.evaluate(el=>el===document.activeElement),true);assert.deepEqual((await state(p)).c,original);layouts++;
        if([390,1440].includes(width)){await openMoment(p);await p.screenshot({path:path.join(os.tmpdir(),'vesando-comfort10-'+mode+'-'+theme+'-'+width+'.png')});await summary.press('Escape')}
      }
    }
    assert.deepEqual(errors,[]);await context.close();console.log('PASS: '+layouts+' expanded layouts across both modes/themes, readable inputs/comparisons, stable triggers, >=44 px targets and no runtime errors');
    for(const spec of [{width:1280,height:800,scale:1.25},{width:960,height:720,scale:1.5},{width:390,height:844,scale:2,touch:true}]){
      const scaled=await browser.newContext({viewport:{width:spec.width,height:spec.height},deviceScaleFactor:spec.scale,hasTouch:!!spec.touch,isMobile:!!spec.touch,reducedMotion:'reduce'}),page=await scaled.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.waitForSelector('#app:not([v-cloak])');
      for(const mode of ['exam','clinical']){
        if(mode==='clinical'){const radio=page.getByRole('radio',{name:'Theo dõi',exact:true});spec.touch?await radio.tap():await radio.click()}
        const c=(await state(page)).c,summary=page.locator('.case-card:visible .moment-browser>summary');spec.touch?await summary.tap():await summary.click();const g=await geometry(page);assert.ok(g.body.width>=g.nav.width-30,spec.scale+' scaled content width');await page.getByRole('textbox',{name:'Giờ cần đến'}).fill('+1.5');const go=page.getByRole('button',{name:'Đến mốc',exact:true});spec.touch?await go.tap():await go.click();await page.waitForFunction(()=>document.querySelector('#app')._vnode.component.setupState.viewTime===1.5);assert.equal(await summary.evaluate(el=>el.parentElement.open),false,'Successful clock navigation closes its panel');assert.deepEqual((await state(page)).c,c);
      }
      await scaled.close();
    }
    assert.deepEqual(errors,[]);console.log('PASS: 125/150/200 percent device pixel densities, actual touch navigation in both modes, automatic panel close and unchanged source data');
  }finally{if(browser)await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());
