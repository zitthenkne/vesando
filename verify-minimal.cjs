// Minimal startup, progressive tools and preserved data, exercised through the real UI.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const files=new Set(['index.html','studio.css','workspace.css','interaction.css','theme.css','canvas.css','clinical-rules.js','guidance.js','enhancements.js']);
const server=http.createServer(async(req,res)=>{
  const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!files.has(file)){res.writeHead(404).end();return}
  try{res.setHeader('Content-Type',(file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':'text/html')+'; charset=utf-8');res.end(await fs.readFile(path.join(__dirname,file)))}catch{res.writeHead(500).end()}
});
const model=p=>p.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState;return JSON.parse(JSON.stringify({home:a.homeOpen,cases:a.cases,clinical:a.clinical,drafts:a.quickDrafts,time:a.selectedTime,tool:a.toolTab,mode:a.mode,open:a.bedsideOpen}))});
const openTools=async p=>{if(!await p.locator('.tool-groups').evaluate(e=>e.open))await p.getByLabel('Công cụ sản đồ',{exact:true}).click()};
const appMenu=async p=>{if(!await p.locator('.workspace-menu').evaluate(e=>e.open))await p.getByLabel('Tùy chọn ứng dụng',{exact:true}).click()};
const home=async p=>{await p.getByRole('button',{name:'Trang bắt đầu',exact:true}).click();await p.locator('.start-screen').waitFor()};
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
  try{
    browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{channel:'chrome'})});
    const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),p=await context.newPage(),errors=[];
    p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));
    await p.goto('http://127.0.0.1:'+server.address().port);await p.waitForSelector('#app:not([v-cloak])');
    assert.equal(await p.locator('.start-card:visible').count(),2);
    assert.equal(await p.locator('.studio-workspace').isVisible(),false);
    const initial=await model(p);let layouts=0;
    for(const width of [320,390,768,1024,1440,1920])for(const theme of ['light','dark']){
      await p.setViewportSize({width,height:900});await p.evaluate(async theme=>{document.querySelector('#app')._vnode.component.setupState.theme=theme;await Vue.nextTick()},theme);
      assert.equal(await p.locator('.start-screen button:visible').count(),4,'Two task cards plus help and file import, without editor controls');
      assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1);
      assert.deepEqual((await model(p)).cases,initial.cases);
      const undersized=await p.locator('.start-screen button:visible').evaluateAll(es=>es.filter(e=>e.getBoundingClientRect().height<44).map(e=>e.outerHTML.slice(0,80)));
      assert.deepEqual(undersized,[]);
      if([390,1440].includes(width))await p.screenshot({path:path.join(os.tmpdir(),'vesando-minimal-home-'+theme+'-'+width+'.png'),fullPage:true});
      layouts++;
    }
    await p.setViewportSize({width:1440,height:1000});await p.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.theme='light');
    await p.getByRole('button',{name:'Soạn đề',exact:false}).click();
    assert.equal(await p.locator('.start-card:visible').count(),3);
    assert.equal(await p.locator('.studio-workspace').isVisible(),false,'Authoring tools wait until the source is chosen');
    await p.getByRole('button',{name:'Viết đề mới',exact:false}).click();
    assert.equal((await model(p)).cases.length,1,'Writing starts with one blank case');
    assert.equal(await p.locator('.editor-brief').evaluate(e=>e.open),true);
    assert.equal(await p.locator('.tool-palette').isVisible(),false);
    assert.equal(await p.locator('.tool-rail').count(),0,'No permanent six-button dock');
    await p.locator('.editor').getByLabel('Tên tình huống',{exact:true}).fill('Đề kiểm tra giao diện gọn');
    await p.locator('.editor').getByLabel('Tình huống / đề bài',{exact:true}).fill('Nội dung đang soạn để kiểm tra việc giữ bản nháp.');
    await home(p);await p.getByRole('button',{name:'Tiếp tục phiên đang mở',exact:false}).click();
    assert.equal(await p.locator('.editor').getByLabel('Tình huống / đề bài',{exact:true}).inputValue(),'Nội dung đang soạn để kiểm tra việc giữ bản nháp.');
    await p.locator('.editor').getByRole('button',{name:'Lưu thay đổi',exact:true}).click();
    const authored=(await model(p)).cases;
    await openTools(p);assert.deepEqual(await p.locator('.tool-palette h3').allTextContents(),['Dữ liệu','Trình bày','Kiểm tra']);
    await p.locator('.tool-palette').getByRole('button',{name:'Lập sản đồ bằng AI',exact:true}).click();
    assert.equal(await p.locator('.json-workbench').isVisible(),true);await p.getByRole('button',{name:'Đóng nhập JSON',exact:true}).click();
    await openTools(p);await p.locator('.tool-palette').getByRole('button',{name:/^Trình bày/}).click();
    assert.equal((await model(p)).tool,'design');assert.equal(await p.locator('.tool-palette').isVisible(),false);
    await p.getByRole('button',{name:'Đóng bảng công cụ',exact:true}).click();
    assert.equal(await p.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Công cụ sản đồ');
    await home(p);await p.getByRole('button',{name:'Theo dõi chuyển dạ',exact:false}).click();
    assert.equal(await p.locator('#quick-cervix').isVisible(),true);
    assert.equal(await p.locator('.clinical-chart-card .chart-moment-tools').isVisible(),false,'Recording has one time selector');
    await p.locator('#quick-cervix').fill('4');await p.locator('#quick-descent').fill('4');await p.locator('#quick-fhr').fill('140');
    const drafts=(await model(p)).drafts;
    await openTools(p);await p.locator('.tool-palette').getByRole('button',{name:/^Thông tin sản phụ/}).click();
    await p.locator('.clinical-admin').getByLabel('Họ tên sản phụ',{exact:true}).fill('Sản phụ kiểm tra');
    assert.deepEqual((await model(p)).drafts,drafts);
    await p.locator('.clinical-admin>summary').click();
    await p.locator('#bedside-form button[type=submit]').click();
    assert.equal((await model(p)).clinical.observations[0].cervix,4);
    await p.getByRole('button',{name:'Tiến mốc 30 phút',exact:true}).click();await p.locator('#quick-cervix').fill('5');
    const pending=await model(p);
    for(const width of [320,390,768,1024,1440,1920])for(const theme of ['light','dark']){
      await p.setViewportSize({width,height:900});await p.evaluate(async theme=>{const a=document.querySelector('#app')._vnode.component.setupState;a.theme=theme;await Vue.nextTick();document.querySelector('.bedside-entry-body').scrollTop=0;window.scrollTo(0,0)},theme);
      assert.equal(await p.locator('#quick-cervix').isVisible(),true);
      assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,width+' workspace overflow');
      await openTools(p);
      const menu=await p.locator('.tool-palette').boundingBox();assert.ok(menu.x>=0&&menu.x+menu.width<=width+1&&menu.y>=0&&menu.y+menu.height<=901,'Tool groups fit the viewport '+width+' '+theme+' '+JSON.stringify(menu));
      assert.equal(await p.locator('.quick-export>span').isVisible(),true,'Save has a visible label on every screen');
      const clipped=await p.locator('.tool-palette button>span').evaluateAll(es=>es.filter(e=>!e.checkVisibility()||e.scrollWidth>e.clientWidth+1).map(e=>e.textContent));assert.deepEqual(clipped,[],'Grouped tools keep their labels readable');
      if([390,1440].includes(width))await p.screenshot({path:path.join(os.tmpdir(),'vesando-minimal-tools-'+theme+'-'+width+'.png')});
      await p.locator('.tool-groups>summary').press('Escape');await p.waitForFunction(()=>!document.querySelector('.tool-groups').open);assert.equal(await p.locator('.tool-palette').isVisible(),false,width+' Escape closes the groups');
      assert.deepEqual((await model(p)).drafts,pending.drafts);
      assert.deepEqual((await model(p)).cases,authored);
      if([390,1440].includes(width))await p.screenshot({path:path.join(os.tmpdir(),'vesando-minimal-clinical-'+theme+'-'+width+'.png'),fullPage:true});
      layouts++;
    }
    await p.setViewportSize({width:390,height:844});await openTools(p);await p.locator('.tool-palette').getByRole('button',{name:/^Bảng thông số/}).click();
    assert.equal(await p.locator('.entry-table').isVisible(),true);
    await p.getByRole('button',{name:'Đóng bảng công cụ',exact:true}).click();
    await openTools(p);await p.locator('.tool-palette').getByRole('button',{name:/^Ghi số đo/}).click();
    assert.equal(await p.locator('#quick-cervix').inputValue(),'5');
    await p.locator('#bedside-form button[type=submit]').click();
    await p.locator('.quick-options>summary').click();await p.getByRole('checkbox',{name:'Tự lưu trên máy này',exact:true}).check();
    await p.waitForFunction(()=>document.querySelector('#app')._vnode.component.setupState.deviceCurrent);
    await p.locator('#quick-fhr').fill('142');await p.waitForFunction(()=>document.querySelector('#app')._vnode.component.setupState.deviceCurrent);
    await p.reload();await p.waitForSelector('#app:not([v-cloak])');await p.getByRole('button',{name:'Tiếp tục phiên đang mở',exact:false}).click();
    assert.equal(await p.locator('#quick-fhr').inputValue(),'142');
    await p.locator('#bedside-form button[type=submit]').click();
    await p.getByRole('button',{name:'Lưu và xuất sản đồ',exact:true}).click();await p.locator('.export-options>summary').click();
    for(const format of ['SVG','PNG','PDF']){
      await p.getByRole('button',{name:format,exact:true}).click();
      const download=await Promise.all([p.waitForEvent('download'),p.locator('.export-main').click()]);
      const bytes=await fs.readFile(await download[0].path());assert.ok(bytes.length>100);assert.ok(download[0].suggestedFilename().toLowerCase().endsWith('.'+format.toLowerCase()));
    }
    await p.getByRole('button',{name:'Đóng bảng công cụ',exact:true}).click();await appMenu(p);
    await p.getByRole('button',{name:'Tùy biến không gian',exact:true}).click();assert.equal(await p.locator('.workspace-preferences').isVisible(),true);await p.getByRole('button',{name:'Đóng tùy biến',exact:true}).click();
    await p.keyboard.press('Control+k');await p.locator('.command-dialog').waitFor();await p.keyboard.press('Escape');await p.locator('.command-dialog').waitFor({state:'detached'});
    assert.equal(await p.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Tùy chọn ứng dụng','Closing search restores focus to the application menu');
    const beforeFile=await model(p);await home(p);
    await p.locator('.start-file-row input').setInputFiles({name:'ca-da-luu.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(authored[0]))});
    assert.equal(await p.locator('.json-workbench').isVisible(),true,'Legacy case JSON opens through the home file action');
    assert.deepEqual((await model(p)).clinical,beforeFile.clinical,'Opening a file previews it before changing the active record');
    await p.getByRole('button',{name:'Đóng nhập JSON',exact:true}).click();
    const beforeGuide=await model(p);await home(p);
    await p.getByRole('button',{name:'Hướng dẫn',exact:true}).click();
    await p.getByRole('button',{name:'Mở hướng dẫn: Bắt đầu',exact:true}).click();
    let steps=0;
    while(await p.locator('.learning-step').count()){
      await p.waitForFunction(()=>!document.querySelector('.learning-step button[aria-label="Đóng hướng dẫn sử dụng"]')?.disabled);
      if(await p.locator('.learning-missing').count())await p.screenshot({path:path.join(os.tmpdir(),'vesando-minimal-guide-check.png')});
      assert.equal(await p.locator('.learning-missing').count(),0,'Startup guidance points at the new interface: '+await p.locator('.learning-step h2').innerText());
      steps++;const next=p.locator('.learning-step').getByRole('button',{name:'Tiếp',exact:true});
      if(await next.count())await next.click();else{await p.locator('.learning-step').getByRole('button',{name:'Hoàn thành',exact:true}).click();await p.locator('.learning-courses').waitFor()}
    }
    assert.equal(steps,7);await p.getByRole('button',{name:'Đóng hướng dẫn sử dụng',exact:true}).click();
    assert.deepEqual((await model(p)).clinical,beforeGuide.clinical);
    assert.deepEqual(errors,[]);
    console.log('PASS: four startup controls, two intent cards, grouped tools, retained author/clinical drafts, optional profile, table entry, autosave/reload, real SVG/PNG/PDF downloads, preferences; '+layouts+' responsive/theme layouts; zero runtime errors.');
    await context.close();
  }finally{if(browser)await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());
