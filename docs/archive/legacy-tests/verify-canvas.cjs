// Đợt 8: select-to-edit on the chart, one edit history, paste/drop anywhere, Theo dõi bedside helpers.
// Run with PLAYWRIGHT_MODULE (and CHROME_EXECUTABLE if needed) like the other browser checks.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const files=new Set(['index.html','base.css','core.js','components.js','app.js','canva.css','workspace-next.js','workspace-next.css','studio.css','workspace.css','interaction.css','theme.css','canvas.css','clinical-rules.js','guidance.js','enhancements.js']);
const server=http.createServer(async(req,res)=>{
  const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!files.has(file)){res.writeHead(404);res.end();return}
  try{res.setHeader('Content-Type',(file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':'text/html')+'; charset=utf-8');res.end(await fs.readFile(path.join(__dirname,file)))}catch{res.writeHead(500);res.end()}
});
const state=p=>p.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState;return {mode:a.mode,tool:a.toolTab,designTab:a.designTab,scope:a.sizeScope,section:a.contextSection.id,point:a.dataPoint&&{...a.dataPoint},pane:a.inspectorPane,case:JSON.parse(JSON.stringify(a.activeCase)),design:JSON.parse(JSON.stringify(a.design)),importer:a.importerOpen,time:a.selectedTime,nowSlot:a.nowSlot,next:{...a.nextExam}}});
const ready=p=>p.waitForSelector('#app:not([v-cloak])');
const toast=async p=>(await p.locator('.toast').count())?await p.locator('.toast').innerText():'';
const point=(p,field,nth=1)=>p.locator('[data-point-hit][data-observation-field="'+field+'"]').nth(nth);
const centre=async loc=>{const b=await loc.boundingBox();return {x:b.x+b.width/2,y:b.y+b.height/2}};
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const url='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{channel:'chrome'})});
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
    page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
    await page.goto(url);await ready(page);
    const original=(await state(page)).case;

    // 1. A selected point shows its data and its line style in one panel.
    await point(page,'cervix').click();assert.equal((await state(page)).tool,'overview');await page.locator('.point-toolbar .point-more-button').click();await page.getByRole('menuitem',{name:'Mở ô nhập số liệu',exact:true}).click();await page.waitForSelector('.point-quick-editor');
    assert.equal((await state(page)).tool,'data');assert.ok((await page.locator('.panel-context').innerText()).startsWith('CTC ·'));
    await page.getByRole('tab',{name:'Trình bày',exact:true}).click();await page.waitForSelector('.point-style .series-style');
    await page.locator('.point-style').getByRole('radio',{name:'Màu #2469ab',exact:true}).click();
    assert.equal((await state(page)).design.series.ctc.color,'#2469ab');
    await page.locator('.point-style').getByRole('radio',{name:'Vuông',exact:true}).click();assert.equal((await state(page)).design.series.ctc.marker,'square');
    assert.deepEqual((await state(page)).case,original,'Style edits never touch the measurements');
    await page.getByRole('button',{name:'Hoàn tác thao tác gần nhất',exact:true}).click();assert.equal((await state(page)).design.series.ctc.marker,'cross');
    await page.getByRole('button',{name:'Hoàn tác thao tác gần nhất',exact:true}).click();assert.equal((await state(page)).design.series.ctc.color,'#d42f4e');
    await page.getByRole('button',{name:'Làm lại thao tác',exact:true}).click();assert.equal((await state(page)).design.series.ctc.color,'#2469ab');
    await page.getByRole('button',{name:'Hoàn tác thao tác gần nhất',exact:true}).click();
    await page.getByRole('tab',{name:'Số liệu',exact:true}).click();await page.waitForSelector('#point-value-input');
    await page.locator('#point-value-input').press('Escape');assert.equal((await state(page)).tool,'overview','Dismissing the selection closes the panel it opened');
    await point(page,'descent',2).click();await page.locator('.point-toolbar .point-more-button').click();await page.getByRole('menuitem',{name:'Mở ô nhập số liệu',exact:true}).click();await page.getByRole('tab',{name:'Trình bày',exact:true}).click();await page.waitForSelector('.point-head-style .head-marker-editor');
    await page.keyboard.press('Escape');await page.keyboard.press('0');assert.equal((await state(page)).tool,'overview');
    console.log('PASS: point inspector with Số liệu / Trình bày tabs, head marker at the point, Esc closes, data untouched');

    // 2. Floating toolbar: the line colour and symbol one tap away.
    await point(page,'fhr',4).click({button:'right'});await page.waitForSelector('.point-toolbar');
    assert.ok(await page.locator('.point-toolbar>button').count()<=5,'The floating toolbar stays at five buttons');
    await page.locator('.point-toolbar').getByRole('button',{name:'Thêm thao tác với điểm',exact:true}).click();await page.locator('.point-style-menu').getByRole('menuitemradio',{name:'Màu #b45309',exact:true}).click();
    assert.equal((await state(page)).design.series.fhr.color,'#b45309');
    await page.keyboard.press('Control+z');assert.equal((await state(page)).design.series.fhr.color,'#172b3a','Ctrl Z undoes a style change from Xem');
    await page.keyboard.press('Escape');
    console.log('PASS: floating point toolbar restyles the whole line; Ctrl Z works outside Trình bày');

    // 3. Row labels select a region: its data and layout together.
    await page.locator('[data-label-section="contractions"]').click();await page.waitForSelector('.section-context');
    let s=await state(page);assert.equal(s.tool,'design');assert.equal(s.section,'contractions');
    assert.ok((await page.locator('.section-data').innerText()).includes('13'));
    await page.locator('.section-data').getByRole('button',{name:/^Nhập tại/}).click();await page.waitForSelector('.chart-cell-editor');
    assert.equal((await state(page)).tool,'overview');await page.keyboard.press('Escape');
    await page.locator('[data-label-section="temperature"]').click();await page.locator('.section-data').getByRole('button',{name:'Ẩn vùng',exact:true}).click();
    s=await state(page);assert.equal(s.design.rowMode,'custom');assert.equal(s.design.sections.temperature,false);assert.equal(s.design.sections.fhr,true);
    assert.ok((await toast(page)).includes('Đã ẩn vùng Nhiệt độ'));
    await page.getByRole('button',{name:'Hoàn tác thao tác gần nhất',exact:true}).click();s=await state(page);assert.equal(s.design.rowMode,'auto');
    await page.keyboard.press('0');
    const temp=page.locator('[data-cell-key="temperature"]').nth(14);await temp.click();await page.waitForSelector('.chart-cell-editor .cell-region-style');
    await page.locator('.chart-cell-editor .cell-region-style').click();s=await state(page);assert.equal(s.tool,'design');assert.equal(s.section,'temperature');
    await page.keyboard.press('Escape');assert.equal((await state(page)).tool,'overview');
    console.log('PASS: row label selects a region, region panel enters data and hides/restores rows, cell editor links to its region');

    // 4. Gestures on the grid: double-click to add, type a digit to edit, right-click for local actions, hover readout.
    await page.locator('.progress-field-picker:visible').getByRole('button',{name:'CTC',exact:true}).click();
    await point(page,'cervix',3).evaluate(e=>e.scrollIntoView({block:'center'}));
    const last=await centre(point(page,'cervix',3));let before=(await state(page)).case.observations.filter(o=>o.cervix!==null).length;
    await page.mouse.dblclick(last.x+60,last.y+40);await page.waitForFunction(n=>document.querySelector('#app')._vnode.component.setupState.activeCase.observations.filter(o=>o.cervix!==null).length===n+1,before);
    assert.ok((await toast(page)).startsWith('Đã thêm CTC'));
    await page.mouse.move(last.x+60,last.y+60);await page.waitForSelector('.chart-hover-readout');assert.ok((await page.locator('.chart-hover-readout').innerText()).includes('CTC'));
    await page.keyboard.press('Control+z');assert.equal((await state(page)).case.observations.filter(o=>o.cervix!==null).length,before);
    await point(page,'cervix',2).focus();await page.keyboard.press('7');const box=page.locator('.chart-cell-editor [data-input-key="cervix"]');await box.waitFor();
    assert.equal(await box.inputValue(),'7');await page.keyboard.type('.5');await page.keyboard.press('Enter');
    await page.waitForFunction(()=>!document.querySelector('.chart-cell-editor'));assert.ok((await state(page)).case.observations.some(o=>o.cervix===7.5));
    await page.keyboard.press('Control+z');
    await page.mouse.click(last.x+60,last.y+40,{button:'right'});await page.waitForSelector('.chart-context-menu');
    const items=await page.locator('.chart-context-menu [role=menuitem]').allInnerTexts();assert.ok(items.some(t=>t.startsWith('Thêm CTC')));assert.ok(items.some(t=>t.startsWith('Thêm ghi chú sự kiện')));assert.ok(items.some(t=>t.startsWith('Trình bày vùng')));
    const events=(await state(page)).case.events.length;
    await page.locator('.chart-context-menu').getByRole('menuitem',{name:/^Thêm ghi chú sự kiện/}).click();await page.waitForSelector('.event-pop');
    assert.equal((await state(page)).case.events.length,events+1);await page.keyboard.type('Chọc ối kiểm tra');await page.keyboard.press('Enter');
    await page.waitForFunction(()=>!document.querySelector('.event-pop'));assert.ok((await state(page)).case.events.some(e=>e.label==='Chọc ối kiểm tra'));
    const row=await centre(page.locator('[data-cell-key="contractions"]').nth(18));await page.mouse.click(row.x,row.y,{button:'right'});
    assert.ok((await page.locator('.chart-context-menu').innerText()).includes('Nhập cơn co lúc'));await page.keyboard.press('Escape');
    assert.equal(await page.locator('.chart-context-menu').count(),0);
    console.log('PASS: double-click add, hover readout, type-to-edit, right-click menu, arrow inserted and typed in place');

    // 5. One history across data and design, in order.
    const data0=(await state(page)).case,design0=(await state(page)).design;
    await page.mouse.dblclick(last.x+100,last.y+40);await page.waitForFunction(n=>document.querySelector('#app')._vnode.component.setupState.activeCase.observations.length>=n,data0.observations.length);
    await page.keyboard.press('Escape');await page.locator('[data-label-section="fhr"]').click();await page.locator('.section-context').getByRole('button',{name:'+10%',exact:true}).click();
    assert.notDeepEqual((await state(page)).design,design0);
    await page.keyboard.press('Escape');await page.keyboard.press('Control+z');assert.deepEqual((await state(page)).design,design0,'Latest change (design) is undone first');assert.notDeepEqual((await state(page)).case,data0);
    await page.keyboard.press('Control+z');assert.deepEqual((await state(page)).case,data0,'Then the earlier data change');
    await page.keyboard.press('Control+y');assert.notDeepEqual((await state(page)).case,data0);await page.keyboard.press('Control+y');assert.notDeepEqual((await state(page)).design,design0);
    await page.keyboard.press('Control+z');await page.keyboard.press('Control+z');
    console.log('PASS: header and keyboard undo/redo follow the true order of data and design edits');

    // 6. Ctrl S, paste anywhere, drop anywhere.
    await page.keyboard.press('Control+s');assert.ok(await page.evaluate(()=>!!localStorage.getItem('partograph-session-v1')));assert.ok((await toast(page)).includes('Đã lưu phiên'));
    const json=await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.jsonText);
    await page.evaluate(t=>{const d=new DataTransfer();d.setData('text/plain',t);document.body.dispatchEvent(new ClipboardEvent('paste',{clipboardData:d,bubbles:true}))},json);
    await page.waitForSelector('.json-workbench[open] .json-preview-column .partograph');assert.equal(await page.getByRole('button',{name:'Bước 2: Nhập kết quả AI',exact:true}).getAttribute('aria-pressed'),'true');
    await page.getByRole('button',{name:'Để sau',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.json-workbench'));
    await page.evaluate(()=>{document.body.dispatchEvent(new ClipboardEvent('paste',{clipboardData:(()=>{const d=new DataTransfer();d.setData('text/plain','ghi chú bình thường');return d})(),bubbles:true}))});
    assert.equal((await state(page)).importer,false,'Ordinary text is ignored');
    const dt=await page.evaluateHandle(t=>{const d=new DataTransfer();d.items.add(new File([t],'ca.json',{type:'application/json'}));return d},json);
    await page.dispatchEvent('main','dragover',{dataTransfer:dt});assert.equal(await page.locator('.drop-overlay').count(),1);
    await page.dispatchEvent('main','drop',{dataTransfer:dt});await page.waitForSelector('.json-workbench[open] .json-preview-column .partograph');assert.equal(await page.locator('.drop-overlay').count(),0);
    await page.getByRole('button',{name:'Để sau',exact:true}).click();
    console.log('PASS: Ctrl S saves on this device; pasted or dropped chart data opens a preview without applying it');

    // 7. Header: history group, icon help, AI in the single accent, no rail tooltip over the panel.
    assert.equal(await page.locator('.history-actions').isVisible(),true);assert.equal(await page.locator('.learning-trigger').isVisible(),true);
    assert.equal((await page.locator('.learning-trigger').innerText()).trim(),'');
    const ai=await page.locator('.json-entry').evaluate(e=>getComputedStyle(e).backgroundImage);assert.equal(ai,'none','AI action is not a gradient');
    await page.keyboard.press('Alt+1');await page.locator('#studio-tools-navigation').getByRole('button',{name:'Nhập / Sửa',exact:true}).hover();
    assert.equal(await page.locator('#studio-tools-navigation .dock-tooltip:visible').count(),0);
    await page.keyboard.press('0');
    console.log('PASS: quiet header, accent-only AI action, rail tooltips never cover the open panel');

    // 8. Theo dõi: Bây giờ, countdown, readouts in the folded summary, Enter walks the form, previous values as hints.
    await page.getByRole('radio',{name:'Theo dõi'}).click();
    await page.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState,d=new Date(Date.now()-90*60000),pad=n=>String(n).padStart(2,'0');a.clinical.patient.date=d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());a.clinical.patient.startTime=pad(d.getHours())+':'+pad(d.getMinutes());a.clinical.observations=[{...a.clinical.observations[0],time:0,cervix:5,fhr:140,descent:4,contractions:3,duration:35}];a.selectedTime=0});
    s=await state(page);assert.ok(s.nowSlot>=1&&s.nowSlot<=2);
    await page.locator('.clinical-now').click();assert.equal((await state(page)).time,s.nowSlot);
    assert.ok(/còn \d/.test(s.next.countdown));assert.ok((await page.locator('.exam-countdown').innerText()).startsWith('còn'));
    await page.evaluate(()=>{document.querySelector('#app')._vnode.component.setupState.selectedTime=0});
    assert.ok((await page.locator('.fold-readouts').innerText()).includes('CTC 5'));
    await page.evaluate(()=>{document.querySelector('#app')._vnode.component.setupState.selectedTime=1});
    await page.getByRole('button',{name:'Ghi mốc',exact:true}).click();await page.waitForSelector('#quick-fhr');
    assert.ok((await page.locator('#quick-fhr').getAttribute('placeholder')).startsWith('Trước: 140'));assert.equal(await page.locator('#quick-fhr').inputValue(),'','The previous value is a hint, never filled in');
    await page.locator('#quick-fhr').fill('142');await page.locator('#quick-fhr').press('Enter');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'quick-cervix','Enter moves to the next box');
    assert.ok(!(await state(page)).case.observations.some(o=>o.time===1),'Enter alone does not record');
    await page.keyboard.press('Control+Enter');await page.waitForFunction(()=>document.querySelector('#app')._vnode.component.setupState.clinical.observations.some(o=>o.time===1&&o.fhr===142));
    console.log('PASS: Bây giờ, live countdown, readouts in summary, Enter walks the Ghi mốc form, previous values only as hints');

    // 9. Phone: a tap keeps the chart visible; header fits.
    const phone=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),tap=await phone.newPage();tap.on('pageerror',e=>errors.push(e.message));
    await tap.goto(url);await ready(tap);
    await tap.locator('[data-point-hit][data-observation-field="cervix"]').nth(1).tap();await tap.waitForSelector('.point-toolbar');
    assert.equal(await tap.locator('#studio-toolbox[aria-modal=true]').count(),0);
    const bar=await tap.locator('.point-toolbar').boundingBox();assert.ok(bar.x>=0&&bar.x+bar.width<=390);
    const hist=await tap.locator('.history-actions').boundingBox();assert.ok(hist&&hist.x>=0&&hist.x+hist.width<=390);
    assert.equal(await tap.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await tap.screenshot({path:path.join(os.tmpdir(),'vesando-canvas-mobile.png'),animations:'disabled'});
    await phone.close();
    for(const theme of ['light','dark']){await page.evaluate(t=>{document.querySelector('#app')._vnode.component.setupState.theme=t},theme);await page.screenshot({path:path.join(os.tmpdir(),'vesando-canvas-'+theme+'.png'),animations:'disabled'})}
    assert.deepEqual(errors,[]);
    console.log('PASS: phone tap keeps the chart in view, header fits 390 px, both themes, no runtime or console errors');
  }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
