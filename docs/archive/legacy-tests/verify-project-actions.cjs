// Labeled project menus and independent copies, including unapplied exam/clinical drafts.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assets=new Set(['index.html','base.css','core.js','components.js','app.js','canva.css','workspace-next.js','workspace-next.css','studio.css','workspace.css','interaction.css','theme.css','canvas.css','clinical-rules.js','guidance.js','enhancements.js']);
const server=http.createServer(async(req,res)=>{const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(!assets.has(file)){res.writeHead(404);res.end();return}try{res.setHeader('Content-Type',(file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':'text/html')+';charset=utf-8');res.end(await fs.readFile(path.join(__dirname,file)))}catch{res.writeHead(500);res.end()}});
const output=path.join(os.tmpdir(),'vesando-focused-ui');
const state=p=>p.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState;return JSON.parse(JSON.stringify({home:a.homeOpen,mode:a.mode,active:a.activeCase,draft:a.previewCase,quick:a.quickDrafts,design:a.design,projects:a.projectLibrary,ids:a.projectIDs,error:a.libraryError,undo:a.undoScope}))});
async function goHome(p){const home=p.getByRole('button',{name:'Trang bắt đầu',exact:true});if(await home.isVisible())await home.click();else{await p.getByLabel('Quản lý ca',{exact:true}).click();await p.getByRole('button',{name:'Thư viện sản phẩm',exact:true}).click()}}
const home=goHome;
async function action(p,label){const item=p.getByLabel(label,{exact:true}),menu=item.locator('xpath=ancestor::details[1]');if(!await menu.evaluate(e=>e.open))await menu.locator('summary').click();await item.click()}
(async()=>{
  await fs.mkdir(output,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{channel:'chrome'})});
  try{
    const p=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];p.setDefaultTimeout(7000);p.on('pageerror',e=>errors.push(e.message));
    await p.goto('http://127.0.0.1:'+server.address().port);await p.waitForSelector('#app:not([v-cloak])');await p.locator('.exam-launch').click();await p.getByLabel('Tên tình huống',{exact:true}).fill('Bản gốc');await p.getByRole('button',{name:'Lưu thay đổi',exact:true}).click();
    await p.evaluate(async()=>{const a=document.querySelector('#app')._vnode.component.setupState;a.design.gridColor='#456789';await a.selectTool('data');a.selectDataMode('manual');await Vue.nextTick()});
    await p.getByLabel('Tên tình huống',{exact:true}).fill('Bản nháp chưa áp dụng');await home(p);
    const original=(await state(p)).projects.exam[0],title='Bản nháp chưa áp dụng';
    assert.equal(await p.locator('.project-organize,.project-copy').count(),0,'Each card exposes one labeled action menu');
    const menu=p.locator('.project-actions').first(),toggle=menu.locator('summary');
    await toggle.focus();await p.keyboard.press('ArrowDown');assert.equal(await menu.getAttribute('open'),'');assert.equal(await menu.locator('[role=menuitem]').count(),5);assert.equal(await menu.locator('[role=menuitem]').first().evaluate(e=>e===document.activeElement),true);
    await p.keyboard.press('End');assert.equal(await menu.locator('[role=menuitem]').last().evaluate(e=>e===document.activeElement),true);await p.keyboard.press('Home');await p.keyboard.press('ArrowDown');await p.keyboard.press('Escape');assert.equal(await menu.getAttribute('open'),null);assert.equal(await toggle.evaluate(e=>e===document.activeElement),true);
    for(const width of [320,390,768,1440])for(const view of ['grid','list']){
      await p.setViewportSize({width,height:844});await p.getByLabel(view==='grid'?'Xem dạng lưới':'Xem dạng danh sách',{exact:true}).click();await toggle.scrollIntoViewIfNeeded();await toggle.click();
      const box=await menu.locator('[role=menu]').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width+1&&box.y>=0&&box.y+box.height<=844,'Menu fits '+width+'/'+view);
      const sizes=await menu.locator('[role=menuitem]').evaluateAll(nodes=>nodes.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));assert.ok(sizes.every(r=>r.w>=44&&r.h>=44));
      if(width===390&&view==='grid')await p.screenshot({path:path.join(output,'project-menu-mobile.png')});
      await p.keyboard.press('Escape');
    }
    await p.setViewportSize({width:1440,height:1000});await action(p,'Ghim '+title);assert.equal((await state(p)).projects.exam.length,1);
    await action(p,'Sắp xếp '+title);await p.getByLabel('Tên sản phẩm mới',{exact:true}).fill(title);await p.getByLabel('Nhãn sản phẩm',{exact:true}).fill('Thực hành');await p.getByRole('button',{name:'Lưu sắp xếp',exact:true}).click();
    await action(p,'Nhân bản '+title);assert.equal((await state(p)).home,true);assert.equal((await state(p)).projects.exam.length,2);
    await p.getByLabel('Thao tác với '+title,{exact:true}).click();await p.getByRole('heading',{name:'Thư viện soạn đề',exact:true}).click();assert.equal(await p.locator('.project-actions[open]').count(),0,'Outside click closes the menu');
    await action(p,'Nhân bản và chỉnh sửa '+title);const copied=await state(p);assert.equal(copied.home,false);assert.notEqual(copied.ids.exam,original.id);assert.equal(copied.active.title,'Bản gốc · bản sao');assert.equal(copied.draft.title,'Bản nháp chưa áp dụng · bản sao');assert.deepEqual(copied.active.observations,original.content.cases[0].observations);assert.deepEqual(copied.draft.observations,original.content.examDraft.observations);assert.equal(copied.design.gridColor,original.content.design.gridColor);assert.equal(copied.undo,null);
    assert.deepEqual(copied.projects.exam.find(x=>x.id===original.id),original,'Copy/edit never changes the source data or unapplied draft');
    await p.getByLabel('Tên tình huống',{exact:true}).fill('Bản sao độc lập');await home(p);assert.deepEqual((await state(p)).projects.exam.find(x=>x.id===original.id),original);
    console.log('PASS: five labeled actions, keyboard navigation/Escape, 8 viewport/view combinations, outside-click dismissal and independent exam copy with a genuinely unapplied draft');

    await p.locator('.home-sidebar nav').getByRole('button',{name:/Theo dõi/}).click();await p.locator('.clinical-launch').click();await p.locator('#quick-fhr').fill('146');await home(p);const clinical=(await state(p)).projects.clinical[0];
    await action(p,'Nhân bản và chỉnh sửa Hồ sơ chưa đặt tên');const clinicalCopy=await state(p);assert.equal(clinicalCopy.mode,'clinical');assert.notEqual(clinicalCopy.ids.clinical,clinical.id);assert.equal(await p.locator('#quick-fhr').inputValue(),'146');assert.deepEqual(clinicalCopy.quick,clinical.content.quickDrafts);assert.deepEqual(clinicalCopy.projects.clinical.find(x=>x.id===clinical.id),clinical);
    await home(p);const beforeFailure=await state(p);await p.evaluate(()=>{window.__setItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith('partograph-library-'))throw new DOMException('Full','QuotaExceededError');return window.__setItem.call(this,k,v)}});await action(p,'Nhân bản và chỉnh sửa Hồ sơ chưa đặt tên');const failed=await state(p);assert.equal(failed.home,true);assert.equal(failed.projects.clinical.length,beforeFailure.projects.clinical.length);assert.match(failed.error,/Chưa nhân bản/);await p.evaluate(()=>Storage.prototype.setItem=window.__setItem);
    assert.deepEqual(errors,[]);console.log('PASS: clinical copy keeps pending measurements separate; failed persistence cannot create or open a copy');
    await p.close();
  }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1;server.close()});
