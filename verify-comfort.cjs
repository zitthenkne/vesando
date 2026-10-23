// Focused regression checks for point-tool dismissal and recoverable device storage.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const KEY='partograph-session-v1',BACKUP='partograph-session-backup-v1',AUTO='partograph-session-autosave-v1';
const files=new Set(['index.html','studio.css','workspace.css','interaction.css','theme.css','canvas.css','clinical-rules.js','guidance.js','enhancements.js']);
const server=http.createServer(async(req,res)=>{
  const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!files.has(file)){res.writeHead(404);res.end();return}
  try{res.setHeader('Content-Type',(file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':'text/html')+'; charset=utf-8');res.end(await fs.readFile(path.join(__dirname,file)))}catch{res.writeHead(500);res.end()}
});
const state=p=>p.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState;return {mode:a.mode,tool:a.toolTab,edit:a.dataMode,point:a.dataPoint,cases:JSON.parse(JSON.stringify(a.cases)),clinical:JSON.parse(JSON.stringify(a.clinical)),drafts:JSON.parse(JSON.stringify(a.quickDrafts)),design:JSON.parse(JSON.stringify(a.design)),active:a.activeCaseIndex,time:a.selectedTime,moment:a.selectedMoment,current:a.deviceCurrent,auto:a.deviceAuto,error:a.deviceError,unsafe:a.deviceUnsafe,preview:a.previewCase&&JSON.parse(JSON.stringify(a.previewCase))}});
const ready=p=>p.waitForSelector('#app:not([v-cloak])');
const saved=p=>p.evaluate(key=>localStorage.getItem(key),KEY);
const mutate=(p,title)=>p.evaluate(title=>{document.querySelector('#app')._vnode.component.setupState.clinical.title=title},title);
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{channel:'chrome'})});
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
    page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
    const url='http://127.0.0.1:'+server.address().port;
    await page.goto(url);await ready(page);
    assert.equal(await saved(page),null);assert.equal((await state(page)).auto,false);
    const original=(await state(page)).cases;
    for(const width of [1440,390]){
      await page.setViewportSize({width,height:1000});
      for(const exit of ['close','escape']){
        await page.keyboard.press('Alt+1');await page.getByRole('button',{name:'Thao tác trực tiếp',exact:true}).click();
        assert.equal((await state(page)).edit,'drag');assert.equal(await page.locator('.editing-mode-banner').count(),0);
        if(exit==='close')await page.getByRole('button',{name:'Đóng bảng công cụ',exact:true}).click();
        if(exit==='escape')await page.keyboard.press('Escape');
        const a=await state(page);assert.equal(a.edit,'drag',exit+' keeps unified interaction');assert.equal(a.tool,'overview');
        assert.equal(await page.locator('.editing-mode-banner').count(),0);assert.equal(await page.locator('.toolbox').isVisible(),false);
        await page.locator('.case-card:visible [data-point-hit][data-observation-time="2"][data-observation-field="cervix"]').click();
        assert.deepEqual((await state(page)).cases,original,'Choosing an existing point never records a measurement');assert.equal((await state(page)).tool,'overview');await page.keyboard.press('Escape');
      }
    }
    await page.setViewportSize({width:1440,height:1000});
    const hit=page.locator('.case-card:visible [data-point-hit][data-observation-time="2"][data-observation-field=cervix]'),bar=page.locator('.point-toolbar');
    await hit.click({button:'right'});await bar.waitFor();assert.ok(await bar.locator('>button').count()<=5);
    await bar.getByRole('button',{name:'Đóng thanh sửa điểm',exact:true}).click();
    await page.locator('.view-menu>summary').click();await page.getByRole('button',{name:'Phóng to sản đồ',exact:true}).click();await page.getByRole('button',{name:'Khớp chiều rộng',exact:true}).click();
    assert.equal(await bar.count(),0,'Zoom/redraw must not revive dismissed controls');
    await hit.click({button:'right'});await bar.waitFor();await bar.getByRole('button',{name:'Thêm thao tác với điểm',exact:true}).click();
    assert.equal(await bar.getByRole('menuitem',{name:'Xóa điểm này',exact:true}).isVisible(),true);
    await page.keyboard.press('Escape');assert.equal(await page.locator('.point-toolbar-menu').count(),0);assert.equal(await bar.count(),1,'Escape closes the nested menu before the selected-point toolbar');
    await page.keyboard.press('Escape');assert.equal(await bar.count(),0);
    await hit.click();await bar.getByRole('button',{name:'Thêm thao tác với điểm',exact:true}).click();await bar.getByRole('menuitem',{name:'Mở ô nhập số liệu',exact:true}).click();assert.equal(await page.locator('.point-quick-editor').isVisible(),true);assert.equal(await bar.count(),0,'Only one editor is shown');
    await page.getByLabel('Giá trị điểm đang chọn',{exact:true}).fill('6.5');
    await page.getByRole('button',{name:'Đóng bảng công cụ',exact:true}).click();
    assert.deepEqual((await state(page)).cases,original);await page.keyboard.press('Alt+1');
    assert.equal(await page.getByLabel('Giá trị điểm đang chọn',{exact:true}).inputValue(),'6.5','Closing preserves unfinished input');
    await page.getByLabel('Giá trị điểm đang chọn',{exact:true}).press('Control+Enter');await page.getByRole('button',{name:'Đóng bảng công cụ',exact:true}).click();
    console.log('PASS: close / Esc keep unified interaction on desktop and mobile; dismissed toolbar stays closed; unfinished point input survives');

    // Explicit opt-in, complete workspace, typed drafts and selected case/time.
    await page.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState;a.duplicateCase(0);a.activeCaseIndex=1;a.selectedMoment=2;a.design.gridOpacity=.45;a.clinical.title='Bản A';a.selectedTime=2;a.setQuickField('fhr','14')});
    await page.waitForTimeout(700);assert.equal(await saved(page),null,'Patient workspace is not written without opt-in');
    await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.selectedMoment=2);const before=await state(page);
    await page.locator('.quick-export').click();assert.equal(await page.locator('.device-storage').getAttribute('open'),'');
    assert.equal(await page.locator('.export-stamp').isVisible(),false);assert.equal(await page.locator('.share-options').getAttribute('open'),null);
    await page.getByRole('button',{name:'Lưu ngay trên máy',exact:true}).click();assert.equal((await state(page)).current,true);
    const first=JSON.parse(await saved(page));assert.equal(first.kind,'partograph-workspace');assert.equal(first.content.cases.length,2);assert.equal(first.content.quickDrafts['2'].fhr,'14');assert.equal(first.view.activeCaseIndex,1);
    await page.reload();await ready(page);await page.waitForFunction(()=>document.querySelector('#app')._vnode.component.setupState.activeCaseIndex===1);
    let a=await state(page);assert.deepEqual(a.cases,before.cases);assert.deepEqual(a.clinical,before.clinical);assert.deepEqual(a.drafts,before.drafts);assert.equal(a.design.gridOpacity,.45);assert.equal(a.moment,2);assert.equal(a.time,2);assert.equal(a.current,true);
    await page.locator('.quick-export').click();await page.getByRole('switch',{name:'Tự lưu phiên làm việc',exact:true}).check();
    await mutate(page,'Bản B');await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).content.clinical.title==='Bản B',KEY);
    assert.equal((await state(page)).current,true);assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).content.clinical.title,BACKUP),'Bản A');
    await page.evaluate(()=>{window.realPreferenceSet=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='partograph-session-autosave-v1')throw new DOMException('Blocked','QuotaExceededError');return window.realPreferenceSet.call(this,key,value)}});await page.getByRole('switch',{name:'Tự lưu phiên làm việc',exact:true}).uncheck();assert.equal((await state(page)).auto,false);assert.equal(await page.evaluate(key=>localStorage.getItem(key),AUTO),null,'Turning auto-save off remains possible when writes fail');await page.evaluate(()=>Storage.prototype.setItem=window.realPreferenceSet);
    await page.locator('.device-versions>summary').click();await page.getByRole('button',{name:'Khôi phục',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('#app')._vnode.component.setupState.clinical.title==='Bản A');
    assert.equal((await state(page)).current,false,'Restoring previous version is an unsaved change');
    await page.locator('.quick-export').click();await page.getByRole('button',{name:'Hoàn tác mở bản lưu',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('#app')._vnode.component.setupState.clinical.title==='Bản B');
    await page.locator('.quick-export').click();await page.getByRole('switch',{name:'Tự lưu phiên làm việc',exact:true}).check();
    await page.locator('.device-versions>summary').click();await page.getByRole('button',{name:'Khôi phục',exact:true}).click();
    await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).content.clinical.title==='Bản A',KEY);
    console.log('PASS: opt-in save, workspace reload, selected case/time, typed drafts, auto-save, previous version and undo restore');

    // Failure cannot replace the last valid snapshot or silently report success.
    await page.locator('.quick-export').click();await page.getByRole('switch',{name:'Tự lưu phiên làm việc',exact:true}).uncheck();
    const valid=await saved(page);await mutate(page,'Chưa lưu vì đầy');
    await page.evaluate(()=>{window.realSet=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='partograph-session-v1')throw new DOMException('Full','QuotaExceededError');return window.realSet.call(this,key,value)}});
    await page.getByRole('button',{name:'Lưu ngay trên máy',exact:true}).click();assert.match((await state(page)).error,/đầy/);assert.equal((await state(page)).current,false);assert.equal(await saved(page),valid);await page.getByRole('switch',{name:'Tự lưu phiên làm việc',exact:true}).click();assert.equal(await page.getByRole('switch',{name:'Tự lưu phiên làm việc',exact:true}).isChecked(),false,'Failed opt-in cannot leave the switch visually on');assert.equal((await state(page)).auto,false);
    await page.evaluate(()=>Storage.prototype.setItem=window.realSet);await page.getByRole('button',{name:'Lưu ngay trên máy',exact:true}).click();assert.equal((await state(page)).current,true);
    const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Tải tệp bản sao',exact:true}).click();const download=await downloadPromise;
    const file=JSON.parse(await fs.readFile(await download.path(),'utf8'));assert.equal(file.content.clinical.title,'Chưa lưu vì đầy');
    const current=await state(page);
    for(const invalid of ['{broken',JSON.stringify({...file,version:999}),JSON.stringify({...file,content:{...file.content,cases:[]}})]){
      await page.getByLabel('Mở tệp phiên làm việc',{exact:true}).setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(invalid)});
      await page.waitForFunction(()=>document.querySelector('.device-import input').value==='');assert.match((await state(page)).error,/Không mở được tệp/);assert.deepEqual((await state(page)).clinical,current.clinical);
    }
    file.content.clinical.title='Mở từ tệp';await page.getByLabel('Mở tệp phiên làm việc',{exact:true}).setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(file))});
    await page.waitForFunction(()=>document.querySelector('#app')._vnode.component.setupState.clinical.title==='Mở từ tệp');
    await page.locator('.quick-export').click();await page.getByRole('button',{name:'Hoàn tác mở bản lưu',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('#app')._vnode.component.setupState.clinical.title==='Chưa lưu vì đầy');
    // Damaged latest remains untouched until the user explicitly recovers the backup.
    await page.evaluate(({KEY,BACKUP,AUTO})=>{localStorage.setItem(BACKUP,localStorage.getItem(KEY));localStorage.setItem(KEY,'{broken');localStorage.setItem(AUTO,'true')},{KEY,BACKUP,AUTO});
    await page.reload();await ready(page);await page.waitForFunction(()=>!!document.querySelector('#app')._vnode.component.setupState.deviceError);
    assert.equal((await state(page)).auto,false);assert.equal(await saved(page),'{broken');assert.equal(await page.locator('.device-error').isVisible(),true);
    await page.locator('.device-versions>summary').click();await page.getByRole('button',{name:'Khôi phục',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('#app')._vnode.component.setupState.clinical.title==='Chưa lưu vì đầy');
    console.log('PASS: storage-full failure, retry, downloadable/importable workspace, malformed files and damaged latest recovery');

    // Preserve a valid exam draft as a draft, never commit it just to save locally.
    await page.getByRole('radio',{name:'Soạn đề',exact:true}).click();await page.keyboard.press('Alt+1');await page.getByRole('button',{name:'Nhập số liệu',exact:true}).click();
    const input=page.locator('.editor-values input[type=number]').nth(1);await input.fill('7');
    await page.waitForFunction(()=>document.querySelector('#app')._vnode.component.setupState.draftDirty);
    const draft=await state(page);assert.ok(draft.preview);assert.notDeepEqual(draft.preview,draft.cases[draft.active]);
    await page.locator('.quick-export').click();await page.getByRole('button',{name:'Lưu ngay trên máy',exact:true}).click();const draftSaved=await saved(page);
    await page.reload();await ready(page);await page.waitForSelector('.editor');
    a=await state(page);assert.deepEqual(a.cases,draft.cases);assert.deepEqual(a.preview,draft.preview);assert.equal(await page.locator('.editor-values input[type=number]').nth(1).inputValue(),'7');
    await page.locator('.editor-values input[type=number]').nth(1).fill('6.3');await page.waitForFunction(()=>document.querySelector('#app')._vnode.component.setupState.deviceUnsafe);
    assert.equal(await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.saveDeviceSession()),false);assert.equal(await saved(page),draftSaved,'Invalid input cannot damage a valid saved draft');
    await page.getByRole('button',{name:'Bỏ thay đổi',exact:true}).click();
    // Auto-save may already have stored the discarded state (label becomes "Lưu lại phiên này"); either button saves.
    await page.locator('.quick-export').click();await page.getByRole('button',{name:/^Lưu (ngay trên máy|lại phiên này)$/}).click();
    console.log('PASS: reload preserves valid exam draft without changing original; invalid form cannot overwrite last saved version');

    // Deletion is scoped and asks once, while the open workspace stays intact.
    const live=await state(page);await page.evaluate(()=>localStorage.setItem('unrelated-key','keep'));
    await page.locator('.device-versions>summary').click();await page.getByRole('button',{name:'Xóa bản lưu trên trình duyệt',exact:true}).click();
    assert.notEqual(await saved(page),null);await page.getByRole('button',{name:'Giữ lại',exact:true}).click();assert.notEqual(await saved(page),null);
    await page.getByRole('button',{name:'Xóa bản lưu trên trình duyệt',exact:true}).click();await page.getByRole('button',{name:'Xác nhận xóa bản lưu',exact:true}).click();
    assert.equal(await saved(page),null);assert.equal(await page.evaluate(key=>localStorage.getItem(key),BACKUP),null);assert.equal(await page.evaluate(key=>localStorage.getItem(key),AUTO),null);assert.equal(await page.evaluate(()=>localStorage.getItem('unrelated-key')),'keep');assert.deepEqual((await state(page)).cases,live.cases);assert.deepEqual((await state(page)).clinical,live.clinical);
    await page.getByRole('radio',{name:'Theo dõi',exact:true}).click();await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.selectTool('overview'));
    for(const width of [320,390,768,1440])for(const theme of ['light','dark']){
      await page.setViewportSize({width,height:1000});await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'No horizontal overflow '+width+' '+theme);
      assert.equal(await page.locator('.clinical-measurement-fold').getAttribute('open'),null);
      await page.screenshot({path:path.join(os.tmpdir(),'vesando-comfort-'+width+'-'+theme+'.png'),fullPage:true,animations:'disabled'});
    }
    assert.deepEqual(errors,[]);console.log('PASS: scoped deletion with cancel/confirm, live workspace retained, compact layout at 4 widths and 2 themes; no runtime errors');
  }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
