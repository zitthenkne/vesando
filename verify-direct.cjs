// Unified choose/add gestures in both workspaces; use an existing PLAYWRIGHT_MODULE if needed.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const files=new Set(['index.html','studio.css','workspace.css','interaction.css','theme.css','canvas.css','clinical-rules.js','guidance.js','enhancements.js']);
const server=http.createServer(async(req,res)=>{const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(!files.has(file)){res.writeHead(404);res.end();return}try{res.setHeader('Content-Type',(file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':'text/html')+'; charset=utf-8');res.end(await fs.readFile(path.join(__dirname,file)))}catch{res.writeHead(500);res.end()}});
const state=p=>p.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState;return JSON.parse(JSON.stringify({c:a.activeCase,clinical:a.clinical,cases:a.cases,tool:a.toolTab,edit:a.dataMode,point:a.dataPoint,field:a.plotField,inspector:a.inspectorOpen,quick:a.quickDrafts}))});
const hit=(p,time,field)=>p.locator('.case-card:visible [data-point-hit][data-observation-time="'+time+'"][data-observation-field="'+field+'"]');
async function at(p,time,field,value){return p.evaluate(({time,field,value})=>{const a=document.querySelector('#app')._vnode.component.setupState,c=window.PartographCore,d=c.buildSVG(a.activeCase,{...a.chartOptions,editable:true,field:a.plotField}),svg=[...document.querySelectorAll('.case-card .partograph')].find(e=>e.checkVisibility()),r=svg.getBoundingClientRect(),y=field==='fhr'?c.fetalHeartY(value):c.cervixY(value);return {x:r.x+(c.G.left+d.labelOffset+d.timeline.plot(time)*d.hour)*d.scaleX*r.width/d.width,y:r.y+d.rowLayout.y(y)*d.scaleY*r.height/d.height}},{time,field,value})}
async function clickAt(p,time,field,value){const svg=p.locator('.case-card:visible .partograph');await svg.scrollIntoViewIfNeeded();const pos=await at(p,time,field,value);await p.mouse.click(pos.x,pos.y);await p.evaluate(()=>Vue.nextTick())}
async function undo(p){await p.keyboard.press('Control+z');await p.evaluate(()=>Vue.nextTick())}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
  try{
    browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{channel:'chrome'})});
    const errors=[],url='http://127.0.0.1:'+server.address().port;
    for(const mode of ['exam','clinical']){
      const context=await browser.newContext({viewport:{width:1440,height:1100},reducedMotion:'reduce'}),page=await context.newPage();page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
      await page.goto(url);await page.waitForSelector('#app:not([v-cloak])');
      if(mode==='clinical'){
        await page.getByRole('radio',{name:'Theo dõi',exact:true}).click();assert.equal(await page.locator('[data-plot="fhr"]:visible').count(),1,'An empty monitoring chart exposes its FHR band immediately');
        await clickAt(page,0,'fhr',140);let empty=(await state(page)).c;assert.ok(Math.abs(empty.observations[0].fhr-140)<=1,'The first grid boundary accepts a click within one screen pixel');assert.equal(empty.observations[0].cervix,null,'First FHR entry invents no other measurements');
        await page.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState;a.openClinical(a.cases[0])});
      }
      const base=(await state(page)).c,exam=(await state(page)).cases,svg=page.locator('.case-card:visible .partograph');
      assert.equal((await state(page)).edit,'drag');assert.equal(await page.locator('.chart-interaction-bar:visible').count(),1);
      const beforeWidth=(await svg.boundingBox()).width;
      await hit(page,2,'cervix').click();
      assert.equal((await state(page)).tool,'overview');assert.equal((await state(page)).inspector,false);
      await page.locator('.point-toolbar:visible').waitFor();assert.equal((await svg.boundingBox()).width,beforeWidth,'Choosing a point never shrinks the drawing');
      assert.deepEqual((await state(page)).c,base);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.point-toolbar:visible').count(),0);
      await hit(page,2,'cervix').click();await page.locator('.point-toolbar:visible').waitFor();assert.deepEqual((await state(page)).c,base,'The same point can be selected again immediately after dismissal');await page.keyboard.press('Escape');
      let pos=await at(page,7,'cervix',5);await page.mouse.move(pos.x,pos.y);
      await page.waitForSelector('.point-add-preview');assert.match(await page.locator('.chart-hover-readout').innerText(),/5/);
      await page.mouse.click(pos.x,pos.y);await page.evaluate(()=>Vue.nextTick());
      assert.equal((await state(page)).c.observations.find(o=>o.time===7).cervix,5,'A single blank click adds a point');
      assert.equal((await state(page)).tool,'overview');
      await undo(page);assert.deepEqual((await state(page)).c,base);
      await page.locator('.progress-field-picker:visible').getByRole('button',{name:'Đầu trên vệ',exact:true}).click();
      await clickAt(page,7,'descent',2);assert.equal((await state(page)).c.observations.find(o=>o.time===7).descent,2);
      await clickAt(page,7,'fhr',150);let s=await state(page);assert.equal(s.c.observations.find(o=>o.time===7).fhr,150);assert.equal(s.field,'descent','Entering FHR preserves the progress-grid choice');
      await undo(page);await undo(page);assert.deepEqual((await state(page)).c,base);
      await page.locator('.progress-field-picker:visible').getByRole('button',{name:'CTC',exact:true}).click();
      await clickAt(page,2,'cervix',8.5);await page.waitForSelector('.chart-cell-editor');
      assert.deepEqual((await state(page)).c,base,'Clicking another height at an occupied time does not overwrite its recorded value');
      await page.locator('.chart-cell-editor').press('Escape');
      pos=await at(page,7,'cervix',5);await page.mouse.dblclick(pos.x,pos.y);await page.evaluate(()=>Vue.nextTick());
      assert.equal((await state(page)).c.observations.filter(o=>o.time===7&&o.cervix!==null).length,1,'A double-click adds once');
      if(await page.locator('.chart-cell-editor').count())await page.locator('.chart-cell-editor').press('Escape');
      await page.keyboard.press('Escape');await undo(page);assert.deepEqual((await state(page)).c,base);
      pos=await at(page,7,'cervix',5);await page.mouse.move(pos.x,pos.y);await page.mouse.down();await page.mouse.move(pos.x+30,pos.y+25,{steps:5});await page.mouse.up();
      assert.deepEqual((await state(page)).c,base,'A blank drag is never recorded as a click');
      await page.keyboard.press('Alt+1');assert.equal(await page.locator('.data-mode-picker button').count(),2);
      assert.equal(await page.getByRole('button',{name:'Thêm điểm',exact:true}).count(),0);
      await hit(page,2,'cervix').click();const input=page.locator('#point-value-input');await input.fill('6.3');
      await hit(page,4,'cervix').click();assert.equal((await state(page)).point.time,2);assert.equal(await input.inputValue(),'6.3','Unfinished input is retained when another point is clicked');
      await input.fill('6.5');await page.locator('.point-quick-editor button[type=submit]').click();assert.equal((await state(page)).c.observations.find(o=>o.time===2).cervix,6.5);
      await undo(page);assert.deepEqual((await state(page)).c,base);
      await page.locator('.overview-toggle').click();await page.evaluate(()=>window.scrollTo(0,0));
      await page.screenshot({path:path.join(os.tmpdir(),'vesando-direct-'+mode+'.png')});
      if(mode==='clinical')assert.deepEqual((await state(page)).cases,exam);
      await context.close();console.log('PASS: '+mode+' single-click add/select, stable canvas, preview, shared-grid choice, automatic FHR, collision protection, double-click, blank drag, undo and unfinished input');
    }
    const context=await browser.newContext({viewport:{width:390,height:900},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url);await page.waitForSelector('#app:not([v-cloak])');
    for(const mode of ['exam','clinical']){
      if(mode==='clinical')await page.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState;a.openClinical(a.cases[0])});
      const base=(await state(page)).c;
      // Zoom provides separate, finger-sized grid cells on a narrow screen.
      await page.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState,c=a.mode==='clinical'?a.clinicalChart:a.examCharts[0];c.zoom=200});
      await hit(page,2,'cervix').scrollIntoViewIfNeeded();await hit(page,2,'cervix').tap();
      assert.equal((await state(page)).tool,'overview');assert.equal(await page.locator('.toolbox-backdrop').count(),0);assert.deepEqual((await state(page)).c,base);
      await page.keyboard.press('Escape');
      await page.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState,c=a.mode==='clinical'?a.clinicalChart:a.examCharts[0];c.zoom=100});
      const pos=await at(page,7,'cervix',5);await page.touchscreen.tap(pos.x,pos.y);await page.evaluate(()=>Vue.nextTick());
      assert.equal((await state(page)).c.observations.find(o=>o.time===7).cervix,5);
      await undo(page);assert.deepEqual((await state(page)).c,base);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.screenshot({path:path.join(os.tmpdir(),'vesando-direct-mobile-'+mode+'.png')});
    }
    await context.close();assert.deepEqual(errors,[]);console.log('PASS: mobile touch in both workspaces, no modal selection, single-tap add, undo, no page overflow and no runtime errors');
  }finally{if(browser)await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
