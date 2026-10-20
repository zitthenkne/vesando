// End-to-end checks of JSON authoring, templates and exact exported content.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const files=new Set(['index.html','studio.css','workspace.css','interaction.css','theme.css','clinical-rules.js','guidance.js','enhancements.js']);
const server=http.createServer(async(req,res)=>{
  const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!files.has(name)){res.writeHead(404);res.end();return}
  try{res.setHeader('Content-Type',(name.endsWith('.css')?'text/css':name.endsWith('.js')?'application/javascript':'text/html')+'; charset=utf-8');res.end(await fs.readFile(path.join(__dirname,name)))}catch{res.writeHead(500);res.end()}
});
const readState=p=>p.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState;return {mode:a.mode,stage:a.toolTab,case:JSON.parse(JSON.stringify(a.activeCase)),design:JSON.parse(JSON.stringify(a.design)),dirty:a.draftDirty}});
const download=async(p,click)=>{const wait=p.waitForEvent('download');await click();const d=await wait;return {name:d.suggestedFilename(),bytes:await fs.readFile(await d.path())}};
const expectedSVG=p=>p.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState,d=window.PartographCore.buildSVG(a.caseForView(a.activeCase),a.chartOptions,true);return '<svg xmlns="http://www.w3.org/2000/svg" width="'+d.width+'" height="'+d.height+'" viewBox="0 0 '+d.width+' '+d.height+'">'+d.inner+'</svg>'});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{channel:'chrome'})});
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
    page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.type()==='error')errors.push(e.text())});
    const url='http://127.0.0.1:'+server.address().port;await page.goto(url);await page.waitForSelector('.partograph');
    const original=await readState(page);assert.equal(original.design.fluidNotation,'vn');
    await page.getByRole('button',{name:'Lập sản đồ bằng AI',exact:true}).click();await page.waitForSelector('.json-workbench[open]');await page.getByRole('button',{name:'Bước 2: Nhập kết quả AI',exact:true}).click();
    const input=page.locator('#json-workbench-input');await input.fill('{bad}');assert.equal(await page.getByRole('button',{name:'Vẽ sản đồ',exact:true}).isDisabled(),true);assert.deepEqual((await readState(page)).case,original.case);
    const sample={id:'VN-TEST',title:'Ca thử nhập Việt',patient:{name:'TEN RIENG CAN AN',code:'CODE-RIENG',startTime:'08:00',date:'2026-10-17'},observations:[{time:0,cervix:4,descent:4,fhr:140,fluid:'C'},{time:1,cervix:5,descent:3,fhr:145,fluid:'T'},{time:2,cervix:6,descent:2,fluid:'K'},{time:3,cervix:7,descent:1,fluid:'X+++'}]};
    await input.fill('```json\n'+JSON.stringify([sample,{...sample,id:'VN-2',title:'Ca thứ hai'}])+'\n```');await page.getByLabel('Ký hiệu ối của JSON',{exact:true}).selectOption('vn');
    assert.equal(await page.locator('.json-validation.valid').count(),1);await page.getByLabel('Ca xem trước từ JSON',{exact:true}).selectOption('1');assert.ok((await page.locator('.json-preview-column .partograph').getAttribute('aria-label')).includes('Ca thứ hai'));
    await page.screenshot({path:path.join(os.tmpdir(),'vesando-v3-json-desktop.png'),animations:'disabled'});
    await page.getByRole('button',{name:'Vẽ sản đồ · 2 ca',exact:true}).click();assert.equal(await page.locator('.json-workbench').count(),0);let current=await readState(page);
    assert.equal(current.stage,'overview');assert.deepEqual(current.case.observations.map(o=>o.fluid),['I','C','A','M+++']);assert.equal(await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.cases.length),2);
    await page.keyboard.press('Control+z');assert.equal((await readState(page)).case.id,original.case.id);await page.keyboard.press('Control+Shift+z');assert.equal((await readState(page)).case.id,'VN-TEST');
    console.log('PASS: prominent JSON entry, live invalid-data guard, multi-case Markdown preview, explicit VN conversion and undo/redo');

    await page.getByRole('button',{name:'Lập sản đồ bằng AI',exact:true}).click();await page.getByRole('button',{name:'Bước 1: Soạn prompt',exact:true}).click();
    const subject='Đề bài có $& và dấu nháy: "test", không được thay đổi.';await page.locator('.prompt-setup textarea').fill(subject);
    const prompt=await page.getByLabel('Prompt tạo JSON sản đồ',{exact:true}).inputValue();assert.ok(prompt.includes(subject));assert.ok(prompt.includes('không tự tạo thông số chưa đo'));assert.ok(!prompt.includes('[DÁN ĐỀ BÀI Ở ĐÂY]'));
    await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>window.__copiedPrompt=text}}));
    await page.getByRole('button',{name:'Sao chép prompt',exact:true}).click();await page.waitForFunction(()=>!!window.__copiedPrompt);assert.equal(await page.evaluate(()=>window.__copiedPrompt),prompt);
    await page.locator('.prompt-kind button').nth(1).click();assert.ok((await page.getByLabel('Prompt tạo JSON sản đồ',{exact:true}).inputValue()).includes('Tạo BA'));
    await page.getByRole('button',{name:'Sang Bước 2',exact:true}).click();await page.locator('.json-input-column input[type=file]').setInputFiles({name:'ca.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(sample))});await page.getByLabel('Ký hiệu ối của JSON',{exact:true}).selectOption('vn');await page.getByRole('button',{name:'Định dạng',exact:true}).click();
    assert.equal(await page.getByLabel('Ký hiệu ối của JSON',{exact:true}).inputValue(),'auto');assert.equal(JSON.parse(await input.inputValue()).fluidNotation,'vn');assert.equal(JSON.parse(await input.inputValue()).observations[0].fluid,'C');await page.getByRole('button',{name:'Để sau',exact:true}).click();
    console.log('PASS: editable prompt subject, safe literal insertion, two prompt types, clipboard promise, file input and canonical formatting');

    await page.keyboard.press('Alt+2');const finder=page.getByLabel('Tìm tùy chỉnh',{exact:true});await finder.fill('mau luoi');await finder.press('Enter');await page.waitForSelector('.paper-controls:visible');
    await page.getByLabel('Màu lưới',{exact:true}).evaluate(e=>{e.value='#668899';e.dispatchEvent(new Event('input',{bubbles:true}))});await page.getByLabel('Chữ trên phiếu',{exact:true}).selectOption('serif');
    await finder.fill('ghi so');await finder.press('Enter');await page.getByLabel('Ghi số cạnh điểm diễn biến',{exact:true}).check();await page.getByLabel('Ẩn họ tên & mã trên đầu phiếu',{exact:true}).check();await page.getByLabel('Khoảng cách nhãn giờ',{exact:true}).selectOption('2');await page.getByLabel('Tô dải tham chiếu tim thai',{exact:true}).uncheck();
    const customized=await readState(page);assert.equal(customized.design.gridColor,'#668899');assert.equal(customized.design.paperFont,'serif');
    await finder.fill('mau ca nhan');await finder.press('Enter');await page.waitForSelector('.design-library:visible');await page.getByLabel('Tên mẫu thiết kế',{exact:true}).fill('Mẫu đề Việt');await page.getByRole('button',{name:'Lưu mẫu cá nhân',exact:true}).click();await page.waitForSelector('.template-row');
    await page.evaluate(()=>{document.querySelector('#app')._vnode.component.setupState.design.gridColor='#abcdef'});await page.getByRole('button',{name:'Áp dụng mẫu Mẫu đề Việt',exact:true}).click();assert.equal((await readState(page)).design.gridColor,'#668899');
    await page.locator('.template-menu>summary').click();await page.getByRole('button',{name:'Đổi tên',exact:true}).click();await page.getByLabel('Tên mới của mẫu',{exact:true}).fill('Bản in gọn');await page.locator('.template-rename').getByRole('button',{name:'Đổi tên',exact:true}).click();
    const template=await download(page,()=>page.getByRole('button',{name:'Tải mẫu JSON',exact:true}).click());assert.equal(JSON.parse(template.bytes).kind,'san-do-design');assert.equal(JSON.parse(template.bytes).patient,undefined);
    await page.locator('.template-menu>summary').click();await page.getByRole('button',{name:'Xóa mẫu',exact:true}).click();assert.equal(await page.locator('.template-row').count(),0);await page.getByRole('button',{name:'Hoàn tác xóa',exact:true}).click();assert.equal(await page.locator('.template-row').count(),1);
    await page.locator('.design-library input[type=file]').setInputFiles({name:'mau.json',mimeType:'application/json',buffer:template.bytes});await page.waitForFunction(()=>document.querySelectorAll('.template-row').length===2);
    const beforeReload=(await readState(page)).case;await page.reload();await page.waitForSelector('.partograph');await page.keyboard.press('Alt+2');await page.getByRole('button',{name:'Mẫu & chuẩn',exact:true}).click();assert.equal(await page.locator('.template-row').count(),2);
    await page.getByRole('button',{name:'Áp dụng mẫu Bản in gọn',exact:true}).click();
    console.log('PASS: accent-free settings search, live paper styling, privacy scope, labels, templates save/apply/rename/delete/undo, actual JSON export/import and persistence');

    // Return to a fixture with known data after reload; templates never store patient data.
    await page.evaluate(c=>{const a=document.querySelector('#app')._vnode.component.setupState;a.cases=[c];a.activeCaseIndex=0},beforeReload);
    await page.keyboard.press('Alt+4');await page.getByRole('button',{name:'SVG',exact:true}).click();
    const expected=await expectedSVG(page),svg=await download(page,()=>page.locator('.export-main').click());assert.equal(svg.bytes.toString(),expected);assert.ok(!expected.includes('TEN RIENG CAN AN'));assert.ok(expected.includes('Times New Roman'));assert.ok(expected.includes('#668899'));assert.ok(expected.includes('X+++'));assert.ok(!expected.includes('selected-point-ring'));
    assert.equal(await page.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState,d=window.PartographCore.buildSVG(a.activeCase,a.chartOptions,true),svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.innerHTML=d.inner;return [...document.querySelectorAll('.case-card .partograph')].find(e=>e.checkVisibility()).innerHTML===svg.innerHTML}),true,'Preview and file have identical SVG elements');
    await page.locator('.output-settings details').last().locator('summary').click();await page.getByLabel('Tên tệp · tự thêm đuôi',{exact:true}).fill('de-thi-test');await page.getByRole('button',{name:'PNG',exact:true}).click();await page.getByLabel('Độ phân giải',{exact:true}).selectOption('1');
    const png=await download(page,()=>page.locator('.export-main').click());assert.equal(png.name,'de-thi-test.png');const pixelCheck=await page.evaluate(async({svg,png})=>{
      const load=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src});
      const a=await load('data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(svg)))),b=await load('data:image/png;base64,'+png);if(a.width!==b.width||a.height!==b.height)return false;
      const canvas=document.createElement('canvas');canvas.width=a.width;canvas.height=a.height;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,a.width,a.height);ctx.drawImage(a,0,0);const pixels=ctx.getImageData(0,0,a.width,a.height).data;ctx.clearRect(0,0,a.width,a.height);ctx.drawImage(b,0,0);const actual=ctx.getImageData(0,0,a.width,a.height).data;return pixels.every((v,i)=>v===actual[i]);
    },{svg:await expectedSVG(page),png:png.bytes.toString('base64')});assert.equal(pixelCheck,true);await fs.writeFile(path.join(os.tmpdir(),'vesando-v3-export.png'),png.bytes);
    await page.getByRole('button',{name:'PDF',exact:true}).click();await page.getByLabel('Khổ giấy',{exact:true}).selectOption('a3');await page.getByLabel('Hướng giấy',{exact:true}).selectOption('landscape');await page.getByLabel('Bố trí nội dung',{exact:true}).selectOption('page');await page.getByLabel('Lề giấy',{exact:true}).selectOption('42');
    const pdf=await download(page,()=>page.locator('.export-main').click()),pdfText=pdf.bytes.toString('latin1');assert.ok(pdfText.includes('/MediaBox [0 0 1190.55 841.89]'));assert.ok(pdfText.includes('/Count 1'));assert.ok(pdfText.includes('/Subtype /Image'));
    const expectedJPEG=await page.evaluate(async base64=>{const img=new Image();img.src='data:image/png;base64,'+base64;await img.decode();const canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;canvas.getContext('2d').drawImage(img,0,0);return canvas.toDataURL('image/jpeg',.98).split(',')[1]},png.bytes.toString('base64'));
    assert.ok(pdf.bytes.includes(Buffer.from(expectedJPEG,'base64')),'PDF embeds the same rendered image as the PNG');
    await page.locator('.output-profiles').getByRole('button',{name:'In A4',exact:true}).click();assert.equal((await readState(page)).design.imageScale,3);assert.equal(await page.getByLabel('Khổ giấy',{exact:true}).inputValue(),'a4');
    console.log('PASS: downloaded SVG equals preview, PNG matches every rendered pixel, styles and VN notation persist, custom filename, real A3 landscape PDF and A4 output profile');

    await page.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState;a.mono=false;a.design.anonymize=false;a.design.imageScale=1;a.exportFormat='svg';a.loadPreset(0)});await page.keyboard.press('0');
    await page.locator('[data-point-hit][data-observation-time="2"][data-observation-field="cervix"]').first().click();await page.getByLabel('Giá trị điểm đang chọn',{exact:true}).fill('6.5');await page.locator('.quick-export').click();assert.equal((await readState(page)).case.observations.find(o=>o.time===2).cervix,6.5);const pointExport=await download(page,()=>page.locator('.export-main').click());assert.equal(pointExport.bytes.toString(),await expectedSVG(page));
    await page.keyboard.press('Alt+1');await page.getByLabel('Giá trị điểm đang chọn',{exact:true}).fill('6.3');await page.locator('.quick-export').click();assert.equal((await readState(page)).stage,'data');assert.equal(await page.getByLabel('Giá trị điểm đang chọn',{exact:true}).inputValue(),'6.3');await page.getByLabel('Giá trị điểm đang chọn',{exact:true}).fill('7');await page.getByLabel('Giá trị điểm đang chọn',{exact:true}).press('Enter');
    await page.getByRole('button',{name:'Chi tiết',exact:true}).click();await page.locator('.editor-values input[type=number]').nth(1).fill('7.5');await page.locator('.quick-export').click();assert.equal((await readState(page)).dirty,true);const applied=await download(page,()=>page.getByRole('button',{name:'Áp dụng & tải SVG',exact:true}).click());assert.equal((await readState(page)).dirty,false);assert.equal((await readState(page)).case.observations.find(o=>o.time===2).cervix,7.5);assert.equal(applied.bytes.toString(),await expectedSVG(page));
    console.log('PASS: pending point is saved before export, invalid point is retained, manual draft can apply and export in one action');
    await page.keyboard.press('Alt+1');await page.getByRole('button',{name:'Chi tiết',exact:true}).click();await page.getByRole('button',{name:'Thai & ối',exact:true}).click();
    await page.locator('.fluid-primary button').nth(0).click();assert.equal(await page.getByLabel('Ối: mức phân su hoặc máu',{exact:true}).inputValue(),'I');await page.locator('.fluid-primary button').nth(1).click();assert.equal(await page.getByLabel('Ối: mức phân su hoặc máu',{exact:true}).inputValue(),'C');await page.getByRole('button',{name:'Hủy thay đổi',exact:true}).click();

    await page.getByRole('radio',{name:'Theo dõi',exact:true}).click();await page.keyboard.press('Alt+1');await page.getByRole('button',{name:'Nhập bảng',exact:true}).click();await page.locator('#quick-fhr').fill('149');
    await page.evaluate(()=>{document.querySelector('#app')._vnode.component.setupState.selectedTime=.5});await page.locator('#quick-fhr').fill('151');await page.locator('.quick-export').click();
    const clinicalExport=await download(page,()=>page.getByRole('button',{name:'Áp dụng & tải SVG',exact:true}).click());const recorded=(await readState(page)).case;assert.equal(recorded.observations.find(o=>o.time===0).fhr,149);assert.equal(recorded.observations.find(o=>o.time===.5).fhr,151);assert.equal(clinicalExport.bytes.toString(),await expectedSVG(page));
    await page.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState;a.undo()});assert.equal((await readState(page)).case.observations[0].fhr,null);
    await page.getByRole('radio',{name:'Soạn đề',exact:true}).click();
    console.log('PASS: clinical drafts at multiple times export together and undo as one transaction');

    await page.keyboard.press('0');await page.keyboard.press('?');await page.waitForSelector('.shortcut-sheet[open]');await page.keyboard.press('Escape');
    for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:900});await page.getByRole('button',{name:'Lập sản đồ bằng AI',exact:true}).click();for(const tab of ['Bước 2: Nhập kết quả AI','Bước 1: Soạn prompt']){await page.locator('.json-tabs').getByRole('button',{name:tab,exact:true}).click();assert.ok(await page.locator('.json-workbench').evaluate(e=>e.scrollWidth<=e.clientWidth+1),'JSON modal fits at '+width);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}await page.getByRole('button',{name:'Đóng nhập JSON',exact:true}).click()}
    await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Lập sản đồ bằng AI',exact:true}).click();await page.screenshot({path:path.join(os.tmpdir(),'vesando-v3-json-mobile.png'),animations:'disabled'});await page.keyboard.press('Escape');
    assert.deepEqual(errors,[]);console.log('PASS: shortcuts, five responsive JSON/prompt layouts, dialog close and no browser runtime/console errors');
  }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1;server.close()});
