// Browser checks for the design refresh: chart text cells, mode switch, AI workflow, phone layout and gestures.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const files=new Set(['index.html','studio.css','workspace.css','interaction.css','theme.css','clinical-rules.js','guidance.js','enhancements.js']);
const server=http.createServer(async(req,res)=>{const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(!files.has(name)){res.writeHead(404);res.end();return}try{res.setHeader('Content-Type',(name.endsWith('.css')?'text/css':name.endsWith('.js')?'application/javascript':'text/html')+'; charset=utf-8');res.end(await fs.readFile(path.join(__dirname,name)))}catch{res.writeHead(500);res.end()}});
const app=page=>page.evaluate(()=>{const s=document.querySelector('#app')._vnode.component.setupState;return {mode:s.mode,inputsOpen:s.inputsOpen,toolTab:s.toolTab}});
const setHidden=(page,hidden)=>page.evaluate(h=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>h});document.dispatchEvent(new Event('visibilitychange'))},hidden);
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{channel:'chrome'})});
  const errors=[];
  try{
    const context=await browser.newContext({viewport:{width:1440,height:900}});await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:url});
    const page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
    await page.goto(url);await page.waitForSelector('#app:not([v-cloak])');

    // Free-text rows show the whole entry when the row has room, and cut on word boundaries when it does not.
    const texts=await page.locator('.case-card:visible svg.partograph text').allTextContents();
    assert.ok(texts.includes('Bupivacain 0,1% + Fentanyl 2 mcg/ml (NMC)'),'Medication text is shown in full');
    assert.ok(texts.includes('Ringer lactat 500 ml TM'),'IV fluid text is shown in full');
    assert.ok(!texts.some(t=>/^(Bup|Rin)…$/.test(t)),'No three-letter stubs remain');
    const cramped=await page.evaluate(()=>{const c=JSON.parse(JSON.stringify(document.querySelector('#app')._vnode.component.setupState.activeCase));c.observations.find(o=>o.time===2).medication='Oxytocin 5 IU';return [...buildSVG(c,{design:{}}).inner.matchAll(/<text[^>]*paint-order[^>]*>([^<]*)<\/text>/g)].map(m=>m[1])});
    assert.ok(cramped.every(line=>line.endsWith('…')||line.split(' ').every(w=>w.length>0)),'Lines are whole words or end with an ellipsis');
    assert.ok(cramped.some(line=>/^Bupiv\S*…$/.test(line))&&!cramped.some(line=>/^[a-z]/.test(line)),'A crowded entry abbreviates the first word instead of splitting it');
    assert.ok(cramped.includes('Oxytocin 5 IU'),'The neighbouring entry keeps its own text');
    for(const heading of ['THUỐC · LIỀU · ĐƯỜNG DÙNG','DỊCH TRUYỀN','ĐƯỜNG & KÝ HIỆU','CƠN CO · THỜI GIAN MỖI CƠN','ỐI (KÝ HIỆU VIỆT) · KIỂU THẾ','GHI CHÚ ĐỌC PHIẾU'])assert.ok(texts.includes(heading),'Footer section '+heading);
    assert.ok(!texts.some(t=>t.startsWith('09:30 · Thuốc:')),'Medication details are a table, not a run-on line');
    console.log('PASS: free-text chart rows span empty cells, wrap to two lines and abbreviate by word; footer is a table, a framed legend and reading notes');

    // Both work modes are visible and switch in one tap.
    await page.getByRole('radio',{name:'Theo dõi',exact:true}).click();assert.equal((await app(page)).mode,'clinical');
    assert.equal(await page.getByRole('radio',{name:'Theo dõi',exact:true}).getAttribute('aria-checked'),'true');
    await page.getByRole('radio',{name:'Soạn đề',exact:true}).click();assert.equal((await app(page)).mode,'exam');
    console.log('PASS: segmented mode switch');

    // Clock times: re-anchoring one axis mark shifts startTime, so every other mark follows; undo restores it.
    const start=()=>page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.activeCase.patient.startTime);
    assert.equal(await start(),'08:00');
    await page.locator('.case-card:visible [data-cell-key="clockAt"][aria-label="Sửa Giờ thực lúc 12:00"]').click();
    const clockEditor=page.locator('.chart-cell-editor');await clockEditor.waitFor();
    assert.equal(await clockEditor.locator('input[type=time]').inputValue(),'12:00');
    await clockEditor.locator('input[type=time]').fill('13:30');await clockEditor.getByRole('button',{name:'Lưu tại ô',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('#app')._vnode.component.setupState.activeCase.patient.startTime==='09:30');
    const axis=await page.locator('.case-card:visible svg.partograph text[font-size][font-family="monospace"]').allTextContents();
    assert.ok(axis.includes('09:30')&&axis.includes('13:30')&&!axis.includes('12:00'),'All axis clock marks move together');
    await page.keyboard.press('Control+z');await page.waitForFunction(()=>document.querySelector('#app')._vnode.component.setupState.activeCase.patient.startTime==='08:00');
    await page.locator('#studio-tools-navigation .tool-tabs button').first().click();
    const day0=await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.activeCase.patient.date);
    const panelClock=page.getByLabel('Giờ thực tại mốc đang xem',{exact:true});assert.equal(await panelClock.inputValue(),'08:00');
    await panelClock.fill('23:00');await panelClock.dispatchEvent('change');
    await page.waitForFunction(()=>{const p=document.querySelector('#app')._vnode.component.setupState.activeCase.patient;return p.startTime==='23:00'});
    const shifted=await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.activeCase.patient.date);assert.equal(new Date(day0+'T00:00:00Z')-new Date(shifted+'T00:00:00Z'),864e5,'08:00 → 23:00 is the evening before');
    await page.keyboard.press('Escape');await page.keyboard.press('Control+z');await page.waitForFunction(()=>document.querySelector('#app')._vnode.component.setupState.activeCase.patient.startTime==='08:00');
    console.log('PASS: axis clock marks and the data-panel clock re-anchor all times; undo restores them');

    // The standard sits on the chart toolbar; a review JSON reopens elsewhere with the same standard and design.
    const st=()=>page.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState;return {standard:a.standard,grid:a.design.gridColor,cases:a.cases.length}});
    const picker=page.locator('.case-card:visible .chart-viewbar').getByLabel('Quy chuẩn sản đồ',{exact:true});
    assert.ok(await picker.isVisible());await picker.selectOption('lcg');assert.equal((await st()).standard,'lcg');
    assert.ok((await page.locator('.case-card:visible svg.partograph text').first().textContent()).includes('WHO LCG'));
    await picker.selectOption('modified');await page.evaluate(()=>{document.querySelector('#app')._vnode.component.setupState.design.gridColor='#7a4b9c'});
    await page.locator('#studio-tools-navigation .tool-tabs button').nth(3).click();
    const [file]=await Promise.all([page.waitForEvent('download'),page.locator('.review-share').getByRole('button',{name:'Tải JSON',exact:true}).click()]);
    assert.match(file.suggestedFilename(),/^san-do-CASE-001-kiem-tra\.json$/);
    const review=await fs.readFile(await file.path(),'utf8'),parsed=JSON.parse(review);
    assert.equal(parsed.kind,'partograph-review');assert.equal(parsed.standard,'modified');assert.equal(parsed.design.gridColor,'#7a4b9c');assert.equal(parsed.cases.length,1);assert.equal(parsed.cases[0].observations.length,13);assert.equal(parsed.cases[0].events.length,4);
    await page.locator('.review-share').getByRole('button',{name:'Sao chép JSON',exact:true}).click();
    assert.equal(JSON.parse(await page.evaluate(()=>navigator.clipboard.readText())).kind,'partograph-review');
    const other=await browser.newContext({viewport:{width:1280,height:900}}),q=await other.newPage();q.on('pageerror',e=>errors.push('reader: '+e.message));
    await q.goto(url);await q.waitForSelector('#app:not([v-cloak])');
    await q.getByRole('button',{name:'Lập sản đồ bằng AI',exact:true}).click();await q.getByRole('button',{name:'Bước 2: Nhập kết quả AI',exact:true}).click();
    await q.locator('#json-workbench-input').fill(review);await q.waitForSelector('.review-badge');
    assert.ok((await q.locator('.review-badge').innerText()).includes('Modified'));
    assert.ok((await q.locator('.json-preview-column .partograph').innerHTML()).includes('#7a4b9c'),'Preview uses the sender design');
    await q.getByRole('button',{name:'Vẽ sản đồ',exact:true}).click();
    assert.deepEqual(await q.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState;return {standard:a.standard,grid:a.design.gridColor,obs:a.activeCase.observations.length}}),{standard:'modified',grid:'#7a4b9c',obs:13});
    await other.close();
    await page.locator('.case-card:visible .chart-viewbar').getByLabel('Quy chuẩn sản đồ',{exact:true}).selectOption('who1993');await page.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState;a.design.gridColor='#a8b4bf';a.selectTool('overview')});
    console.log('PASS: standard picker on the chart toolbar; review JSON downloads, copies and reopens with the same standard and design');

    // Header strip, alternate FHR numbers, head figures that step aside, outline-only figure.
    const svgTexts=()=>page.locator('.case-card:visible svg.partograph text').allTextContents();
    let labels=await svgTexts();for(const t of ['HỌ TÊN','MÃ','PARA','TUỔI THAI','NGÀY','GIỜ BẮT ĐẦU','NGÔI · KIỂU THẾ','Sản phụ giả định'])assert.ok(labels.includes(t),'Header field '+t);
    assert.ok(labels.includes('180')&&!labels.includes('190'),'FHR numbers alternate every 20 beats by default');
    await page.evaluate(()=>{document.querySelector('#app')._vnode.component.setupState.design.fhrLabelStep=10});await page.waitForTimeout(100);assert.ok((await svgTexts()).includes('190'),'Every-10 labels can be restored');
    await page.evaluate(()=>{const d=document.querySelector('#app')._vnode.component.setupState.design;d.fhrLabelStep=20;d.headerLayout='line'});await page.waitForTimeout(100);assert.ok((await svgTexts()).some(t=>t.startsWith('Mã: ')),'One-line header remains available');
    await page.evaluate(()=>{document.querySelector('#app')._vnode.component.setupState.design.headerLayout='grid'});
    assert.ok(await page.locator('.case-card:visible [data-head-callout]').count()>=1,'A figure that would hide the 08:00 cervix cross is moved aside');
    const lift=await page.locator('.case-card:visible g[data-observation-time="0"][data-observation-field="descent"]').evaluate(g=>{const head=g.querySelector('[data-head-callout] [data-head-marker] circle'),dot=[...g.querySelectorAll(':scope>circle')].pop();return Number(dot.getAttribute('cy'))-Number(head.getAttribute('cy'))});assert.ok(lift>10,'With room above, the moved figure goes straight up');
    const setMarker=patch=>page.evaluate(patch=>{const a=document.querySelector('#app')._vnode.component.setupState,c=JSON.parse(JSON.stringify(a.activeCase)),o=c.observations.find(o=>o.time===0);o.headMarker={...o.headMarker,...patch};a.cases[a.activeCaseIndex]=c},patch);
    await setMarker({placement:'point'});await page.waitForTimeout(100);assert.equal(await page.locator('.case-card:visible [data-observation-time="0"][data-observation-field="descent"] [data-head-callout]').count(),0,'Placement can pin the figure to the point');
    await setMarker({hidden:true});await page.waitForTimeout(100);
    const plain=page.locator('.case-card:visible g[data-observation-time="0"][data-observation-field="descent"]');assert.equal(await plain.locator('[data-head-marker]').count(),0,'A hidden figure draws no head');assert.equal((await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.activeCase.observations[0].headMarker)).angle,270,'Hiding keeps the angle');assert.equal(await plain.locator('circle[fill="none"]').count(),1,'It is the usual small circle, see-through over the cervix cross');
    await page.locator('#studio-tools-navigation .tool-tabs button').nth(1).click();for(const name of ['Kiểu đầu phiếu','Khoảng cách số trên trục tim thai','Dải tim thai bình thường','Khoảng cách số trên trục mạch và huyết áp'])assert.ok(await page.getByLabel(name,{exact:true}).count(),'Design control '+name);
    await page.keyboard.press('Control+z');await page.keyboard.press('Control+z');await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.selectTool('overview'));
    console.log('PASS: labelled header strip, alternate FHR numbers, head figures step aside with an arrow, per-moment hide keeps settings, upward placement, new design controls');

    // Floating point toolbar: nudge, move, copy, shift the rest of the labour, right-click selection.
    const obs=()=>page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.activeCase.observations.map(o=>[o.time,o.cervix]).filter(o=>o[1]!==null));
    const before=await obs();await page.locator('.case-card:visible [data-point-hit][data-observation-time="2"][data-observation-field=cervix]').click({button:'right'});
    const bar=page.locator('.point-toolbar');await bar.waitFor();assert.ok((await bar.innerText()).includes('CTC 6 cm'));
    await bar.getByRole('button',{name:'Tăng số đo trên sản đồ',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#app')._vnode.component.setupState.activeCase.observations.find(o=>o.time===2).cervix===6.5);
    await bar.getByRole('button',{name:'Muộn hơn 30 phút',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#app')._vnode.component.setupState.activeCase.observations.find(o=>o.time===2.5)?.cervix===6.5);
    await bar.getByRole('button',{name:'Nhân bản sang 30 phút sau',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#app')._vnode.component.setupState.activeCase.observations.find(o=>o.time===3)?.cervix===6.5);
    for(let i=0;i<3;i++)await page.keyboard.press('Control+z');assert.deepEqual(await obs(),before,'Toolbar edits undo step by step');
    await page.locator('.case-card:visible [data-point-hit][data-observation-time="4"][data-observation-field=descent]').click({button:'right'});
    await bar.getByRole('button',{name:'Ẩn hình kiểu thế',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#app')._vnode.component.setupState.activeCase.observations.find(o=>o.time===4).headMarker.hidden===true);
    assert.equal(await page.locator('.case-card:visible g[data-observation-time="4"][data-observation-field="descent"] [data-head-marker]').count(),0);
    await bar.getByRole('button',{name:'Hiện hình kiểu thế',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('#app')._vnode.component.setupState.activeCase.observations.find(o=>o.time===4).headMarker.hidden);
    await page.locator('.case-card:visible [data-point-hit][data-observation-time="4"][data-observation-field=cervix]').click({button:'right'});await bar.getByRole('button',{name:'Thêm thao tác với điểm',exact:true}).click();
    await page.getByRole('menuitem',{name:'Dời điểm này và các mốc sau muộn 30 phút',exact:true}).click();
    const moved=await obs();assert.deepEqual(moved.filter(o=>o[0]<4),before.filter(o=>o[0]<4),'Earlier data stays put');assert.deepEqual(moved.filter(o=>o[0]>=4.5).map(o=>o[1]),before.filter(o=>o[0]>=4).map(o=>o[1]),'Later data moves together');
    await page.keyboard.press('Control+z');assert.deepEqual(await obs(),before);await page.keyboard.press('Escape');
    console.log('PASS: point toolbar nudges, moves, copies and shifts later observations; eye button hides/shows a head figure; right-click selects; undo restores');

    // AI step 1: data checklist, sample brief, saved draft.
    await page.getByRole('button',{name:'Lập sản đồ bằng AI',exact:true}).click();await page.waitForSelector('.json-workbench[open]');
    assert.equal(await page.locator('.insight-head span').innerText(),'0/10 nhóm');
    await page.getByRole('button',{name:'Dùng đề mẫu',exact:true}).click();
    assert.equal(await page.locator('.insight-head span').innerText(),'10/10 nhóm');
    assert.equal(await page.locator('.insight-list li.found').count(),10);
    const brief=await page.getByLabel('Đề bài lâm sàng',{exact:true}).inputValue();assert.ok(brief.includes('Lúc 12:30'));
    assert.ok((await page.getByLabel('Prompt tạo JSON sản đồ',{exact:true}).inputValue()).includes('Lúc 12:30'),'The brief flows into the prompt');
    assert.equal(await page.locator('details.prompt-output').getAttribute('open'),null,'The full prompt starts collapsed');
    assert.equal(await page.locator('.ai-links a').count(),3);
    for(const a of await page.locator('.ai-links a').all())assert.equal(await a.getAttribute('target'),'_blank');
    await page.reload();await page.waitForSelector('#app:not([v-cloak])');
    await page.getByRole('button',{name:'Lập sản đồ bằng AI',exact:true}).click();
    assert.equal(await page.getByLabel('Đề bài lâm sàng',{exact:true}).inputValue(),brief,'The brief survives a reload');
    console.log('PASS: brief checklist, sample brief, collapsed prompt, copy-and-open links, saved draft');

    // Copying then leaving for the AI tool brings the author back on step 2.
    await page.getByRole('button',{name:'Sao chép prompt',exact:true}).click();
    assert.ok((await page.evaluate(()=>navigator.clipboard.readText())).includes('Lúc 12:30'));
    assert.equal(await page.getByRole('button',{name:'Bước 1: Soạn prompt',exact:true}).locator('svg').count(),1,'Step 1 shows a check mark once the prompt is copied');
    await setHidden(page,true);await setHidden(page,false);
    assert.equal(await page.getByRole('button',{name:'Bước 2: Nhập kết quả AI',exact:true}).getAttribute('aria-pressed'),'true');
    await page.waitForSelector('.ai-return-banner');
    assert.equal(await page.evaluate(()=>document.activeElement.textContent.trim()),'Dán phản hồi');
    console.log('PASS: copy marks step 1 done; returning to the page opens step 2 with the paste action focused');

    // Step 2: quick check, dropped text, paste button.
    assert.equal(await page.locator('.quick-check-grid>div').count(),6);
    assert.equal(await page.locator('.quick-check-grid>div').first().locator('strong').innerText(),'13');
    const sample={title:'Ca thả vào',patient:{startTime:'07:00'},observations:[{time:0,cervix:4,descent:4,fhr:138},{time:2,cervix:6,descent:3,fhr:142},{time:4,cervix:8,descent:2,fhr:140}]};
    const dt=await page.evaluateHandle(text=>{const d=new DataTransfer();d.setData('text/plain',text);return d},'```json\n'+JSON.stringify(sample)+'\n```');
    await page.dispatchEvent('.paste-zone','drop',{dataTransfer:dt});
    await page.waitForFunction(()=>document.querySelector('.json-preview-heading span')?.textContent==='Ca thả vào');
    assert.equal(await page.locator('.quick-check-grid>div').nth(1).locator('strong').innerText(),'4 → 8 cm');
    assert.equal(await page.locator('.quick-warn').count(),0);
    await page.evaluate(()=>navigator.clipboard.writeText('{"observations":[{"time":0,"fhr":140}]}'));
    await page.getByRole('button',{name:'Dán phản hồi',exact:true}).click();
    await page.waitForSelector('.quick-warn');assert.ok((await page.locator('.quick-warn').innerText()).includes('Chưa có độ mở cổ tử cung'));
    assert.equal(await page.getByRole('button',{name:'Bước 2: Nhập kết quả AI',exact:true}).locator('svg').count(),1,'Step 2 shows a check mark when the data is valid');
    await page.getByRole('button',{name:'Đóng nhập JSON',exact:true}).click();
    console.log('PASS: quick check summary and warnings, drag-and-drop and paste');

    // Phones: two-row header, six-item bottom bar, zoom pill, pinch, swipe-to-close sheet.
    for(const width of [320,390]){
      const phone=await browser.newContext({viewport:{width,height:740},isMobile:true,hasTouch:true}),p=await phone.newPage();p.on('pageerror',e=>errors.push(width+': '+e.message));p.on('console',m=>{if(m.type()==='error')errors.push(width+': '+m.text())});
      await p.goto(url);await p.waitForSelector('#app:not([v-cloak])');
      assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal scroll at '+width);
      assert.ok(await p.locator('.session-name>summary').isVisible(),'Current case is visible at '+width);
      for(const name of ['Soạn đề','Theo dõi'])assert.ok(await p.getByRole('radio',{name,exact:true}).isVisible());
      const rail=await p.locator('#studio-tools-navigation button:visible').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return [r.left,r.right,r.width]}));
      assert.equal(rail.length,6,'Six bottom-bar targets at '+width);
      assert.ok(rail.every(([l,r,w])=>l>=0&&r<=width&&w>=44),'Bottom bar fits the screen with 44 px targets at '+width);
      const fit=await p.locator('#studio-tools-navigation .tool-name, #studio-tools-navigation .focus-toggle>span').evaluateAll(els=>els.every(e=>e.scrollWidth<=e.clientWidth+1));
      assert.ok(fit,'Bottom bar labels are not clipped at '+width);
      assert.ok(await p.locator('.chart-zoom-pill').isVisible());
      await p.getByRole('button',{name:'Phóng to nhanh',exact:true}).click();assert.equal(await p.locator('.zoom-readout').innerText(),'150%');
      await p.locator('.zoom-readout').click();assert.equal(await p.locator('.zoom-readout').innerText(),'100%');
      const box=await p.locator('.chart-scroll').boundingBox(),cdp=await phone.newCDPSession(p),cx=box.x+box.width/2,cy=box.y+Math.min(box.height,300)/2;
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx-30,y:cy},{x:cx+30,y:cy}]});
      for(const d of [50,80,110])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx-d,y:cy},{x:cx+d,y:cy}]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      assert.ok(parseInt(await p.locator('.zoom-readout').innerText())>=300,'Pinch zooms the chart at '+width);
      await p.locator('#studio-tools-navigation .tool-tabs button').first().click();await p.waitForSelector('.toolbox.mobile-open');
      const head=await p.locator('.toolbox.mobile-open .toolbox-mobile-heading').boundingBox();
      await p.mouse.move(head.x+head.width/2,head.y+12);await p.mouse.down();await p.mouse.move(head.x+head.width/2,head.y+80,{steps:4});await p.mouse.move(head.x+head.width/2,head.y+170,{steps:4});await p.mouse.up();
      assert.equal((await app(p)).inputsOpen,false,'Dragging the sheet down closes it at '+width);
      await p.getByRole('button',{name:'Lập sản đồ bằng AI',exact:true}).click();await p.waitForSelector('.json-workbench[open]');
      const dialog=await p.locator('.json-workbench').boundingBox();assert.ok(dialog.width>=width-1&&dialog.x<=1,'AI dialog is full screen at '+width);
      assert.equal(await p.locator('#ai-subject').evaluate(e=>getComputedStyle(e).fontSize),'16px','Phone inputs stay at 16 px');
      assert.ok(await p.locator('.json-workbench').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
      await p.screenshot({path:path.join(os.tmpdir(),'vesando-refresh-ai-'+width+'.png')});
      await phone.close();
    }
    console.log('PASS: 320/390 phone header, bottom bar, zoom pill, pinch zoom, swipe-to-close sheet, full-screen AI dialog');

    // Dark theme keeps the AI action readable.
    await page.evaluate(()=>{document.documentElement.dataset.theme='dark'});
    const contrast=await page.locator('.json-entry').evaluate(e=>getComputedStyle(e).color);assert.equal(contrast,'rgb(255, 255, 255)');
    assert.deepEqual(errors,[]);console.log('PASS: dark theme AI action; no runtime or console errors');
  }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
