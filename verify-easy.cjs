// Browser checks: set PLAYWRIGHT_MODULE and, if needed, CHROME_EXECUTABLE.
// Đợt 11–12: reference bands, empty-chart start card, rail → panel → canvas order, exam clinical reading and the presenter.
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
      // Template gallery: every preset has a rendered thumbnail and opens as a new editable exam case.
      assert.equal(await page.locator('.template-card').count(),7);
      assert.equal(await page.locator('.template-card img[src^="data:image/svg+xml"]').count(),7);
      await page.locator('.template-card',{hasText:'Tăng huyết áp · đạm niệu'}).click();
      assert.equal(await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.activeCase.title),'Tăng huyết áp trong chuyển dạ');
      // Maternal findings are read under the default historical chart too, with a source.
      assert.deepEqual(await page.evaluate(()=>{const st=document.querySelector('#app')._vnode.component.setupState;return st.presetList.map(c=>assessment(c,'who1993').checks.map(x=>x.code).filter(k=>/^(maternal|prolonged)/.test(k)))}),[[],['maternal-pulse'],[],['prolonged-latent'],['maternal-fever','maternal-pulse'],['maternal-bp'],[]]);
      // Exam pack: the question sheet carries the chart and narrative; the answer key adds sourced findings per moment on its own page.
      const pack=await page.evaluate(()=>{const st=document.querySelector('#app')._vnode.component.setupState;return {key:st.examPackHTML(st.activeCase,true),sheet:st.examPackHTML(st.activeCase,false)}});
      assert.match(pack.sheet,/<svg[^>]*viewBox/);assert.match(pack.sheet,/Tình huống/);assert.doesNotMatch(pack.sheet,/Đáp án gợi ý/);
      assert.match(pack.key,/class="key"/);assert.match(pack.key,/ISSHP 2021/);assert.equal((pack.key.match(/<tr><td>/g)||[]).length,5,'One row per recorded moment');
      // Question prompt: data-bound instructions for an external AI, one line per recorded moment, with sourced findings.
      const qp=await page.evaluate(()=>{const st=document.querySelector('#app')._vnode.component.setupState;return st.questionPrompt(st.activeCase)});
      assert.match(qp,/soạn 5 câu hỏi trắc nghiệm/);assert.equal((qp.match(/^- \d\d:\d\d:/gm)||[]).length,5);assert.match(qp,/ISSHP 2021/);assert.match(qp,/chỉ dùng dữ liệu bên dưới/);
      await page.locator('.creation-rail > button',{hasText:'Xuất tệp'}).click();
      const [file]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Tải tệp HTML'}).click()]);assert.equal(file.suggestedFilename(),'de-CASE-006-dap-an.html');
      await page.getByRole('button',{name:'In đề + đáp án'}).click();await page.waitForSelector('iframe.print-frame',{state:'attached'});
      await page.goto(url);await page.waitForSelector('#app:not([v-cloak])');
      await page.locator('.home-launch.clinical-launch').click();await page.waitForSelector('#quick-cervix');
      // Template integrity: a broken tag leaves raw mustaches on screen (caught once in the patient panel).
      assert.equal(await page.evaluate(()=>document.body.innerText.includes('{{')),false,'No uncompiled template text');
      assert.equal(await page.locator('.home-launch').count(),0);
      // Quick entry follows the bedside routine: frequent checks first, vaginal examination second; origin collapses after the first record.
      assert.deepEqual(await page.locator('.quick-fields input').evaluateAll(n=>n.map(i=>i.id)),['quick-fhr','quick-contractions','quick-duration','quick-pulse','quick-cervix','quick-descent']);
      assert.deepEqual(await page.locator('.quick-group-label').allInnerTexts(),['THEO DÕI THƯỜNG XUYÊN','KHÁM TRONG']);
      // Empty chart shows the three-step start card; it leaves once a value is recorded.
      const start=page.locator('.chart-empty-start');assert.equal(await start.count(),1);
      await start.getByRole('button',{name:'Ghi số đo đầu tiên'}).click();
      await page.fill('#quick-cervix','4');await page.getByRole('button',{name:'Ghi nhận',exact:true}).first().click();
      await page.waitForFunction(()=>!document.querySelector('.chart-empty-start'));
      assert.equal(await page.locator('#quick-date').count(),0,'Start date/time collapses once data exists');
      await page.locator('.origin-summary').click();assert.equal(await page.locator('#quick-date').count(),1);await page.locator('.origin-done').click();
      // Clinical alert mode: a normal value raises nothing; a new out-of-range value tints the screen, names it and rings the point.
      await page.getByRole('radio',{name:'Lâm sàng'}).click();
      await page.evaluate(()=>{document.querySelector('#app')._vnode.component.setupState.selectedTime=1});
      await page.fill('#quick-fhr','140');await page.getByRole('button',{name:'Ghi nhận',exact:true}).first().click();
      assert.equal(await page.locator('.alarm-banner').count(),0,'No alarm for an in-range value');
      await page.evaluate(()=>{document.querySelector('#app')._vnode.component.setupState.selectedTime=1.5});
      await page.fill('#quick-fhr','92');await page.getByRole('button',{name:'Ghi nhận',exact:true}).first().click();
      await page.locator('.alarm-banner').waitFor();assert.match(await page.locator('.alarm-banner').textContent(),/Báo động · 09:30.*Tim thai 92/);
      assert.equal(await page.locator('.alarm-tint.critical').count(),1);await page.locator('.alarm-ring').first().waitFor();
      assert.match(await page.locator('.alarm-banner').textContent(),/ngưỡng 120–160 lần\/phút/);
      await page.getByRole('button',{name:'Đã xem'}).click();assert.equal(await page.locator('.alarm-tint').count(),0);
      assert.equal(await page.locator('.case-card:visible circle.alert-mark').count(),1,'The abnormal point stays ringed after acknowledgement');
      assert.match(await page.locator('.alarm-log').textContent(),/Nhật ký cảnh báo.*09:30.*Đã xem \d\d:\d\d/s);
      // Maternal vitals are ringed too: a fever and a fast pulse recorded at a new moment.
      await page.evaluate(()=>{const st=document.querySelector('#app')._vnode.component.setupState;st.selectedTime=1.5;st.setQuickField('pulse','112');st.setQuickField('temperature','38.6')});
      await page.getByRole('button',{name:'Ghi nhận',exact:true}).first().click();await page.locator('.alarm-banner').waitFor();
      assert.match(await page.locator('.alarm-banner').textContent(),/Nhiệt độ 38,6 °C \(ngưỡng < 38 °C\).*Mạch mẹ 112 lần\/phút \(ngưỡng ≤ 100 lần\/phút\)/s);
      assert.equal(await page.locator('.case-card:visible [data-mark="pulse@1.5"]').count(),1);assert.equal(await page.locator('.case-card:visible [data-mark="temperature@1.5"]').count(),1);
      await page.getByRole('button',{name:'Đã xem'}).click();
      await page.getByRole('radio',{name:'Học tập'}).click();
      await page.evaluate(()=>{document.querySelector('#app')._vnode.component.setupState.selectedTime=2});
      await page.fill('#quick-fhr','190');await page.getByRole('button',{name:'Ghi nhận',exact:true}).first().click();
      assert.equal(await page.locator('.alarm-banner').count(),0,'Learning mode keeps the explanatory display only');
      assert.equal(await page.locator('.case-card:visible circle.alert-mark').count(),0,'No persistent rings in learning mode');
      await page.evaluate(()=>{document.querySelector('#app')._vnode.component.setupState.selectedTime=0});
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
      // Wide screens: rail → panel → canvas, left to right (Canva order); the panel resizer grows to the right.
      const rail=name=>page.locator('.creation-rail > button',{hasText:name}).first();
      const state=()=>page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.toolTab);
      await page.goto(url);await page.waitForSelector('#app:not([v-cloak])');
      await page.locator('.home-launch.exam-launch').click();await page.waitForSelector('.creation-rail');
      if(viewport.width<=1100)await page.locator('.close-toolbox-button').first().click().catch(()=>{});
      // Exam steps: a new exam starts at the brief; visiting Kiểm tra marks that step done.
      assert.match(await page.locator('.exam-steps li.next').innerText(),/Đề bài & sản phụ/);
      if(viewport.width<=1100)await page.locator('.close-toolbox-button').first().click().catch(()=>{});
      await page.locator('.exam-steps button',{hasText:'Kiểm tra'}).click();assert.equal(await state(),'review');
      assert.match(await page.locator('.exam-steps li',{hasText:'Kiểm tra'}).getAttribute('class'),/\bdone\b/);
      if(viewport.width<=1100)await page.locator('.close-toolbox-button').first().click().catch(()=>{});
      assert.equal(await page.evaluate(()=>document.body.innerText.includes('{{')),false);
      await rail('Trình bày').click();assert.equal(await state(),'design');
      if(viewport.width>1100){
        const panel=await page.locator('.inspector-shell').boundingBox(),work=await page.locator('.workbench>.workarea').boundingBox(),railBox=await page.locator('.creation-rail').boundingBox();
        assert.ok(railBox.x<panel.x&&panel.x+panel.width<=work.x+1,'Rail, panel, canvas in order');
        const handle=await page.locator('.panel-resizer').boundingBox();
        await page.mouse.move(handle.x+handle.width/2,handle.y+40);await page.mouse.down();await page.mouse.move(handle.x+60,handle.y+40,{steps:4});await page.mouse.up();
        assert.ok((await page.locator('.inspector-shell').boundingBox()).width>panel.width+40,'Dragging right widens a left panel');
      }
      await page.locator('.close-toolbox-button').first().click();assert.equal(await state(),'overview');
      // Exam review reads the chart: empty case gives no false reassurance; a sample shows sourced findings.
      await rail('Kiểm tra').click();
      assert.equal(await page.locator('.exam-reading .reading-ok').count(),0,'No reassurance without data');
      await page.evaluate(async()=>{const st=document.querySelector('#app')._vnode.component.setupState;st.libraryOpen=true;st.toolTab='data';st.inputsOpen=true});
      await page.getByText('Tim thai giảm · cơn co nhiều').first().click();
      if(viewport.width<=1100)await page.locator('.close-toolbox-button').first().click().catch(()=>{});
      await rail('Kiểm tra').click();
      const reading=page.locator('.exam-reading');assert.match(await reading.getAttribute('class'),/\bcritical\b/);
      assert.ok(await reading.locator('li.critical').count()>=1);assert.match(await reading.textContent(),/Nguồn:/);
      // Standards comparison: three models side by side; findings not shared by all are marked; Esc closes and returns focus.
      await page.locator('.compare-open').click();await page.locator('.compare-dialog').waitFor();
      assert.equal(await page.locator('.compare-col').count(),3);assert.equal(await page.evaluate(()=>document.activeElement.className),'compare-dialog');
      assert.ok(await page.locator('.compare-col').nth(2).locator('li.unique').count()>=2,'LCG-only criteria are marked');
      await page.keyboard.press('Escape');assert.equal(await page.locator('.compare-dialog').count(),0);
      // Presenter steps through moments; captions show readings and sourced findings at that time; Esc closes.
      if(viewport.width<=1100)await page.locator('.close-toolbox-button').first().click().catch(()=>{});
      await rail('Diễn biến').click();
      const presenter=page.locator('.presenter');await presenter.waitFor();
      await presenter.press('Space');assert.match(await presenter.locator('.presenter-progress').textContent(),/Mốc 1 \/ 8/);
      for(let k=0;k<7;k++)await presenter.press('ArrowRight');
      assert.match(await presenter.locator('.presenter-progress').textContent(),/11:30.*Mốc 8 \/ 8/);
      assert.ok(await presenter.locator('.presenter-chips span.alert').count()>=1);assert.match(await presenter.textContent(),/Nguồn:/);
      assert.equal(await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.viewTime),3.5,'Chart follows the presenter');
      // "Che dữ liệu sau mốc": the chart shows only moments up to the current one; closing restores everything.
      const fhrPoints=()=>page.locator('.case-card:visible [data-observation-field="fhr"]').count(),allPoints=await fhrPoints();
      await presenter.locator('.presenter-reveal').click();await presenter.press('Home').catch(()=>{});
      for(let k=0;k<7;k++)await presenter.press('ArrowLeft');
      assert.equal(await fhrPoints(),allPoints/8,'Only the first moment is drawn');
      await presenter.press('ArrowRight');assert.equal(await fhrPoints(),allPoints/4);
      await presenter.locator('.presenter-reveal').click();assert.equal(await fhrPoints(),allPoints);
      await presenter.press('Escape');assert.equal(await presenter.count(),0);
      assert.deepEqual(errors,[]);await page.close();
    }
    // Measurement schedule against a fixed clock: 13:10 with FHR last at 12:00 (every 30 min) is 40 minutes overdue; a chip opens the entry.
    {const page=await browser.newPage({viewport:{width:1440,height:900}});await page.clock.install({time:new Date('2026-10-25T13:10:00')});
      await page.goto(url);await page.waitForSelector('#app:not([v-cloak])');await page.locator('.home-launch.clinical-launch').click();await page.waitForSelector('#quick-cervix');
      await page.getByRole('radio',{name:'Lâm sàng'}).click();
      await page.evaluate(()=>{const st=document.querySelector('#app')._vnode.component.setupState;st.clinical={...st.clinical,patient:{...st.clinical.patient,date:'2026-10-25',startTime:'08:00'},observations:JSON.parse(JSON.stringify(st.presetList[0].observations.slice(0,9)))}});
      const chip=page.locator('.measure-chip',{hasText:'Tim thai'});assert.match(await chip.getAttribute('class'),/\boverdue\b/);assert.match(await chip.textContent(),/Quá hạn 40 phút/);assert.match(await chip.getAttribute('title'),/đến hạn 12:30/);
      assert.equal(await page.locator('.alarm-banner').count(),0,'Loading a whole record set does not raise an alarm');
      assert.match(await page.locator('.measure-chip',{hasText:'Khám CTC'}).textContent(),/Đến hạn 16:00/);
      // Shift handover page carries the schedule state, current reading and chart; the button prepares a print frame.
      const handover=await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.handoverHTML());
      assert.match(handover,/Bàn giao theo dõi chuyển dạ/);assert.match(handover,/Quá hạn 40 phút \(đến hạn 12:30\)/);assert.match(handover,/<svg[^>]*viewBox/);
      await page.locator('.handover-btn').click();await page.waitForSelector('iframe.print-frame',{state:'attached'});
      await chip.click();assert.equal(await page.evaluate(()=>document.activeElement.id),'quick-fhr');await page.close()}
    console.log('PASS: reference bands, empty-chart start, rail/panel order, clinical reading and presenter');
  }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
