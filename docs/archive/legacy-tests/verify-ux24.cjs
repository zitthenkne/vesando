// Run with PLAYWRIGHT_MODULE pointing to the bundled Playwright runtime.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assets = new Set(['index.html','base.css','core.js','components.js','app.js','canva.css','workspace-next.js','workspace-next.css','studio.css','workspace.css','interaction.css','theme.css','canvas.css','clinical-rules.js','guidance.js','enhancements.js']);
const server = http.createServer(async (req,res) => {
  const name = new URL(req.url,'http://localhost').pathname.slice(1) || 'index.html';
  if (!assets.has(name)) {res.writeHead(404);res.end();return;}
  try {res.setHeader('Content-Type',(name.endsWith('.css')?'text/css':name.endsWith('.js')?'application/javascript':'text/html')+';charset=utf-8');res.end(await fs.readFile(path.join(__dirname,name)));}
  catch {res.writeHead(500);res.end();}
});
const state = (p, read) => p.evaluate(read || (() => {
  const a=document.querySelector('#app')._vnode.component.setupState;
  return {title:a.activeCase.title,data:JSON.stringify(a.activeCase),stage:a.toolTab,draft:a.workspaceHasDraft,saved:a.workspaceSaveState};
}));
const app = (p, run, arg) => p.evaluate(({source,arg}) => {
  const a=document.querySelector('#app')._vnode.component.setupState;
  return new Function('a','arg','return ('+source+')(a,arg)')(a,arg);
},{source:run.toString(),arg});
const output = path.join(os.tmpdir(),'vesando-ux24');
async function command(p,query) {
  await p.keyboard.press('Control+k');
  await p.locator('#studio-command-input').fill(query);
  assert.ok(await p.locator('.command-list [role=option]').count(), 'Search results: '+query);
  await p.keyboard.press('Enter');
}
(async () => {
  const html=await fs.readFile(path.join(__dirname,'index.html'),'utf8');
  for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) if(match[1].trim()) new vm.Script(match[1]);
  await fs.mkdir(output,{recursive:true});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const url='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{channel:'chrome'})});
  try {
    const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
    const p=await context.newPage(),errors=[];p.setDefaultTimeout(8000);
    p.on('pageerror',e=>errors.push(e.message));
    await p.goto(url);await p.waitForSelector('#app:not([v-cloak])');
    await p.locator('.home-template-disclosure>summary').click();
    await p.locator('.template-card').first().click();
    const initial=await state(p),rail=p.locator('.creation-rail');
    for (const name of ['Dữ liệu','Trợ lý AI','Trình bày','Ca mẫu','Kiểm tra']) assert.equal(await rail.getByRole('button',{name,exact:true}).isVisible(),true);
    const undo=p.getByRole('button',{name:'Hoàn tác thao tác gần nhất',exact:true});
    const redo=p.getByRole('button',{name:'Làm lại thao tác',exact:true});
    assert.equal(await undo.isVisible(),true);assert.equal(await undo.isDisabled(),true);
    assert.equal(await redo.isVisible(),true);assert.equal(await redo.isDisabled(),true);
    await p.getByRole('button',{name:'Đổi tên sản đồ',exact:true}).click();
    await p.locator('#workspace-case-title').fill('Không lưu tên này');await p.keyboard.press('Escape');
    assert.equal((await state(p)).title,initial.title);
    await p.getByRole('button',{name:'Đổi tên sản đồ',exact:true}).click();
    await p.locator('#workspace-case-title').fill('Ca thực hành 24');await p.keyboard.press('Enter');
    assert.equal((await state(p)).title,'Ca thực hành 24');
    assert.match(await undo.getAttribute('title'),/đổi tên ca/);
    await undo.click();assert.equal((await state(p)).title,initial.title);
    await redo.click();assert.equal((await state(p)).title,'Ca thực hành 24');
    await p.getByLabel('Quản lý ca',{exact:true}).click();assert.equal(await p.locator('.case-menu[open]').count(),1);await p.keyboard.press('Escape');
    console.log('PASS: labelled rail, separate case menu, title Enter/Esc, fixed undo/redo with actual action labels');

    const point=p.locator('[data-point-hit][data-observation-time="2"][data-observation-field="cervix"]').first();
    const originalValue=await app(p,a=>a.activeCase.observations.find(o=>o.time===2).cervix);
    await point.click();
    assert.equal((await state(p)).stage,'data');
    assert.match(await p.locator('.panel-context:visible').innerText(),/CTC.*10:00/);
    assert.equal(await p.locator('.selected-point-ring').isVisible(),true);
    const value=p.getByLabel('Giá trị điểm đang chọn',{exact:true});
    assert.equal(await p.getByLabel('Thời điểm điểm đang chọn',{exact:true}).isVisible(),true);
    assert.ok(await p.locator('.quick-point-colors button:visible').count()>=4);
    assert.equal(await p.getByRole('button',{name:'Xóa điểm',exact:true}).isVisible(),true);
    await value.fill('20');
    assert.equal(await value.getAttribute('aria-invalid'),'true');assert.equal(await value.inputValue(),'20');
    assert.equal(await app(p,a=>a.activeCase.observations.find(o=>o.time===2).cervix),originalValue);
    assert.match((await state(p)).saved,/Đang sửa.*chưa lưu/);
    await p.getByRole('button',{name:'Đóng bảng công cụ',exact:true}).click();
    assert.equal(await p.locator('.panel-draft-decision').isVisible(),true);
    assert.equal((await state(p)).stage,'data');
    await p.getByRole('button',{name:'Tiếp tục sửa',exact:true}).click();
    await p.getByRole('button',{name:'Đóng sửa nhanh',exact:true}).click();
    assert.equal(await p.locator('.panel-draft-decision').isVisible(),true,'Closing the point properties also preserves its draft');
    await p.getByRole('button',{name:'Tiếp tục sửa',exact:true}).click();
    await value.fill(String(originalValue+.5));await value.press('Enter');
    assert.equal(await app(p,a=>a.activeCase.observations.find(o=>o.time===2).cervix),originalValue+.5);
    await undo.click();assert.equal(await app(p,a=>a.activeCase.observations.find(o=>o.time===2).cervix),originalValue);
    await redo.click();
    const color=await app(p,a=>a.design.series.ctc.color);
    const swatches=p.locator('.quick-point-colors button');
    for(const swatch of await swatches.all()) if(!(await swatch.getAttribute('aria-label')).includes(color)){await swatch.click();break;}
    assert.match(await undo.getAttribute('title'),/đổi màu đường/);
    await undo.click();assert.equal(await app(p,a=>a.design.series.ctc.color),color);
    await p.getByRole('button',{name:'Chi tiết',exact:true}).click();
    assert.equal(await app(p,a=>a.dataMode),'manual','Point details still open the full data editor');
    await p.getByRole('button',{name:'Thao tác trực tiếp',exact:true}).click();
    await p.getByRole('button',{name:'Đóng bảng công cụ',exact:true}).click();
    await point.focus();await p.keyboard.press('Enter');
    assert.equal(await p.locator('.chart-cell-editor').isVisible(),true);
    const inline=p.locator('.chart-cell-editor input[data-input-key=cervix]');
    await inline.fill(String(originalValue+1));await inline.press('Escape');
    assert.equal(await app(p,a=>a.activeCase.observations.find(o=>o.time===2).cervix),originalValue+.5);
    const cell=p.locator('.case-card:visible [data-cell-key="temperature"][data-cell-time="2"]').first();
    await cell.click();assert.equal(await p.locator('.chart-cell-editor').count(),0);
    await cell.press('Enter');assert.equal(await p.locator('.chart-cell-editor').isVisible(),true);await p.keyboard.press('Escape');
    await cell.press('Enter');
    await p.locator('.chart-cell-editor input[data-input-key=temperature]').fill('37.2');
    await rail.getByRole('button',{name:'Trình bày',exact:true}).click();
    assert.equal(await p.locator('dialog.panel-draft-decision').isVisible(),true,'A dirty inline cell can resolve drafts from the overview');
    await p.locator('.panel-draft-decision').getByRole('button',{name:'Lưu thay đổi',exact:true}).click();
    assert.equal(await app(p,a=>a.activeCase.observations.find(o=>o.time===2).temperature),37.2);
    assert.equal((await state(p)).stage,'design');
    console.log('PASS: contextual point properties, visible selection, inline invalid value retained, draft guard, edit save, undo/redo, color labels and cell select/Enter/Esc');

    await command(p,'đổi màu');assert.equal(await app(p,a=>a.designTab),'symbols');
    await command(p,'thêm mốc');assert.equal(await app(p,a=>a.draftDirty),true);
    await rail.getByRole('button',{name:'Trình bày',exact:true}).click();
    assert.equal(await p.locator('.panel-draft-decision').isVisible(),true);
    await p.locator('.panel-draft-decision').getByRole('button',{name:'Bỏ thay đổi',exact:true}).click();
    assert.equal((await state(p)).stage,'design');assert.equal((await state(p)).draft,false);
    await app(p,a=>a.designTab='template');
    const presets=p.locator('.design-preset');assert.equal(await presets.count(),5);
    for(const img of await presets.locator('img').all()) assert.ok((await img.getAttribute('src')).startsWith('data:image/svg+xml'));
    const designBefore=await app(p,a=>JSON.stringify(a.design));
    await p.getByLabel('Tên mẫu thiết kế',{exact:true}).fill('Mẫu kiểm tra');
    await p.getByRole('button',{name:'Lưu mẫu cá nhân',exact:true}).click();
    assert.ok((await p.locator('.personal-design-thumb').getAttribute('src')).startsWith('data:image/svg+xml'));
    await presets.last().click();assert.notEqual(await app(p,a=>JSON.stringify(a.design)),designBefore);
    await undo.click();assert.equal(await app(p,a=>JSON.stringify(a.design)),designBefore);
    await rail.getByRole('button',{name:'Ca mẫu',exact:true}).click();
    const total=await p.locator('.preset-preview').count();assert.ok(total>0);
    await p.getByLabel('Tìm ca mẫu',{exact:true}).fill('không-có-mẫu-này');assert.equal(await p.locator('.preset-preview').count(),0);
    await p.getByLabel('Tìm ca mẫu',{exact:true}).fill('');
    const tag=await app(p,a=>a.templateTags[0]);await p.getByLabel('Lọc ca mẫu theo nhãn',{exact:true}).selectOption(tag);
    assert.ok(await p.locator('.preset-preview').count()>0);assert.ok(await p.locator('.preset-preview').count()<=total);
    await p.getByLabel('Lọc ca mẫu theo nhãn',{exact:true}).selectOption('');
    await p.getByRole('button',{name:'Đóng bảng công cụ',exact:true}).click();
    await p.getByRole('button',{name:'Nhân bản ca đang mở',exact:true}).click();
    assert.equal(await p.locator('.case-switcher-track>button').count(),2);
    assert.equal(await p.locator('.case-switcher-track>button.active img').isVisible(),true);
    console.log('PASS: action search, unsaved form resolution, real design previews with undo, template search/tags and case filmstrip duplication');

    // Resolve the duplicate's clean manual editor before entering export.
    await command(p,'xuất PDF');
    assert.equal((await state(p)).stage,'export');assert.equal(await app(p,a=>a.exportFormat),'pdf');
    assert.equal(await p.locator('.export-live-preview img').isVisible(),true);
    await app(p,a=>a.design.imageScale=1);
    for (const [format,label,magic] of [['png','Ảnh',[137,80,78,71]],['pdf','PDF',[37,80,68,70]],['json','JSON',null]]) {
      await p.locator('.export-flow .format-choice').getByRole('button',{name:label,exact:true}).click();
      const downloadWait=p.waitForEvent('download');await p.locator('.export-main').click();
      const download=await downloadWait,bytes=await fs.readFile(await download.path());
      assert.ok(download.suggestedFilename().endsWith('.'+format));
      if(magic)assert.deepEqual([...bytes.slice(0,4)],magic);else {const data=JSON.parse(bytes.toString());assert.equal(data.kind,'partograph-review');assert.equal(data.cases.length,1);assert.ok(data.design);}
      if(format==='pdf')assert.equal(Number(bytes.toString('latin1').match(/\/Count (\d+)/)[1]),await p.locator('.pdf-page-preview').count(),'Preview and PDF have the same number of pages');
      await download.saveAs(path.join(output,'sample.'+format));
    }
    await p.getByRole('button',{name:'Chuyển thành bảng nổi',exact:true}).click();
    const separator=p.getByRole('separator',{name:'Độ rộng bảng công cụ'});await separator.focus();await p.keyboard.press('ArrowLeft');
    const savedLayout=await app(p,a=>({panelMode:a.ui.panelMode,width:a.panelWidth}));
    await p.reload();await p.waitForSelector('#app:not([v-cloak])');
    assert.equal(await app(p,a=>a.exportFormat),'json');
    assert.deepEqual(await app(p,a=>({panelMode:a.ui.panelMode,width:a.panelWidth})),savedLayout,'Dock mode and panel width persist');
    await app(p,a=>a.ui.panelMode='dock');
    await app(p,async a=>{await a.beginWorkspace('exam');await a.selectTool('design')});
    await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:path.join(output,'desktop.png')});
    console.log('PASS: phrase search to PDF preview, actual PNG/PDF/JSON downloads and persisted format preference');

    // One scroll owner, a sticky title and reachable save action in manual data mode.
    await app(p,async a=>{await a.selectTool('data');a.selectDataMode('manual')});
    const toolbox=p.locator('#studio-toolbox');
    const nestedScrollers=await toolbox.evaluate(el=>[...el.querySelectorAll('*')].filter(n=>n.checkVisibility()&&['auto','scroll'].includes(getComputedStyle(n).overflowY)&&n.scrollHeight>n.clientHeight+2).map(n=>n.className));
    assert.deepEqual(nestedScrollers,[],'Only the main inspector scrolls');
    await toolbox.evaluate(el=>el.scrollTop=el.scrollHeight);
    const heading=await p.locator('.toolbox-heading').boundingBox();assert.ok(heading.y>=60&&heading.y<180);
    assert.equal(await p.getByRole('button',{name:'Lưu thay đổi',exact:true}).isVisible(),true);
    await app(p,async a=>{await a.selectTool('overview')});
    const nav=p.locator('.case-card:visible .canvas-navigation');
    await nav.getByLabel('Kéo để di chuyển vùng xem',{exact:true}).click();
    assert.equal(await nav.locator('.canvas-pan').getAttribute('aria-pressed'),'true');
    await nav.getByLabel('Chọn / sửa',{exact:true}).click();
    const chart=p.locator('.case-card:visible .chart-scroll');
    await chart.locator('svg.partograph').focus();await p.keyboard.down('Space');assert.equal(await chart.evaluate(el=>el.classList.contains('panning')),true);await p.keyboard.up('Space');
    assert.equal(await chart.evaluate(el=>el.classList.contains('panning')),false);
    await chart.evaluate(el=>el.scrollTop=el.scrollHeight);
    assert.equal(await nav.getByLabel('Mở toàn màn hình sản đồ',{exact:true}).isVisible(),true);
    console.log('PASS: one inspector scroller, sticky title/save, explicit select/pan at 100%, temporary Space pan and persistent canvas controls');

    // Same save/cancel and validation contract in the clinical table, including redo.
    await app(p,async a=>{await a.createLibraryProject('clinical');await a.openClinicalTable()});
    const tableCell=p.locator('[data-field=cervix] .table-cell-value').first();
    await tableCell.click();assert.equal(await p.locator('.entry-table input').count(),0);
    await tableCell.press('Enter');assert.equal(await p.locator('.entry-table input').count(),1);
    const tableInput=p.locator('.entry-table input');await tableInput.fill('999');await tableInput.press('Enter');
    assert.equal(await tableInput.inputValue(),'999');assert.equal(await p.locator('.table-cell-error').isVisible(),true);
    await tableInput.press('Escape');assert.equal(await p.locator('.entry-table input').count(),0);
    await tableCell.press('Enter');
    await p.locator('.entry-table input').fill('5');await p.locator('.entry-table input').press('Enter');
    const clinicalAfter=await app(p,a=>JSON.stringify(a.clinical));
    await undo.click();assert.notEqual(await app(p,a=>JSON.stringify(a.clinical)),clinicalAfter);
    await redo.click();assert.equal(await app(p,a=>JSON.stringify(a.clinical)),clinicalAfter);
    console.log('PASS: clinical table single-select/Enter edit, invalid drafts retained, Escape cancel, Enter save and clinical undo/redo');

    await app(p,async a=>{await a.createLibraryProject('exam',0);await a.selectTool('design')});
    for(const width of [1440,1024,768,390,320]) {
      await p.setViewportSize({width,height:900});
      for(const theme of ['light','dark']) {
        await app(p,(a,t)=>a.theme=t,theme);
        assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page fits '+width+'/'+theme);
        assert.ok((await p.locator('.session-title').boundingBox()).width>=100,'Case title remains readable at '+width);
        if(width<=760) {
          const visibleTools=await rail.locator(':scope>button:visible,:scope>details:visible').count();assert.equal(visibleTools,4);
          await p.getByRole('button',{name:'Đóng bảng công cụ',exact:true}).click();
          for(const b of await p.locator('.case-card:visible .canvas-navigation button:visible').all()){const box=await b.boundingBox();assert.ok(box.width>=44&&box.height>=44);assert.ok(box.x>=0&&box.x+box.width<=width+1);}
          await rail.getByRole('button',{name:'Trình bày',exact:true}).click();
          assert.equal(await toolbox.getAttribute('aria-modal'),'true');
        }
        if(width===1440||width===390)await p.screenshot({path:path.join(output,width+'-'+theme+'.png')});
      }
    }
    await p.getByRole('button',{name:'Đóng bảng công cụ',exact:true}).click();
    await p.setViewportSize({width:390,height:900});
    await app(p,a=>a.theme='light');
    await p.screenshot({path:path.join(output,'mobile-canvas.png')});
    await p.locator('[data-point-hit][data-observation-time="2"][data-observation-field="cervix"]').first().click();
    assert.equal(await toolbox.getAttribute('aria-modal'),'true','A point tap opens the mobile properties sheet');
    await p.screenshot({path:path.join(output,'mobile-point.png')});
    assert.deepEqual(errors,[]);
    console.log('PASS: 5 widths × 2 themes, four mobile tools, 44px targets, bottom-sheet semantics, no page errors');
    console.log('Artifacts: '+output);
    await context.close();
  } finally {await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;server.close()});
