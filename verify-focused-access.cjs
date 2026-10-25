// Keyboard, touch targets, contrast and AI-to-clinical import in the real browser.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assets=new Set(['index.html','studio.css','workspace.css','interaction.css','theme.css','canvas.css','clinical-rules.js','guidance.js','enhancements.js']);
const server=http.createServer(async(req,res)=>{const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(!assets.has(file)){res.writeHead(404);res.end();return}try{res.setHeader('Content-Type',(file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':'text/html')+';charset=utf-8');res.end(await fs.readFile(path.join(__dirname,file)))}catch{res.writeHead(500);res.end()}});
const output=path.join(os.tmpdir(),'vesando-focused-ui');
const ready=p=>p.waitForSelector('#app:not([v-cloak])');
const snapshot=p=>p.evaluate(()=>{const a=document.querySelector('#app')._vnode.component.setupState;return JSON.parse(JSON.stringify({clinical:a.clinical,quick:a.quickDrafts,pending:a.pendingQuickTimes,time:a.selectedTime,cases:a.cases,mode:a.mode}))});
async function touchAudit(p){return p.locator('.json-workbench').evaluate(root=>[...root.querySelectorAll('button,summary,input,textarea,select')].filter(e=>e.checkVisibility()&&!e.disabled&&e.type!=='hidden').flatMap(e=>{const target=e.matches('[type=checkbox],[type=radio]')?e.closest('label')||e:e,r=target.getBoundingClientRect();return r.width<43.9||r.height<43.9?[{label:e.getAttribute('aria-label')||e.textContent.trim().slice(0,60)||e.id,width:r.width,height:r.height}]:[]}))}
async function contrastAudit(p){return p.locator('.json-workbench').evaluate(root=>{
  const ctx=document.createElement('canvas').getContext('2d'),rgba=color=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].map((v,i)=>i===3?v/255:v)},blend=(front,back)=>[0,1,2].map(i=>front[i]*front[3]+back[i]*(1-front[3])).concat(1),background=e=>{const color=rgba(getComputedStyle(e).backgroundColor);return color[3]>=.999?color:blend(color,e.parentElement?background(e.parentElement):[255,255,255,1])},lum=c=>c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
  return [...root.querySelectorAll('.ai-send,.prompt-kind>button.active,.ai-mode-hint,.ai-input-meta small,.ai-brief-options>summary,.ai-tool-menu>summary')].filter(e=>e.checkVisibility()).map(e=>{const a=lum(rgba(getComputedStyle(e).color)),b=lum(background(e));return {label:e.getAttribute('aria-label')||e.textContent.trim().slice(0,45),ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)}})
})}
(async()=>{
  await fs.mkdir(output,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{channel:'chrome'})});
  try{
    const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await context.newPage(),errors=[];p.setDefaultTimeout(7000);p.on('pageerror',e=>errors.push(e.message));
    await p.goto('http://127.0.0.1:'+server.address().port);await ready(p);await p.getByRole('button',{name:'Bắt đầu với AI',exact:true}).click();
    await p.locator('.ai-suggestion-disclosure>summary').click();await p.locator('.ai-brief-options>summary').click();await p.getByLabel('Dùng số liệu của ca đang mở',{exact:false}).check();await p.locator('.ai-send-options>summary').click();await p.locator('.prompt-output>summary').click();
    const targets=await touchAudit(p);assert.deepEqual(targets,[],'Expanded AI touch targets: '+JSON.stringify(targets));
    for(const theme of ['light','dark']){await p.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);const contrast=await contrastAudit(p);assert.ok(contrast.every(x=>x.ratio>=4.5),'Text contrast '+theme+': '+JSON.stringify(contrast))}
    await p.getByLabel('Đổi công cụ AI',{exact:true}).focus();await p.keyboard.press('Enter');assert.equal(await p.locator('.ai-tool-menu').getAttribute('open'),'');await p.keyboard.press('Tab');assert.equal(await p.locator('.ai-tool-menu>div').evaluate(e=>e.contains(document.activeElement)),true);await p.keyboard.press('Escape');assert.equal(await p.locator('.ai-tool-menu').getAttribute('open'),null);assert.equal(await p.getByLabel('Đổi công cụ AI',{exact:true}).evaluate(e=>e===document.activeElement),true);
    for(let i=0;i<30;i++){await p.keyboard.press('Tab');assert.equal(await p.locator('.json-workbench').evaluate(e=>e.contains(document.activeElement)),true,'Modal retains keyboard focus')}
    await p.keyboard.press('Control+k');assert.equal(await p.locator('.command-dialog[open]').count(),0,'The AI modal must not open a second command dialog');
    await p.keyboard.press('Escape');assert.equal(await p.locator('.json-workbench').count(),0);
    assert.equal(await p.locator('.rail-ai-entry').evaluate(e=>e===document.activeElement),true,'Closing from a removed home trigger restores focus to the AI rail');
    console.log('PASS: expanded mobile targets, text contrast in both themes, provider menu keyboard/Escape, modal Tab containment and shortcut isolation');

    await p.getByRole('button',{name:'Trang bắt đầu',exact:true}).click();await p.getByRole('button',{name:'Trang chủ',exact:true}).click();await p.locator('.clinical-launch').click();
    await p.locator('#quick-fhr').fill('145');const pending=await snapshot(p);
    await p.locator('.rail-ai-entry').click();await p.getByRole('button',{name:'Bước 2: Nhập kết quả AI',exact:true}).click();
    await p.locator('.ai-reply-options>summary').click();await p.locator('.ai-notation-options>summary').click();assert.deepEqual(await touchAudit(p),[],'Reply controls have mobile touch targets');
    const sample={id:'CLINICAL-AI-TEST',fluidNotation:'vn',title:'Ca nhập thử',patient:{startTime:'10:00',date:'2026-10-25'},observations:[{time:0,fhr:140,cervix:4},{time:1,fhr:142}]};
    await p.locator('#json-workbench-input').fill(JSON.stringify(sample));await p.getByRole('button',{name:'Xem trước sản đồ',exact:true}).click();
    await p.locator('.ai-apply-options>summary').click();await p.locator('.ai-refinement>summary').click();assert.deepEqual(await touchAudit(p),[],'Review and refinement controls have mobile touch targets');
    await p.getByRole('button',{name:'Áp dụng',exact:true}).click();
    assert.match(await p.locator('.json-workbench-footer .error').textContent(),/bản nhập dở/);assert.deepEqual(await snapshot(p),pending,'AI import cannot replace a pending clinical entry');
    await p.getByRole('button',{name:'Đóng nhập JSON',exact:true}).click();await p.locator('#quick-fhr').press('Tab');
    await p.locator('#bedside-form button[type=submit]').click();const before=await snapshot(p);assert.equal(before.pending.length,0);
    await p.locator('.rail-ai-entry').click();await p.getByRole('button',{name:'Bước 2: Nhập kết quả AI',exact:true}).click();await p.getByRole('button',{name:'Xem trước sản đồ',exact:true}).click();await p.getByRole('button',{name:'Áp dụng',exact:true}).click();
    assert.equal((await snapshot(p)).clinical.id,sample.id);assert.deepEqual((await snapshot(p)).cases,before.cases);
    await p.keyboard.press('Control+z');const undone=await snapshot(p);assert.deepEqual(undone.clinical,before.clinical);assert.equal(undone.time,before.time);
    await p.screenshot({path:path.join(output,'clinical-ai-undo-mobile.png')});
    assert.deepEqual(errors,[]);console.log('PASS: AI-to-clinical import preserves pending entries, saves explicitly, imports without changing exam cases and undoes to the original data/time');
    await context.close();
  }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1;server.close()});
