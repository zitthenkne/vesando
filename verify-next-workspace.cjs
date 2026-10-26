// Run with PLAYWRIGHT_MODULE pointing at the bundled Playwright runtime.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const os = require('node:os');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assets = new Set(['index.html','studio.css','workspace.css','interaction.css','theme.css','canvas.css','clinical-rules.js','guidance.js','enhancements.js','workspace-next.js','workspace-next.css']);
const server = http.createServer(async (req,res) => {
  const name = new URL(req.url,'http://localhost').pathname.slice(1) || 'index.html';
  if (!assets.has(name)) {res.writeHead(404);res.end();return;}
  try {res.setHeader('Content-Type',(name.endsWith('.css')?'text/css':name.endsWith('.js')?'application/javascript':'text/html')+';charset=utf-8');res.end(await fs.readFile(path.join(__dirname,name)));}
  catch {res.writeHead(500);res.end();}
});
const app = (p,fn,arg) => p.evaluate(({source,arg})=>{
  const a=document.querySelector('#app')._vnode.component.setupState;
  return new Function('a','arg','return ('+source+')(a,arg)')(a,arg);
},{source:fn.toString(),arg});
const output = path.join(os.tmpdir(),'vesando-next-workspace');
async function check(p,name,fn){await fn();console.log('PASS:',name);}
(async()=>{
  await fs.mkdir(output,{recursive:true});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{channel:'chrome'})});
  const errors=[];
  try {
    const ctx=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
    const p=await ctx.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));
    p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('Failed to load resource'))errors.push(m.text())});
    await p.goto('http://127.0.0.1:'+server.address().port);await p.waitForSelector('#app:not([v-cloak])');
    await p.locator('.home-template-disclosure>summary').click();await p.locator('.template-card').first().click();
    await p.locator('.next-workspace-bar').waitFor();
    await p.screenshot({path:path.join(output,'desktop.png'),fullPage:true});
    console.log('SCREENSHOT:',path.join(output,'desktop.png'));
    assert.deepEqual(errors,[],'No runtime errors');
    await check(p,'Three spaces preserve the active case, time, draft and viewport',async()=>{
      await app(p,a=>a.work.go(1.5));
      const before=await app(p,a=>JSON.stringify(a.activeCase));
      await p.getByRole('radio',{name:'Nhập & theo dõi',exact:true}).click();
      await p.locator('#next-fhr').fill('143');
      assert.equal(await app(p,a=>a.work.changes.length),1);
      assert.equal(await app(p,a=>a.activeCase.observations.find(o=>o.time===1.5)?.fhr),JSON.parse(before).observations.find(o=>o.time===1.5)?.fhr);
      assert.equal(await p.locator('.next-draft-point').count(),1);
      await p.getByRole('radio',{name:'Thiết kế',exact:true}).click();
      assert.equal(await app(p,a=>a.viewTime),1.5);
      await p.getByRole('radio',{name:'Trình chiếu',exact:true}).click();
      assert.equal(await app(p,a=>a.viewTime),1.5);
      assert.equal(await app(p,a=>JSON.stringify(a.activeCase)),before);
      await p.getByRole('radio',{name:'Nhập & theo dõi',exact:true}).click();
      assert.equal(await p.locator('#next-fhr').inputValue(),'143');
      assert.match(await p.locator('.session-save-state').innerText(),/Có bản nháp/);
      await p.locator('#next-fhr').press('Control+Enter');
      assert.equal(await app(p,a=>a.activeCase.observations.find(o=>o.time===1.5).fhr),143);
      assert.equal(await app(p,a=>a.work.pending.length),0);
    });
    await check(p,'Blank current inputs, separate previous reading, validation and keyboard flow',async()=>{
      await app(p,a=>a.work.go(7.25));
      assert.equal(await p.locator('#next-fhr').inputValue(),'');
      assert.equal(await p.locator('#next-fhr').getAttribute('placeholder'),'');
      assert.match(await p.locator('.next-field[data-field=fhr] .next-previous').innerText(),/Lần trước:.*·/);
      await p.locator('#next-fhr').fill('999');await p.locator('#next-fhr').press('Control+Enter');
      assert.match(await p.locator('.next-error').innerText(),/30–240/);
      assert.equal(await app(p,a=>a.activeCase.observations.some(o=>o.time===7.25)),false);
      await p.locator('#next-fhr').fill('145');await p.locator('#next-fhr').press('Enter');
      assert.equal(await p.evaluate(()=>document.activeElement.id),'next-contractions');
      await p.locator('#next-contractions').fill('3');await p.locator('#next-contractions').press('Enter');
      assert.equal(await p.evaluate(()=>document.activeElement.id),'next-duration');
      await p.locator('#next-duration').fill('35');await p.locator('#next-duration').press('Control+Shift+Enter');
      assert.equal(await app(p,a=>a.viewTime),7.75);
      assert.equal(await app(p,a=>a.activeCase.observations.find(o=>o.time===7.25).duration),35);
    });
    await check(p,'Durable draft survives closing, saving and reopening the same project',async()=>{
      await p.locator('#next-fhr').fill('147');
      await p.getByRole('button',{name:'Đóng bảng công cụ',exact:true}).click();
      await p.locator('.creation-rail').getByRole('button',{name:'Dữ liệu',exact:true}).click();
      assert.equal(await p.locator('#next-fhr').inputValue(),'147');
      await p.locator('.next-save').click();
      const project=await app(p,a=>({id:a.projectIDs[a.mode],kind:a.mode}));
      await p.reload();await p.waitForSelector('#app:not([v-cloak])');
      await app(p,(a,arg)=>a.openLibraryProject(arg.id,arg.kind),project);
      await p.getByRole('radio',{name:'Nhập & theo dõi',exact:true}).click();await app(p,a=>a.work.go(7.75));
      assert.equal(await p.locator('#next-fhr').inputValue(),'147');
      assert.equal(await app(p,a=>a.activeCase.observations.some(o=>o.time===7.75)),false);
      await app(p,a=>a.work.discard());
    });
    await check(p,'Individual and grouped locks reject writes without changing the case',async()=>{
      const before=await app(p,a=>JSON.stringify(a.activeCase));
      await app(p,a=>a.work.lockLayer(a.work.layers.find(g=>g.id==='mother')));
      await app(p,a=>a.work.set('systolic','120'));
      assert.match(await app(p,a=>a.work.error),/khóa/);
      assert.equal(await app(p,a=>a.work.pending.length),0);
      assert.equal(await app(p,a=>JSON.stringify(a.activeCase)),before);
      await app(p,a=>a.work.lockLayer(a.work.layers.find(g=>g.id==='mother')));
    });
    await check(p,'Multi selection enforces same type and previews data changes before one undo',async()=>{
      await app(p,async a=>{await a.work.open('entry');a.work.go(0);a.work.select({type:'point',field:'fhr',time:0});a.work.select({type:'point',field:'fhr',time:.5},true);a.work.select({type:'point',field:'cervix',time:2},true);a.work.panel='properties'});
      assert.equal(await app(p,a=>a.work.selection.length),2);
      assert.match(await p.locator('.next-selection-title').innerText(),/2 điểm Tim thai/);
      const before=await app(p,a=>a.activeCase.observations.filter(o=>o.time===0||o.time===.5).map(o=>o.fhr));
      await app(p,a=>{a.work.batchValue='149';a.work.previewBatch()});
      assert.deepEqual(await app(p,a=>a.activeCase.observations.filter(o=>o.time===0||o.time===.5).map(o=>o.fhr)),before);
      await p.getByRole('button',{name:'Ghi 2 thay đổi',exact:true}).click();
      assert.deepEqual(await app(p,a=>a.activeCase.observations.filter(o=>o.time===0||o.time===.5).map(o=>o.fhr)),[149,149]);
      await p.getByRole('button',{name:'Hoàn tác thao tác gần nhất',exact:true}).click();
      assert.deepEqual(await app(p,a=>a.activeCase.observations.filter(o=>o.time===0||o.time===.5).map(o=>o.fhr)),before);
      await app(p,a=>a.work.clearSelection());
    });
    await check(p,'Exact minute move protects occupied targets; zoom has a viewport history and minimap',async()=>{
      await app(p,a=>{a.work.select({type:'point',field:'fhr',time:7.25});a.work.panel='properties'});
      await app(p,a=>a.work.movePointTime(7.5));
      assert.equal(await app(p,a=>a.activeCase.observations.find(o=>o.time===7.5).fhr),145);
      await app(p,a=>a.work.zoomTo('moment'));
      assert.equal(await p.locator('.next-minimap:visible').count(),1);
      const z=await app(p,a=>a.work.zoom);
      assert.ok(z>120);
      await p.locator('.next-zoom-menu>summary').click();await p.getByRole('button',{name:'Quay lại vị trí trước',exact:true}).click();
      assert.equal(await app(p,a=>a.work.zoom),100);
      await app(p,a=>a.work.movePointTime(0));
      assert.match(await app(p,a=>a.work.error),/đã có số đo/);
      assert.equal(await app(p,a=>a.activeCase.observations.find(o=>o.time===7.5).fhr),145);
      await app(p,a=>{a.work.error='';a.work.clearSelection()});
    });
    await check(p,'Annotation layout is independent of its anchor and survives validation/export',async()=>{
      await app(p,a=>a.work.open('notes'));await p.getByRole('button',{name:'Thêm chú thích',exact:true}).click();
      await p.locator('.next-note-form textarea').fill('Ghi chú thử vị trí');
      await p.locator('.next-note-form input[type=number]').first().fill('7.5');
      await p.locator('.next-note-form input[type=number]').nth(1).fill('35');
      await p.locator('.next-note-form input[type=number]').nth(2).fill('24');
      await p.locator('.next-note-form select').first().selectOption('box');
      await p.getByRole('button',{name:'Lưu chú thích',exact:true}).click();
      const note=await app(p,a=>a.activeCase.events.find(e=>e.label==='Ghi chú thử vị trí'));
      assert.equal(note.time,7.5);assert.deepEqual(note.layout,{dx:35,dy:24,z:0,kind:'box'});
      await app(p,a=>a.work.arrangeNotes());
      assert.equal(await p.locator('.next-real-preview img').count(),1);
      assert.equal(await app(p,a=>a.activeCase.events.find(e=>e.label==='Ghi chú thử vị trí').layout.dx),35);
      await p.getByRole('button',{name:'Áp dụng sắp xếp',exact:true}).click();
      assert.equal(await app(p,a=>a.activeCase.events.find(e=>e.label==='Ghi chú thử vị trí').time),7.5);
      assert.equal(await app(p,a=>a.activeCase.events.find(e=>e.label==='Ghi chú thử vị trí').layout.dx),0);
    });
    await check(p,'Style previews use current data and partial application leaves geometry intact',async()=>{
      await app(p,a=>a.work.open('styles'));
      assert.equal(await p.locator('.next-style-preset img').count(),4);
      const before=await app(p,a=>({data:JSON.stringify(a.activeCase),row:a.design.rowHeight,color:a.design.series.ctc.color}));
      await app(p,a=>{a.work.styleParts=['font'];a.work.applyStyle(a.work.stylePresets[3])});
      assert.equal(await app(p,a=>a.design.font),1.25);
      assert.equal(await app(p,a=>a.design.rowHeight),before.row);
      assert.equal(await app(p,a=>a.design.series.ctc.color),before.color);
      assert.equal(await app(p,a=>JSON.stringify(a.activeCase)),before.data);
    });
    await check(p,'Editable data table tracks dirty cells and commits a batch atomically',async()=>{
      await app(p,a=>a.work.open('table'));
      await p.locator('.next-data-table td[data-table-row="0"][data-table-col="0"] input').fill('146');
      assert.equal(await p.locator('.next-data-table td.changed').count(),1);
      assert.equal(await app(p,a=>a.work.selection[0].field),'fhr');
      assert.equal(await app(p,a=>a.activeCase.observations[0].fhr),140);
      await p.locator('.next-data-table td.changed input').press('Control+Enter');
      assert.equal(await app(p,a=>a.activeCase.observations[0].fhr),146);
      assert.equal(await p.locator('.next-data-table td.changed').count(),0);
    });
    await check(p,'Paste mapping counts new/replaced/unread cells and enforces duplicate policy',async()=>{
      await app(p,a=>{a.work.panel='import';a.work.importStep=0});
      await p.locator('.next-panel-import textarea').fill('Giờ\tTim thai\tCTC\n08:00\t144\t4\n16:00\t148\t8');
      await p.getByRole('button',{name:'Ghép cột',exact:true}).click();
      assert.deepEqual(await app(p,a=>a.work.columns.map(c=>c.key)),['time','fhr','cervix']);
      await app(p,a=>{a.work.importPolicy='cancel';a.work.previewImport()});
      assert.match(await app(p,a=>a.work.importError),/đã tồn tại/);
      await app(p,a=>{a.work.importPolicy='update';a.work.previewImport()});
      assert.equal(await app(p,a=>a.work.importPreview.unread.length),0);
      assert.equal(await app(p,a=>a.work.importPreview.replaced),1);
      assert.equal(await app(p,a=>a.work.importPreview.newCount),2);
      assert.equal(await app(p,a=>a.activeCase.observations[0].fhr),146);
      await p.getByRole('button',{name:'Nhập 3 ô',exact:true}).click();
      assert.equal(await app(p,a=>a.activeCase.observations[0].fhr),144);
      assert.equal(await app(p,a=>a.activeCase.observations.find(o=>o.time===8).cervix),8);
      await p.getByRole('button',{name:'Hoàn tác thao tác gần nhất',exact:true}).click();
      assert.equal(await app(p,a=>a.activeCase.observations[0].fhr),146);
      await app(p,a=>{a.work.paste='Giờ\tTim thai\n17:00\txxx';a.work.parsePaste();a.work.previewImport()});
      assert.equal(await app(p,a=>a.work.importPreview.unread.length),1);
      assert.equal(await p.getByRole('button',{name:/Nhập \d+ ô/}).isDisabled(),true);
    });
    await check(p,'Issues lead to the correct field and versions compare data/design visibly',async()=>{
      await app(p,a=>a.work.open('issues'));
      assert.equal(await p.locator('.next-issue-group').count(),3);
      await app(p,a=>{a.work.versionName='Trước khi sửa';a.work.checkpoint()});
      assert.equal(await app(p,a=>a.work.versions.length),1);
      await app(p,async a=>{await a.work.open('entry');a.work.go(0);a.work.set('fhr','148');await a.work.record();a.work.versionName='Sửa tim thai 08:00';await a.work.checkpoint();await a.work.open('versions');a.work.versionA=a.work.versions[1].id;a.work.versionB=a.work.versions[0].id});
      assert.ok(await app(p,a=>a.work.versionDiff.some(r=>r.scope==='data'&&r.path==='observations.0.fhr')));
      assert.equal(await p.locator('.next-version-images img').count(),2);
      assert.match(await p.locator('.next-diff-row').first().innerText(),/146.*148/);
    });
    await check(p,'Export purposes show real PDF page geometry and remember settings separately',async()=>{
      await app(p,async a=>{a.work.clearSelection();a.work.panel='';await a.selectTool('export');a.work.exportChoose('print')});
      assert.equal(await p.locator('.next-proof-page').count(),await app(p,a=>a.pdfPreview.pages));
      await app(p,a=>{a.outputSettings.margin=30;a.work.exportChoose('slides');a.work.exportChoose('print')});
      assert.equal(await app(p,a=>a.outputSettings.margin),30);
      await p.screenshot({path:path.join(output,'export.png'),fullPage:true});
      await app(p,a=>a.work.exportChoose('editable'));
      assert.equal(await p.locator('.next-export-proof pre').count(),1);
      await app(p,a=>a.work.open('entry'));
    });
    await check(p,'Cross-midnight navigation shows a full date; library and pin menu are available',async()=>{
      const label=await p.evaluate(()=>nextClock({patient:{startTime:'23:30',date:'2026-10-26'}},1));
      assert.equal(label,'00:30 · 27/10/2026');
      await app(p,a=>a.work.open('library'));
      assert.ok(await p.locator('.next-library-item').count()>0);
      await p.getByLabel('Ghim công cụ',{exact:true}).click();
      assert.ok(await p.locator('.next-pin-menu[open]').count());
      await p.getByLabel('Ghim công cụ',{exact:true}).click();
    });
    await check(p,'Clinical mode uses the same sheet and has time-locked dragging by default',async()=>{
      await app(p,a=>a.createLibraryProject('clinical'));
      await p.getByRole('radio',{name:'Nhập & theo dõi',exact:true}).click();
      assert.equal(await app(p,a=>a.ui.dragAxis),'value');
      await p.locator('#next-fhr').fill('142');await p.locator('#next-fhr').press('Control+Enter');
      assert.equal(await app(p,a=>a.clinical.observations.find(o=>o.time===0).fhr),142);
      await p.screenshot({path:path.join(output,'capture.png'),fullPage:true});
    });
    await check(p,'Tablet/phone layouts have no document overflow and keep entry actions available',async()=>{
      await p.setViewportSize({width:1024,height:768});
      await app(p,a=>{a.work.hand='left';a.work.layout('balanced')});
      await p.screenshot({path:path.join(output,'tablet.png'),fullPage:true});
      assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
      await p.setViewportSize({width:390,height:844});await app(p,a=>{a.work.hand='right';a.work.sheet='half'});
      await p.screenshot({path:path.join(output,'phone.png'),fullPage:true});
      assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
      assert.equal(await p.locator('.next-sheet-sizes').isVisible(),true);
      await p.getByRole('button',{name:'Toàn màn hình',exact:true}).click();
      assert.equal(await app(p,a=>a.work.sheet),'full');
      await p.getByRole('button',{name:'Gọn',exact:true}).click();
      assert.equal(await app(p,a=>a.work.sheet),'compact');
      await app(p,a=>{a.work.sheet='half';a.work.go(.5)});await p.locator('#next-fhr').fill('144');
      await p.locator('#next-fhr').press('Control+Enter');
      assert.equal(await app(p,a=>a.clinical.observations.find(o=>o.time===.5).fhr),144);
      await p.setViewportSize({width:390,height:500});
      const rect=await p.locator('.next-record-footer').boundingBox();
      assert.ok(rect&&rect.y+rect.height<=500-60,'Record actions remain above the phone dock with a shorter visual viewport');
      await p.setViewportSize({width:1440,height:1000});
    });
    await check(p,'Core validator and SVG regression checks remain valid',async()=>{
      const result=await p.evaluate(()=>runChecks());assert.ok(result.passed>=10);
    });
    await check(p,'Real pointer selection, Shift selection and direct drag retain time in capture space',async()=>{
      await app(p,a=>a.work.open('entry'));await app(p,a=>a.work.go(0));
      const first=p.locator('.clinical-chart-card [data-point-hit][data-observation-field=fhr][data-observation-time="0"]');
      const firstBox=await first.boundingBox();await p.mouse.click(firstBox.x+firstBox.width/2,firstBox.y+firstBox.height/2);
      assert.equal(await app(p,a=>a.work.selection[0].field),'fhr');
      assert.match(await p.locator('.next-context').first().innerText(),/Tim thai/);
      const second=p.locator('.clinical-chart-card [data-point-hit][data-observation-field=fhr][data-observation-time="0.5"]');
      const secondBox=await second.boundingBox();await p.keyboard.down('Shift');await p.mouse.click(secondBox.x+secondBox.width/2,secondBox.y+secondBox.height/2);await p.keyboard.up('Shift');
      assert.equal(await app(p,a=>a.work.selection.length),2);
      await app(p,a=>a.work.clearSelection());
      const box=await first.boundingBox(),before=await app(p,a=>a.clinical.observations.find(o=>o.time===0).fhr);
      await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.mouse.move(box.x+box.width/2+35,box.y+box.height/2-15,{steps:8});await p.mouse.up();
      const after=await app(p,a=>({value:a.clinical.observations.find(o=>o.time===0).fhr,times:a.clinical.observations.map(o=>o.time)}));
      assert.notEqual(after.value,before);assert.deepEqual(after.times,[0,.5]);
    });
    await check(p,'Marquee selection and independent note dragging work with real pointer events',async()=>{
      await app(p,a=>{a.work.clearSelection();a.work.marquee=true});
      const pts=p.locator('.clinical-chart-card [data-point-hit][data-observation-field=fhr]');
      const a=await pts.nth(0).boundingBox(),b=await pts.nth(1).boundingBox();
      await p.mouse.move(Math.min(a.x,b.x)-10,Math.min(a.y,b.y)-18);await p.mouse.down();await p.mouse.move(Math.max(a.x+a.width,b.x+b.width)+10,Math.max(a.y+a.height,b.y+b.height)+18,{steps:8});await p.mouse.up();
      assert.equal(await app(p,a=>a.work.selection.length),2);
      await app(p,async a=>{a.work.marquee=false;a.work.clearSelection();a.work.newNote();a.work.noteDraft.label='Kéo nhãn độc lập';a.work.noteDraft.time=0;await a.work.saveNote()});
      const note=p.locator('.clinical-chart-card [data-event-index="0"]');
      await note.scrollIntoViewIfNeeded();const r=await note.boundingBox();
      await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await p.mouse.down();await p.mouse.move(r.x+r.width/2+60,r.y+r.height/2+12,{steps:8});await p.mouse.up();
      await p.waitForFunction(()=>document.querySelector('#app')._vnode.component.setupState.activeCase.events[0]?.layout?.dx>0);
      assert.equal(await app(p,a=>a.activeCase.events[0].time),0);
      await app(p,a=>a.work.clearSelection());
    });
    await check(p,'Draft conflicts cannot overwrite a direct edit and case information saves through validation',async()=>{
      await app(p,async a=>{await a.work.open('entry');a.work.go(0);a.work.set('fhr','150');const current=a.clinical.observations[0].fhr;a.recordPoint({field:'fhr',fromTime:0,fromValue:current,time:0,value:151});await a.work.record()});
      assert.match(await app(p,a=>a.work.error),/tránh ghi đè/);
      assert.equal(await app(p,a=>a.clinical.observations[0].fhr),151);
      await app(p,a=>a.work.discard());
      await p.getByRole('button',{name:'Thông tin ca',exact:true}).first().click();
      await p.locator('.next-panel-case input').first().fill('Ca kiểm tra giao diện');
      await p.getByRole('button',{name:'Ghi thông tin ca',exact:true}).click();
      assert.equal(await app(p,a=>a.activeCase.title),'Ca kiểm tra giao diện');
    });
    await check(p,'AI exposes concrete scopes and separates adds, edits, kept fields and assumptions',async()=>{
      await p.getByRole('button',{name:'Trợ lý AI',exact:true}).click();
      await p.getByRole('button',{name:'Chỉ chỉnh trình bày',exact:true}).click();
      const ai=p.locator('.json-workbench');
      assert.equal(await ai.count(),1);
      await app(p,a=>{a.aiReply=JSON.stringify({...a.activeCase,provenance:{'observations.0.fhr':'ai'}});a.jsonWorkbenchRef.tab='review'});
      assert.equal(await p.locator('.next-ai-changes').count(),1);
      assert.match(await p.locator('.next-ai-changes').innerText(),/AI thêm gì.*Sửa gì.*Giữ gì.*giả định/s);
      await app(p,a=>a.importerOpen=false);
    });
    console.log('Runtime errors:',JSON.stringify(errors));
    assert.deepEqual(errors,[]);
  } finally {await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;server.close()});
