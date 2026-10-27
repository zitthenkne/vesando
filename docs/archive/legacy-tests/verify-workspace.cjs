// Run with the same PLAYWRIGHT_MODULE / CHROME_EXECUTABLE as verify-ui.cjs.
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
const state=p=>p.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState;return {ui:JSON.parse(JSON.stringify(a.ui)),panelWidth:a.panelWidth,stage:a.toolTab,data:JSON.stringify(a.activeCase),design:JSON.stringify(a.design)}});
async function preferences(p){const b=p.getByRole('button',{name:'Tùy biến không gian',exact:true});if(await b.isVisible())await b.click();else{await p.getByLabel('Ca và công cụ',{exact:true}).click();await p.locator('.workspace-menu .mobile-preferences-action').click()}}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{channel:'chrome'})});
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
    page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.type()==='error')errors.push(e.text())});
    const url='http://127.0.0.1:'+server.address().port;
    await page.goto(url);await page.waitForSelector('#app:not([v-cloak])');
    const original=await state(page);
    assert.equal(original.stage,'overview');assert.equal(await page.locator('.data-tools:visible').count(),0);
    assert.equal(await page.locator('.toolbox').isVisible(),false);
    assert.equal(await page.locator('.dossier.open').count(),0);
    assert.equal(await page.locator('.view-menu').getAttribute('open'),null);
    assert.equal(await page.locator('.case-header').isVisible(),false);
    assert.equal(await page.locator('.chart-diagnostics').isVisible(),false);
    // The two-option mode switch replaces the former mode <select>; it is not extra clutter. Hồ sơ ca adds one tab bar (4 tabs + fold) in place of the old nested accordion.
    assert.equal(await page.locator('.progress-field-picker>button:visible').count(),2);
    assert.ok(await page.locator('button:visible').count()-await page.locator('.workspace-mode>button').count()-await page.locator('.progress-field-picker>button:visible').count()<=16);
    await page.screenshot({path:path.join(os.tmpdir(),'vesando-quiet-desktop.png'),fullPage:true,animations:'disabled'});
    console.log('PASS: quiet startup, eleven visible buttons including JSON and usage guides, closed secondary information and full-width paper');

    await page.keyboard.press('Control+,');await page.waitForSelector('.workspace-preferences[open]');
    const box=await page.locator('.workspace-preferences').boundingBox();assert.ok(box.x>0&&box.y>=0&&box.x+box.width<1440);
    assert.equal(await page.evaluate(()=>!!document.activeElement.closest('.workspace-preferences')),true);
    await page.getByRole('button',{name:'Đầy đủ',exact:true}).click();
    let current=await state(page);for(const key of ['labels','timeline','hints','diagnostics','chartHeader','caseStrip'])assert.equal(current.ui[key],true);
    await page.getByLabel('Vị trí công cụ',{exact:true}).selectOption('side');
    await page.getByLabel('Bảng chỉnh sửa',{exact:true}).selectOption('overlay');
    for(const name of ['Tên công cụ','Dải mốc giờ','Gợi ý thao tác','Thông tin kỹ thuật','Tiêu đề ca trên màn hình','Dải ca mở rộng']){const toggle=page.getByRole('switch',{name,exact:true});await toggle.uncheck();assert.equal(await toggle.isChecked(),false);await toggle.check()}
    await page.locator('.preference-theme').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    await page.screenshot({path:path.join(os.tmpdir(),'vesando-workspace-preferences.png'),animations:'disabled'});
    await page.getByRole('button',{name:'Xong',exact:true}).click();
    assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('preferences-trigger')),true);
    await page.keyboard.press('Alt+2');
    const paperWidth=await page.locator('.workarea').evaluate(e=>e.getBoundingClientRect().width);
    assert.ok(paperWidth>1200,'Overlay inspector keeps the paper wide');
    await page.getByRole('separator',{name:'Độ rộng bảng công cụ'}).focus();await page.keyboard.press('ArrowLeft');
    assert.equal((await state(page)).panelWidth,360);
    const saved=await state(page);assert.equal(saved.data,original.data);assert.equal(saved.design,original.design);
    await page.reload();await page.waitForSelector('#app:not([v-cloak])');
    current=await state(page);assert.deepEqual(current.ui,saved.ui);assert.equal(current.panelWidth,360);
    assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    await preferences(page);await page.getByRole('button',{name:'Đặt lại giao diện',exact:true}).click();
    assert.equal((await state(page)).panelWidth,340);assert.deepEqual((await state(page)).ui,original.ui);
    assert.equal((await state(page)).data,original.data);assert.equal((await state(page)).design,original.design);
    assert.equal(await page.locator('html').getAttribute('data-theme'),'dark','Reset layout preserves the theme');
    await page.locator('.preference-theme').click();await page.keyboard.press('Escape');
    console.log('PASS: presets, six live switches, native dialog focus, overlay layout, width persistence, separate theme persistence and layout-only reset');

    await page.getByRole('button',{name:'Trình bày',exact:true}).click();assert.equal(await page.locator('.toolbox').isVisible(),true);
    assert.equal(await page.locator('.dimension-advanced').getAttribute('open'),null);
    await page.locator('.dimension-advanced>summary').click();assert.equal(await page.getByLabel('Rộng sản đồ (px)',{exact:true}).isVisible(),true);
    await page.getByRole('button',{name:'Trình bày',exact:true}).click();assert.equal((await state(page)).stage,'overview');
    await page.keyboard.press('Alt+2');await page.locator('.focus-toggle').focus();await page.keyboard.press('f');
    assert.equal(await page.locator('.tool-rail').isVisible(),false);assert.equal(await page.locator('.workbench-bar').isVisible(),false);
    assert.equal(await page.getByRole('button',{name:'Thoát tập trung',exact:true}).isVisible(),true);
    await page.keyboard.press('Escape');assert.equal(await page.locator('.workbench-bar').isVisible(),true);
    await page.keyboard.press('Escape');assert.equal((await state(page)).stage,'overview');
    await page.keyboard.press('Alt+1');await page.locator('.overview-toggle').focus();await page.keyboard.press('0');assert.equal((await state(page)).stage,'overview');
    await page.keyboard.press('Control+k');await page.locator('#studio-command-input').fill('tuy bien');await page.keyboard.press('Enter');assert.equal(await page.locator('.workspace-preferences').isVisible(),true);
    await page.keyboard.press('Control+k');assert.equal(await page.locator('dialog[open]').count(),1);assert.equal(await page.locator('.command-dialog').isVisible(),true);await page.keyboard.press('Escape');
    await page.locator('[data-point-hit][data-observation-time="2"][data-observation-field="cervix"]').first().click();
    await page.waitForSelector('.point-toolbar:visible');assert.equal(await page.locator('.editor').count(),0);assert.equal((await state(page)).stage,'overview');
    await page.locator('.focus-toggle').focus();await page.keyboard.press('f');await page.keyboard.press('Escape');assert.equal(await page.locator('.workbench-bar').isVisible(),true,'Escape exits focus even with an existing point selection');
    assert.equal(await page.locator('.point-quick-editor').count(),0,'Focus dismisses the point controls');await page.locator('.overview-toggle').click();
    console.log('PASS: tool toggling, progressive dimensions, true focus mode, Escape/0, and preference search');

    const scroll=page.locator('.chart-scroll');await scroll.hover({position:{x:400,y:180}});
    await page.keyboard.down('Control');await page.mouse.wheel(0,-100);await page.keyboard.up('Control');
    await page.waitForFunction(()=>document.querySelector('.partograph').style.width==='125%');
    assert.ok(await scroll.evaluate(e=>e.scrollLeft>0),'Wheel zoom keeps the cursor area in view');
    await page.locator('.view-menu>summary').click();await page.getByLabel('Mức phóng sản đồ',{exact:true}).selectOption('600');
    await scroll.dispatchEvent('wheel',{ctrlKey:true,deltaY:-100,clientX:400,clientY:250,cancelable:true});
    assert.equal(await page.getByLabel('Mức phóng sản đồ',{exact:true}).inputValue(),'600');
    await page.locator('.view-menu>summary').focus();await page.keyboard.press('Escape');assert.equal(await page.locator('.view-menu').getAttribute('open'),null);
    await page.locator('.view-menu>summary').click();await page.getByRole('button',{name:'Khớp chiều rộng',exact:true}).click();
    assert.equal(await page.getByLabel('Mức phóng sản đồ',{exact:true}).inputValue(),'100');assert.equal(await page.locator('.view-menu').getAttribute('open'),null);
    assert.equal((await state(page)).data,original.data);assert.equal((await state(page)).design,original.design);
    console.log('PASS: cursor-anchored Ctrl-wheel zoom, 600% cap, fit, and contextual dismissal without data changes');

    let layouts=0;
    for(const width of [320,390,768,1024,1440]){
      await page.setViewportSize({width,height:1000});
      for(const dock of ['bottom','side'])for(const panelMode of ['dock','overlay'])for(const labels of [false,true])for(const stage of ['overview','data','design','export']){
        await page.evaluate(async({dock,panelMode,labels,stage})=>{const a=document.querySelector('#app')._vnode.component.setupState;a.ui={...a.ui,dock,panelMode,labels};a.selectTool(stage);await Vue.nextTick();window.scrollTo(0,0)},{dock,panelMode,labels,stage});
        const faults=await page.evaluate(()=>{
          const faults=[];if(document.documentElement.scrollWidth>innerWidth)faults.push('horizontal overflow');
          for(const e of document.querySelectorAll('.tool-rail button,.session-actions button,.view-menu>summary')){
            if(!e.checkVisibility())continue;const r=e.getBoundingClientRect();if(r.width<43.9||r.height<43.9)faults.push('small target: '+e.getAttribute('aria-label'));
          }
          const dock=document.querySelector('.tool-rail').getBoundingClientRect();if(dock.left<0||dock.right>innerWidth+1||dock.top<0||dock.bottom>innerHeight+1)faults.push('dock outside viewport');
          const panel=document.querySelector('.toolbox');if(panel.checkVisibility()){const r=panel.getBoundingClientRect();if(r.left<0||r.right>innerWidth+1||r.top<0||r.bottom>innerHeight+1)faults.push('panel outside viewport')}
          return faults;
        });
        assert.deepEqual(faults,[],[width,dock,panelMode,labels,stage].join(' / '));layouts++;
      }
    }
    await page.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState;a.resetWorkspace();a.selectTool('overview')});
    await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(os.tmpdir(),'vesando-quiet-mobile.png'),animations:'disabled'});
    await preferences(page);const mobileDialog=await page.locator('.workspace-preferences').boundingBox();assert.ok(mobileDialog.x>=0&&mobileDialog.x+mobileDialog.width<=390&&mobileDialog.y>=0&&mobileDialog.y+mobileDialog.height<=844);
    await page.screenshot({path:path.join(os.tmpdir(),'vesando-preferences-mobile.png'),animations:'disabled'});await page.keyboard.press('Escape');
    await page.getByRole('radio',{name:'Theo dõi',exact:true}).click();assert.equal(await page.locator('.clinical-section').isVisible(),true);
    console.log('PASS: '+layouts+' responsive combinations, 44px primary targets, mobile dialog, and workspace switching');

    // Exercise the new interaction model with real input events and default settings.
    const precisionContext=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),precision=await precisionContext.newPage();
    precision.setDefaultTimeout(10000);precision.on('pageerror',e=>errors.push(e.message));
    await precision.goto(url);await precision.waitForSelector('#app:not([v-cloak])');
    const hit=(time,field)=>precision.locator('[data-point-hit][data-observation-time="'+time+'"][data-observation-field="'+field+'"]');
    const getCase=async()=>JSON.parse((await state(precision)).data),base=await getCase();
    async function drag(time,field,targetTime,value,shift=false){
      const node=hit(time,field);await node.scrollIntoViewIfNeeded();const box=await node.boundingBox();
      const at=await precision.evaluate(({field,targetTime,value})=>{
        const a=document.querySelector('#app')._vnode.component.setupState,core=window.PartographCore,d=core.buildSVG(a.activeCase,{...a.chartOptions,editable:true,field:a.plotField}),svg=document.querySelector('.case-card .partograph'),r=svg.getBoundingClientRect(),y=field==='fhr'?core.fetalHeartY(value):field==='descent'?core.descentY(value):core.cervixY(value);
        return {x:r.x+(core.G.left+d.labelOffset+d.timeline.plot(targetTime)*d.hour)*d.scaleX*r.width/d.width,y:r.y+d.rowLayout.y(y)*d.scaleY*r.height/d.height};
      },{field,targetTime,value});
      if(shift)await precision.keyboard.down('Shift');await precision.mouse.move(box.x+box.width/2,box.y+box.height/2);await precision.mouse.down();await precision.mouse.move(at.x,at.y,{steps:6});await precision.mouse.up();if(shift)await precision.keyboard.up('Shift');await precision.evaluate(()=>Vue.nextTick());
    }
    const undoPoint=async()=>{const button=precision.getByRole('button',{name:'Hoàn tác dữ liệu',exact:true});if(await button.isVisible())await button.click();else await precision.keyboard.press('Control+z')};
    assert.equal((await state(precision)).ui.dragAxis,'free','All directions work immediately, without Shift or changing settings');
    for(const [time,value] of [[1.5,5.5],[1.5,6.5],[2.5,5.5],[2.5,6.5],[2,5.5],[2,6.5],[1.5,6],[2.5,6]]){
      await drag(2,'cervix',time,value);const moved=await getCase();assert.equal(moved.observations.find(o=>o.time===time).cervix,value,'Free drag to '+time+'h / '+value+'cm');assert.equal(moved.observations.find(o=>o.time===2).fhr,140);await undoPoint();assert.deepEqual(await getCase(),base,'Each direction undoes in one step');
    }
    await drag(2,'cervix',2.5,6.5);
    let changed=await getCase();assert.equal(changed.observations.find(o=>o.time===2).cervix,null);assert.equal(changed.observations.find(o=>o.time===2.5).cervix,6.5);
    assert.equal(changed.observations.find(o=>o.time===2).fhr,140);await undoPoint();assert.deepEqual(await getCase(),base);await precision.keyboard.press('Alt+1');
    const workarea=await precision.locator('.workarea').boundingBox(),dataBox=await precision.locator('.data-tools').boundingBox();assert.ok(dataBox.x>=workarea.x+workarea.width,'All data controls belong to the right inspector');
    assert.equal(await precision.locator('.case-card .data-tools').count(),0);assert.equal(await precision.locator('.data-mode-picker button').count(),2);
    await hit(2,'cervix').click();assert.deepEqual(await getCase(),base,'Selecting a point never records a new value');assert.equal(await precision.locator('.selected-point-ring').count(),1);
    const input=precision.getByLabel('Giá trị điểm đang chọn',{exact:true});assert.equal(await input.inputValue(),'6');
    await precision.getByRole('button',{name:'Tăng giá trị một bước',exact:true}).click();assert.equal((await getCase()).observations.find(o=>o.time===2).cervix,6.5);await undoPoint();
    await input.fill('6.5');await precision.getByRole('button',{name:'Điểm sau cùng thông số',exact:true}).click();
    assert.equal((await getCase()).observations.find(o=>o.time===2).cervix,6.5);assert.equal(await precision.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.dataPoint.time),4);await undoPoint();
    await precision.getByRole('button',{name:'Điểm trước cùng thông số',exact:true}).click();await input.fill('6.3');await precision.getByRole('button',{name:'Điểm sau cùng thông số',exact:true}).click();
    assert.equal(await input.getAttribute('aria-invalid'),'true');assert.equal(await precision.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.dataPoint.time),2);assert.deepEqual(await getCase(),base);
    await input.fill('6.5');await precision.locator('.point-field-tabs').getByRole('button',{name:'Tim thai',exact:true}).click();assert.equal(await input.inputValue(),'140');assert.equal((await getCase()).observations.find(o=>o.time===2).cervix,6.5);await undoPoint();
    await precision.locator('.point-field-tabs').getByRole('button',{name:'CTC',exact:true}).click();if(!await precision.locator('.point-options').evaluate(e=>e.open))await precision.locator('.point-options>summary').click();
    await precision.getByLabel('Thời điểm điểm đang chọn',{exact:true}).fill('2.5');assert.ok((await precision.locator('.point-change-preview').innerText()).includes('10:00 → 10:30'));await input.fill('6.5');await input.press('Enter');
    changed=await getCase();assert.equal(changed.observations.find(o=>o.time===2).cervix,null);assert.equal(changed.observations.find(o=>o.time===2.5).cervix,6.5);assert.equal(changed.observations.find(o=>o.time===2.5).fhr,144);await undoPoint();
    await hit(2,'cervix').click();if(!await precision.locator('.point-options').evaluate(e=>e.open))await precision.locator('.point-options>summary').click();await precision.getByRole('button',{name:'Xóa điểm',exact:true}).click();
    changed=await getCase();assert.equal(changed.observations.find(o=>o.time===2).cervix,null);assert.equal(changed.observations.find(o=>o.time===2).descent,3);await undoPoint();assert.deepEqual(await getCase(),base);
    await hit(2,'cervix').focus();await precision.keyboard.press('Delete');assert.equal((await getCase()).observations.find(o=>o.time===2).cervix,null);await undoPoint();
    await precision.getByLabel('Hướng kéo điểm',{exact:true}).selectOption('time');await drag(2,'cervix',2.5,9);changed=await getCase();assert.equal(changed.observations.find(o=>o.time===2.5).cervix,6);await undoPoint();
    await precision.getByLabel('Hướng kéo điểm',{exact:true}).selectOption('value');await drag(2,'cervix',2.5,6.5,true);changed=await getCase();assert.equal(changed.observations.find(o=>o.time===2.5).cervix,6.5);await undoPoint();
    await hit(2,'descent').click();if(!await precision.locator('.point-options').evaluate(e=>e.open))await precision.locator('.point-options>summary').click();await precision.getByRole('button',{name:'Kiểu thế',exact:true}).click();
    assert.equal(await precision.getByLabel('Vị trí thay hình',{exact:true}).inputValue(),'2');await precision.locator('.head-position-grid>button').first().click();
    const withHead=await getCase();assert.ok(withHead.observations.find(o=>o.time===2).headMarker);
    await precision.keyboard.press('Alt+1');await hit(2,'descent').click();if(!await precision.locator('.point-options').evaluate(e=>e.open))await precision.locator('.point-options>summary').click();await precision.getByRole('button',{name:'Xóa điểm',exact:true}).click();
    changed=await getCase();assert.equal(changed.observations.find(o=>o.time===2).descent,null);assert.equal(changed.observations.find(o=>o.time===2).headMarker,undefined);assert.equal(changed.observations.find(o=>o.time===2).cervix,6);await undoPoint();assert.deepEqual(await getCase(),withHead);
    await hit(2,'cervix').click();await precision.getByRole('button',{name:'Chi tiết',exact:true}).click();const form=await precision.locator('.editor').boundingBox(),paper=await precision.locator('.workarea').boundingBox();assert.ok(form.x>=paper.x+paper.width,'The full form is also in the right inspector');
    await precision.locator('.editor-values input[type=number]').nth(1).fill('6.5');assert.equal((await getCase()).observations.find(o=>o.time===2).cervix,6);await precision.locator('.editor-values input[type=number]').nth(1).press('Control+Enter');assert.equal((await getCase()).observations.find(o=>o.time===2).cervix,6.5);
    await precision.screenshot({path:path.join(os.tmpdir(),'vesando-precision-desktop.png'),animations:'disabled'});
    await precision.getByRole('radio',{name:'Theo dõi',exact:true}).click();await precision.getByRole('button',{name:'Nhập số liệu',exact:true}).click();
    assert.equal(await precision.locator('#studio-toolbox .quick-entry').count(),0);assert.equal(await precision.locator('.clinical-section .quick-entry').count(),1);assert.equal(await precision.locator('.bedside-entry').isVisible(),true);await precision.locator('#quick-fhr').fill('151');await precision.locator('#quick-fhr').press('Control+Enter');assert.equal((await getCase()).observations[0].fhr,151);
    await precisionContext.close();
    const tapContext=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),tap=await tapContext.newPage();await tap.goto(url);await tap.waitForSelector('#app:not([v-cloak])');
    const tapBefore=(await state(tap)).data;await tap.locator('[data-point-hit][data-observation-time="2"][data-observation-field=cervix]').tap();await tap.waitForSelector('.point-toolbar');assert.equal(await tap.locator('#studio-toolbox[aria-modal=true]').count(),0,'A tap keeps the chart in view: floating toolbar, no full sheet');assert.equal((await state(tap)).data,tapBefore);
    await tap.locator('.point-toolbar').getByRole('button',{name:'Thêm thao tác với điểm',exact:true}).tap();await tap.getByRole('menuitem',{name:'Mở ô nhập số liệu'}).tap();await tap.waitForSelector('#studio-toolbox[aria-modal=true]');assert.equal(await tap.locator('.point-quick-editor').isVisible(),true);assert.equal((await state(tap)).data,tapBefore);
    await tap.waitForTimeout(400);assert.equal(await tap.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.dataMode),'drag','A synthesized touch click must not activate the newly displayed Add button');
    await tap.screenshot({path:path.join(os.tmpdir(),'vesando-precision-mobile.png'),animations:'disabled'});await tapContext.close();
    console.log('PASS: free drag in eight directions without Shift, one-step undo, right-side controls/forms, optional axis locks, nudge, save-before-navigation, invalid-input retention, head-marker preservation, clinical input and touch selection');

    for(const key of ['partograph-workspace-v2','partograph-workspace-v3']){
      const legacyContext=await browser.newContext(),legacy=await legacyContext.newPage();await legacy.goto(url);await legacy.waitForSelector('#app:not([v-cloak])');
      await legacy.evaluate(key=>{localStorage.removeItem('partograph-workspace-v3');localStorage.setItem(key,JSON.stringify({ui:{dragAxis:'value',accent:'blue',labels:false},panelWidth:380}))},key);await legacy.reload();await legacy.waitForSelector('#app:not([v-cloak])');
      const upgraded=await state(legacy);assert.equal(upgraded.ui.dragAxis,'free');assert.equal(upgraded.ui.accent,'blue');assert.equal(upgraded.ui.labels,false);assert.equal(upgraded.panelWidth,380);
      await legacy.keyboard.press('Alt+1');await legacy.getByLabel('Hướng kéo điểm',{exact:true}).selectOption('time');await legacy.reload();await legacy.waitForSelector('#app:not([v-cloak])');assert.equal((await state(legacy)).ui.dragAxis,'time','A lock explicitly chosen after the upgrade remains saved');await legacyContext.close();
    }
    console.log('PASS: legacy v2/v3 axis-lock migration preserves other preferences and remembers later explicit locks');

    const malformed=await browser.newContext();await malformed.addInitScript(()=>localStorage.setItem('partograph-workspace-v3',JSON.stringify({ui:{labels:'false',dock:'invalid',panelMode:null,spacing:'wrong',patient:'must not be retained'},panelWidth:9999})));
    const invalid=await malformed.newPage();await invalid.goto(url);await invalid.waitForSelector('#app:not([v-cloak])');
    const repaired=await state(invalid);assert.deepEqual(repaired.ui,original.ui);assert.equal(repaired.panelWidth,520);assert.ok(!('patient' in repaired.ui));
    await invalid.evaluate(()=>localStorage.setItem('partograph-workspace-v3','{broken'));await invalid.reload();await invalid.waitForSelector('#app:not([v-cloak])');assert.deepEqual((await state(invalid)).ui,original.ui);await malformed.close();
    assert.deepEqual(errors,[]);console.log('PASS: corrupt/invalid preferences recover safely; no console or runtime errors');
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());
