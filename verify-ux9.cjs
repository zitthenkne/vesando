// Real-browser checks for the 24 UX additions; no installed packages required beyond existing Playwright.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const os=require('node:os');
const vm=require('node:vm');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const files=new Set(['index.html','studio.css','workspace.css','interaction.css','theme.css','canvas.css','clinical-rules.js','guidance.js','enhancements.js']);
const server=http.createServer(async(req,res)=>{const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(!files.has(file)){res.writeHead(404);res.end();return}try{res.setHeader('Content-Type',(file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':'text/html')+'; charset=utf-8');res.end(await fs.readFile(path.join(__dirname,file)))}catch{res.writeHead(500);res.end()}});
const state=p=>p.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState;return JSON.parse(JSON.stringify({mode:a.mode,c:a.activeCase,cases:a.cases,time:a.viewTime,selected:a.selectedTime,drafts:a.quickDrafts,pending:a.pendingQuickTimes,point:a.dataPoint,error:a.clinicalError,history:a.history.length}))});
const hit=(p,t,f)=>p.locator('.case-card:visible [data-point-hit][data-observation-time="'+t+'"][data-observation-field="'+f+'"]');
const ready=p=>p.waitForSelector('#app:not([v-cloak])');
const tick=p=>p.evaluate(()=>Vue.nextTick());
async function menu(p){const el=p.locator('.case-card:visible .moment-browser');if(!await el.evaluate(e=>e.open))await el.locator('summary').click();return el}
async function jump(p,t){const m=await menu(p);await m.getByRole('textbox',{name:'Giờ cần đến'}).fill(t);await m.getByRole('button',{name:'Đến mốc',exact:true}).click();await tick(p)}
async function at(p,t,f,v){return p.evaluate(({t,f,v})=>{const a=document.querySelector('#app')._vnode.component.setupState,c=window.PartographCore,d=c.buildSVG(a.activeCase,{...a.chartOptions,editable:true}),svg=[...document.querySelectorAll('.case-card .partograph')].find(e=>e.checkVisibility()),r=svg.getBoundingClientRect(),y=f==='fhr'?c.fetalHeartY(v):c.cervixY(v);return {x:r.x+(c.G.left+d.labelOffset+d.timeline.plot(t)*d.hour)*d.scaleX*r.width/d.width,y:r.y+d.rowLayout.y(y)*d.scaleY*r.height/d.height}},{t,f,v})}
(async()=>{
  const sandbox={};vm.createContext(sandbox);vm.runInContext(await fs.readFile(path.join(__dirname,'clinical-rules.js'),'utf8'),sandbox);vm.runInContext(await fs.readFile(path.join(__dirname,'enhancements.js'),'utf8'),sandbox);
  const parse=(s,start='23:30')=>sandbox.parseChartMoment(s,{patient:{startTime:start}});
  assert.equal(parse('01:00'),1.5);assert.equal(parse('23:30'),0);assert.equal(parse('+24'),24);assert.equal(parse('+1,5'),1.5);assert.equal(parse('08:45','08:15'),.5);
  for(const s of ['24:00','12:99','+72.5','+0.001','text','-1','1:3'])assert.equal(parse(s),null,s);
  assert.equal(parse('+24.5'),24.5);assert.equal(parse('+0.2'),.2);assert.equal(parse('15:20','16:30'),1370/60);
  console.log('PASS: precise minute navigation, midnight, multi-day relative time and invalid input');
  if(process.argv.includes('--unit'))return;
  await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
  try{
    browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{channel:'chrome'})});
    const url='http://127.0.0.1:'+server.address().port,errors=[];
    const context=await browser.newContext({viewport:{width:1440,height:1100},reducedMotion:'reduce'}),p=await context.newPage();p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));
    await p.goto(url);await ready(p);await p.locator('.home-template-disclosure>summary').click();await p.locator('.template-card').first().click();const base=(await state(p)).c;
    await jump(p,'+7.5');assert.equal((await state(p)).time,7.5);assert.deepEqual((await state(p)).c,base,'Navigation creates no measurements');
    await jump(p,'+1.301');assert.equal((await state(p)).time,7.5);assert.match(await p.locator('.moment-browser .error').innerText(),/phút/);
    await p.getByRole('button',{name:'Mốc đã ghi trước',exact:true}).click();assert.equal((await state(p)).time,base.observations.filter(o=>o.time<7.5).at(-1).time);
    await jump(p,'+0');await p.getByRole('button',{name:'Mốc mới nhất',exact:true}).click();assert.equal((await state(p)).time,base.observations.at(-1).time);
    await jump(p,'+0');await p.getByRole('button',{name:'Mốc đã ghi tiếp',exact:true}).click();assert.equal((await state(p)).time,base.observations[1].time);
    await jump(p,'+0');let m=await menu(p);await m.getByRole('combobox',{name:'Đối chiếu mốc',exact:true}).selectOption(String(base.observations[1].time));assert.equal(await m.locator('thead th').count(),3);
    assert.match(await m.locator('tbody').innerText(),new RegExp(String(base.observations[1].fhr)));
    await m.getByRole('button',{name:/Sửa Độ mở/}).click();await p.locator('.chart-cell-editor').waitFor();assert.deepEqual((await state(p)).c,base);await p.locator('.chart-cell-editor').press('Escape');
    assert.ok(await p.locator('[data-point-hit][tabindex="0"]').count()<=3);assert.ok(await p.locator('[data-point-hit][tabindex="-1"]').count()>3);
    await hit(p,2,'cervix').click();await p.locator('.point-toolbar').waitFor();await p.getByRole('button',{name:'Thêm thao tác với điểm'}).click();await p.getByRole('menuitem',{name:'Điểm sau cùng thông số'}).click();assert.equal((await state(p)).point.time,4);assert.deepEqual((await state(p)).c,base);
    await p.getByRole('button',{name:'Thêm thao tác với điểm'}).click();await p.getByRole('menuitem',{name:'Điểm trước cùng thông số'}).click();assert.equal((await state(p)).point.time,2);
    await p.keyboard.press('Alt+ArrowRight');assert.equal((await state(p)).point.time,4);
    await p.getByRole('button',{name:'Thêm thao tác với điểm'}).click();await p.getByRole('menuitem',{name:'Đưa điểm vào giữa khung'}).click();assert.deepEqual((await state(p)).c,base);
    await hit(p,4,'cervix').focus();await hit(p,4,'cervix').evaluate(el=>el.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:new DataTransfer()})));
    await p.evaluate(()=>{const el=document.activeElement,dt=new DataTransfer();dt.setData('text/plain','6,5');el.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:dt}))});await p.locator('.chart-cell-editor').waitFor();assert.equal(await p.locator('[data-input-key="cervix"]').inputValue(),'6.5');assert.deepEqual((await state(p)).c,base,'Pasted values remain a draft');await p.locator('[data-input-key="cervix"]').fill('7.5');await hit(p,4,'cervix').focus();await p.evaluate(()=>{const dt=new DataTransfer();dt.setData('text/plain','8.5');document.activeElement.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:dt}))});assert.equal(await p.locator('[data-input-key="cervix"]').inputValue(),'7.5','A second paste cannot overwrite an unfinished editor');await p.locator('[data-input-key="cervix"]').press('Escape');
    await p.keyboard.press('Escape');await p.locator('.toast').waitFor({state:'hidden'});await p.locator('.case-card:visible .partograph').scrollIntoViewIfNeeded();let pos=await at(p,7,'cervix',5);await p.mouse.move(pos.x,pos.y);await p.locator('.hover-crosshair').waitFor();assert.equal(await p.locator('.hover-crosshair line').count(),2);
    pos=await at(p,2,'cervix',8.5);await p.mouse.move(pos.x,pos.y);await p.waitForFunction(()=>document.querySelector('.chart-hover-readout')?.textContent.startsWith('Sửa'));assert.match(await p.locator('.chart-hover-readout').innerText(),new RegExp(String(base.observations.find(o=>o.time===2).cervix)));
    await p.locator('.view-menu:visible summary').click();await p.getByRole('combobox',{name:'Mức phóng sản đồ',exact:true}).selectOption('200');await p.locator('.view-menu:visible summary').click();
    m=await menu(p);await m.getByRole('combobox',{name:'Đến hàng trên sản đồ'}).selectOption('progress');assert.ok(await p.locator('.case-card:visible .chart-scroll').evaluate(el=>el.scrollTop)>0,'Row jump scrolls the chart');
    await p.locator('.case-card:visible .partograph').focus();await p.keyboard.down('Space');const scroll=p.locator('.case-card:visible .chart-scroll');assert.equal(await scroll.evaluate(el=>el.classList.contains('panning')),true);const b=await scroll.boundingBox();const prior=await scroll.evaluate(el=>({x:el.scrollLeft,y:el.scrollTop}));await p.mouse.move(b.x+b.width/2,b.y+150);await p.mouse.down();await p.mouse.move(b.x+b.width/2-80,b.y+100,{steps:5});await p.mouse.up();await p.keyboard.up('Space');const after=await scroll.evaluate(el=>({x:el.scrollLeft,y:el.scrollTop}));assert.ok(after.x!==prior.x||after.y!==prior.y);assert.equal(await scroll.evaluate(el=>el.classList.contains('panning')),false);assert.deepEqual((await state(p)).c,base,'Temporary pan never records a point');
    await p.keyboard.press('Control+k');await p.locator('#studio-command-input').fill('toi giao');assert.equal(await p.locator('.command-list [role="option"]').count(),1,'Search matches words in any order');await p.keyboard.press('Enter');await p.keyboard.press('Control+k');assert.equal(await p.locator('.command-list [role="option"]').first().getAttribute('id'),'command-item-theme');assert.match(await p.locator('.command-caption').innerText(),/gần đây/);await p.keyboard.press('Escape');
    assert.deepEqual(await p.evaluate(()=>JSON.parse(sessionStorage.getItem('partograph-recent-commands'))),['theme'],'Recent commands store IDs only');
    console.log('PASS: exam clock jump, recorded navigation, last moment, snapshots, compare/edit, row jump, selected-point location/navigation, roving focus, numeric paste draft, crosshair, actual-value hover, Space pan and command search/recents');
    await p.getByRole('radio',{name:'Theo dõi',exact:true}).click();await p.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState;a.openClinical(a.cases[0])});await tick(p);
    const original=(await state(p)).c;await p.locator('#quick-time').selectOption('2');assert.ok(await p.locator('.quick-previous').count()>0);assert.match(await p.locator('.quick-previous').first().innerText(),/Lần đo trước/);
    await p.locator('#quick-fhr').fill('146');assert.ok(await p.locator('.quick-previous').first().isVisible(),'Previous value stays visible after typing');await p.locator('#quick-pulse').fill('88');
    await p.locator('.quick-review summary').click();assert.match(await p.locator('.quick-review').innerText(),/146/);await p.getByRole('button',{name:'Bỏ sửa riêng Tim thai',exact:false}).click();let s=await state(p);assert.equal(s.drafts[2].fhr,undefined);assert.equal(s.drafts[2].pulse,'88');
    await p.locator('#quick-time').selectOption('3');await p.locator('#quick-fhr').fill('147');await p.getByRole('button',{name:/Hủy nháp riêng/}).click();s=await state(p);assert.equal(s.drafts[3],undefined);assert.equal(s.drafts[2].pulse,'88');
    await p.locator('.quick-group-jumps').getByRole('button',{name:'Mẹ',exact:true}).click();assert.equal(await p.locator('[data-entry-group="maternal"]').getAttribute('open'),'');assert.equal(await p.evaluate(()=>document.activeElement.id),'quick-systolic');
    await p.locator('.quick-group-jumps').getByRole('button',{name:'Chính',exact:true}).click();await p.locator('#quick-cervix').focus();await p.keyboard.press('Shift+Enter');assert.equal(await p.evaluate(()=>document.activeElement.id),'quick-fhr');
    await p.locator('#quick-fhr').fill('999');await p.getByRole('button',{name:/Ghi tất cả 2 mốc/}).click();s=await state(p);assert.deepEqual(s.c,original,'An invalid draft prevents the entire batch');assert.equal(s.pending.length,2);
    await p.locator('#quick-fhr').fill('147');const history=(await state(p)).history;await p.getByRole('button',{name:/Ghi tất cả 2 mốc/}).click();s=await state(p);assert.equal(s.pending.length,0);assert.equal(s.c.observations.find(o=>o.time===3).fhr,147);assert.equal(s.c.observations.find(o=>o.time===2).pulse,88);assert.equal(s.history,history+1,'Batch save is one undo step');
    await p.locator('.case-card:visible .partograph').focus();await p.keyboard.press('Control+z');s=await state(p);assert.deepEqual(s.c,original);assert.equal(s.pending.length,2,'Undo restores the original records and every draft');
    await p.getByRole('button',{name:/Ghi tất cả 2 mốc/}).click();await p.locator('#quick-time').selectOption('4');await p.getByRole('combobox',{name:'Bước chuyển mốc sau khi ghi'}).selectOption('1');await p.locator('#quick-fhr').fill('148');await p.keyboard.press('Control+Shift+Enter');s=await state(p);assert.equal(s.selected,5);assert.equal(s.c.observations.find(o=>o.time===4).fhr,148);assert.equal(await p.evaluate(()=>document.activeElement.id),'quick-fhr');
    await p.getByRole('combobox',{name:'Bước chuyển mốc sau khi ghi'}).selectOption('2');await p.locator('#quick-fhr').fill('149');await p.locator('.record-next').click();assert.equal((await state(p)).selected,7);
    const saved=(await state(p)).c;await jump(p,'+6.5');assert.equal((await state(p)).selected,6.5);assert.deepEqual((await state(p)).c,saved);await p.getByRole('button',{name:'Mốc mới nhất',exact:true}).click();assert.equal((await state(p)).selected,saved.observations.at(-1).time);
    assert.deepEqual((await state(p)).cases,base?[base]:[],'Monitoring edits leave exam cases intact');
    console.log('PASS: persistent previous measurements, group jump, individual/current-draft undo, change review, Shift Enter, atomic batch validation/save/undo, configurable record interval, Ctrl Shift Enter and monitoring navigation');
    for(const theme of ['light','dark'])for(const width of [320,390,768,1024,1440]){
      await p.setViewportSize({width,height:900});await p.evaluate(theme=>{document.documentElement.dataset.theme=theme;window.scrollTo(0,0)},theme);await tick(p);
      if(width<700&&!await p.locator('.bedside-entry').evaluate(el=>el.classList.contains('expanded')))await p.locator('.bedside-toggle').click();
      const overflow=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert.ok(overflow<=1,theme+' '+width+' page overflow '+overflow);
      const bad=await p.locator('.chart-moment-tools:visible button:visible,.chart-moment-tools:visible summary:visible,.quick-group-jumps:visible button:visible,.quick-revert:visible,.record-step:visible').evaluateAll(els=>els.filter(el=>{const r=el.getBoundingClientRect();return r.width<43.5||r.height<43.5}).map(el=>[el.outerHTML.slice(0,90),el.getBoundingClientRect().toJSON()]));assert.deepEqual(bad,[],theme+' '+width+' targets');
      await menu(p);assert.ok(await p.locator('.moment-browser-body:visible').isVisible());assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,'Expanded navigator fits '+width);
      await p.locator('.case-card:visible .moment-browser summary').click();
      await p.screenshot({path:path.join(os.tmpdir(),'vesando-ux9-'+theme+'-'+width+'.png'),animations:'disabled'});
    }
    assert.deepEqual(errors,[]);console.log('PASS: ten responsive/theme layouts, expanded navigation, >=44 px new touch targets, no page overflow or browser runtime errors');await context.close();
    const touchContext=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),touch=await touchContext.newPage();touch.on('pageerror',e=>errors.push(e.message));
    await touch.goto(url);await ready(touch);
    for(const mode of ['exam','clinical']){
      if(mode==='clinical')await touch.getByRole('radio',{name:'Theo dõi',exact:true}).tap();
      const before=(await state(touch)).c,nav=touch.locator('.case-card:visible .moment-browser'),summary=nav.locator('summary');
      const first=await summary.boundingBox();await summary.tap();const opened=await summary.boundingBox();assert.ok(Math.abs(opened.x-first.x)<1&&Math.abs(opened.y-first.y)<1,'Opening navigation keeps its trigger in place');
      await nav.getByRole('textbox',{name:'Giờ cần đến'}).fill('+1.5');await nav.getByRole('button',{name:'Đến mốc',exact:true}).tap();assert.equal((await state(touch)).time,1.5);assert.deepEqual((await state(touch)).c,before);await summary.tap();
      if(mode==='clinical'){
        await touch.locator('.bedside-toggle').tap();await touch.locator('#quick-fhr').fill('145');await touch.locator('#quick-pulse').fill('84');
        await touch.getByRole('button',{name:'Bỏ sửa riêng Tim thai',exact:false}).tap();assert.equal((await state(touch)).drafts[1.5].fhr,undefined);assert.equal((await state(touch)).drafts[1.5].pulse,'84');
        await touch.locator('.bedside-entry-body').evaluate(el=>el.scrollTop=el.scrollHeight);const strip=await touch.locator('.quick-group-jumps').boundingBox(),body=await touch.locator('.bedside-entry-body').boundingBox();assert.ok(strip.y>=body.y-1&&strip.y<body.y+60,'Group jump remains reachable while the form scrolls');
        await touch.locator('.quick-group-jumps').getByRole('button',{name:'Mẹ',exact:true}).tap();assert.equal(await touch.evaluate(()=>document.activeElement.id),'quick-systolic');assert.deepEqual((await state(touch)).c,before);
      }
    }
    assert.deepEqual(errors,[]);await touchContext.close();console.log('PASS: real touch events in both modes, stable navigation trigger, draft-only individual revert and sticky group shortcuts');
  }finally{if(browser)await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());
