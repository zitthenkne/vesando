// End-to-end checks for the compact workspace and the three-step AI workflow.
// External AI services are replaced with a popup fixture; no model requests are made.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assets=new Set(['index.html','studio.css','workspace.css','interaction.css','theme.css','canvas.css','clinical-rules.js','guidance.js','enhancements.js']);
const output=path.join(os.tmpdir(),'vesando-focused-ui');
const server=http.createServer(async(req,res)=>{
  const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!assets.has(file)){res.writeHead(404);res.end();return}
  try{res.setHeader('Content-Type',(file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':'text/html')+';charset=utf-8');res.end(await fs.readFile(path.join(__dirname,file)))}catch{res.writeHead(500);res.end()}
});
const sample={id:'AI-FIXTURE',fluidNotation:'vn',title:'Tình huống học tập',patient:{startTime:'09:00',date:'2026-10-25',name:'Tên giả định',code:'MA-GIA-DINH'},narrative:'Đề bài giả định để kiểm tra giao diện.',observations:[{time:0,cervix:4,fhr:140},{time:2,cervix:5,fhr:142}],events:[]};
const state=p=>p.evaluate(()=>JSON.stringify(document.querySelector('#app')._vnode.component.setupState.cases));
const open=async p=>{await p.locator('.rail-ai-entry').click();await p.getByRole('button',{name:'Bước 1: Soạn prompt',exact:true}).click()};
const goReply=p=>p.getByRole('button',{name:'Bước 2: Nhập kết quả AI',exact:true}).click();
const goReview=p=>p.getByRole('button',{name:'Xem trước sản đồ',exact:true}).click();
const home=async p=>{const b=p.getByRole('button',{name:'Trang bắt đầu',exact:true});if(await b.isVisible())await b.click();else{await p.getByLabel('Quản lý ca',{exact:true}).click();await p.getByRole('button',{name:'Thư viện sản phẩm',exact:true}).click()}};
const close=p=>p.getByRole('button',{name:'Đóng nhập JSON',exact:true}).click();
const prompt=p=>p.getByLabel('Prompt tạo JSON sản đồ',{exact:true}).inputValue();
async function fits(p,width,height,label){
  const box=await p.locator('.json-workbench').boundingBox();
  assert.ok(box.x>=-1&&box.x+box.width<=width+1&&box.y>=-1&&box.y+box.height<=height+1,label+' dialog fits');
  assert.ok(await p.locator('.json-workbench').evaluate(e=>e.scrollWidth<=e.clientWidth+1),label+' no horizontal overflow');
  const action=await p.locator('.json-workbench-footer .btn.primary').boundingBox();
  assert.ok(action.y>=0&&action.y+action.height<=height+1,label+' primary action stays visible');
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+' page fits');
}
(async()=>{
  await fs.mkdir(output,{recursive:true});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{channel:'chrome'})});
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.setDefaultTimeout(7000);
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',e=>{if(e.type()==='error')errors.push(e.text())});
  try{
    await page.goto('http://127.0.0.1:'+server.address().port);
    await page.waitForSelector('#app:not([v-cloak])');
    assert.equal(await page.locator('.home-template-disclosure').getAttribute('open'),null);
    await page.screenshot({path:path.join(output,'home-desktop.png')});
    const idea='Một tình huống để luyện đọc sản đồ. Giữ các mốc đã cung cấp.';
    await page.getByLabel('Ý tưởng sản đồ muốn tạo',{exact:true}).fill(idea);
    await page.getByRole('button',{name:'Bắt đầu với AI',exact:true}).click();
    assert.equal(await page.locator('#ai-subject').inputValue(),idea);
    assert.equal(await page.locator('.ai-brief-options').getAttribute('open'),null);
    assert.equal(await page.locator('.ai-send-options').getAttribute('open'),null);
    await page.screenshot({path:path.join(output,'ai-request-default.png')});
    assert.equal(await page.getByRole('button',{name:'Bước 3: Xem trước và áp dụng',exact:true}).isDisabled(),true,'A new AI task starts without a misleading prefilled reply');
    await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>window.__copied=text,readText:async()=>window.__reply||''}});window.open=()=>window.__popup={closed:false,close(){this.closed=true},location:{replace(url){window.__opened=url}}}});
    await page.locator('.ai-brief-options>summary').click();
    await page.getByLabel('Mục tiêu học tập',{exact:true}).fill('Luyện nhận xét theo dữ kiện gốc');
    await page.getByLabel('Điều cần giữ nguyên hoặc tránh',{exact:true}).fill('Không viết đáp án');
    assert.ok((await prompt(page)).includes('Luyện nhận xét theo dữ kiện gốc'));
    assert.ok((await prompt(page)).includes('Không viết đáp án'));
    await page.getByLabel('Dùng số liệu của ca đang mở',{exact:false}).check();
    let request=await prompt(page);
    assert.ok(request.includes('DỮ LIỆU CA ĐANG MỞ ĐỂ THAM CHIẾU'));
    await page.getByLabel('Đổi công cụ AI',{exact:true}).click();
    await page.locator('.ai-tool-menu').getByRole('button',{name:'Claude',exact:true}).click();
    await page.locator('.ai-send').click();
    assert.equal(await page.evaluate(()=>window.__copied),request);
    assert.equal(await page.evaluate(()=>window.__opened),'https://claude.ai/new');
    await page.screenshot({path:path.join(output,'ai-request-desktop.png')});
    console.log('PASS: home AI entry, collapsed options, detailed brief, explicit context and provider handoff');

    const original=await state(page);
    await goReply(page);
    await page.locator('#json-workbench-input').fill('{bad}');
    assert.equal(await page.getByRole('button',{name:'Xem trước sản đồ',exact:true}).isDisabled(),true);
    await page.keyboard.press('Control+Enter');assert.equal(await state(page),original);
    await page.getByRole('button',{name:'Yêu cầu AI sửa lỗi',exact:true}).click();
    assert.ok((await page.evaluate(()=>window.__copied)).includes('{bad}'));
    await page.locator('#json-workbench-input').fill('Phản hồi giả định.\n```json\n'+JSON.stringify(sample)+'\n```');
    assert.equal(await page.locator('.json-validation.valid').count(),1);
    assert.equal(await page.locator('.json-preview-column').isVisible(),false);
    await goReview(page);
    assert.equal(await page.locator('.json-preview-column').isVisible(),true);
    assert.equal(await page.locator('.json-input-column').isVisible(),false);
    assert.equal(await state(page),original,'Preview does not mutate the case');
    await page.locator('.ai-refinement>summary').click();
    await page.getByLabel('Yêu cầu chỉnh sửa',{exact:true}).fill('Chỉ viết lại câu hỏi cuối đề');
    await page.getByRole('button',{name:'Sao chép yêu cầu chỉnh sửa',exact:true}).click();
    assert.ok((await page.evaluate(()=>window.__copied)).includes('Chỉ viết lại câu hỏi cuối đề'));
    assert.ok((await page.evaluate(()=>window.__copied)).includes('AI-FIXTURE'));
    await page.getByRole('button',{name:'Áp dụng',exact:true}).click();
    assert.equal(JSON.parse(await state(page))[0].id,sample.id);
    await page.keyboard.press('Control+z');assert.equal(await state(page),original);
    console.log('PASS: invalid JSON guard, repair, separate preview, refinement, apply and undo');

    // Give the current case data so the next import offers append/replace.
    await page.evaluate(c=>{const s=document.querySelector('#app')._vnode.component.setupState;s.cases=[window.PartographCore.validateCase(c)]},sample);
    const existing=await state(page);
    await open(page);await goReply(page);
    await page.locator('#json-workbench-input').fill(JSON.stringify([sample,{...sample,id:'SECOND',title:'Ca thứ hai'}]));
    await goReview(page);
    assert.equal(await page.getByLabel('Cách áp dụng kết quả AI',{exact:true}).inputValue(),'append');
    await page.getByRole('button',{name:'Áp dụng · 2 ca',exact:true}).click();
    let imported=JSON.parse(await state(page));
    assert.equal(imported.length,3);assert.deepEqual(imported[0],JSON.parse(existing)[0]);
    assert.equal(new Set(imported.map(c=>c.id)).size,3,'Appending resolves colliding IDs');
    await page.keyboard.press('Control+z');assert.equal(await state(page),existing);
    await open(page);await goReply(page);await page.locator('#json-workbench-input').fill(JSON.stringify([sample,{...sample,id:'SECOND',title:'Ca thứ hai'}]));await goReview(page);
    await page.locator('.ai-apply-options>summary').click();
    await page.getByLabel('Cách áp dụng kết quả AI',{exact:true}).selectOption('replace');
    await page.getByLabel('Ca xem trước từ JSON',{exact:true}).selectOption('1');
    await page.getByLabel('Chỉ dựng ca đang xem trước',{exact:true}).check();
    await page.getByRole('button',{name:'Áp dụng',exact:true}).click();
    assert.equal(JSON.parse(await state(page)).length,1);assert.equal(JSON.parse(await state(page))[0].id,'SECOND');
    await page.keyboard.press('Control+z');assert.equal(await state(page),existing);
    console.log('PASS: append preserves cases, colliding IDs are unique, selected-case replacement and undo');

    await open(page);
    await page.getByRole('button',{name:'Bước 1: Soạn prompt',exact:true}).click();
    assert.ok((await prompt(page)).includes('Luyện nhận xét theo dữ kiện gốc'),'Detailed brief survives closing and reopening');
    await page.locator('.ai-brief-options>summary').click();
    assert.equal(await page.getByLabel('Dùng số liệu của ca đang mở',{exact:false}).isChecked(),false,'Sending context requires a fresh explicit choice');
    await page.getByLabel('Dùng số liệu của ca đang mở',{exact:false}).check();
    const contextJSON=await page.locator('.ai-context-preview pre').textContent();
    assert.ok(!contextJSON.includes(sample.patient.name)&&!contextJSON.includes(sample.patient.code)&&!contextJSON.includes(sample.narrative));
    assert.ok(contextJSON.includes('"fhr": 140'),'Context preserves the actual measurements');
    await page.evaluate(()=>{navigator.clipboard.writeText=async()=>{throw Error('Denied')}});
    await page.locator('.ai-send').click();
    assert.equal(await page.evaluate(()=>window.__popup.closed),true,'Copy failure closes the reserved tab');
    assert.equal(await page.locator('.prompt-output').getAttribute('open'),'');
    assert.equal(await page.getByLabel('Prompt tạo JSON sản đồ',{exact:true}).evaluate(e=>e===document.activeElement),true);
    await page.locator('.prompt-output>summary').click();
    await page.evaluate(()=>{navigator.clipboard.writeText=async text=>window.__copied=text;window.open=()=>null});
    await page.locator('.ai-send').click();
    assert.equal(await page.getByRole('link',{name:'Mở Claude',exact:false}).getAttribute('href'),'https://claude.ai/new');
    await page.evaluate(()=>{delete window.__opened;window.open=()=>window.__popup={closed:false,close(){this.closed=true},location:{replace(url){window.__opened=url}}};navigator.clipboard.writeText=()=>new Promise(resolve=>window.__resolveCopy=resolve)});
    await page.locator('.ai-send').click();
    await page.getByLabel('Điều cần giữ nguyên hoặc tránh',{exact:true}).fill('Giữ số liệu, không viết đáp án');
    await page.evaluate(()=>window.__resolveCopy());
    await page.waitForFunction(()=>window.__popup.closed);
    assert.equal(await page.evaluate(()=>window.__opened),undefined,'Editing detailed constraints cancels a stale send');
    await page.evaluate(()=>navigator.clipboard.writeText=()=>new Promise(resolve=>window.__resolveCopy=resolve));
    await page.locator('.ai-send').click();
    await page.getByLabel('Đổi công cụ AI',{exact:true}).click();
    await page.locator('.ai-tool-menu').getByRole('button',{name:'Gemini',exact:true}).click();
    await page.evaluate(()=>window.__resolveCopy());
    await page.waitForFunction(()=>window.__popup.closed);
    assert.equal(await page.evaluate(()=>window.__opened),undefined,'Changing provider cancels the old reserved tab');
    await page.evaluate(()=>navigator.clipboard.writeText=async text=>window.__copied=text);
    await goReply(page);
    await page.locator('#json-workbench-input').fill(JSON.stringify(sample));
    const replyBefore=await page.locator('#json-workbench-input').inputValue();
    await page.evaluate(()=>navigator.clipboard.readText=()=>new Promise(resolve=>window.__resolvePaste=resolve));
    await page.getByRole('button',{name:'Dán phản hồi',exact:true}).click();
    await page.locator('#json-workbench-input').fill('Bản đang gõ');
    await page.evaluate(text=>window.__resolvePaste(text),replyBefore);
    await page.waitForFunction(()=>document.querySelector('.json-input-column .json-workbench-message')?.textContent.includes('vừa thay đổi'));
    assert.equal(await page.locator('#json-workbench-input').inputValue(),'Bản đang gõ','A delayed paste cannot overwrite a newer edit');
    await page.locator('#json-workbench-input').fill(replyBefore);
    await page.locator('.json-input-column input[type=file]').setInputFiles({name:'too-large.json',mimeType:'application/json',buffer:Buffer.alloc(2000001,32)});
    assert.equal(await page.locator('#json-workbench-input').inputValue(),replyBefore);
    await close(page);
    console.log('PASS: detailed brief retention, explicit context with identity fields removed, denied clipboard, blocked popup, stale copy/paste protection and oversized file guard');

    assert.equal(await page.locator('.creation-rail>button:visible').count(),7);
    await page.getByLabel('Thêm công cụ',{exact:true}).click();
    await page.getByRole('button',{name:'Kiểm tra sản đồ',exact:false}).click();
    assert.equal(await page.locator('.rail-more').getAttribute('open'),null);
    await page.getByRole('button',{name:'Đóng bảng công cụ',exact:true}).click();
    await open(page);
    for(const theme of ['light','dark']){
      await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
      for(const [width,height] of [[320,568],[390,844],[768,900],[1440,1000]]){
        await page.setViewportSize({width,height});
        await page.getByRole('button',{name:'Bước 1: Soạn prompt',exact:true}).click();
        await fits(page,width,height,theme+' '+width+' request');
        await goReply(page);await fits(page,width,height,theme+' '+width+' reply');
        await goReview(page);await fits(page,width,height,theme+' '+width+' review');
        if(theme==='light')await page.screenshot({path:path.join(output,'ai-review-'+width+'.png')});
      }
    }
    await page.screenshot({path:path.join(output,'ai-review-dark.png')});
    await close(page);
    for(const width of [320,390,768,1440]){
      await page.setViewportSize({width,height:900});
      await page.getByLabel('Thêm công cụ',{exact:true}).click();
      const menu=await page.locator('.rail-more-menu').boundingBox();
      assert.ok(menu.x>=0&&menu.x+menu.width<=width+1&&menu.y>=0&&menu.y+menu.height<=900);
      await page.keyboard.press('Escape');assert.equal(await page.locator('.rail-more').getAttribute('open'),null);
      await home(page);
      await page.getByRole('button',{name:'Trang chủ',exact:true}).click();
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Home fits '+width);
      if(width===390)await page.screenshot({path:path.join(output,'home-mobile.png')});
      if(!await page.locator('.clinical-launch').isVisible())await page.locator('.home-create').click();await page.getByRole('button',{name:'Tạo hồ sơ theo dõi',exact:false}).click();
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Clinical fits '+width);
      await home(page);
      await page.locator('.home-resume').click();
    }
    await page.setViewportSize({width:1440,height:1000});
    await page.screenshot({path:path.join(output,'workspace-desktop.png')});
    await open(page);await page.getByRole('button',{name:'Bước 1: Soạn prompt',exact:true}).click();await page.locator('.ai-brief-options>summary').click();
    await page.getByLabel('Tự lưu cả phiên AI trên thiết bị',{exact:true}).check();
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem('partograph-ai-draft-v1'))?.brief?.goal==='Luyện nhận xét theo dữ kiện gốc');
    await page.reload();await page.waitForSelector('#app:not([v-cloak])');
    await page.getByRole('button',{name:'Bắt đầu với AI',exact:true}).click();
    await page.locator('.ai-brief-options>summary').click();
    assert.equal(await page.getByLabel('Mục tiêu học tập',{exact:true}).inputValue(),'Luyện nhận xét theo dữ kiện gốc');
    assert.equal(await page.getByLabel('Điều cần giữ nguyên hoặc tránh',{exact:true}).inputValue(),'Giữ số liệu, không viết đáp án');
    await page.getByLabel('Tự lưu cả phiên AI trên thiết bị',{exact:true}).uncheck();
    assert.equal(await page.evaluate(()=>localStorage.getItem('partograph-ai-draft-v1')),null);
    assert.deepEqual(errors,[]);
    console.log('PASS: 24 AI stage/theme/viewport combinations, 4 home/clinical layouts, compact tools and Escape; no console/runtime errors');
    console.log('Screenshots: '+output);
  }catch(e){await page.screenshot({path:path.join(output,'failure.png')}).catch(()=>{});throw e}
  finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1;server.close()});
