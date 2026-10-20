// Browser checks: set PLAYWRIGHT_MODULE and, if needed, CHROME_EXECUTABLE.
// Uses installed Playwright and a temporary local server; adds no dependencies.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const files={'/':'index.html','/index.html':'index.html','/interaction.css':'interaction.css','/workspace.css':'workspace.css','/studio.css':'studio.css','/clinical-rules.js':'clinical-rules.js','/guidance.js':'guidance.js','/enhancements.js':'enhancements.js'};
const server=http.createServer(async(req,res)=>{const file=files[new URL(req.url,'http://localhost').pathname];if(!file){res.writeHead(404);res.end();return}try{const bytes=await fs.readFile(path.join(__dirname,file));res.setHeader('Content-Type',(file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':'text/html')+'; charset=utf-8');res.end(bytes)}catch{res.writeHead(500);res.end()}});
async function source(page,clinical=false){return page.evaluate(c=>JSON.stringify(document.querySelector('#app')._vnode.component.setupState[c?'clinical':'activeCase'].observations),clinical)}
async function change(input,value){await input.fill(String(value));await input.press('Tab')}
async function themeUI(p){await p.getByRole('button',{name:'Tùy biến không gian',exact:true}).click();await p.locator('.preference-theme').click();await p.getByRole('button',{name:'Xong',exact:true}).click()}
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{channel:'chrome'})});
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
    // Exercise the expanded configuration as well as the quiet defaults in verify-workspace.cjs.
    await context.addInitScript(()=>localStorage.setItem('partograph-workspace-v3',JSON.stringify({ui:{dock:'side',dragAxis:'free',timeline:true,hints:true,diagnostics:true,chartHeader:true,caseStrip:true}})));
    page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url);await page.waitForSelector('#app:not([v-cloak])');
    assert.equal(await page.locator('.toolbox').isVisible(),false,'The initial view gives the chart the full workspace');
    assert.equal(await page.locator('.case-narrative').getAttribute('open'),null);
    await page.screenshot({path:path.join(os.tmpdir(),'vesando-ui-clean-start.png'),fullPage:true,animations:'disabled'});
    await page.locator('.tool-tabs button').nth(1).click();
    // Convenience controls must change only their intended scope.
    const designState=()=>page.evaluate(()=>JSON.parse(JSON.stringify(document.querySelector('#app')._vnode.component.setupState.design)));
    const measurements=()=>page.evaluate(()=>JSON.stringify(document.querySelector('#app')._vnode.component.setupState.activeCase.observations.map(({headMarker,...o})=>o)));
    const beforeConvenience=await measurements(),railBox=await page.locator('.tool-rail').boundingBox(),inspectorBox=await page.locator('.inspector-shell').boundingBox();
    assert.ok(railBox.x>=inspectorBox.x+inspectorBox.width&&railBox.x-inspectorBox.x-inspectorBox.width<20,'Navigation sits directly beside the right inspector');
    const splitter=page.getByRole('separator',{name:'Độ rộng bảng công cụ'}),splitBox=await splitter.boundingBox();
    await page.mouse.move(splitBox.x+splitBox.width/2,splitBox.y+35);await page.mouse.down();await page.mouse.move(splitBox.x-50,splitBox.y+35,{steps:5});await page.mouse.up();
    assert.ok((await page.locator('.inspector-shell').boundingBox()).width>inspectorBox.width+40);
    await splitter.focus();await page.keyboard.press('ArrowRight');assert.equal(await splitter.getAttribute('aria-valuenow'),'376');
    const board=page.locator('.board-dimensions');await board.locator('.dimension-advanced>summary').click();
    await board.getByRole('button',{name:'Thoáng',exact:true}).click();assert.equal((await designState()).cellWidth,1.6);assert.equal((await designState()).rowHeight,1.1);
    let priorDesign=await designState();await board.getByRole('button',{name:'+10%',exact:true}).click();let nextDesign=await designState();
    assert.ok(Math.abs(nextDesign.cellWidth/priorDesign.cellWidth-1.1)<.002&&Math.abs(nextDesign.rowHeight/priorDesign.rowHeight-1.1)<.003);
    await board.getByLabel('Khóa tỷ lệ',{exact:true}).check();priorDesign=await designState();
    await change(board.getByLabel('Rộng sản đồ (px)',{exact:true}),Number(await board.getByLabel('Rộng sản đồ (px)',{exact:true}).inputValue())+70);
    nextDesign=await designState();assert.ok(Math.abs(nextDesign.cellWidth/priorDesign.cellWidth-nextDesign.rowHeight/priorDesign.rowHeight)<.003,'Locked aspect ratio updates both axes');
    await page.getByRole('button',{name:'Hoàn tác thiết kế',exact:true}).click();assert.deepEqual(await designState(),priorDesign);
    await page.getByRole('button',{name:'Làm lại thiết kế',exact:true}).click();assert.deepEqual(await designState(),nextDesign);
    await board.getByRole('button',{name:'Khôi phục kích thước toàn bảng',exact:true}).click();
    await page.getByRole('button',{name:'Từng vùng',exact:false}).click();assert.equal(await board.count(),0);
    await page.getByLabel('Vùng trên sản đồ',{exact:true}).selectOption('fhr');await page.locator('.section-context').getByRole('button',{name:'Thoáng',exact:true}).click();
    assert.ok(Math.abs((await designState()).sectionHeights.fhr-1.4)<.001);assert.equal((await designState()).sectionHeights.progress,1);
    await page.locator('.section-context').getByRole('button',{name:'+10%',exact:true}).click();assert.ok(Math.abs((await designState()).sectionHeights.fhr-1.54)<.01);
    await page.locator('.section-context').getByRole('button',{name:'Khôi phục chiều cao vùng này',exact:true}).click();assert.equal((await designState()).sectionHeights.fhr,1);
    await page.locator('.design-nav').getByRole('button',{name:'Nét vẽ',exact:true}).click();
    await page.locator('.symbol-controls input[type=color]').fill('#aa6611');assert.equal((await designState()).series.ctc.color,'#aa6611');
    const otherSeries=(await designState()).series.des;
    await page.getByRole('button',{name:'Khôi phục riêng CTC',exact:true}).click();assert.equal((await designState()).series.ctc.color,'#d42f4e');assert.deepEqual((await designState()).series.des,otherSeries);
    await page.locator('.design-nav').getByRole('button',{name:'Kiểu thế',exact:true}).click();
    const convenienceHead=page.locator('.head-marker-tool');await convenienceHead.locator('.head-position-grid>button').first().click();
    await convenienceHead.getByRole('button',{name:'Màu #7c3aed',exact:true}).click();assert.equal(await page.locator('.partograph [data-head-marker] circle').getAttribute('stroke'),'#7c3aed');
    await page.getByRole('button',{name:'Mốc kiểu thế sau',exact:true}).click();await convenienceHead.locator('.head-position-grid>button').nth(6).click();
    await page.getByRole('button',{name:'Mốc kiểu thế trước',exact:true}).click();assert.equal(await convenienceHead.getByRole('button',{name:'Màu #7c3aed',exact:true}).getAttribute('aria-pressed'),'true');
    await convenienceHead.locator('.head-fine-tune>summary').click();await convenienceHead.locator('.head-hex>summary').click();const hex=convenienceHead.getByLabel('Mã màu hình kiểu thế',{exact:true});await change(hex,'badhex');assert.equal(await hex.getAttribute('aria-invalid'),'true');
    assert.equal(await page.locator('.partograph [data-head-marker]').first().locator('circle').getAttribute('stroke'),'#7c3aed');
    await change(hex,'#11AA66');assert.equal(await page.locator('.partograph [data-head-marker]').first().locator('circle').getAttribute('stroke'),'#11aa66');
    await convenienceHead.locator('.head-fine-tune>summary').click();await convenienceHead.locator('.head-batch>summary').click();await convenienceHead.getByLabel('Phạm vi áp dụng kiểu hình',{exact:true}).selectOption('all');await convenienceHead.locator('.head-batch button').click();
    assert.equal(await page.locator('.partograph [data-head-marker]').count(),4);
    assert.equal(await page.locator('.partograph [data-head-marker]').nth(1).getAttribute('data-angle'),'0','Batch formatting preserves each existing orientation');
    await page.keyboard.press('Control+z');assert.equal(await page.locator('.partograph [data-head-marker]').count(),2);
    await page.keyboard.press('Control+Shift+z');assert.equal(await page.locator('.partograph [data-head-marker]').count(),4);
    await convenienceHead.locator('.head-batch>summary').click();await page.getByRole('button',{name:'Tìm hình này trên sản đồ',exact:true}).click();assert.equal(await page.locator('.partograph .point-highlight').count(),1);
    assert.equal(await measurements(),beforeConvenience);
    await page.screenshot({path:path.join(os.tmpdir(),'vesando-usability-desktop.png'),fullPage:true,animations:'disabled'});
    await page.setViewportSize({width:390,height:844});await page.locator('.tool-tabs button').nth(1).click();
    await page.locator('.tool-tabs button').nth(2).click();await page.waitForSelector('.review-inspector:visible');
    await page.locator('.tool-tabs button').nth(1).click();await page.waitForSelector('.head-marker-tool:visible');
    await page.screenshot({path:path.join(os.tmpdir(),'vesando-usability-mobile.png'),animations:'disabled'});
    await page.setViewportSize({width:1440,height:1000});await page.locator('.quick-export').click();
    await page.locator('.format-choice button').nth(1).click();
    const [coloredDownload]=await Promise.all([page.waitForEvent('download'),page.locator('.export-main').click()]);
    const coloredSVG=await fs.readFile(await coloredDownload.path(),'utf8');
    assert.ok(coloredSVG.includes('#11aa66')&&!coloredSVG.includes('data-design-section='),'Custom per-point color survives an actual SVG download');
    console.log('PASS: right-side navigation, pointer/keyboard panel resize, global/local presets, 10% steps, ratio lock, design undo/redo, scoped style reset, HEX colors, point navigation, batch formatting/undo and locate');
    await page.setViewportSize({width:1440,height:1000});await page.reload();await page.waitForSelector('#app:not([v-cloak])');await page.locator('.tool-tabs button').nth(1).click();
    const original=await source(page),sectionSelect=page.locator('.section-context select'),height=page.getByLabel('Cao vùng (px)',{exact:true});
    await page.locator('[data-design-section=fhr]').focus();await page.keyboard.press('Enter');assert.equal(await sectionSelect.inputValue(),'fhr');
    await change(height,190);assert.equal(await height.inputValue(),'190');assert.equal(await source(page),original);
    await sectionSelect.selectOption('progress');await change(height,320);
    await page.getByRole('button',{name:'Toàn bảng',exact:false}).click();
    await page.locator('.dimension-advanced>summary').click();await change(page.getByLabel('Rộng sản đồ (px)',{exact:true}),1300);
    await page.locator('.board-dimensions > details:not(.dimension-advanced)>summary').click();await change(page.getByLabel('Rộng vùng nhãn (px)',{exact:true}),230);
    await page.getByRole('button',{name:'Từng vùng',exact:false}).click();
    assert.equal(await source(page),original);assert.ok(Math.abs(Number(await height.inputValue())-320)<=1);
    const handle=page.locator('[data-resize-section=progress]');await handle.scrollIntoViewIfNeeded();const handleBox=await handle.boundingBox();
    await page.mouse.move(handleBox.x+handleBox.width/2,handleBox.y+handleBox.height/2);await page.mouse.down();await page.mouse.move(handleBox.x+handleBox.width/2,handleBox.y+handleBox.height/2+35,{steps:6});await page.mouse.up();
    assert.ok(Number(await height.inputValue())>340);assert.equal(await source(page),original);
    console.log('PASS: section selection, individual height, common width, label width and direct resize handle');

    await page.locator('[data-design-section=fhr]').scrollIntoViewIfNeeded();
    const hit=await page.evaluate(()=>{const app=document.querySelector('#app')._vnode.component.setupState,d=window.PartographCore.buildSVG(app.activeCase,app.chartOptions),r=document.querySelector('.case-card .partograph').getBoundingClientRect();return {x:r.x+(158+d.labelOffset+d.hour)*d.scaleX*r.width/d.width,y:r.y+d.rowLayout.y(window.PartographCore.fetalHeartY(180))*d.scaleY*r.height/d.height}});
    await page.mouse.click(hit.x,hit.y);assert.equal(await sectionSelect.inputValue(),'fhr');
    assert.equal(await source(page),original);
    await page.keyboard.press('Alt+1');await page.locator('.data-mode-picker').getByRole('button',{name:'Nhập bảng',exact:true}).click();await page.waitForSelector('.editor:visible');await page.keyboard.press('Alt+2');
    console.log('PASS: clicking empty chart regions opens the matching inspector');

    await page.keyboard.press('Control+k');await page.locator('#studio-command-input').fill('kieu the');await page.keyboard.press('Enter');await page.waitForSelector('.head-marker-tool:visible');
    await page.locator('.head-marker-editor input[type=checkbox]').check();assert.equal(await page.locator('.partograph [data-head-marker]').count(),1);
    const head=page.locator('.head-marker-tool'),positions=head.locator('.head-position-grid>button'),marker=page.locator('.partograph [data-head-marker]');
    assert.equal(await positions.count(),8);
    const observationsWithoutMarkers=()=>page.evaluate(()=>JSON.stringify(document.querySelector('#app')._vnode.component.setupState.activeCase.observations.map(({headMarker,...o})=>o)));
    const clinicalMeasurements=await observationsWithoutMarkers();
    for(const [index,angle] of [135,180,225,90,270,45,0,315].entries()){
      await positions.nth(index).click();assert.equal(await marker.getAttribute('data-angle'),String(angle));assert.equal(await positions.nth(index).getAttribute('aria-pressed'),'true');
    }
    for(const [label,value] of [['Thóp sau','posterior'],['Thóp trước','anterior'],['Cả hai thóp','both']]){
      await head.getByRole('button',{name:label,exact:true}).click();assert.equal(await marker.getAttribute('data-fontanelles'),value);
      assert.equal(await marker.locator('[data-fontanelle=anterior]').count(),value==='posterior'?0:1);
      assert.equal(await marker.locator('[data-fontanelle=posterior]').count(),value==='anterior'?0:1);
    }
    await head.locator('.head-fine-tune>summary').click();await change(head.getByLabel('Góc chính xác (°)',{exact:true}),117);assert.equal(await marker.getAttribute('data-angle'),'117');
    assert.equal(await head.locator('.head-position-grid [aria-pressed=true]').count(),0);
    await change(head.getByLabel('Cỡ hình',{exact:true}),16);assert.equal(await marker.locator('circle').getAttribute('r'),'16');
    await head.locator('.head-fine-tune>summary').click();
    const headMoment=head.getByLabel('Vị trí thay hình',{exact:true});await headMoment.selectOption({index:1});assert.equal(await head.locator('input[type=checkbox]').isChecked(),false);
    await head.getByRole('button',{name:'Thóp sau',exact:true}).click();assert.equal(await marker.count(),2);
    await head.locator('input[type=checkbox]').uncheck();assert.equal(await marker.count(),1);await headMoment.selectOption({index:0});
    assert.equal(await head.getByRole('button',{name:'Cả hai thóp',exact:true}).getAttribute('aria-pressed'),'true');
    await head.locator('input[type=checkbox]').uncheck();assert.equal(await marker.count(),0);await positions.first().click();assert.equal(await marker.count(),1);
    assert.equal(await observationsWithoutMarkers(),clinicalMeasurements);
    await page.screenshot({path:path.join(os.tmpdir(),'vesando-ui-head-picker.png'),animations:'disabled'});
    await page.setViewportSize({width:390,height:844});await page.waitForSelector('.toolbox[aria-modal=true]');
    await page.screenshot({path:path.join(os.tmpdir(),'vesando-ui-mobile-head-picker.png'),animations:'disabled'});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.setViewportSize({width:1440,height:1000});
    console.log('PASS: eight position presets, three fontanelle views, free angle/size, independent moments and unchanged clinical measurements');
    await page.keyboard.press('Control+k');await page.locator('#studio-command-input').fill('not-a-command-xyz');assert.equal(await page.locator('.command-empty').count(),1);await page.keyboard.press('Escape');
    await page.locator('.command-trigger').click();await page.locator('#studio-command-input').fill('net ve');await page.keyboard.press('Enter');await page.waitForSelector('.design-symbols:visible');
    assert.equal(await page.locator('dialog').count(),0);
    console.log('PASS: command search without Vietnamese accents, keyboard execution and empty state');

    await page.locator('.moment-navigation button').last().click();assert.equal(await page.locator('.moment-jump select').inputValue(),'1');await page.keyboard.press('Alt+ArrowRight');assert.equal(await page.locator('.moment-jump select').inputValue(),'2');
    await page.locator('.moment-jump select').selectOption('0');assert.equal(await page.locator('.moment-navigation button').first().isDisabled(),true);
    await page.locator('.moment-navigation button').last().focus();await page.keyboard.press('f');assert.equal(await page.locator('main.focused').count(),1);await page.keyboard.press('Escape');assert.equal(await page.locator('main.focused').count(),0);
    console.log('PASS: timeline navigation and focus mode shortcuts');

    await page.keyboard.press('Alt+1');await page.locator('.data-mode-picker').getByRole('button',{name:'Nhập bảng',exact:true}).click();await page.waitForSelector('.editor:visible');const cervix=page.locator('.editor-values input[type=number]').nth(1);await cervix.fill('4.5');
    await page.waitForSelector('.commit-draft');await page.locator('.quick-export').click();assert.equal(await page.locator('.export-main').isDisabled(),true);
    await page.locator('.commit-draft').click();await page.waitForFunction(()=>!document.querySelector('#app')._vnode.component.setupState.draftDirty);
    await page.locator('.command-trigger').focus();await page.keyboard.press('Control+z');assert.equal(await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.activeCase.observations[0].cervix),4);
    await page.keyboard.press('Control+Shift+z');assert.equal(await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.activeCase.observations[0].cervix),4.5);
    console.log('PASS: draft apply, export guard, undo and redo');

    await page.keyboard.press('Alt+2');await page.locator('.view-menu>summary').click();const zoom=page.getByLabel('Mức phóng sản đồ',{exact:true});await zoom.selectOption('200');await page.getByRole('button',{name:'Kéo để xem sản đồ',exact:true}).click();
    const beforePan=await source(page),scroll=page.locator('.case-card:visible .chart-scroll');await scroll.scrollIntoViewIfNeeded();const box=await scroll.boundingBox();await page.mouse.move(box.x+box.width*.7,box.y+220);await page.mouse.down();await page.mouse.move(box.x+box.width*.3,box.y+220,{steps:8});await page.mouse.up();
    assert.ok(await scroll.evaluate(el=>el.scrollLeft>0));assert.equal(await source(page),beforePan);await page.locator('.view-menu>summary').click();await page.getByRole('button',{name:'Khớp chiều rộng',exact:true}).click();assert.equal(await zoom.inputValue(),'100');
    console.log('PASS: zoom presets, drag to pan, and fit width without data changes');

    await themeUI(page);assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    assert.equal(await scroll.evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 255, 255)');
    const savedTheme=await context.newPage();await savedTheme.goto(url);await savedTheme.waitForSelector('#app:not([v-cloak])');assert.equal(await savedTheme.locator('html').getAttribute('data-theme'),'dark');await savedTheme.close();
    await page.screenshot({path:path.join(os.tmpdir(),'vesando-ui-dark.png'),fullPage:true,animations:'disabled'});await themeUI(page);
    await page.screenshot({path:path.join(os.tmpdir(),'vesando-ui-upgraded.png'),fullPage:true,animations:'disabled'});
    console.log('PASS: dark theme persistence with white chart paper');

    await page.keyboard.press('Alt+4');for(const [index,ext] of [[1,'svg'],[0,'png'],[2,'pdf']]){
      await page.locator('.format-choice button').nth(index).click();const [download]=await Promise.all([page.waitForEvent('download'),page.locator('.export-main').click()]);const bytes=await fs.readFile(await download.path());assert.ok(download.suggestedFilename().endsWith('.'+ext));
      if(ext==='svg'){const text=bytes.toString();assert.ok(!text.includes('data-design-section=')&&!text.includes('data-resize-section='));assert.ok(text.includes('data-head-marker='));}
      if(ext==='png')assert.equal(bytes.subarray(1,4).toString(),'PNG');if(ext==='pdf')assert.equal(bytes.subarray(0,4).toString(),'%PDF');
    }
    console.log('PASS: resized SVG/PNG/PDF exports exclude editor controls');

    for(const width of [320,390,768,1024]){await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Horizontal overflow at '+width)}
    await page.setViewportSize({width:390,height:844});await page.locator('.tool-tabs button').nth(1).click();await page.waitForSelector('.toolbox[aria-modal=true]');assert.equal(await page.locator('.workarea').getAttribute('inert'),'');
    await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>!!document.activeElement.closest('#studio-toolbox,#studio-tools-navigation')),true);await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>!!document.activeElement.closest('#studio-toolbox,#studio-tools-navigation')),true);
    await page.screenshot({path:path.join(os.tmpdir(),'vesando-ui-mobile-sheet.png'),animations:'disabled'});await page.keyboard.press('Escape');assert.equal(await page.locator('.toolbox[aria-modal=true]').count(),0);assert.equal(await page.locator('.mobile-tools-toggle').isVisible(),true);
    await page.screenshot({path:path.join(os.tmpdir(),'vesando-ui-mobile-workspace.png'),fullPage:true,animations:'disabled'});
    await page.locator('[data-design-section=fhr]').focus();await page.keyboard.press('Enter');await page.waitForSelector('.toolbox[aria-modal=true]');assert.equal(await sectionSelect.inputValue(),'fhr');
    await page.keyboard.press('Control+k');await page.waitForSelector('dialog[open]');assert.equal(await page.locator('.toolbox[aria-modal=true]').count(),0);await page.keyboard.press('Escape');
    console.log('PASS: 320/390/768/1024px layouts, mobile context sheet, focus trap and Escape');

    await page.setViewportSize({width:1440,height:1000});await page.locator('.case-card:visible .case-extras>summary').click();await page.locator('.case-card:visible .case-actions >summary').click();await page.locator('.case-card:visible .card-foot >button').click();
    const clinicalBefore=await source(page,true);await page.locator('.clinical-section [data-design-section=progress]').focus();await page.keyboard.press('Enter');assert.equal(await sectionSelect.inputValue(),'progress');assert.equal(await source(page,true),clinicalBefore);
    await change(height,350);await page.keyboard.press('Alt+1');await page.locator('.data-mode-picker').getByRole('button',{name:'Thêm điểm',exact:true}).click();await page.locator('.data-series-picker button').last().click();
    await page.locator('.clinical-section [data-plot]').scrollIntoViewIfNeeded();
    const record=await page.evaluate(()=>{const app=document.querySelector('#app')._vnode.component.setupState,d=window.PartographCore.buildSVG(app.clinical,{...app.chartOptions,editable:true,field:'fhr',activeTime:app.selectedTime}),svg=document.querySelector('.clinical-section .partograph'),r=svg.getBoundingClientRect();return {x:r.x+(158+d.labelOffset+d.timeline.plot(7)*d.hour)*d.scaleX*r.width/d.width,y:r.y+d.rowLayout.y(window.PartographCore.fetalHeartY(150))*d.scaleY*r.height/d.height}});
    await page.mouse.click(record.x,record.y);const recordedFhr=await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.clinical.observations.find(o=>o.time===7).fhr);
    // Integer browser pixels can differ by 1 bpm at fit-to-width zoom.
    assert.ok(Math.abs(recordedFhr-150)<=1,'Recording remains within one screen pixel of the requested point');
    assert.equal(await page.locator('.clinical-section [data-head-marker]').count(),1);
    console.log('PASS: clinical recording maps correctly after independent section and label resizing');
    // Direct data editing: real pointer gestures, keyboard, manual form and touch.
    const direct=await context.newPage();direct.on('pageerror',e=>errors.push(e.message));direct.setDefaultTimeout(12000);
    await direct.goto(url);await direct.waitForSelector('#app:not([v-cloak])');await direct.keyboard.press('Alt+1');
    assert.equal(await direct.locator('.data-tools:visible').getAttribute('data-mode'),'drag','Selecting Data opens direct dragging');
    const directSource=()=>source(direct),dataMode=label=>direct.locator('.data-mode-picker').getByRole('button',{name:label,exact:true});
    const point=(time,field)=>direct.locator('.case-card:visible [data-point-hit][data-observation-time="'+time+'"][data-observation-field="'+field+'"]');
    for(const width of [320,390,768,1024]){
      await direct.setViewportSize({width,height:844});
      for(const label of ['Chọn và kéo','Thêm điểm','Nhập bảng']){if(await dataMode(label).count()){if(!await dataMode(label).isVisible())await direct.locator('.mobile-tools-toggle').click();await dataMode(label).click();}assert.ok(await direct.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Data layout overflows at '+width+' in '+label)}
    }
    await direct.setViewportSize({width:1440,height:1000});await dataMode('Chọn và kéo').click();
    async function targetAt(p,time,field,value){return p.evaluate(({time,field,value})=>{const app=document.querySelector('#app')._vnode.component.setupState,c=app.activeCase,d=window.PartographCore.buildSVG(c,{...app.chartOptions,editable:true,field:app.plotField,activeTime:app.selectedTime}),svg=[...document.querySelectorAll('.partograph')].find(e=>e.getClientRects().length),r=svg.getBoundingClientRect(),core=window.PartographCore,y=field==='fhr'?core.fetalHeartY(value):field==='descent'?core.descentY(value):core.cervixY(value);return {x:r.x+(core.G.left+d.labelOffset+d.timeline.plot(time)*d.hour)*d.scaleX*r.width/d.width,y:r.y+d.rowLayout.y(y)*d.scaleY*r.height/d.height}},{time,field,value})}
    async function beginDrag(fromTime,field,time,value){const hit=point(fromTime,field);await hit.scrollIntoViewIfNeeded();const box=await hit.boundingBox(),target=await targetAt(direct,time,field,value);await direct.mouse.move(box.x+box.width/2,box.y+box.height/2);await direct.mouse.down();await direct.mouse.move(target.x,target.y,{steps:8});}
    assert.equal(await direct.locator('.data-tools:visible').getAttribute('data-mode'),'drag');assert.equal(await direct.locator('.editor').count(),0);
    const originalDirect=await directSource();
    assert.equal(await direct.locator('.data-mode-picker button').count(),3);assert.equal(await direct.locator('.data-series-picker').count(),0);
    await point(2,'cervix').click();await direct.waitForSelector('.point-quick-editor:visible');assert.equal(await direct.locator('.editor').count(),0);
    const quickPoint=direct.locator('.point-quick-editor'),quickValue=quickPoint.getByLabel('Giá trị điểm đang chọn',{exact:true});
    await direct.waitForFunction(()=>document.querySelector('.point-quick-editor').getBoundingClientRect().left>=document.querySelector('.workarea').getBoundingClientRect().right);
    await direct.screenshot({path:path.join(os.tmpdir(),'vesando-quick-edit-desktop.png'),animations:'disabled'});
    await quickValue.fill('6.5');await quickPoint.getByRole('button',{name:'Lưu',exact:true}).click();assert.equal(JSON.parse(await directSource()).find(o=>o.time===2).cervix,6.5);
    await direct.getByRole('button',{name:'Hoàn tác dữ liệu',exact:true}).click();assert.equal(await directSource(),originalDirect);
    await quickValue.fill('6.3');await quickPoint.getByRole('button',{name:'Lưu',exact:true}).click();assert.equal(await quickValue.evaluate(el=>el.validity.valid),false);assert.equal(await directSource(),originalDirect);
    await quickPoint.getByRole('button',{name:'Đóng sửa nhanh',exact:true}).click();
    await point(0,'cervix').click();await quickPoint.locator('.point-field-tabs').getByRole('button',{name:'Đầu trên vệ',exact:true}).click();assert.equal(await quickValue.inputValue(),'4');
    await quickValue.fill('3');await quickPoint.getByRole('button',{name:'Lưu',exact:true}).click();let overlap=JSON.parse(await directSource()).find(o=>o.time===0);assert.equal(overlap.descent,3);assert.equal(overlap.cervix,4);
    await direct.getByRole('button',{name:'Hoàn tác dữ liệu',exact:true}).click();assert.equal(await directSource(),originalDirect);await quickPoint.getByRole('button',{name:'Đóng sửa nhanh',exact:true}).click();
    console.log('PASS: direct entry after choosing Data, three contextual modes, contextual point value editing, input validation, undo and overlapping-series selection');
    await beginDrag(2,'cervix',2.5,6.5);
    assert.equal(await direct.locator('.point-drag-ghost').count(),1);assert.equal(await directSource(),originalDirect,'Drag preview does not mutate data');
    await direct.mouse.up();let directCase=JSON.parse(await directSource());
    assert.equal(directCase.find(o=>o.time===2).cervix,null);assert.equal(directCase.find(o=>o.time===2).fhr,140);assert.equal(directCase.find(o=>o.time===2).descent,3);
    assert.equal(directCase.find(o=>o.time===2.5).cervix,6.5);assert.equal(directCase.find(o=>o.time===2.5).fhr,144);
    await direct.getByRole('button',{name:'Hoàn tác dữ liệu',exact:true}).click();assert.equal(await directSource(),originalDirect);
    await beginDrag(2,'cervix',4,7);await direct.mouse.up();assert.equal(await directSource(),originalDirect);await direct.waitForSelector('.inline-feedback');
    await beginDrag(2,'cervix',3,7);await direct.keyboard.press('Escape');await direct.mouse.up();assert.equal(await directSource(),originalDirect);assert.equal(await direct.locator('.point-drag-ghost').count(),0);
    await beginDrag(2,'cervix',3,7);await direct.locator('.partograph').dispatchEvent('pointercancel',{pointerId:1,pointerType:'mouse'});await direct.mouse.up();assert.equal(await directSource(),originalDirect);
    await dataMode('Thêm điểm').click();await direct.locator('.data-series-picker').getByRole('button',{name:'CTC',exact:true}).click();
    await direct.locator('.partograph').scrollIntoViewIfNeeded();let target=await targetAt(direct,3,'cervix',7);await direct.mouse.click(target.x,target.y);
    directCase=JSON.parse(await directSource());assert.equal(directCase.find(o=>o.time===3).cervix,7);assert.equal(directCase.find(o=>o.time===3).fhr,142);
    const addedPoint=await directSource();target=await targetAt(direct,3,'cervix',5);await direct.mouse.click(target.x,target.y);assert.equal(await directSource(),addedPoint,'Add mode cannot overwrite an existing measurement');
    await dataMode('Nhập bảng').click();await direct.waitForSelector('.editor:visible');
    const editorBox=await direct.locator('.editor').boundingBox(),chartBox=await direct.locator('.chart-frame').boundingBox();assert.ok(editorBox.x>=chartBox.x+chartBox.width,'Manual form is to the right of the chart');
    const manualCervix=direct.locator('.editor-values input[type=number]').nth(1);await manualCervix.fill('7.5');
    await dataMode('Chọn và kéo').click();assert.equal(await dataMode('Nhập bảng').getAttribute('aria-pressed'),'true','A dirty manual draft stays in manual mode');assert.equal(await directSource(),addedPoint);
    await direct.locator('.editor').getByRole('button',{name:'Hủy thay đổi',exact:true}).click();assert.equal(await directSource(),addedPoint);assert.equal(await direct.locator('.data-tools:visible').getAttribute('data-mode'),'drag');
    await direct.locator('.point-quick-editor').getByRole('button',{name:'Chi tiết',exact:true}).click();await direct.locator('.editor-values input[type=number]').nth(1).fill('7.5');
    await direct.locator('.editor').getByRole('button',{name:'Áp dụng dữ liệu',exact:true}).click();assert.equal(JSON.parse(await directSource()).find(o=>o.time===3).cervix,7.5);
    await direct.getByRole('button',{name:'Hoàn tác dữ liệu',exact:true}).click();assert.equal(await directSource(),addedPoint);
    await point(3,'cervix').focus();await direct.keyboard.press('ArrowUp');assert.equal(JSON.parse(await directSource()).find(o=>o.time===3).cervix,7.5);
    await direct.keyboard.press('ArrowRight');directCase=JSON.parse(await directSource());assert.equal(directCase.find(o=>o.time===3).cervix,null);assert.equal(directCase.find(o=>o.time===3.5).cervix,7.5);assert.equal(directCase.find(o=>o.time===3.5).fhr,140);
    await direct.getByRole('button',{name:'Hoàn tác dữ liệu',exact:true}).click();await direct.getByRole('button',{name:'Hoàn tác dữ liệu',exact:true}).click();assert.equal(await directSource(),addedPoint);
    // Resized/zoomed charts use the same inverse geometry during dragging.
    await direct.keyboard.press('Alt+2');await direct.locator('[data-design-section=progress]').focus();await direct.keyboard.press('Enter');await change(direct.getByLabel('Cao vùng (px)',{exact:true}),350);
    await direct.keyboard.press('Alt+1');await direct.locator('.view-menu>summary').click();await direct.getByLabel('Mức phóng sản đồ',{exact:true}).selectOption('200');
    await beginDrag(2,'cervix',2.5,6.5);await direct.mouse.up();assert.equal(JSON.parse(await directSource()).find(o=>o.time===2.5).cervix,6.5);
    await direct.locator('.view-menu>summary').click();await direct.getByLabel('Mức phóng sản đồ',{exact:true}).selectOption('100');await direct.getByRole('button',{name:'Hoàn tác dữ liệu',exact:true}).click();
    await direct.screenshot({path:path.join(os.tmpdir(),'vesando-direct-data-desktop.png'),fullPage:true,animations:'disabled'});
    // The head drawing moves with descent, including its custom style.
    await direct.keyboard.press('Control+k');await direct.locator('#studio-command-input').fill('kieu the');await direct.keyboard.press('Enter');
    await direct.locator('.head-marker-tool .head-position-grid button').first().click();await direct.getByRole('button',{name:'Màu #7c3aed',exact:true}).click();
    await direct.keyboard.press('Alt+1');await dataMode('Thêm điểm').click();await direct.locator('.data-series-picker').getByRole('button',{name:'Đầu trên vệ',exact:true}).click();await beginDrag(0,'descent',.5,3);await direct.mouse.up();
    directCase=JSON.parse(await directSource());assert.equal(directCase.find(o=>o.time===0).descent,null);assert.equal(directCase.find(o=>o.time===.5).descent,3);assert.equal(directCase.find(o=>o.time===.5).headMarker.color,'#7c3aed');
    assert.equal(directCase.find(o=>o.time===0).cervix,4);assert.equal(directCase.find(o=>o.time===.5).fhr,144);
    const [directExport]=await Promise.all([direct.waitForEvent('download'),(async()=>{await direct.locator('.quick-export').click();await direct.locator('.format-choice button').nth(1).click();await direct.locator('.export-main').click()})()]);
    const directSVG=await fs.readFile(await directExport.path(),'utf8');assert.ok(directSVG.includes('#7c3aed')&&!directSVG.includes('data-point-hit')&&!directSVG.includes('point-drag-ghost'));
    await direct.keyboard.press('Alt+1');await direct.locator('.case-extras>summary').click();await direct.locator('.case-actions>summary').click();await direct.locator('.card-foot>button').click();
    const clinicalDirectBefore=await directSource();await beginDrag(6,'fhr',6.5,150);await direct.mouse.up();
    let clinicalDirect=JSON.parse(await directSource());assert.equal(clinicalDirect.find(o=>o.time===6).fhr,null);assert.equal(clinicalDirect.find(o=>o.time===6).cervix,10);assert.ok(Math.abs(clinicalDirect.find(o=>o.time===6.5).fhr-150)<=1);
    await direct.getByRole('button',{name:'Hoàn tác dữ liệu',exact:true}).click();assert.equal(await directSource(),clinicalDirectBefore);
    await dataMode('Nhập bảng').click();await direct.locator('#quick-fhr').fill('151');await dataMode('Chọn và kéo').click();assert.equal(await dataMode('Nhập bảng').getAttribute('aria-pressed'),'true');
    assert.equal(await direct.getByRole('button',{name:'Hoàn tác dữ liệu',exact:true}).isDisabled(),true);await direct.keyboard.press('Control+z');assert.equal(await direct.locator('#quick-fhr').inputValue(),'151');
    await direct.locator('.quick-entry button[type=submit]').click();assert.equal(JSON.parse(await directSource()).find(o=>o.time===6.5).fhr,151);
    await direct.locator('#quick-fhr').fill('152');await direct.locator('.quick-entry .draft-note').getByRole('button',{name:'Hủy bản nháp (1 mốc)',exact:true}).click();assert.equal(await direct.locator('#quick-fhr').inputValue(),'151');
    await dataMode('Chọn và kéo').click();assert.equal(await direct.locator('.data-tools:visible').getAttribute('data-mode'),'drag');
    await direct.close();
    const touchContext=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true}),touch=await touchContext.newPage();touch.on('pageerror',e=>errors.push(e.message));
    await touchContext.addInitScript(()=>localStorage.setItem('partograph-workspace-v3',JSON.stringify({ui:{dragAxis:'free'}})));await touch.goto(url);await touch.waitForSelector('#app:not([v-cloak])');await touch.locator('.tool-tabs button').first().tap();await touch.keyboard.press('Escape');
    const touchHit=touch.locator('[data-point-hit][data-observation-time="2"][data-observation-field=cervix]');await touchHit.scrollIntoViewIfNeeded();
    const touchBox=await touchHit.boundingBox(),touchTarget=await targetAt(touch,2.5,'cervix',6.5),cdp=await touchContext.newCDPSession(touch),startX=touchBox.x+touchBox.width/2,startY=touchBox.y+touchBox.height/2;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:startX,y:startY,id:1}]});
    for(let step=1;step<=6;step++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:startX+(touchTarget.x-startX)*step/6,y:startY+(touchTarget.y-startY)*step/6,id:1}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    assert.equal(JSON.parse(await source(touch)).find(o=>o.time===2.5).cervix,6.5,'Touch dragging commits the same measurement as mouse dragging');
    await touch.locator('.mobile-tools-toggle').tap();await touch.waitForSelector('.point-quick-editor:visible');assert.ok(await touch.evaluate(()=>{const r=document.querySelector('#point-value-input').getBoundingClientRect(),panel=document.querySelector('#studio-toolbox').getBoundingClientRect();return r.left>=panel.left&&r.right<=panel.right&&r.top>=panel.top&&r.bottom<=panel.bottom}));await touch.screenshot({path:path.join(os.tmpdir(),'vesando-quick-edit-mobile.png'),animations:'disabled'});
    await touch.locator('.data-mode-picker').getByRole('button',{name:'Nhập bảng',exact:true}).tap();await touch.waitForSelector('.editor:visible');assert.ok(await touch.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await touch.screenshot({path:path.join(os.tmpdir(),'vesando-direct-data-mobile.png'),animations:'disabled'});await touchContext.close();
    console.log('PASS: mouse/touch drag preview and commit, one-step undo, collision guards, Escape/pointer cancellation, add mode, manual entry in the right inspector, draft protection, keyboard moves, resized/zoomed drag, styled head transfer and clean SVG export');
    // Inspect every control group in both workspaces, including expanded menus.
    const controls=await context.newPage();controls.on('pageerror',e=>errors.push(e.message));
    await controls.goto(url);await controls.waitForSelector('#app:not([v-cloak])');
    const layouts=['data','add','manual','board','section','head','symbols','canvas','template','review','export','guide'];
    for(const width of [320,390,768,1024,1440]){
      await controls.setViewportSize({width,height:1000});
      for(const mode of ['exam','clinical'])for(const layout of layouts){
        await controls.evaluate(async({mode,layout})=>{
          const a=document.querySelector('#app')._vnode.component.setupState;
          a.mode=mode;a.selectDataPoint(null);a.selectDataMode('drag');
          if(['data','add','manual'].includes(layout)){a.selectTool('data');a.selectDataMode(layout==='data'?'drag':layout)}
          else if(['board','section','head','symbols','canvas','template'].includes(layout)){
            a.selectTool('design');a.designTab=['board','section'].includes(layout)?'layout':layout;a.sizeScope=layout==='section'?'section':'board';
          }else a.selectTool(layout);
          if(a.mobile&&a.inspectorOpen)a.inputsOpen=true;await Vue.nextTick();await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
          window.scrollTo({top:0,behavior:'instant'});
        },{mode,layout});
        const faults=await controls.evaluate(()=>{
          const faults=[];
          if(document.documentElement.scrollWidth>innerWidth)faults.push('Page overflows horizontally');
          const visible=e=>e.checkVisibility({checkVisibilityCSS:true});
          for(const e of document.querySelectorAll('#app button,#app summary,#app label.btn,#app .check-field')){
            if(!visible(e))continue;const r=e.getBoundingClientRect(),name=e.getAttribute('aria-label')||e.textContent.trim().replace(/\s+/g,' ').slice(0,55);
            if(r.width<43.9||r.height<43.9)faults.push(name+': target '+Math.round(r.width)+'×'+Math.round(r.height));
            if(e.tagName==='BUTTON'&&(e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+1))faults.push(name+': clipped content');
            if(e.matches('.editor .btn,.quick-entry-actions .btn,.inspector-actions .btn'))for(const text of e.childNodes){
              if(text.nodeType!==3||!text.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(text);
              if(new Set([...range.getClientRects()].map(r=>Math.round(r.top))).size>1)faults.push(name+': action label wraps');
            }
          }
          for(const group of document.querySelectorAll('.data-mode-picker,.data-undo,.zoom-control,.design-nav,.head-moment-navigation,.head-color-row,.fontanelle-choice,.quick-point-actions,.editor-footer .action-row,.quick-entry-actions')){
            const buttons=[...group.querySelectorAll(':scope >button')].filter(visible);
            for(let i=0;i<buttons.length;i++)for(let j=i+1;j<buttons.length;j++){
              const a=buttons[i].getBoundingClientRect(),b=buttons[j].getBoundingClientRect();
              if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)faults.push('Overlapping buttons in '+group.className);
            }
          }
          return faults;
        });
        assert.deepEqual(faults,[],width+'px '+mode+' '+layout);
        if(width===1440&&mode==='exam'&&layout==='data'){
          const actions=await controls.locator('.data-mode-picker').boundingBox(),history=await controls.locator('.data-undo').boundingBox();
          assert.ok(actions.y<history.y,'History follows editing controls in the right inspector');
        }
        if(layout==='manual'&&mode==='clinical'){
          assert.equal(await controls.locator('.manual-entry-switch').getByRole('button',{name:/Xuất/}).count(),0);
          const fields=await controls.locator('.quick-fields').boundingBox(),save=await controls.locator('.quick-entry-actions').boundingBox();assert.ok(save.y>=fields.y+fields.height,'Recording follows the input fields');
        }
        if(layout==='export'){
          const last=controls.locator('.inspector-actions >button').last();assert.ok((await last.getAttribute('class')).includes('export-main'),'Download is the final export action');
        }
        if([390,1440].includes(width)&&mode==='exam'&&['data','head','manual','export'].includes(layout))await controls.screenshot({path:path.join(os.tmpdir(),'vesando-controls-'+layout+'-'+width+'.png'),fullPage:width===1440,animations:'disabled'});
      }
    }
    await controls.setViewportSize({width:390,height:844});await controls.reload();await controls.waitForSelector('#app:not([v-cloak])');
    await controls.locator('.workspace-menu>summary').click();
    const themeBefore=await controls.locator('html').getAttribute('data-theme');await controls.locator('.mobile-theme-action').click();assert.notEqual(await controls.locator('html').getAttribute('data-theme'),themeBefore);
    assert.equal(await controls.locator('.workspace-menu').getAttribute('open'),null);
    await controls.getByLabel('Phân hệ làm việc',{exact:true}).selectOption('clinical');await controls.locator('.workspace-menu>summary').click();
    const [sessionDownload]=await Promise.all([controls.waitForEvent('download'),controls.locator('.workspace-menu').getByRole('button',{name:'Lưu phiên JSON',exact:true}).click()]);
    const sessionText=await fs.readFile(await sessionDownload.path(),'utf8');assert.ok(JSON.parse(sessionText).observations.length);
    const importedSession=JSON.parse(sessionText);importedSession.observations[0].fhr=151;
    await controls.locator('.workspace-menu>summary').click();await controls.locator('#session-file').setInputFiles({name:'session.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(importedSession))});
    await controls.waitForFunction(()=>document.querySelector('#app')._vnode.component.setupState.clinical.observations[0].fhr===151);
    assert.equal(await controls.locator('.workspace-menu').getAttribute('open'),null);
    assert.deepEqual(JSON.parse(await source(controls)),importedSession.observations);
    await controls.close();
    console.log('PASS: 120 control layouts across 320/390/768/1024/1440px, 44px targets, unclipped labels, non-overlapping groups, form action order, mobile theme and session file actions');
    // Feedback must follow actual success, survive no-op clicks, and recover from failures.
    const feedbackContext=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),f=await feedbackContext.newPage();
    f.on('pageerror',e=>errors.push(e.message));f.setDefaultTimeout(12000);await f.goto(url);await f.waitForSelector('#app:not([v-cloak])');
    await f.keyboard.press('Alt+2');const saveDesign=f.locator('.save-design');await saveDesign.click();
    assert.equal(await saveDesign.getAttribute('data-action-state'),'success');assert.equal(await saveDesign.isDisabled(),true);
    const storedDesign=await f.evaluate(()=>localStorage.getItem('partograph-design-v2'));
    await f.locator('.board-dimensions .size-step-row').getByRole('button',{name:'+10%',exact:true}).click();assert.equal(await saveDesign.isDisabled(),false);assert.equal(await saveDesign.getAttribute('data-action-state'),null);
    await f.evaluate(()=>{window.realSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='partograph-design-v2')throw new DOMException('Blocked','QuotaExceededError');return window.realSetItem.call(this,key,value)}});
    await saveDesign.click();assert.equal(await saveDesign.getAttribute('data-action-state'),'error');assert.equal(await f.evaluate(()=>localStorage.getItem('partograph-design-v2')),storedDesign,'A storage failure cannot report saved');
    await f.evaluate(()=>Storage.prototype.setItem=window.realSetItem);await saveDesign.click();assert.equal(await saveDesign.getAttribute('data-action-state'),'success');
    await f.keyboard.press('Alt+1');const beforeFeedbackPoint=await source(f),fh=f.locator('[data-point-hit][data-observation-time="2"][data-observation-field=cervix]');
    await fh.click();const fv=f.getByLabel('Giá trị điểm đang chọn',{exact:true}),pointSave=f.locator('.quick-point-actions button[type=submit]');assert.equal(await pointSave.isDisabled(),true);
    await fv.fill('6.5');await fv.press('Control+Enter');await f.waitForFunction(()=>document.querySelector('.quick-point-actions button[type=submit]')?.dataset.actionState==='success');
    assert.equal(JSON.parse(await source(f)).find(o=>o.time===2).cervix,6.5);assert.equal(await pointSave.innerText(),'Đã lưu');assert.equal(await pointSave.isDisabled(),true);
    assert.equal(await f.locator('.point-confirmed').count(),1);await f.locator('.toast-undo').click();assert.equal(await source(f),beforeFeedbackPoint);
    await fv.fill('6.3');await pointSave.click();assert.equal(await source(f),beforeFeedbackPoint);assert.equal(await fv.getAttribute('aria-invalid'),'true');assert.equal(await pointSave.getAttribute('data-action-state'),'error');
    assert.ok((await fv.locator('..').getAttribute('data-validation-message')).includes('0.5'));assert.equal(await fv.evaluate(e=>document.activeElement===e),true);
    await fv.fill('6.5');await fv.press('Control+Enter');await f.waitForFunction(()=>document.querySelector('.quick-point-actions button[type=submit]')?.dataset.actionState==='success');
    await f.getByRole('button',{name:'Đóng sửa nhanh',exact:true}).click();await f.getByRole('button',{name:'Thêm điểm',exact:true}).click();assert.equal(await f.locator('.point-quick-editor').count(),0);
    await f.getByRole('button',{name:'Nhập bảng',exact:true}).click();const fullValue=f.locator('.editor-values input[type=number]').nth(1);await fullValue.fill('7');
    assert.equal(await f.locator('.editor .field-changed').count(),1);assert.ok((await f.locator('.editor-footer .form-state').innerText()).includes('1 mục'));
    await fullValue.press('Control+Enter');await f.waitForSelector('.editor',{state:'detached'});assert.equal(JSON.parse(await source(f)).find(o=>o.time===2).cervix,7);
    assert.equal(await f.evaluate(()=>!!document.activeElement.closest('.data-mode-picker')),true);
    await f.getByLabel('Phân hệ làm việc',{exact:true}).selectOption('clinical');await f.getByRole('button',{name:'Nhập bảng',exact:true}).click();
    const qv=f.locator('#quick-fhr'),quickSave=f.locator('.quick-entry-actions button');assert.equal(await quickSave.isDisabled(),true);
    await qv.fill('151');assert.equal(await f.locator('.quick-fields .field-changed').count(),1);await qv.press('Control+Enter');
    assert.equal(await quickSave.getAttribute('data-action-state'),'success');assert.equal(await quickSave.isDisabled(),true);assert.equal(JSON.parse(await source(f))[0].fhr,151);
    await qv.fill('152');assert.equal(await quickSave.getAttribute('data-action-state'),null);await quickSave.click();await f.locator('.toast-undo').click();assert.equal(JSON.parse(await source(f))[0].fhr,151);
    await f.locator('.quick-entry .draft-note').getByRole('button',{name:'Hủy bản nháp (1 mốc)',exact:true}).click();
    const [jsonFeedbackDownload]=await Promise.all([f.waitForEvent('download'),f.locator('.session-save').click()]);assert.ok(jsonFeedbackDownload.suggestedFilename().endsWith('.json'));assert.equal(await f.locator('.session-save').getAttribute('data-action-state'),'success');
    await qv.fill('153');assert.equal(await f.locator('.session-save').getAttribute('data-action-state'),null,'A new draft invalidates the exported snapshot');
    await f.locator('.quick-entry .draft-note').getByRole('button',{name:'Hủy bản nháp (1 mốc)',exact:true}).click();await f.locator('.quick-export').click();
    // Hold real SVG image loading so the pending state and duplicate guard are deterministic.
    await f.evaluate(()=>{window.realImage=window.Image;window.imageLoads=0;window.Image=function(){window.imageLoads++;const img=new window.realImage();Object.defineProperty(img,'src',{set(url){window.finishExport=()=>Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src').set.call(img,url)}});return img}});
    const exportFeedback=f.locator('.export-main'),pendingDownload=f.waitForEvent('download');await exportFeedback.click();
    assert.equal(await exportFeedback.getAttribute('aria-busy'),'true');assert.equal(await exportFeedback.isDisabled(),true);assert.equal(await f.locator('.copy-image').isDisabled(),true);
    assert.equal(await f.locator('.action-spinner').evaluate(e=>getComputedStyle(e).animationName),'none','Reduced motion keeps progress readable without spinning');
    await f.emulateMedia({reducedMotion:'no-preference'});assert.equal(await f.locator('.action-spinner').evaluate(e=>getComputedStyle(e).animationName),'action-spin');await f.emulateMedia({reducedMotion:'reduce'});
    await f.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState;a.exportCase(a.activeCase,'png')});assert.equal(await f.evaluate(()=>window.imageLoads),1);
    await f.evaluate(()=>{window.Image=window.realImage;window.finishExport()});await pendingDownload;await f.waitForFunction(()=>document.querySelector('.export-main').dataset.actionState==='success');
    assert.equal(await exportFeedback.innerText(),'Đã xuất PNG');await f.locator('.format-choice button').nth(1).click();assert.equal(await exportFeedback.getAttribute('data-action-state'),null);
    await f.locator('.format-choice button').first().click();
    await f.evaluate(()=>{window.realDataURL=HTMLCanvasElement.prototype.toDataURL;HTMLCanvasElement.prototype.toDataURL=function(){throw new Error('Simulated canvas failure')}});await exportFeedback.click();await f.waitForFunction(()=>document.querySelector('.export-main').dataset.actionState==='error');assert.equal(await exportFeedback.isDisabled(),false);
    await f.evaluate(()=>HTMLCanvasElement.prototype.toDataURL=window.realDataURL);await Promise.all([f.waitForEvent('download'),exportFeedback.click()]);await f.waitForFunction(()=>document.querySelector('.export-main').dataset.actionState==='success');
    // Clipboard promise injection checks failure/retry paths without requiring OS clipboard permissions.
    await f.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{write:items=>new Promise((resolve,reject)=>{window.finishClipboard=async ok=>{if(ok){await items[0].getType('image/png');resolve()}else reject(new DOMException('Denied','NotAllowedError'))}})}}));
    const imageCopy=f.locator('.copy-image');await imageCopy.click();assert.equal(await imageCopy.getAttribute('aria-busy'),'true');assert.equal(await exportFeedback.getAttribute('aria-busy'),'false','Copying an image cannot look like a file export');
    await f.evaluate(()=>window.finishClipboard(false));await f.waitForFunction(()=>document.querySelector('.copy-image').dataset.actionState==='error');assert.equal(await imageCopy.isDisabled(),false);
    await imageCopy.click();await f.evaluate(()=>window.finishClipboard(true));await f.waitForFunction(()=>document.querySelector('.copy-image').dataset.actionState==='success');
    await f.screenshot({path:path.join(os.tmpdir(),'vesando-feedback-success.png'),animations:'disabled'});
    await f.getByLabel('Phân hệ làm việc',{exact:true}).selectOption('exam');await f.locator('.case-menu>summary').click();await f.getByRole('button',{name:'Thư viện ca',exact:true}).click();
    await f.locator('.toolbox .sidebar-tool').first().locator('summary').click();const textCopy=f.locator('.json-label button').last();
    await f.evaluate(()=>navigator.clipboard.writeText=text=>new Promise(resolve=>{window.copiedText=text;window.finishTextCopy=resolve}));await textCopy.click();assert.equal(await textCopy.getAttribute('aria-busy'),'true');
    await f.evaluate(()=>window.finishTextCopy());await f.waitForFunction(()=>document.querySelector('.json-label [data-action-state=success]'));
    assert.equal(await f.evaluate(()=>window.copiedText),await f.locator('#json-input').inputValue());
    await f.locator('#json-input').fill((await f.locator('#json-input').inputValue())+'\n ');assert.equal(await textCopy.getAttribute('data-action-state'),null);
    await f.evaluate(()=>navigator.clipboard.writeText=()=>Promise.reject(new DOMException('Denied','NotAllowedError')));await textCopy.click();await f.waitForFunction(()=>document.querySelector('.json-label [data-action-state=error]'));
    await f.evaluate(()=>navigator.clipboard.writeText=text=>{window.copiedText=text;return Promise.resolve()});await textCopy.click();await f.waitForFunction(()=>document.querySelector('.json-label [data-action-state=success]'));
    await f.evaluate(()=>navigator.clipboard.writeText=()=>new Promise(resolve=>window.finishTextCopy=resolve));await textCopy.click();await f.locator('#json-input').fill((await f.locator('#json-input').inputValue())+'\n ');await f.evaluate(()=>window.finishTextCopy());
    await f.waitForFunction(()=>document.querySelector('#app')._vnode.component.setupState.feedback.jsonCopy?.phase==='success');assert.equal(await textCopy.getAttribute('data-action-state'),null,'A delayed copy of old text cannot confirm the newly edited text');
    await f.setViewportSize({width:390,height:844});await f.screenshot({path:path.join(os.tmpdir(),'vesando-feedback-mobile.png'),animations:'disabled'});
    await feedbackContext.close();console.log('PASS: real save confirmations, dirty-state resets, storage failure/retry, contextual Ctrl Enter, native inline validation, changed-field summaries, toast undo, JSON snapshot tracking, actual export busy/success/failure/retry, duplicate guard, clipboard failure/retry and reduced motion');
    assert.deepEqual(errors,[]);console.log('PASS: no browser runtime errors');
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());
