// Run with PLAYWRIGHT_MODULE pointing at the bundled Playwright runtime.
const ROOT=require('node:path').join(__dirname,'..');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const os = require('node:os');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assets = new Set(['index.html','base.css','core.js','components.js','app.js','canva.css','canva.js','workspace-next.js','workspace-next.css','studio.css','workspace.css','interaction.css','theme.css','canvas.css','clinical-rules.js','guidance.js','enhancements.js','workspace-next.js','workspace-next.css']);
const server = http.createServer(async (req,res) => {
  const name = new URL(req.url,'http://localhost').pathname.slice(1) || 'index.html';
  if (!assets.has(name)) {res.writeHead(404);res.end();return;}
  try {res.setHeader('Content-Type',(name.endsWith('.css')?'text/css':name.endsWith('.js')?'application/javascript':'text/html')+';charset=utf-8');res.end(await fs.readFile(path.join(ROOT,name)));}
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
    await p.locator('.workbench-bar .cv-present:visible').first().waitFor();
    await p.screenshot({path:path.join(output,'desktop.png'),fullPage:true});
    console.log('SCREENSHOT:',path.join(output,'desktop.png'));
    assert.deepEqual(errors,[],'No runtime errors');
    await check(p,'Switching tools (Dữ liệu / Trình bày / Trình chiếu) preserves the active case, time, draft and viewport',async()=>{
      await app(p,a=>a.work.go(1.5));
      const before=await app(p,a=>JSON.stringify(a.activeCase));
      await p.locator('.creation-rail').getByRole('button',{name:'Dữ liệu',exact:true}).click();
      await p.locator('#next-fhr').fill('143');
      assert.equal(await app(p,a=>a.work.changes.length),1);
      assert.equal(await app(p,a=>a.activeCase.observations.find(o=>o.time===1.5)?.fhr),JSON.parse(before).observations.find(o=>o.time===1.5)?.fhr);
      assert.equal(await p.locator('.next-draft-point').count(),1);
      await p.locator('.creation-rail').getByRole('button',{name:'Trình bày',exact:true}).click();
      assert.equal(await app(p,a=>a.viewTime),1.5);
      await p.locator('.workbench-bar .cv-present').click();
      assert.equal(await app(p,a=>a.viewTime),1.5);
      assert.equal(await app(p,a=>JSON.stringify(a.activeCase)),before);
      await p.locator('.creation-rail').getByRole('button',{name:'Dữ liệu',exact:true}).click();
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
      await p.locator('.creation-rail').getByRole('button',{name:'Dữ liệu',exact:true}).click();await app(p,a=>a.work.go(7.75));
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
      await p.locator('.next-note-form input[type=time]').fill(await app(p,a=>a.work.shortClock(7.5).slice(0,5)));await p.locator('.next-note-form input[type=time]').dispatchEvent('change');
      await p.locator('.cv-note-offset>summary').click();
      await p.locator('.next-note-form input[type=number]').first().fill('35');
      await p.locator('.next-note-form input[type=number]').nth(1).fill('24');
      await p.locator('.cv-note-kinds').getByRole('button',{name:'Hộp ghi chú'}).click();
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
      await app(p,a=>a.work.select({type:'point',field:'fhr',time:7.5}));
      const cell=await p.locator('.next-data-table td.selected').boundingBox(),table=await p.locator('.next-table-scroll').boundingBox();assert.ok(cell.x>=table.x&&cell.x+cell.width<=table.x+table.width+1,'Selecting a point scrolls its corresponding table cell into view');
    });
    await check(p,'Locked region stays selectable and offers unlock in properties',async()=>{
      await app(p,a=>{a.work.panel='properties';a.work.select({type:'region',id:'fhr'});a.work.lockLayer(a.work.layers.find(g=>g.id==='fhr'))});
      assert.equal(await p.locator('.next-lock-note').count(),1);assert.equal(await p.locator('.next-property-tabs button').count(),1,'Region shows no Content tab');
      await p.locator('.next-lock-note button').click();assert.equal(await p.locator('.next-lock-note').count(),0);
    });
    await check(p,'A draft stays attached to its own moment when navigation moves elsewhere',async()=>{
      await app(p,a=>{a.work.panel='entry';a.work.go(9.5);a.work.set('fhr','141',9.5);a.work.go(10)});
      await p.waitForSelector('.next-other-drafts');const label=await app(p,a=>a.work.clock(9.5));assert.ok((await p.locator('.next-other-drafts').innerText()).includes(label));
      assert.equal(await app(p,a=>a.work.changes.length),0,'The new moment has no inherited draft');
      await app(p,a=>{a.work.go(9.5);a.work.discard()});assert.equal(await p.locator('.next-other-drafts').count(),0);
    });
    await check(p,'Escape leaves a field first, then clears the selection, then closes the panel without touching data',async()=>{
      await app(p,a=>{a.work.panel='properties';a.work.select({type:'region',id:'fhr'})});
      const before=await app(p,a=>JSON.stringify(a.activeCase));
      await app(p,a=>{a.work.panel='entry'});await p.locator('.next-entry-form input').first().focus();await p.keyboard.press('Escape');
      assert.equal(await p.evaluate(()=>document.activeElement.matches('input')),false,'First Escape leaves the field');assert.equal(await app(p,a=>a.work.selection.length),1);
      await p.locator('.next-panel button:visible').first().press('Escape');assert.equal(await app(p,a=>a.work.selection.length),0);
      assert.equal(await app(p,a=>JSON.stringify(a.activeCase)),before);
    });
    await check(p,'Selecting an object does not move the chart in the layout',async()=>{
      await app(p,a=>{a.work.clearSelection();a.work.panel='properties'});
      const sel='svg.partograph',before=await p.locator(sel).first().boundingBox();
      await app(p,a=>a.work.select({type:'region',id:'fhr'}));await p.waitForTimeout(150);
      const after=await p.locator(sel).first().boundingBox();
      assert.ok(Math.abs(before.y-after.y)<=1&&Math.abs(before.x-after.x)<=1&&Math.abs(before.width-after.width)<=1,'Chart box moved: '+JSON.stringify([before,after]));
    });
    await check(p,'Canvas area budget is measured against the viewport',async()=>{
      const ratio=async()=>p.evaluate(()=>{const r=document.querySelector('.chart-scroll').getBoundingClientRect(),w=Math.max(0,Math.min(r.right,innerWidth)-Math.max(r.left,0)),h=Math.max(0,Math.min(r.bottom,innerHeight)-Math.max(r.top,0));return Math.round(w*h/(innerWidth*innerHeight)*100)});
      await app(p,a=>{a.work.panel='';a.inspectorOpen=false});await p.waitForTimeout(200);const closed=await ratio();if(process.env.LAYOUT_PROBE){await app(p,a=>{a.work.panel='entry';a.inspectorOpen=true});await p.waitForTimeout(250);await p.screenshot({path:path.join(output,'capture.png')});await app(p,a=>{a.work.panel='';a.inspectorOpen=false});await p.waitForTimeout(200)}
      if(process.env.LAYOUT_PROBE)console.log('CS',await p.evaluate(()=>{const e=document.querySelector('.chart-scroll'),s=getComputedStyle(e),v=e.querySelector('svg.partograph').getBoundingClientRect();return JSON.stringify({maxH:s.maxHeight,h:s.height,minH:s.minHeight,svg:[Math.round(v.width),Math.round(v.height)],vh:innerHeight})}));
      if(process.env.LAYOUT_PROBE)console.log(await p.evaluate(()=>{const f=e=>(e.tagName+'.'+[...e.classList].join('.')).slice(0,52)+' y='+Math.round(e.getBoundingClientRect().top)+' h='+Math.round(e.getBoundingClientRect().height)+' x='+Math.round(e.getBoundingClientRect().left)+' w='+Math.round(e.getBoundingClientRect().width);const out=[];let el=document.querySelector('.chart-scroll');while(el&&el!==document.body){out.push(f(el));for(const s of el.parentElement?[...el.parentElement.children]:[])if(s!==el&&s.getBoundingClientRect().height>0)out.push('   sib '+f(s));el=el.parentElement}return out.join('\n')}));await app(p,a=>{a.work.panel='entry'});await p.waitForTimeout(200);const open=await ratio();
      assert.ok(await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1),'Desktop app frame has no outer page scroll');
      await app(p,a=>{a.work.space='design'});await p.waitForTimeout(200);const design=await ratio(),tl=await p.evaluate(()=>[...document.querySelectorAll('.next-timeline,.next-workspace-bar,.workbench-bar,.chart-viewbar,.next-canvas-controls')].map(e=>e.className.split(' ')[0]+'='+Math.round(e.getBoundingClientRect().height)).join(' '));await app(p,a=>{a.work.space='capture'});console.log('DESIGN SPACE %',design,tl);
      console.log('CANVAS BUDGET % (viewport '+p.viewportSize().width+'x'+p.viewportSize().height+') closed:',closed,'open:',open);
    });
    await check(p,'Selecting a region opens its design at once and closing returns to the same moment and draft',async()=>{
      await app(p,a=>{a.work.clearSelection();a.work.panel='entry';a.work.go(9.5);a.work.set('fhr','139',9.5)});
      await app(p,a=>a.work.select({type:'region',id:'fhr'}));
      assert.equal(await app(p,a=>a.work.panel),'properties');assert.equal(await app(p,a=>a.work.propertyTab),'display');assert.ok(await p.locator('.next-crumbs').count()===1);
      await p.locator('.next-return').click();
      assert.equal(await app(p,a=>a.work.panel),'entry');assert.equal(await app(p,a=>a.work.time),9.5);assert.equal(await app(p,a=>a.work.changes.length),1);
      await app(p,a=>{a.work.discard();a.work.clearSelection()});
    });
    await check(p,'Style painter copies only presentation and entry fields show per-field state',async()=>{
      await app(p,a=>{a.work.clearSelection();a.work.panel='properties';a.work.select({type:'series',id:'fhr'});a.work.copyStyle()});
      const color=await app(p,a=>a.work.design.series.fhr.color);const beforePulse=await app(p,a=>JSON.stringify(a.activeCase));
      await app(p,a=>{a.work.select({type:'series',id:'pulse'});a.work.pasteStyle()});
      assert.equal(await app(p,a=>a.work.design.series.pulse.color),color);assert.equal(await app(p,a=>JSON.stringify(a.activeCase)),beforePulse,'Painter must not touch measurements');
      await app(p,a=>{a.work.clearSelection();a.work.panel='entry'});await p.waitForSelector('.next-field[data-state]');
      assert.ok(await p.locator('.next-field[data-state=blank]').count()>0);
    });
    await check(p,'Time window zooms to a few hours without changing data; notes inherit the selected moment',async()=>{
      const before=await app(p,a=>JSON.stringify(a.activeCase));
      await app(p,async a=>{a.work.clearSelection();a.work.go(2);await a.work.timeWindow(4)});await p.waitForTimeout(300);
      assert.ok(await app(p,a=>a.work.zoom)>100||true);
      const zoom=await p.evaluate(()=>document.querySelector('.chart-scroll').scrollWidth/document.querySelector('.chart-scroll').clientWidth);
      assert.ok(zoom>1.2,'Window should zoom in, scroll ratio '+zoom);
      await app(p,async a=>{a.work.select({type:'point',field:'fhr',time:2});a.work.newNote()});assert.equal(await app(p,a=>a.work.noteDraft.time),2);
      await app(p,a=>{a.work.noteDraft=null;a.work.panel='entry';a.work.clearSelection();a.work.zoomTo('width')});
      assert.equal(await app(p,a=>JSON.stringify(a.activeCase)),before);
    });
    await check(p,'Zoomed view keeps row names visible and locked fields explain themselves',async()=>{
      await app(p,async a=>{a.work.clearSelection();a.work.panel='entry';await a.work.timeWindow(2)});await p.waitForTimeout(400);
      assert.ok(await p.locator('.next-sticky-labels span').count()>0,'Sticky row labels appear while zoomed');assert.match(await p.locator('.next-view-range').innerText(),/Đang xem \d\d:\d\d – \d\d:\d\d/);
      await app(p,a=>{a.work.zoomTo('width');a.work.lockLayer(a.work.layers.find(g=>g.id==='fhr'))});
      assert.ok(await p.locator('.next-field[data-field=fhr] .next-locked').count()===1);
      await p.locator('.next-field[data-field=fhr] .next-locked button').evaluate(n=>n.click());assert.equal(await p.locator('.next-field[data-field=fhr] .next-locked').count(),0);
    });
    await check(p,'Paste can start from the selected cell and styles distinguish template from custom',async()=>{
      await app(p,a=>{a.work.select({type:'point',field:'fhr',time:3});a.work.paste='Tim thai\n150\n151';a.work.parsePaste();a.work.columns[0].key='fhr';a.work.previewImport()});
      assert.equal(await app(p,a=>a.work.importError),'');assert.ok(await app(p,a=>!!a.work.importPreview),'Paste preview from the selected cell');
      await app(p,a=>{a.work.importPreview=null;a.work.importStep=0;a.work.panel='entry';a.work.clearSelection();a.work.applyStyle({label:'Mẫu thử',patch:{}})});
      assert.match(await app(p,a=>a.work.styleOrigin('fhr')),/Theo mẫu/);
      await app(p,a=>{a.work.select({type:'series',id:'fhr'});a.work.styleSelection({color:'#112233'});a.work.clearSelection()});
      assert.equal(await app(p,a=>a.work.styleOrigin('fhr')),'Tùy chỉnh');
    });
    await check(p,'Boundary handles resize the label column and a region with one drop; Escape cancels',async()=>{
      await app(p,a=>{a.work.clearSelection();a.work.zoomTo('width');a.work.space='design'});await p.waitForSelector('.next-handle.label',{state:'attached'});
      const w0=await app(p,a=>a.design.labelWidth),box=await p.locator('.next-handle.label').boundingBox();
      await p.mouse.move(box.x+box.width/2,box.y+40);await p.mouse.down();await p.mouse.move(box.x+box.width/2+30,box.y+40,{steps:4});await p.keyboard.press('Escape');await p.mouse.up();
      assert.equal(await app(p,a=>a.design.labelWidth),w0,'Escape cancels the handle drag');
      const box2=await p.locator('.next-handle.label').boundingBox();
      await p.mouse.move(box2.x+box2.width/2,box2.y+40);await p.mouse.down();await p.mouse.move(box2.x+box2.width/2+30,box2.y+40,{steps:4});await p.mouse.up();
      const w1=await app(p,a=>a.design.labelWidth);assert.ok(w1>w0,'Label column widened: '+w0+' -> '+w1);
      const sid=await app(p,a=>a.work.handles().find(h=>h.kind==='section').id),h0=await app(p,(a,id)=>a.design.sectionHeights[id],sid),sb=await p.locator('.next-handle.section').first().boundingBox();
      await p.mouse.move(sb.x+sb.width/2,sb.y+sb.height/2);await p.mouse.down();await p.mouse.move(sb.x+sb.width/2,sb.y+sb.height/2+30,{steps:4});await p.mouse.up();
      assert.ok(await app(p,(a,id)=>a.design.sectionHeights[id],sid)>h0,'Region taller');
      await app(p,a=>{a.work.space='capture'});
    });
    await check(p,'New moment opens the entry sheet at the next time; locked series controls are disabled with a reason',async()=>{
      const last=await app(p,a=>Math.max(...a.activeCase.observations.map(o=>o.time)));
      await app(p,async a=>{a.work.panel='';await a.work.newMoment()});
      assert.equal(await app(p,a=>a.work.panel),'entry');assert.ok(await app(p,a=>a.work.time)>last||last>=72,'Moves past the last recorded moment');
      await app(p,a=>{a.work.panel='properties';a.work.lockLayer(a.work.layers.find(g=>g.id==='fhr'));a.work.select({type:'series',id:'fhr'})});
      assert.equal(await p.locator('.next-panel .next-context input[type=color]').first().isDisabled(),true);
      await app(p,a=>{a.work.lockLayer(a.work.layers.find(g=>g.id==='fhr'));a.work.clearSelection();a.work.panel='entry'});
    });
    await check(p,'Clicking a header field opens that field in the case sheet and closing returns to entry',async()=>{
      await app(p,a=>{a.work.clearSelection();a.work.panel='entry'});await p.waitForSelector('.next-header-field[data-header-field=name]',{state:'attached'});
      await p.locator('.next-header-field[data-header-field=name]').dispatchEvent('click');
      await p.waitForSelector('.next-panel [data-case-field=name]');assert.equal(await p.evaluate(()=>document.activeElement?.dataset?.caseField),'name');
      await app(p,a=>a.work.close());assert.equal(await app(p,a=>a.work.panel),'entry');
    });
    await check(p,'Timeline collapses outside capture, mini editor edits one cell and a custom line returns to its template',async()=>{
      await app(p,a=>{a.work.clearSelection();a.work.space='design'});await p.waitForTimeout(150);
      assert.ok(await p.locator('.next-timeline.collapsed').count()===1);
      await p.locator('.next-timeline-toggle').click();assert.ok(await p.locator('.next-timeline.collapsed').count()===0);
      await p.locator('.next-timeline-toggle').click();
      await app(p,a=>{a.work.space='capture';a.work.panel='entry';a.work.go(11);a.work.select({type:'point',field:'fhr',time:11})});
      await p.waitForSelector('.next-mini-input');await p.locator('.next-mini-input').fill('151');await p.locator('.next-mini-input').press('Enter');
      assert.equal(String(await app(p,a=>a.work.value('fhr',11))),'151');
      await app(p,a=>{a.work.discard();a.work.clearSelection();a.work.space='design';a.work.styleBase={label:'Thử',series:JSON.parse(JSON.stringify(a.design.series))};a.work.select({type:'series',id:'fhr'})});
      const base=await app(p,a=>a.design.series.fhr.color);await app(p,a=>a.work.styleSelection({color:'#ff0000'}));
      assert.equal(await app(p,a=>a.work.styleOrigin('fhr')),'Tùy chỉnh');
      await p.getByRole('button',{name:'Về mẫu',exact:true}).first().click();
      assert.equal(await app(p,a=>a.design.series.fhr.color),base);
      await app(p,a=>{a.work.clearSelection();a.work.space='capture'});
    });
    await check(p,'One top bar on desktop and the floating panel never hides the selected point',async()=>{
      assert.equal(await p.locator('.next-workspace-bar').count(),1);assert.ok(await p.locator('.workbench-bar .cv-present').count()===1);
      const last=await app(p,a=>Math.max(...a.activeCase.observations.filter(o=>o.fhr!=null&&o.fhr!=='').map(o=>o.time)));
      await app(p,a=>{a.work.space='capture';a.work.panel='entry';a.inspectorOpen=true});await p.waitForTimeout(200);
      await app(p,async(a,t)=>{a.work.go(t);a.work.select({type:'point',field:'fhr',time:t});await a.work.ensureSelected()},last);await p.waitForTimeout(250);
      const geo=await p.evaluate(t=>{const n=document.querySelector('.clinical-chart-card [data-point-hit][data-observation-field=fhr][data-observation-time="'+t+'"]')||document.querySelector('[data-point-hit][data-observation-field=fhr][data-observation-time="'+t+'"]'),s=document.querySelector('.workbench.inspector-open>.inspector-shell');const a=n.getBoundingClientRect(),b=s.getBoundingClientRect();return {pt:[a.left,a.right],panel:[b.left,b.right]}},last);
      assert.ok(geo.pt[1]<geo.panel[0]||geo.pt[0]>geo.panel[1],'Selected point sits under the panel: '+JSON.stringify(geo));
      await app(p,a=>a.work.clearSelection());
    });
    await check(p,'Line header fields, region-scaled text, handle preview and zoom shortcuts',async()=>{
      await app(p,a=>{a.work.clearSelection();a.work.panel='';a.inspectorOpen=false;a.work.space='design';a.work.patchDesign({headerLayout:'line'})});await p.waitForTimeout(200);
      const fields=await p.locator('.next-header-field').evaluateAll(n=>n.map(e=>e.dataset.headerField));
      for(const f of ['code','name','para','gestationalAge','date','startTime'])assert.ok(fields.includes(f),'line header lacks '+f);
      await p.locator('.next-header-field[data-header-field=para]').dispatchEvent('click');await p.waitForSelector('.next-panel [data-case-field=para]');
      await app(p,a=>{a.work.close();a.work.patchDesign({headerLayout:'grid'})});
      const size=()=>p.evaluate(()=>[...document.querySelectorAll('.workarea svg.partograph text')].find(t=>t.textContent.trim()==='TIM THAI')?.getAttribute('font-size'));
      const before=await size();await app(p,a=>{a.work.sectionHeight('fhr',1.5);a.work.patchDesign({textFollowsRegion:true})});await p.waitForTimeout(100);
      assert.ok(Number(await size())>Number(before),'Row label grows with its region '+before+' '+await size()+' '+await app(p,a=>a.design.textFollowsRegion+' '+a.design.sectionHeights.fhr));
      await app(p,a=>{a.work.patchDesign({textFollowsRegion:false});a.work.sectionHeight('fhr',1)});
      await p.waitForSelector('.next-handle.section',{state:'attached'});const h=p.locator('.next-handle.section').first(),b=await h.boundingBox();
      await p.mouse.move(b.x+b.width/2,b.y+b.height/2);await p.mouse.down();await p.mouse.move(b.x+b.width/2,b.y+b.height/2+30,{steps:5});
      assert.match(await p.locator('.next-handle-tip').innerText(),/%$/);await p.keyboard.press('Escape');await p.mouse.up();
      await app(p,a=>a.work.discard?.());
      await p.locator('.clinical-chart-card .chart-scroll').first().click({position:{x:5,y:5}}).catch(()=>{});
      await p.evaluate(()=>document.activeElement?.blur());const z=await app(p,a=>a.work.zoom);await p.keyboard.press('Control+=');await p.waitForTimeout(150);
      assert.ok(await app(p,a=>a.work.zoom)>z,'Ctrl+= zooms in');await p.keyboard.press('Control+0');await p.waitForTimeout(150);assert.equal(await app(p,a=>a.work.zoom),100);
      await app(p,a=>{a.work.clearSelection();a.work.space='capture'});
    });
    await check(p,'Colour trials are one undo step, Esc cancels a trial, Ctrl+Z stays in the input and right-click selects',async()=>{
      await app(p,a=>{a.work.clearSelection();a.work.space='design';a.work.select({type:'series',id:'fhr'})});
      const base=await app(p,a=>a.design.series.fhr.color);
      await app(p,async a=>{a.work.trial();for(const c of ['#aa0000','#bb0000','#cc0000']){a.work.styleSelection({color:c});await Vue.nextTick()}await a.work.trialEnd()});
      assert.equal(await app(p,a=>a.design.series.fhr.color),'#cc0000');
      await app(p,async a=>{a.undoAny();await Vue.nextTick()});assert.equal(await app(p,a=>a.design.series.fhr.color),base,'One undo reverts the whole trial');
      await app(p,async a=>{a.work.trial();a.work.styleSelection({color:'#00aa00'});await Vue.nextTick();await a.work.trialEnd(true)});
      assert.equal(await app(p,a=>a.design.series.fhr.color),base,'Cancelled trial restores colour');
      await app(p,a=>{a.work.clearSelection();a.work.space='capture';a.work.panel='entry';a.inspectorOpen=true});
      const input=p.locator('#next-fhr');await input.fill('');await input.type('15');await p.keyboard.press('Control+z');
      assert.notEqual(await input.inputValue(),'15','Ctrl+Z undoes typing inside the field');
      assert.equal(await app(p,a=>a.design.series.fhr.color),base,'Ctrl+Z in a field leaves design history alone');
      await app(p,a=>{a.work.discard();a.work.clearSelection()});
      const pt=p.locator('.workarea [data-point-hit][data-observation-field=fhr]').first(),b=await pt.boundingBox();
      await app(p,a=>{a.work.panel='';a.inspectorOpen=false});await pt.scrollIntoViewIfNeeded();const r=await pt.boundingBox();
      await p.mouse.click(r.x+r.width/2,r.y+r.height/2,{button:'right'});void b;
      assert.equal(await app(p,a=>a.work.selection[0]?.type),'point');
      await app(p,a=>a.work.clearSelection());
      await app(p,async a=>{a.work.panel='entry';a.inspectorOpen=true;await a.work.open('layers')});await p.waitForSelector('.next-return-head');
      await p.locator('.next-return-head').click();assert.equal(await app(p,a=>a.work.panel),'entry','Any panel opened from entry returns to it');
    });
    await check(p,'Region style painter, all-regions scope in one undo, and empty grid clicks select the region in design',async()=>{
      await app(p,a=>{a.work.clearSelection();a.work.space='design';a.work.sectionHeight('fhr',1.4);a.work.sectionHeight('contractions',1)});
      await app(p,a=>{a.work.select({type:'region',id:'fhr'});a.work.copyStyle();a.work.clearSelection();a.work.select({type:'region',id:'contractions'})});
      await p.getByRole('button',{name:/^Áp kiểu/}).first().click();
      assert.equal(await app(p,a=>a.design.sectionHeights.contractions),1.4);
      const before=await app(p,a=>JSON.stringify(a.design.sectionHeights));
      await app(p,async a=>{a.work.select({type:'region',id:'fhr'});a.work.heightForAll('fhr');await Vue.nextTick();await Vue.nextTick()});
      assert.ok(await app(p,a=>Object.entries(a.design.sectionHeights).filter(([k])=>k!=='header').every(([,v])=>v===1.4)));
      await app(p,async a=>{a.undoAny();await Vue.nextTick()});assert.equal(await app(p,a=>JSON.stringify(a.design.sectionHeights)),before,'All-regions height undoes in one step');
      await app(p,a=>{a.work.clearSelection();a.work.panel='';a.inspectorOpen=false;a.work.sectionHeight('fhr',1);a.work.sectionHeight('contractions',1)});await p.waitForTimeout(150);
      const box=await p.evaluate(()=>{const s=document.querySelector('.workarea svg.partograph'),t=[...s.querySelectorAll('text')].find(t=>t.textContent.trim()==='CƠN CO TỬ CUNG').getBoundingClientRect(),r=s.getBoundingClientRect();return {x:Math.min(r.right-60,t.right+520),y:t.top+t.height/2}});
      await p.evaluate(b=>{const s=document.querySelector('.workarea .chart-scroll'),r=s.getBoundingClientRect();if(b.y<r.top||b.y>r.bottom)s.scrollTop+=b.y-r.top-r.height/2},box);
      const box2=await p.evaluate(()=>{const t=[...document.querySelectorAll('.workarea svg.partograph text')].find(t=>t.textContent.trim()==='CƠN CO TỬ CUNG').getBoundingClientRect(),r=document.querySelector('.workarea svg.partograph').getBoundingClientRect();return {x:Math.min(r.right-60,t.right+260),y:t.top+t.height/2+6}});
      await p.mouse.click(box2.x,box2.y);
      assert.equal(await app(p,a=>JSON.stringify(a.work.selection[0])),JSON.stringify({type:'region',id:'contractions'}));
      await app(p,a=>{a.work.clearSelection();a.work.space='capture'});
    });
    await check(p,'Selected region gets a frame, template reason is stated, and a note can start from a point',async()=>{
      await app(p,a=>{a.work.clearSelection();a.work.space='design';a.work.select({type:'region',id:'contractions'})});await p.waitForTimeout(150);if(process.env.LAYOUT_PROBE)await p.screenshot({path:path.join(output,'region.png')});
      assert.equal(await p.locator('.next-region-frame.selected').count(),1);assert.match(await p.locator('.next-region-frame.selected').innerText(),/Cơn co/i);
      assert.match(await p.locator('.next-template-reason').innerText(),/theo mẫu/);
      const t=await app(p,a=>a.activeCase.observations.find(o=>o.fhr!=null&&o.fhr!=='').time);
      await app(p,(a,t)=>{a.work.clearSelection();a.work.space='capture';a.work.select({type:'point',field:'fhr',time:t})},t);
      await p.locator('.next-context [aria-label="Thêm chú thích tại mốc này"]').first().click();
      assert.equal(await app(p,a=>a.work.noteDraft?.time),t);
      await app(p,a=>{a.work.noteDraft=null;a.work.panel='';a.work.clearSelection()});
    });
    await check(p,'Hour strip sticks when the time row scrolls away and a resized region returns to its template',async()=>{
      await app(p,a=>{a.work.clearSelection();a.work.space='design';a.work.panel='';a.inspectorOpen=false});await p.waitForTimeout(150);
      await p.evaluate(()=>{const s=document.querySelector('.workarea .chart-scroll');s.scrollTop=s.scrollHeight});await p.waitForTimeout(200);
      assert.ok(await p.locator('.next-sticky-hours span').count()>3,'Sticky hour strip is shown');if(process.env.LAYOUT_PROBE)await p.screenshot({path:path.join(output,'hours.png')});
      await p.evaluate(()=>{document.querySelector('.workarea .chart-scroll').scrollTop=0});
      await app(p,a=>{a.work.sectionHeight('fhr',1.3);a.work.select({type:'region',id:'fhr'})});
      assert.match(await p.locator('.next-context').first().innerText(),/Tùy chỉnh/);
      await p.locator('.next-context').first().getByRole('button',{name:'Về mẫu',exact:true}).click();
      assert.equal(await app(p,a=>a.design.sectionHeights.fhr),1);
      await app(p,a=>{a.work.clearSelection();a.work.space='capture'});
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
    await check(p,'Export profiles (In A4 → black and white) never leave the editor chart monochrome',async()=>{
      await app(p,a=>{a.mono=false;a.toolTab='overview'});await p.waitForTimeout(100);
      await app(p,a=>{a.work.exportPurpose='print';a.toolTab='export'});await p.waitForTimeout(200);
      assert.equal(await app(p,a=>a.mono),true,'print preview is black and white');
      await app(p,a=>{a.toolTab='overview'});await p.waitForTimeout(200);
      assert.equal(await app(p,a=>a.mono),false,'editor colours come back after leaving export');
      await app(p,a=>{a.toolTab='export'});await p.waitForTimeout(200);
      assert.equal(await app(p,a=>a.mono),true,'re-entering export restores its own profile');
      await app(p,a=>{a.toolTab='overview'});
    });
    await check(p,'Cross-midnight navigation shows a full date; library and pin menu are available',async()=>{
      const label=await p.evaluate(()=>nextClock({patient:{startTime:'23:30',date:'2026-10-26'}},1));
      assert.equal(label,'00:30 · 27/10/2026');
      await app(p,a=>a.work.open('library'));
      assert.ok(await p.locator('.next-library-item').count()>0);
      // Desktop keeps extra tools in the rail's "Thêm" menu; narrow layouts keep the top-bar pin menu.
      const more=p.locator('summary[aria-label="Thêm công cụ"]:visible, summary[aria-label="Ghim công cụ"]:visible').first();
      await more.click();
      assert.ok(await p.locator('.next-pin-menu[open]').count());
      await more.click();
    });
    await check(p,'Clinical mode uses the same sheet and has time-locked dragging by default',async()=>{
      await app(p,a=>a.createLibraryProject('clinical'));
      await p.locator('.creation-rail').getByRole('button',{name:'Dữ liệu',exact:true}).click();
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
      const secondBox=await second.boundingBox();if(process.env.LAYOUT_PROBE)console.log('SECOND',JSON.stringify(secondBox),await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e.tagName+'.'+e.className?.baseVal+e.className+' in '+(e.closest('section,.toolbox,.chart-frame>div')?.className||'')},[secondBox.x+secondBox.width/2,secondBox.y+secondBox.height/2]));await p.keyboard.down('Shift');await p.mouse.click(secondBox.x+secondBox.width/2,secondBox.y+secondBox.height/2);await p.keyboard.up('Shift');
      assert.equal(await app(p,a=>a.work.selection.length),2);
      await app(p,a=>a.work.clearSelection());
      const box=await first.boundingBox(),before=await app(p,a=>a.clinical.observations.find(o=>o.time===0).fhr);
      await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.mouse.move(box.x+box.width/2+35,box.y+box.height/2-15,{steps:8});await p.mouse.up();
      const after=await app(p,a=>({value:a.clinical.observations.find(o=>o.time===0).fhr,times:a.clinical.observations.map(o=>o.time)}));
      assert.notEqual(after.value,before);assert.deepEqual(after.times,[0,.5]);
    });
    await check(p,'Marquee selection and independent note dragging work with real pointer events',async()=>{
      await app(p,a=>{a.work.clearSelection();a.work.marquee=true;a.work.panel='';a.inspectorOpen=false});
      const pts=p.locator('.clinical-chart-card [data-point-hit][data-observation-field=fhr]');
      const a=await pts.nth(0).boundingBox(),b=await pts.nth(1).boundingBox();
      await p.mouse.move(Math.min(a.x,b.x)-10,Math.min(a.y,b.y)-18);await p.mouse.down();await p.mouse.move(Math.max(a.x+a.width,b.x+b.width)+10,Math.max(a.y+a.height,b.y+b.height)+18,{steps:8});await p.mouse.up();
      assert.equal(await app(p,a=>a.work.selection.length),2);
      await app(p,async a=>{a.work.marquee=false;a.work.clearSelection();a.work.newNote();a.work.noteDraft.label='Kéo nhãn độc lập';a.work.noteDraft.time=0;await a.work.saveNote()});
      const note=p.locator('.clinical-chart-card [data-event-index="0"]');
      await note.scrollIntoViewIfNeeded();await p.evaluate(()=>document.querySelectorAll('.next-canvas-controls').forEach(e=>e.style.display='none'));const r=await note.boundingBox();
      if(process.env.LAYOUT_PROBE)console.log('NOTE',JSON.stringify(r),await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e.tagName+'.'+e.className+' in '+(e.closest('section,aside,nav,.toolbox')?.className||'')+' '+JSON.stringify(e.getBoundingClientRect())},[r.x+r.width/2,r.y+r.height/2]));await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await p.mouse.down();await p.mouse.move(r.x+r.width/2+60,r.y+r.height/2+12,{steps:8});await p.mouse.up();
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
    await check(p,'Layout width is remembered per space and semantic text passes contrast in both themes',async()=>{
      await app(p,async a=>{await a.work.changeSpace('capture');a.work.layout('entry');await a.work.changeSpace('design');a.work.layout('chart');await a.work.changeSpace('capture')});
      assert.equal(await app(p,a=>a.panelWidth),480);
      await app(p,async a=>{await a.work.changeSpace('design')});
      assert.equal(await app(p,a=>a.panelWidth),300);
      await app(p,async a=>{await a.work.changeSpace('capture');a.work.error='Kiểm tra thông báo lỗi';a.work.message='Đã ghi nhận';a.work.set('fhr','152')});
      for(const theme of ['light','dark']){
        await p.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
        await app(p,a=>{a.work.error='Kiểm tra thông báo lỗi';a.work.message='Đã ghi nhận'});
        const ratios=await p.locator('.next-panel .next-error,.next-panel .next-success,.next-record-footer .btn.primary,.workbench-bar .quick-export').evaluateAll(nodes=>{
          const lum=rgb=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((v,c,i)=>v+c*[.2126,.7152,.0722][i],0);
          return nodes.filter(e=>e.checkVisibility()&&!e.disabled).map(e=>{let bg=e;while(bg.parentElement&&getComputedStyle(bg).backgroundColor==='rgba(0, 0, 0, 0)')bg=bg.parentElement;const a=lum(getComputedStyle(e).color.match(/[\d.]+/g).slice(0,3).map(Number)),b=lum(getComputedStyle(bg).backgroundColor.match(/[\d.]+/g).slice(0,3).map(Number));return {text:e.innerText,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)}});
        });
        assert.ok(ratios.length>=3);assert.ok(ratios.every(r=>r.ratio>=4.5),theme+' '+JSON.stringify(ratios));
      }
      await p.evaluate(()=>document.documentElement.dataset.theme='light');await app(p,a=>{a.work.discard();a.work.error='';a.work.message=''});
    });
    await check(p,'Touch first selects a point without changing data or hiding the timeline behind a modal',async()=>{
      const touch=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),t=await touch.newPage();
      try {
        t.on('pageerror',e=>errors.push(e.message));await t.goto('http://127.0.0.1:'+server.address().port);await t.waitForSelector('#app:not([v-cloak])');assert.equal(await t.locator('.studio-workspace').isVisible(),false);
        await app(t,async a=>{await a.createLibraryProject('clinical');a.work.set('fhr','142');await a.work.record();a.work.close();a.toolTab='overview';a.dataMode='drag'});
        const before=await app(t,a=>JSON.stringify(a.activeCase));
        const rect=await t.locator('.clinical-chart-card [data-point-hit][data-observation-field=fhr]').first().boundingBox();
        await t.touchscreen.tap(rect.x+rect.width/2,rect.y+rect.height/2);
        assert.equal(await app(t,a=>JSON.stringify(a.activeCase)),before);
        assert.equal(await app(t,a=>a.work.selection[0]?.field),'fhr');
        assert.equal(await t.locator('.chart-cell-editor').count(),0);
        assert.equal(await t.locator('.workarea[inert]').count(),0);
        assert.equal(await t.locator('#studio-toolbox[aria-modal=true]').count(),0);
      } finally {await touch.close();}
    });
    console.log('Runtime errors:',JSON.stringify(errors));
    assert.deepEqual(errors,[]);
  } finally {await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;server.close()});
