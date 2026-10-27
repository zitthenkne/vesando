// Layout guard: no visible control is painted over another, nothing leaves the viewport and toasts stay pill-sized,
// across phone → wide desktop and the main editor states. Scrolled content under sticky/fixed chrome is allowed.
const ROOT=require('node:path').join(__dirname,'..');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assets=new Set(['index.html','base.css','core.js','components.js','app.js','canva.css','canva.js','workspace-next.js','workspace-next.css','studio.css','workspace.css','interaction.css','theme.css','canvas.css','clinical-rules.js','guidance.js','enhancements.js']);
const server=http.createServer(async(req,res)=>{
  const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!assets.has(file)){res.writeHead(404);res.end();return}
  try{res.setHeader('Content-Type',(file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':'text/html')+';charset=utf-8');res.end(await fs.readFile(path.join(ROOT,file)))}catch{res.writeHead(500);res.end()}
});
const app=(p,fn)=>p.evaluate(src=>(0,eval)('('+src+')')(document.querySelector('#app')._vnode.component.setupState),fn.toString());
// Runs in the page.
function audit(){
  const sel='button,summary,a[href],input:not([type=hidden]),select,textarea,label,.zoom-readout,.next-time-heading>strong,.session-title,.cv-pages-toggle,.standard-picker,.next-moment-track,.canvas-navigation,.next-canvas-controls,.chart-viewbar,.next-context,.cv-page';
  const scroller=e=>{for(let a=e.parentElement;a&&a!==document.body;a=a.parentElement){const s=getComputedStyle(a);if(/(auto|scroll)/.test(s.overflow+s.overflowX+s.overflowY)&&(a.scrollHeight>a.clientHeight+1||a.scrollWidth>a.clientWidth+1))return a}return null};
  const sticky=e=>{for(let a=e;a&&a!==document.body;a=a.parentElement)if(getComputedStyle(a).position==='sticky')return a;return null};
  const vis=e=>{
    const r=e.getBoundingClientRect();if(r.width<2||r.height<2)return null;
    const d=e.parentElement?.closest('details');if(d&&!d.open&&!d.querySelector(':scope>summary')?.contains(e))return null;
    const cs=getComputedStyle(e);if(cs.visibility==='hidden'||+cs.opacity===0)return null;
    for(let a=e;a;a=a.parentElement)if(getComputedStyle(a).display==='none')return null;
    for(let a=e.parentElement;a&&a!==document.body;a=a.parentElement){const s=getComputedStyle(a);if(/(auto|scroll|hidden|clip)/.test(s.overflow+s.overflowX+s.overflowY)){const b=a.getBoundingClientRect();if(r.right<=b.left+1||r.left>=b.right-1||r.bottom<=b.top+1||r.top>=b.bottom-1)return null}}
    return r};
  const name=e=>(e.getAttribute('aria-label')||e.innerText||e.className||e.tagName).toString().trim().replace(/\s+/g,' ').slice(0,40);
  const els=[...document.querySelectorAll(sel)].filter(e=>!e.closest('.toast,.cv-tip')).map(e=>({e,r:vis(e)})).filter(x=>x.r);
  const issues=[];
  for(const {e,r} of els)if((r.left<-1||r.right>innerWidth+1)&&!scroller(e))issues.push('offscreen: '+name(e));
  // Text spilling out of a squeezed button runs into its neighbours even though the boxes do not overlap.
  for(const {e} of els)if(e.matches('button,summary')&&getComputedStyle(e).overflowX==='visible'&&e.scrollWidth>e.clientWidth+2)issues.push('text spills out of: '+name(e));
  for(let i=0;i<els.length;i++)for(let j=i+1;j<els.length;j++){
    const A=els[i],B=els[j];if(A.e.contains(B.e)||B.e.contains(A.e))continue;
    if(A.e.closest('label')&&A.e.closest('label')===B.e.closest('label'))continue;
    const w=Math.min(A.r.right,B.r.right)-Math.max(A.r.left,B.r.left),h=Math.min(A.r.bottom,B.r.bottom)-Math.max(A.r.top,B.r.top);
    if(w<=3||h<=3)continue;
    const top=document.elementFromPoint(Math.max(A.r.left,B.r.left)+w/2,Math.max(A.r.top,B.r.top)+h/2);if(!top)continue;
    const onA=A.e.contains(top)||top.contains(A.e),onB=B.e.contains(top)||top.contains(B.e);
    const under=(x,y)=>{const s=scroller(x);return s&&!s.contains(y)},stk=(x,y)=>{const s=sticky(y);return s&&!s.contains(x)};
    if(onB&&!onA&&(under(A.e,B.e)||stk(A.e,B.e))||onA&&!onB&&(under(B.e,A.e)||stk(B.e,A.e)))continue;
    issues.push('overlap: '+name(A.e)+' × '+name(B.e));
  }
  if(document.documentElement.scrollWidth>innerWidth+1)issues.push('page scrolls sideways');
  return issues;
}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{channel:'chrome'})});
  const failures=[];
  try{
    const url='http://127.0.0.1:'+server.address().port;
    for(const [w,h] of [[2000,1015],[1366,768],[1024,768],[900,900],[390,844]]){
      const ctx=await browser.newContext({viewport:{width:w,height:h},reducedMotion:'reduce'}),p=await ctx.newPage(),errors=[];
      p.setDefaultTimeout(8000);p.on('pageerror',e=>errors.push(e.message));
      await p.goto(url);await p.waitForSelector('#app:not([v-cloak])');
      const states=[
        ['home',async()=>{}],
        ['design',async()=>{await p.locator('.home-template-disclosure>summary').click();await p.locator('.template-card').first().click()}],
        ['data',()=>app(p,a=>a.work.open('entry'))],
        ['select',()=>app(p,async a=>{await a.work.open('layers');const t=Math.max(...a.activeCase.observations.filter(o=>o.fhr!=null&&o.fhr!=='').map(o=>o.time));a.work.go(t);a.work.select({type:'point',field:'fhr',time:t});await a.work.ensureSelected()})],
        // A real click opens both the top properties toolbar and the mini-bar by the point; they must not collide.
        ['click point',async()=>{await app(p,a=>{a.work.clearSelection();a.work.close()});const pt=p.locator('.workarea svg.partograph [data-point-hit]').nth(3);await pt.scrollIntoViewIfNeeded();const b=await pt.boundingBox();await p.mouse.click(b.x+b.width/2,b.y+b.height/2);await p.mouse.move(2,h-2)}],
        ['two cases',()=>app(p,a=>{a.work.clearSelection();a.duplicateCase(a.activeCaseIndex)})],
        ['export',()=>app(p,a=>a.work.open('export'))],
        ['present',()=>app(p,a=>{a.work.close();a.work.changeSpace('present')})]];
      for(const [state,go] of states){
        await go();await p.waitForTimeout(400);
        for(const issue of await p.evaluate(audit))failures.push(`${w}x${h} ${state}: ${issue}`);
      }
      // A toast is a single pill under the top bar, never stretched.
      await app(p,a=>{a.toast='Đã nhân bản độc lập; sửa bản sao để tạo biến thể';a.toastTone='success'});await p.waitForTimeout(200);
      const t=await p.locator('.toast').boundingBox();
      if(!t||t.height>72||t.x<0||t.x+t.width>w)failures.push(`${w}x${h}: toast box ${JSON.stringify(t)}`);
      if(errors.length)failures.push(`${w}x${h}: page errors ${errors.join(' | ')}`);
      await ctx.close();
    }
    assert.deepEqual(failures,[],failures.join('\n'));
    console.log('PASS: no overlapping or off-screen controls and pill-sized toasts at 2000/1366/1024/900/390 px across home, design, data, selection, two cases, export and present');
  }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e.message||e);process.exitCode=1;server.close()});
