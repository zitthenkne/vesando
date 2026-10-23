// Browser checks for upgrade 6: Hồ sơ ca (case dossier), interactive legend, risk zones, accent themes.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const files=new Set(['index.html','studio.css','workspace.css','interaction.css','theme.css','canvas.css','clinical-rules.js','guidance.js','enhancements.js']);
const server=http.createServer(async(req,res)=>{const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(!files.has(name)){res.writeHead(404);res.end();return}try{res.setHeader('Content-Type',(name.endsWith('.css')?'text/css':name.endsWith('.js')?'application/javascript':'text/html')+'; charset=utf-8');res.end(await fs.readFile(path.join(__dirname,name)))}catch{res.writeHead(500);res.end()}});
const state=(page,pick)=>page.evaluate(pick=>{const s=document.querySelector('#app')._vnode.component.setupState;return pick.split(',').reduce((o,k)=>({...o,[k]:JSON.parse(JSON.stringify(k.split('.').reduce((v,p)=>v?.[p],s)??null))}),{})},pick);
const svgOf=(page,options)=>page.evaluate(o=>{const s=document.querySelector('#app')._vnode.component.setupState;return buildSVG(JSON.parse(JSON.stringify(s.activeCase)),{...o,design:{...JSON.parse(JSON.stringify(s.design)),...(o.design||{})}},true).inner},options||{});
const dossier=page=>page.locator('.case-card:visible .dossier');
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{channel:'chrome'})});
  const errors=[];
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:url});
    const page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
    await page.goto(url);await page.waitForSelector('#app:not([v-cloak])');

    // 1. One tab bar replaces the nested accordions; it starts closed and shows the latest measurements.
    assert.equal(await page.locator('.case-extras,.case-narrative,.case-actions,.chart-details,.chart-diagnostics').count(),0,'Old nested panels are gone');
    assert.equal(await page.locator('.dossier.open').count(),0,'Dossier starts closed');
    assert.deepEqual(await dossier(page).locator('[role=tab]').allInnerTexts().then(a=>a.map(t=>t.replace(/\s+/g,' ').trim().replace(/ \d+h$/,''))),['Đề bài','Chú giải','Bản vẽ','Thao tác']);
    const kpis=await dossier(page).locator('.dossier-kpis li').allInnerTexts();assert.equal(kpis.length,4);assert.ok(/CTC\s*10\s*cm/.test(kpis[0].replace(/\n/g,' ')),'CTC KPI shows the latest value');
    assert.equal(await page.evaluate(()=>new Set([...document.querySelectorAll('.case-card:not([style*="display: none"]) .dossier-tabs [role=tab] svg')].map(e=>getComputedStyle(e).color)).size),1,'Tab icons share one neutral colour');
    assert.ok(await dossier(page).locator('.dossier-level').isVisible(),'Assessment badge shown');
    console.log('PASS: single tab bar, closed by default, latest-value strip and assessment badge');

    // 2. Narrative becomes a timeline with a highlighted request.
    await dossier(page).locator('.t-brief').click();assert.equal(await page.locator('.dossier.open').count(),1);
    assert.equal(await dossier(page).locator('.story-steps li').count(),5,'Five timed steps');
    assert.equal(await dossier(page).locator('.story-time').first().innerText(),'08:00');
    assert.ok((await dossier(page).locator('.story-request p').innerText()).startsWith('Nhận xét tình trạng mẹ'),'Request is its own block');
    assert.ok(await dossier(page).locator('mark.t-ctc').count()>=3&&await dossier(page).locator('mark.t-des').count()>=2&&await dossier(page).locator('mark.t-fhr').count()>=1,'Terms carry the line colours');
    assert.equal(await dossier(page).locator('.story-note').innerText(),'Trong quá trình theo dõi, các thông số được ghi trên sản đồ.','A general sentence is kept as a note, not a step');
    await dossier(page).locator('.story-time',{hasText:'12:00'}).click();
    let st=await state(page,'toolTab,selectedMoment');assert.equal(st.toolTab,'review');assert.equal(st.selectedMoment,8,'Step 12:00 selects the 12:00 moment');
    assert.equal(await dossier(page).locator('.story-steps li.current .story-time').innerText(),'12:00');
    console.log('PASS: narrative timeline, request block, term colours, step → moment jump');

    // 3. Narrative shapes: inline time is not a cut, plain prose still reads, empty offers to write one.
    await page.evaluate(()=>{const s=document.querySelector('#app')._vnode.component.setupState;s.cases[0].narrative='Sản phụ vào viện lúc 07:30 vì đau bụng. Ngôi chỏm, ối còn.'});
    await page.waitForSelector('.case-card:visible .story-lead');assert.equal(await dossier(page).locator('.story-steps').count(),0);
    await page.evaluate(()=>{const s=document.querySelector('#app')._vnode.component.setupState;s.cases[0].narrative=''});
    await page.waitForSelector('.case-card:visible .story-empty');assert.ok(await dossier(page).getByRole('button',{name:'Viết đề bài'}).isVisible());
    await page.evaluate(()=>{const s=document.querySelector('#app')._vnode.component.setupState;s.cases[0].narrative='Lúc 08:00: cổ tử cung mở 4 cm; 09:15 bấm ối.\nYêu cầu: Nhận xét.'});
    await page.waitForSelector('.case-card:visible .story-steps li');assert.equal(await dossier(page).locator('.story-steps li').count(),2);
    console.log('PASS: inline times are not steps; prose and empty narratives are handled');

    // 4. Copy variants.
    await dossier(page).getByRole('button',{name:'Kèm bảng mốc'}).click();
    const md=await page.evaluate(()=>navigator.clipboard.readText());assert.ok(md.includes('| Giờ | CTC (cm) | Đầu trên vệ | Tim thai (lần/phút) | Cơn co |')&&md.includes('Lúc 08:00'),'Markdown table copied');
    await dossier(page).getByRole('button',{name:'Chỉ yêu cầu'}).click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'Nhận xét.');
    console.log('PASS: copy narrative, narrative with moment table, request only');

    // 5. Keyboard: arrows move between tabs, clicking the open tab folds the dossier.
    await dossier(page).locator('.t-brief').focus();await page.keyboard.press('ArrowRight');
    assert.equal((await state(page,'ui.dossierTab'))['ui.dossierTab'],'legend');assert.equal(await page.evaluate(()=>document.activeElement.className.includes('t-legend')),true);
    await page.keyboard.press('End');assert.equal((await state(page,'ui.dossierTab'))['ui.dossierTab'],'actions');await page.keyboard.press('Home');assert.equal((await state(page,'ui.dossierTab'))['ui.dossierTab'],'brief');
    await dossier(page).locator('.t-brief').click();assert.equal(await page.locator('.dossier.open').count(),0);
    await page.reload();await page.waitForSelector('#app:not([v-cloak])');assert.equal(await page.locator('.dossier.open').count(),0,'Closed state remembered');
    await dossier(page).locator('.t-legend').click();await page.reload();await page.waitForSelector('#app:not([v-cloak])');
    assert.equal(await dossier(page).getAttribute('data-tab'),'legend');assert.equal(await page.locator('.dossier.open').count(),1,'Tab and open state remembered');
    console.log('PASS: roving arrow keys, Home/End, fold by re-click, tab and fold state persist');

    // 6. Legend: hide a line everywhere, spotlight on hover, restore.
    const before=await svgOf(page);assert.ok(before.includes('stroke="#2469ab"'),'Head-descent colour is drawn');
    await dossier(page).locator('.legend-group li[data-series=des] .legend-eye').click();
    assert.deepEqual((await state(page,'design.hiddenSeries'))['design.hiddenSeries'],['des']);
    const hidden=await svgOf(page);assert.ok(!hidden.includes('#2469ab')&&!hidden.includes('data-series="des"'),'Hidden line leaves no points or polyline');
    assert.ok(!hidden.includes('Đầu trên vệ · /5'),'Hidden line leaves the in-sheet legend too');assert.ok(hidden.includes('#d42f4e'),'Other lines stay');
    assert.equal(await page.locator('.case-card:visible svg.partograph [data-observation-field=descent]:not([data-point-hit])').count(),0);
    await dossier(page).locator('.legend-group li[data-series=ctc]').hover();assert.equal(await page.evaluate(()=>document.getElementById('app').dataset.spot),'ctc');
    assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('.case-card:not([style*="display: none"]) [data-observation-field=fhr]')).opacity),'0.16');
    await page.mouse.move(2,2);assert.equal(await page.evaluate(()=>document.getElementById('app').dataset.spot??'none'),'none');
    await dossier(page).getByRole('button',{name:'Hiện lại tất cả các đường'}).click();assert.deepEqual((await state(page,'design.hiddenSeries'))['design.hiddenSeries'],[]);
    assert.deepEqual(await page.evaluate(()=>designOptions({hiddenSeries:['des','bogus','des'],zoneShading:'yes',sectionAccent:true}).hiddenSeries),['des']);
    assert.equal(await page.evaluate(()=>designOptions({zoneShading:'yes'}).zoneShading),false);
    console.log('PASS: per-line visibility (chart, export, in-sheet legend), spotlight on hover, restore, validated design JSON');

    // 7. Risk zones and group accents are real chart features, absent from monochrome and LCG.
    const plain=await svgOf(page);assert.ok(!plain.includes('data-zone'));
    await dossier(page).locator('.legend-switches button',{hasText:'Vùng nguy cơ'}).click();
    const zones=await svgOf(page);assert.equal((zones.match(/data-zone="true"/g)||[]).length,2,'Amber and red zones');assert.ok(zones.includes('clip-path="url(#'));
    assert.equal((await svgOf(page,{mono:true})).includes('data-zone'),false);assert.equal((await svgOf(page,{standard:'lcg'})).includes('data-zone'),false);
    await dossier(page).locator('.legend-switches button',{hasText:'Vạch nhóm hàng'}).click();
    const accents=await svgOf(page);assert.ok((accents.match(/rx="1.5"/g)||[]).length>=6,'Accent bars beside group labels');assert.equal((await svgOf(page,{mono:true})).includes('rx="1.5"'),false);
    await page.locator('.case-card:visible .legend-switches button',{hasText:'Vùng nguy cơ'}).click();await dossier(page).locator('.legend-switches button',{hasText:'Vạch nhóm hàng'}).click();
    console.log('PASS: risk-zone shading and group accent bars (clipped, colour only, off in monochrome/LCG)');

    // 7b. Event arrows reach into their time column; a dashed guide follows the column, under the plotted points.
    const evented=await svgOf(page);const events=(await state(page,'activeCase.events'))['activeCase.events'].length;
    assert.equal((evented.match(/data-event-guide="true"/g)||[]).length,events,'One column guide per event');
    assert.ok(evented.indexOf('data-event-guide')<evented.indexOf('stroke="#d42f4e" stroke-width'),'Guides are drawn before the cervix symbols');
    assert.ok(!evented.includes('event-guides-->'),'No placeholder left in the drawing');
    assert.equal((await svgOf(page,{design:{eventGuides:false}})).includes('data-event-guide'),false,'Guides can be switched off');
    await dossier(page).locator('.legend-switches button',{hasText:'Đường dóng sự kiện'}).click();assert.equal((await state(page,'design.eventGuides'))['design.eventGuides'],false);
    await dossier(page).locator('.legend-switches button',{hasText:'Đường dóng sự kiện'}).click();assert.equal((await state(page,'design.eventGuides'))['design.eventGuides'],true);
    assert.equal(await page.evaluate(()=>designOptions({}).eventGuides+'|'+designOptions({eventGuides:false}).eventGuides),'true|false');
    console.log('PASS: event arrows into the time column, column guides under the data, switchable');

    // 7c. Event callouts are edited on the chart: content, time, colour and size, with live preview.
    const eventList=()=>state(page,'activeCase.events').then(s=>s['activeCase.events']);
    const original=await eventList();const callout=i=>page.locator('.case-card:visible svg.partograph [data-event-index="'+i+'"]');
    await callout(1).click();const pop=page.locator('.case-card:visible .event-pop');assert.ok(await pop.isVisible(),'Clicking a callout opens its editor on the chart');
    assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),null);assert.equal(await page.evaluate(()=>document.activeElement.tagName),'INPUT','Content field is focused');
    await pop.locator('input').fill('Gây tê NMC');await pop.getByRole('radio',{name:'Xanh dương'}).click();await pop.getByRole('button',{name:'Lớn'}).click();await pop.getByRole('button',{name:'Muộn hơn 15 phút'}).click();
    assert.ok((await page.locator('.case-card:visible svg.partograph').innerHTML()).includes('>Gây tê NMC<'),'Draft is previewed live');assert.deepEqual(await eventList(),original,'Nothing is saved before Lưu');
    await pop.getByRole('button',{name:'Lưu',exact:true}).click();
    let list=await eventList();assert.deepEqual(list[1],{time:original[1].time+.25,label:'Gây tê NMC',color:'#1f5fbf',size:'l'});assert.equal(await pop.count(),0);
    const styled=await svgOf(page);assert.ok(styled.includes('fill="#1f5fbf"')&&!styled.includes('tabindex="0" role="button" aria-label="Sửa mũi tên'),'Colour reaches the export; editor attributes do not');
    await callout(0).click();await pop.locator('input').fill('Không lưu');await page.keyboard.press('Escape');assert.deepEqual((await eventList())[0],original[0],'Esc discards');
    await callout(0).click();await pop.getByRole('radio',{name:'Đỏ'}).click();await page.mouse.click(4,500);await page.waitForTimeout(200);assert.equal((await eventList())[0].color,'#b4233c','Clicking elsewhere saves');
    await callout(2).click();await pop.getByRole('radio',{name:'Xanh y khoa'}).click();await pop.getByRole('button',{name:'Nhỏ'}).click();await pop.getByRole('button',{name:'Áp dụng kiểu cho mọi mũi tên'}).click();
    list=await eventList();assert.ok(list.every(e=>e.color==='#0e6b62'&&e.size==='s')&&list[1].label==='Gây tê NMC','One style for every callout, content kept');
    await callout(3).focus();await page.keyboard.press('Enter');assert.ok(await pop.isVisible(),'Enter on a focused callout opens the editor');
    await pop.locator('input').fill('');await pop.getByRole('button',{name:'Lưu',exact:true}).click();assert.ok((await pop.locator('[role=alert]').innerText()).includes('nội dung'),'Empty content is refused');
    await pop.getByRole('button',{name:'Xóa'}).click();assert.equal((await eventList()).length,original.length-1,'Delete removes the callout');
    for(let n=0;n<5;n++)await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.undoExam());assert.deepEqual(await eventList(),original,'Undo restores every step');
    await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.selectTool('design'));await callout(0).click();assert.ok(await pop.isVisible(),'Also editable from Thiết kế');await page.keyboard.press('Escape');
    await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.selectTool('overview'));
    const checked=await page.evaluate(()=>validateCase({id:'X',title:'X',patient:{startTime:'08:00',date:'2026-10-20'},observations:[{time:0,cervix:4}],events:[{time:1,label:'A',color:'#6D28D9',size:'m'},{time:2,label:'B',color:'red',size:'xl'},{time:3,label:'C',color:'#1F5FBF',size:'l'}]}).events);
    assert.deepEqual(checked,[{time:1,label:'A'},{time:2,label:'B'},{time:3,label:'C',color:'#1f5fbf',size:'l'}],'Default/invalid style values are dropped, valid ones kept');
    console.log('PASS: on-chart callout editor (content, time, colour, size, live preview, Esc, outside save, apply to all, keyboard, delete, undo, validation)');

    // 8. Palettes and design presets.
    await dossier(page).getByRole('button',{name:'Mù màu · Okabe–Ito'}).click();
    let design=(await state(page,'design.series.ctc.color,design.series.des.color,designPreset'));assert.equal(design['design.series.ctc.color'],'#d55e00');assert.equal(design['design.series.des.color'],'#0072b2');
    await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.applyDesign('soft'));
    design=await state(page,'design.zoneShading,design.sectionAccent,designPreset,design.series.ctc.color');assert.deepEqual(design,{'design.zoneShading':true,'design.sectionAccent':true,designPreset:'soft','design.series.ctc.color':'#e0566f'});
    await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.applyDesign('contrast'));
    design=await state(page,'design.stroke,design.zoneShading,designPreset');assert.deepEqual(design,{'design.stroke':2.1,'design.zoneShading':false,designPreset:'contrast'});
    await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.applyDesign('exam'));
    await page.evaluate(()=>{const s=document.querySelector('#app')._vnode.component.setupState;s.selectTool('design');s.designTab='canvas'});
    await page.locator('.palette-choices button:visible').first().waitFor();assert.equal(await page.locator('.palette-choices button:visible').count(),6,'Design panel lists the same six palettes');
    await page.locator('.palette-choices button',{hasText:'Pastel dịu'}).click();assert.equal((await state(page,'design.series.ctc.color'))['design.series.ctc.color'],'#e0566f');
    assert.equal(await page.locator('[data-control=zoneShading]:visible,[data-control=sectionAccent]:visible').count(),2,'Both new switches are in the design panel');
    await page.locator('.control-finder input').fill('vung nguy');assert.ok(await page.locator('.control-results').getByText('Tô màu vùng nguy cơ').isVisible(),'Finder knows the new option');await page.locator('.control-finder input').fill('');
    await page.evaluate(()=>{const s=document.querySelector('#app')._vnode.component.setupState;s.selectTool('overview');s.applyDesign('exam')});
    console.log('PASS: six palettes (incl. colour-blind safe) and two new design presets');

    // 9. Drawing tab: stat tiles and flexible grid controls.
    await dossier(page).locator('.t-drawing').click();assert.equal(await dossier(page).locator('.stat-tiles li').count(),4);
    assert.ok((await dossier(page).locator('.s-hours').innerText()).includes('19'),'Hours tile');
    await dossier(page).getByRole('button',{name:'Cố định'}).click();let d=await state(page,'design.timeMode,design.timeHours');assert.equal(d['design.timeMode'],'manual');assert.equal(d['design.timeHours'],19);
    await dossier(page).getByRole('button',{name:'Thêm một giờ'}).click();assert.equal((await state(page,'design.timeHours'))['design.timeHours'],20);
    await dossier(page).getByRole('button',{name:'24 giờ'}).click();assert.equal((await state(page,'design.timeMode'))['design.timeMode'],'full');
    await dossier(page).getByRole('button',{name:'Hiện đủ'}).click();assert.equal((await state(page,'design.rowMode'))['design.rowMode'],'all');
    await dossier(page).getByRole('button',{name:'Tự động'}).click();await dossier(page).getByRole('button',{name:'Tự gọn'}).click();
    assert.equal(await dossier(page).locator('.s-image').count(),0,'Image size only with the technical-information switch');
    await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.patchUi({diagnostics:true}));assert.equal(await dossier(page).locator('.s-image').count(),1);
    console.log('PASS: stat tiles, time-frame segmented control and stepper, row mode, optional image size');

    // 10. Actions: duplicate, remove guard, open in monitoring.
    await dossier(page).locator('.t-actions').click();assert.equal(await dossier(page).locator('.a-remove').isDisabled(),true,'Cannot remove the only case');
    const cases=(await state(page,'cases')).cases.length;await dossier(page).locator('.a-dup').click();assert.equal((await state(page,'cases')).cases.length,cases+1);
    assert.equal(await dossier(page).locator('.a-remove').isDisabled(),false);
    await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.undoExam());
    console.log('PASS: action cards, remove guard and duplicate');

    // 11. Accent colour and corner radius.
    await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.patchUi({accent:'blue',radius:'soft'}));
    assert.equal(await page.evaluate(()=>document.documentElement.dataset.accent+document.documentElement.dataset.radius),'bluesoft');
    assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--brand').trim()),'#1f5fbf');assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--r-m').trim()),'18px');
    await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.theme='dark');assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--brand').trim()),'#6ea0ff','Dark accent');
    await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.theme='light');
    await page.reload();await page.waitForSelector('#app:not([v-cloak])');assert.equal(await page.evaluate(()=>document.documentElement.dataset.accent),'blue','Accent remembered');
    await page.keyboard.press('Control+,');await page.getByRole('radio',{name:'Hổ phách'}).click();assert.equal(await page.evaluate(()=>document.documentElement.dataset.accent),'amber');
    await page.getByLabel('Độ bo góc').selectOption('sharp');assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--r-m').trim()),'5px');
    await page.getByRole('button',{name:'Đặt lại giao diện'}).click();assert.equal(await page.evaluate(()=>document.documentElement.dataset.accent+document.documentElement.dataset.radius),'tealnormal','Reset restores accent and radius');
    await page.keyboard.press('Escape');
    const bad=await context.newPage();await bad.addInitScript(()=>localStorage.setItem('partograph-workspace-v3',JSON.stringify({ui:{accent:'neon',radius:'huge',dossierTab:'nope',dossierOpen:'yes'}})));await bad.goto(url);await bad.waitForSelector('#app:not([v-cloak])');
    assert.equal(await bad.evaluate(()=>document.documentElement.dataset.accent+document.documentElement.dataset.radius),'tealnormal','Unknown accent/radius fall back');assert.equal(await bad.locator('.dossier.open').count(),0);await bad.close();
    console.log('PASS: five accents (light and dark), three radii, persistence, reset and corrupt-value fallback');

    // 12. Ctrl K commands.
    await page.setViewportSize({width:1440,height:1000});
    await page.keyboard.press('Control+k');await page.locator('#studio-command-input').fill('hồ sơ ca');
    assert.ok(await page.locator('.command-dialog').getByText('Hồ sơ ca · Chú giải').isVisible());await page.keyboard.press('Escape');
    await page.keyboard.press('Control+k');await page.locator('#studio-command-input').fill('vung nguy co');await page.keyboard.press('Enter');
    assert.equal((await state(page,'design.zoneShading'))['design.zoneShading'],true);
    await page.keyboard.press('Control+k');await page.locator('#studio-command-input').fill('mau nhan');await page.keyboard.press('Enter');
    assert.notEqual(await page.evaluate(()=>document.documentElement.dataset.accent),'teal','Đổi màu nhấn cycles the accent');
    console.log('PASS: Ctrl K commands for dossier, risk zones and accent');

    // 13. Review JSON carries the new design options.
    const review=await page.evaluate(()=>{const s=document.querySelector('#app')._vnode.component.setupState;return JSON.stringify(designOptions(s.design))});assert.ok(review.includes('"zoneShading":true')&&review.includes('"hiddenSeries":[]'));
    console.log('PASS: new options are part of the saved design');

    // 14. Monitoring module reuses the dossier with the two drawing tabs.
    await page.getByRole('radio',{name:'Theo dõi',exact:true}).click();
    const clinical=page.locator('.clinical-section .dossier');await clinical.waitFor();assert.deepEqual(await clinical.locator('[role=tab]').allInnerTexts().then(a=>a.map(t=>t.replace(/\s+/g,' ').trim().replace(/ \d+h$/,''))),['Chú giải','Bản vẽ']);
    await clinical.locator('.t-legend').click();await clinical.locator('.legend-group li[data-series=fhr] .legend-eye').click();assert.deepEqual((await state(page,'design.hiddenSeries'))['design.hiddenSeries'],['fhr']);
    assert.equal(await page.locator('.clinical-section svg.partograph [data-observation-field=fhr]:not([data-point-hit])').count(),0);
    console.log('PASS: Theo dõi chuyển dạ uses the same dossier (legend + drawing)');

    // 15. Phone: no overflow, 44px tab targets, KPI chips readable.
    await page.getByRole('radio',{name:'Soạn đề',exact:true}).click();await page.setViewportSize({width:390,height:844});
    await dossier(page).locator('.t-brief').click();
    const phone=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,tabs:[...document.querySelectorAll('.case-card:not([style*="display: none"]) .dossier-tabs [role=tab]')].map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height),e.scrollWidth>e.clientWidth+1]})}));
    assert.equal(phone.overflow,false);assert.ok(phone.tabs.every(([w,h,clip])=>w>=44&&h>=44&&!clip),JSON.stringify(phone.tabs));
    console.log('PASS: 390px layout without overflow or clipped tabs');
    assert.deepEqual(errors,[],'No runtime errors');console.log('PASS: no browser runtime errors');
  }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
