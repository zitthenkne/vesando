// Browser checks: set PLAYWRIGHT_MODULE and, if needed, CHROME_EXECUTABLE.
// Đợt 11: reference bands beside quick entry (neutral/green/red, follow the standard) and the always-visible tool dock.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const files={'/':'index.html','/index.html':'index.html','/interaction.css':'interaction.css','/theme.css':'theme.css','/canvas.css':'canvas.css','/workspace.css':'workspace.css','/studio.css':'studio.css','/clinical-rules.js':'clinical-rules.js','/guidance.js':'guidance.js','/enhancements.js':'enhancements.js'};
const server=http.createServer(async(req,res)=>{const file=files[new URL(req.url,'http://localhost').pathname];if(!file){res.writeHead(404);res.end();return}try{const bytes=await fs.readFile(path.join(__dirname,file));res.setHeader('Content-Type',(file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':'text/html')+'; charset=utf-8');res.end(bytes)}catch{res.writeHead(500);res.end()}});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{channel:'chrome'})});
  try{
    for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
      const page=await browser.newPage({viewport}),errors=[];page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));
      await page.goto(url);await page.waitForSelector('#app:not([v-cloak])');
      await page.getByText('Theo dõi chuyển dạ',{exact:true}).first().click();
      // Empty chart shows the three-step start card; it leaves once a value is recorded.
      const start=page.locator('.chart-empty-start');assert.equal(await start.count(),1);
      await start.getByRole('button',{name:'Ghi số đo đầu tiên'}).click();
      await page.fill('#quick-cervix','4');await page.getByRole('button',{name:'Ghi nhận',exact:true}).first().click();
      await page.waitForFunction(()=>!document.querySelector('.chart-empty-start'));
      const band=key=>page.locator('label.field:has(#quick-'+key+') .quick-range');
      assert.match(await band('fhr').textContent(),/^Ngưỡng 120–160$/);
      assert.equal(await band('cervix').count(),0,'Cervix has no fixed band');
      await page.fill('#quick-fhr','172');assert.match(await band('fhr').getAttribute('class'),/\balert\b/);assert.match(await band('fhr').textContent(),/Cao hơn ngưỡng 120–160/);
      await page.fill('#quick-fhr','100');assert.match(await band('fhr').textContent(),/Thấp hơn ngưỡng/);
      await page.fill('#quick-fhr','140');assert.match(await band('fhr').getAttribute('class'),/\bok\b/);
      await page.fill('#quick-contractions','6');assert.match(await band('contractions').getAttribute('class'),/\balert\b/);
      await page.fill('#quick-pulse','88');assert.match(await band('pulse').getAttribute('class'),/\bok\b/);
      // The band text follows the selected standard.
      await page.evaluate(()=>{document.querySelector('#app')._vnode.component.setupState.standard='lcg'});
      await page.fill('#quick-fhr','159');assert.match(await band('fhr').textContent(),/Trong ngưỡng 110–159/);
      await page.fill('#quick-fhr','160');assert.match(await band('fhr').getAttribute('class'),/\balert\b/);
      // Dock: one tap opens the main jobs; tapping the active one returns to the chart.
      await page.evaluate(()=>document.activeElement?.blur());const dock=page.locator('.quick-dock');assert.ok(await dock.isVisible());
      const box=await dock.boundingBox();
      if(viewport.width>1100)assert.ok(box.x<20&&box.height>box.width,'Desktop dock is a left rail');
      else assert.ok(box.y+box.height>=viewport.height-1&&box.width>=viewport.width-1,'Phone dock is a bottom bar');
      await page.locator('#quick-fhr').focus();
      if(viewport.width<=1100)assert.equal(await dock.isVisible(),false,'Dock yields to the on-screen keyboard');
      await page.locator('#quick-fhr').blur();
      await page.goto(url);await page.waitForSelector('#app:not([v-cloak])');
      await page.getByText('Soạn đề',{exact:true}).first().click();await page.getByText('Viết đề mới',{exact:true}).first().click();
      if(viewport.width<=1100)await page.locator('.close-toolbox-button').first().click();
      await page.evaluate(()=>document.activeElement?.blur());const design=page.locator('.quick-dock button.dock-design');await design.click();
      assert.equal(await design.getAttribute('aria-pressed'),'true');
      const state=()=>page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.toolTab);
      assert.equal(await state(),'design');
      if(viewport.width<=1100)await page.locator('.close-toolbox-button').first().click();else await design.click();
      assert.equal(await state(),'overview');
      assert.equal(await page.locator('.quick-dock button.dock-ai').count(),1,'Exam dock offers AI');
      // Exam review reads the chart: empty case gives no false reassurance; a sample shows sourced findings.
      if(viewport.width<=1100)await page.locator('.close-toolbox-button').first().click().catch(()=>{});
      await page.locator('.quick-dock button.dock-review').click();
      assert.equal(await page.locator('.exam-reading .reading-ok').count(),0,'No reassurance without data');
      await page.evaluate(async()=>{const st=document.querySelector('#app')._vnode.component.setupState;st.libraryOpen=true;st.toolTab='data';st.inputsOpen=true});
      await page.getByText('Tim thai giảm · cơn co nhiều').first().click();
      if(viewport.width<=1100)await page.locator('.close-toolbox-button').first().click().catch(()=>{});
      await page.locator('.quick-dock button.dock-review').click();
      const reading=page.locator('.exam-reading');assert.match(await reading.getAttribute('class'),/\bcritical\b/);
      assert.ok(await reading.locator('li.critical').count()>=1);assert.match(await reading.textContent(),/Nguồn:/);
      // Presenter steps through moments; captions show readings and sourced findings at that time; Esc closes.
      if(viewport.width<=1100)await page.locator('.close-toolbox-button').first().click().catch(()=>{});
      await page.locator('.quick-dock button.dock-present').click();
      const presenter=page.locator('.presenter');await presenter.waitFor();
      await presenter.press('Space');assert.match(await presenter.locator('.presenter-progress').textContent(),/Mốc 1 \/ 8/);
      for(let k=0;k<7;k++)await presenter.press('ArrowRight');
      assert.match(await presenter.locator('.presenter-progress').textContent(),/11:30.*Mốc 8 \/ 8/);
      assert.ok(await presenter.locator('.presenter-chips span.alert').count()>=1);assert.match(await presenter.textContent(),/Nguồn:/);
      assert.equal(await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.viewTime),3.5,'Chart follows the presenter');
      await presenter.press('Escape');assert.equal(await presenter.count(),0);
      assert.deepEqual(errors,[]);await page.close();
    }
    console.log('PASS: reference bands and tool dock');
  }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
