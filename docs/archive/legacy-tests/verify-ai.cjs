// Browser checks for idea-to-JSON prompting and faithful conversion of an existing brief.
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
const ready=p=>p.waitForSelector('#app:not([v-cloak])');
const open=p=>p.getByRole('button',{name:'Lập sản đồ bằng AI',exact:true}).click();
const prompt=p=>p.getByLabel('Prompt tạo JSON sản đồ',{exact:true}).inputValue();
const cases=p=>p.evaluate(()=>JSON.stringify(document.querySelector('#app')._vnode.component.setupState.cases));
const saved=p=>p.evaluate(()=>localStorage.getItem('partograph-ai-draft-v1'));
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{channel:'chrome'})});
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
    page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.type()==='error')errors.push(e.text())});
    const url='http://127.0.0.1:'+server.address().port;
    await page.goto(url);await ready(page);const before=await cases(page);await open(page);
    const idea=page.locator('.prompt-kind').getByRole('button',{name:'Từ ý tưởng'}),convert=page.locator('.prompt-kind').getByRole('button',{name:'Có đề bài đầy đủ'}),subject=page.locator('#ai-subject'),count=page.getByLabel('Số ca AI tạo',{exact:true});
    assert.equal(await idea.getAttribute('aria-pressed'),'true');assert.equal(await count.inputValue(),'1');
    await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>window.__copiedPrompt=text}}));
    await page.locator('.ai-send').click();
    assert.equal(await page.evaluate(()=>window.__copiedPrompt),undefined);assert.equal(context.pages().length,1,'Empty content cannot open an AI tab');assert.equal(await subject.evaluate(e=>e===document.activeElement),true);
    await page.getByRole('button',{name:'Tiến triển chậm',exact:true}).click();assert.ok((await subject.inputValue()).length>0);await page.getByRole('button',{name:'Hoàn tác gợi ý',exact:true}).click();assert.equal(await subject.inputValue(),'');
    const input='Muốn một ca chuyển dạ tiến triển chậm. Giữ giờ bắt đầu 09:00. $& "nháy" </script> 📝';await subject.fill(input);
    let text=await prompt(page);assert.ok(text.endsWith(input),'User content is inserted literally, including replacement tokens and markup');
    assert.ok(text.includes('tự phát triển MỘT tình huống'));assert.ok(text.includes('Không yêu cầu người dùng viết đề bài hoàn chỉnh'));assert.ok(text.includes('Giữ các số đo, thời điểm và ràng buộc'));assert.ok(text.includes('nêu rõ những phần đã bổ sung'));assert.ok(!text.includes('Chỉ điền số đề đã cho'));assert.ok(!text.includes('không tự tạo thông số chưa đo'));
    assert.equal(await saved(page),null,'Briefs are not stored without opt-in');assert.equal(await cases(page),before);
    await page.locator('.prompt-copy').click();await page.waitForFunction(()=>!!window.__copiedPrompt);assert.equal(await page.evaluate(()=>window.__copiedPrompt),text);
    await count.selectOption('3');text=await prompt(page);assert.ok(text.includes('Tạo BA'));assert.ok(text.includes('MẢNG JSON gồm đúng 3'));assert.equal(await page.locator('.json-tabs>button').first().getAttribute('class'),'active','Editing the prompt clears the copied step');
    const downloading=page.waitForEvent('download');await page.getByRole('button',{name:'Tải prompt .txt',exact:true}).click();const download=await downloading;assert.equal(await fs.readFile(await download.path(),'utf8'),text);
    await count.selectOption('12');text=await prompt(page);assert.ok(text.includes('MẢNG JSON gồm đúng 12'));await count.selectOption('3');
    await page.locator('.prompt-kind').getByRole('button',{name:'Bổ sung bản nháp',exact:true}).click();text=await prompt(page);assert.ok(text.includes('CHẾ ĐỘ BỔ SUNG BẢN NHÁP'));assert.ok(text.includes('Giữ nguyên mọi số đo, giờ khám'));assert.ok(text.includes('BẢN NHÁP CẦN HOÀN THIỆN:'));assert.ok(text.includes('QUY CHUẨN ĐANG CHỌN:'));assert.equal(await subject.inputValue(),input);
    await page.getByRole('button',{name:'Luyện nhận xét',exact:true}).click();assert.ok((await subject.inputValue()).startsWith(input));await page.getByRole('button',{name:'Hoàn tác gợi ý',exact:true}).click();assert.equal(await subject.inputValue(),input,'Suggestions can be undone without losing the original brief');
    await convert.click();text=await prompt(page);assert.equal(await count.count(),0);assert.equal(await subject.inputValue(),input);assert.ok(text.includes('không tự tạo thông số chưa đo'));assert.ok(text.includes('Không nội suy'));assert.ok(text.includes('MỘT đối tượng JSON'));assert.ok(!text.includes('Tạo BA'));assert.ok(!text.includes('Không yêu cầu người dùng viết đề bài hoàn chỉnh'));assert.ok(!text.includes('KHI TẠO CA MỚI'));
    await idea.click();assert.equal(await count.inputValue(),'3');assert.equal(await subject.inputValue(),input);
    await page.getByLabel('Tự lưu đề bài trên thiết bị',{exact:true}).check();await page.waitForFunction(()=>!!localStorage.getItem('partograph-ai-draft-v1'));assert.deepEqual(JSON.parse(await saved(page)),{kind:'generate',subject:input,count:3});
    await page.reload();await ready(page);await open(page);assert.equal(await idea.getAttribute('aria-pressed'),'true');assert.equal(await count.inputValue(),'3');assert.equal(await subject.inputValue(),input);
    await convert.click();await page.reload();await ready(page);await open(page);assert.equal(await convert.getAttribute('aria-pressed'),'true');assert.equal(await subject.inputValue(),input);
    await page.getByLabel('Tự lưu đề bài trên thiết bị',{exact:true}).uncheck();assert.equal(await saved(page),null);
    console.log('PASS: three input modes, 1–12 cases, literal input, append/undo suggestions, faithful conversion, standard-aware prompt, empty-input guard, clipboard/download and opt-in draft restoration');

    // Reserve the tab within the user gesture, but navigate only after clipboard success.
    await idea.click();await page.getByRole('radio',{name:'Chọn Claude',exact:true}).click();await context.route('https://claude.ai/**',route=>route.fulfill({contentType:'text/html',body:'<title>AI handoff fixture</title>'}));
    await page.evaluate(()=>{navigator.clipboard.writeText=text=>new Promise(resolve=>{window.__pendingText=text;window.__resolveCopy=resolve})});
    const opening=context.waitForEvent('page');await page.locator('.ai-send').click();const popup=await opening;assert.equal(popup.url(),'about:blank');assert.equal(await page.locator('.ai-send').isDisabled(),true);await page.evaluate(()=>window.__resolveCopy());await popup.waitForURL('https://claude.ai/new');assert.equal(await page.evaluate(()=>window.__pendingText),await prompt(page));await popup.close();
    const rawBeforeReturn=await page.locator('#json-workbench-input').inputValue();
    await page.evaluate(()=>{for(const hidden of [true,false]){Object.defineProperty(document,'hidden',{configurable:true,value:hidden});document.dispatchEvent(new Event('visibilitychange'))}});
    assert.equal(await page.locator('.json-workbench-body').isVisible(),true);assert.equal(await page.locator('#json-workbench-input').inputValue(),rawBeforeReturn,'Returning from AI cannot replace an existing reply');await page.getByRole('button',{name:'Bước 1: Soạn prompt',exact:true}).click();
    await page.evaluate(()=>{navigator.clipboard.writeText=async()=>{throw new Error('Clipboard denied')}});const failedOpening=context.waitForEvent('page');await page.locator('.ai-send').click();const failedPopup=await failedOpening;if(!failedPopup.isClosed())await failedPopup.waitForEvent('close');assert.equal(await page.locator('.prompt-output').getAttribute('open'),'');assert.equal(await page.getByLabel('Prompt tạo JSON sản đồ',{exact:true}).evaluate(e=>e===document.activeElement),true);assert.equal(context.pages().length,1,'A failed copy closes the reserved tab');
    await page.evaluate(()=>{navigator.clipboard.writeText=async text=>window.__copiedPrompt=text});await page.locator('.prompt-output>summary').click();
    await page.evaluate(()=>{window.__originalOpen=window.open;window.open=()=>null});await page.locator('.ai-send').click();assert.equal(await page.getByRole('link',{name:'Mở Claude',exact:true}).getAttribute('href'),'https://claude.ai/new');await page.evaluate(()=>window.open=window.__originalOpen);
    await page.evaluate(()=>{window.open=()=>window.__reserved={closed:false,close(){this.closed=true},location:{replace(url){window.__unexpectedNavigation=url}}};navigator.clipboard.writeText=()=>new Promise(resolve=>window.__resolveCopy=resolve)});await page.locator('.ai-send').click();await subject.fill(input+'\nNội dung vừa sửa.');await page.evaluate(()=>window.__resolveCopy());await page.waitForFunction(()=>window.__reserved.closed);assert.equal(await page.evaluate(()=>window.__unexpectedNavigation),undefined,'Editing during copy must cancel sending the stale prompt');await subject.fill(input);await page.evaluate(()=>{window.open=window.__originalOpen;navigator.clipboard.writeText=async text=>window.__copiedPrompt=text});
    console.log('PASS: provider choice, reserved-tab handoff waits for clipboard, copy failure gives manual fallback, returning from AI preserves existing reply');

    // Exercise the existing JSON boundary with a fictional reply; no live model call is made.
    const sample={id:'IDEA-TEST',fluidNotation:'vn',title:'Ca phát triển từ ý tưởng',patient:{startTime:'09:00',date:'2026-10-22'},narrative:'Tình huống giả định phục vụ học tập.',observations:[{time:0,cervix:4,fhr:140},{time:2,cervix:5,fhr:142}],events:[]};
    await page.getByRole('button',{name:'Sang Bước 2',exact:true}).click();await page.locator('#json-workbench-input').fill('Dữ liệu giả định phục vụ học tập.\n```json\n'+JSON.stringify(sample)+'\n```');
    assert.equal(await page.locator('.json-validation.valid').count(),1);assert.equal(await page.locator('.json-preview-column .partograph').count(),1);assert.equal(await cases(page),before,'Previewing never changes the case');
    await page.locator('.ai-narrative>summary').click();assert.ok((await page.locator('.ai-narrative p').innerText()).includes('giả định'));
    await page.getByRole('button',{name:'Vẽ sản đồ',exact:true}).click();assert.equal(JSON.parse(await cases(page))[0].id,'IDEA-TEST');await page.keyboard.press('Control+z');assert.equal(await cases(page),before);
    await open(page);await page.getByRole('button',{name:'Sang Bước 2',exact:true}).click();const reply=page.locator('#json-workbench-input'),originalReply=await reply.inputValue(),batch=JSON.stringify([sample,{...sample,id:'IDEA-SECOND',title:'Ca thứ hai'}]);
    await page.evaluate(text=>{navigator.clipboard.readText=async()=>text},batch);await page.getByRole('button',{name:'Dán phản hồi',exact:true}).click();assert.equal(await reply.inputValue(),batch);await page.getByRole('button',{name:'Hoàn tác nhập',exact:true}).click();assert.equal(await reply.inputValue(),originalReply);
    await page.evaluate(()=>{navigator.clipboard.readText=()=>new Promise(resolve=>window.__resolvePaste=resolve)});await page.getByRole('button',{name:'Dán phản hồi',exact:true}).click();await reply.fill('Bản nhập đang chỉnh');await page.evaluate(text=>window.__resolvePaste(text),batch);await page.waitForFunction(()=>document.querySelector('.json-input-column [role=status].json-workbench-message')?.textContent.includes('vừa thay đổi'));assert.equal(await reply.inputValue(),'Bản nhập đang chỉnh');await reply.fill(originalReply);
    await page.locator('.json-input-column input[type=file]').setInputFiles({name:'too-large.json',mimeType:'application/json',buffer:Buffer.alloc(2000001,32)});assert.equal(await reply.inputValue(),originalReply,'Oversized files cannot replace the current reply');
    await reply.fill(batch);await page.getByLabel('Ca xem trước từ JSON',{exact:true}).selectOption('1');await page.getByLabel('Chỉ dựng ca đang xem trước',{exact:true}).check();await page.getByRole('button',{name:'Vẽ sản đồ',exact:true}).click();const chosen=JSON.parse(await cases(page));assert.equal(chosen.length,1);assert.equal(chosen[0].id,'IDEA-SECOND');await page.keyboard.press('Control+z');assert.equal(await cases(page),before);
    await open(page);await page.getByRole('button',{name:'Sang Bước 2',exact:true}).click();const review=JSON.stringify({kind:'partograph-review',version:1,standard:'lcg',mono:true,compact:true,design:{gridColor:'#778899'},cases:[sample]});await reply.fill(review);await page.getByRole('button',{name:'Định dạng',exact:true}).click();const formatted=JSON.parse(await reply.inputValue());assert.equal(formatted.kind,'partograph-review');assert.equal(formatted.standard,'lcg');assert.equal(formatted.design.gridColor,'#778899');assert.equal(formatted.mono,true);await page.getByRole('button',{name:'Hoàn tác nhập',exact:true}).click();assert.equal(await reply.inputValue(),review);
    await reply.fill('{bad}');await page.evaluate(()=>{navigator.clipboard.writeText=async()=>{throw new Error('Denied')}});await page.getByRole('button',{name:'Yêu cầu AI sửa lỗi',exact:true}).click();assert.ok((await page.getByLabel('Yêu cầu AI sửa JSON',{exact:true}).inputValue()).includes('{bad}'));await page.getByRole('button',{name:'Để sau',exact:true}).click();
    console.log('PASS: narrative preview, paste/undo, selected-case import/undo, review metadata survives formatting and manual JSON repair fallback');
    await open(page);await idea.click();await count.selectOption('1');await subject.fill('Tạo một ca chuyển dạ tiến triển chậm để luyện đọc sản đồ. Có vài mốc khám và câu hỏi nhận xét, không kèm đáp án.');
    for(const width of [320,390,768,1440]){
      await page.setViewportSize({width,height:900});
      for(const mode of ['generate','complete','convert']){
        await (mode==='generate'?idea:mode==='convert'?convert:page.locator('.prompt-kind').getByRole('button',{name:'Bổ sung bản nháp',exact:true})).click();
        assert.equal(await page.locator('.json-workbench').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true,'Dialog fits at '+width+' / '+mode);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
        const field=await subject.boundingBox();assert.ok(field.x>=0&&field.x+field.width<=width+1,'Input fits at '+width);
      }
      await idea.click();await page.locator('.json-workbench').evaluate(e=>e.scrollTop=0);await page.screenshot({path:path.join(os.tmpdir(),'vesando-ai-'+width+'.png'),animations:'disabled'});
      const action=await page.locator('.ai-send').boundingBox();assert.ok(action.y>=0&&action.y+action.height<=900,'The primary AI action stays visible at '+width);
      if(width===390){await page.getByLabel('Đổi công cụ AI',{exact:true}).click();await page.locator('.ai-tool-menu').getByRole('button',{name:'Gemini',exact:true}).click();assert.ok((await page.locator('.ai-send').innerText()).includes('Gemini'));assert.equal(await page.getByLabel('Đổi công cụ AI',{exact:true}).evaluate(e=>e===document.activeElement),true);await page.getByLabel('Đổi công cụ AI',{exact:true}).click();await page.keyboard.press('Escape');assert.equal(await page.locator('.json-workbench[open]').count(),1);assert.equal(await page.locator('.ai-tool-menu').getAttribute('open'),null);await page.getByRole('radio',{name:'Chọn Claude',exact:true}).click();await page.locator('.json-workbench').evaluate(e=>e.scrollTop=0)}
    }
    await page.setViewportSize({width:320,height:568});await page.locator('.json-workbench').evaluate(e=>e.scrollTop=0);const shortAction=await page.locator('.ai-send').boundingBox();assert.ok(shortAction.y>=0&&shortAction.y+shortAction.height<=568);await page.setViewportSize({width:1440,height:900});
    for(const theme of ['light','dark']){await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);const ratios=await page.locator('.ai-send').evaluate(e=>{const s=getComputedStyle(e),luminance=c=>{const rgb=c.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722},a=luminance(s.color),b=luminance(s.backgroundColor);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)});assert.ok(ratios>=4.5,'Primary action contrast passes AA in '+theme)}
    await page.screenshot({path:path.join(os.tmpdir(),'vesando-ai-dark.png'),animations:'disabled'});
    await page.keyboard.press('Escape');assert.equal(await page.locator('.json-workbench').count(),0);assert.deepEqual(errors,[]);
    await context.close();
    const invalid=await browser.newContext();await invalid.addInitScript(()=>localStorage.setItem('partograph-ai-draft-v1','{bad'));const clean=await invalid.newPage();await clean.goto(url);await ready(clean);await open(clean);assert.equal(await clean.locator('.prompt-kind button').first().getAttribute('aria-pressed'),'true');assert.equal(await clean.locator('#ai-subject').inputValue(),'');await invalid.close();
    console.log('PASS: stale-copy/paste protection, popup-block fallback, oversized files, three responsive modes at 320/390/768/1440px, 568px height, mobile provider menu/focus/Escape, dark mode and corrupt draft fallback; no runtime/console errors');
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());
