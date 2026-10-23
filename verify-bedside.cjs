// Bedside input regression: PLAYWRIGHT_MODULE may point to an existing Playwright install.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const os = require('node:os');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const files = new Set(['index.html','studio.css','workspace.css','interaction.css','theme.css','canvas.css','clinical-rules.js','guidance.js','enhancements.js']);
const server = http.createServer(async (req, res) => {
  const file = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
  if (!files.has(file)) { res.writeHead(404); res.end(); return; }
  try {
    res.setHeader('Content-Type', (file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'application/javascript' : 'text/html') + '; charset=utf-8');
    res.end(await fs.readFile(path.join(__dirname, file)));
  } catch { res.writeHead(500); res.end(); }
});
const state = p => p.evaluate(() => {
  const a = document.querySelector('#app')._vnode.component.setupState;
  return JSON.parse(JSON.stringify({clinical:a.clinical, cases:a.cases, time:a.selectedTime, drafts:a.quickDrafts, pending:a.pendingQuickTimes, mode:a.mode, auto:a.deviceAuto, current:a.deviceCurrent, inspector:a.inspectorOpen, sheet:a.sheetOpen}));
});
const ready = p => p.waitForSelector('#app:not([v-cloak])');
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  let browser;
  try {
    browser = await chromium.launch({headless:true, ...(process.env.CHROME_EXECUTABLE ? {executablePath:process.env.CHROME_EXECUTABLE} : {channel:'chrome'})});
    const context = await browser.newContext({viewport:{width:1440,height:1000}, reducedMotion:'reduce'});
    const page = await context.newPage(), errors = [];
    page.setDefaultTimeout(12000);
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:' + server.address().port); await ready(page);
    const exam = (await state(page)).cases.map(({short,subtitle,...c})=>c);
    await page.getByRole('radio', {name:'Theo dõi', exact:true}).click();
    const rail = page.locator('.bedside-entry'), chart = page.locator('.clinical-chart-card');
    assert.equal(await rail.isVisible(), true);
    assert.equal((await state(page)).inspector, false);
    let rb = await rail.boundingBox(), cb = await chart.boundingBox();
    assert.ok(rb.x >= cb.x + cb.width && Math.abs(rb.y - cb.y) < 2, 'Desktop inputs sit directly beside the chart');
    await page.locator('#quick-fhr').fill('140'); await page.locator('#quick-cervix').fill('4');
    assert.equal((await state(page)).clinical.observations[0].fhr, null, 'Draft numbers are not silently recorded');
    await rail.locator('button[type=submit]').click();
    assert.equal((await state(page)).clinical.observations[0].fhr, 140);
    assert.ok(await chart.locator('[data-observation-field=fhr][data-observation-time="0"]').count(), 'The chart redraws the committed measurement');
    await page.getByRole('button', {name:'Tiến mốc 30 phút', exact:true}).click();
    assert.equal(await page.locator('#quick-fhr').inputValue(), '');
    assert.match(await page.locator('#quick-fhr').getAttribute('placeholder'), /140/);
    await page.locator('#quick-fhr').fill('142');
    await page.getByRole('button', {name:'Tiến mốc 30 phút', exact:true}).click();
    await page.locator('#quick-pulse').fill('85');
    await page.getByRole('button', {name:'Lùi mốc 30 phút', exact:true}).click();
    assert.equal(await page.locator('#quick-fhr').inputValue(), '142', 'Each time keeps its own unfinished input');
    await page.getByRole('button', {name:'Ghi & mốc tiếp', exact:true}).click();
    let s = await state(page);
    assert.equal(s.time, 1); assert.equal(s.clinical.observations.some(o => o.time === 1), false);
    assert.equal(await page.locator('#quick-pulse').inputValue(), '85');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'quick-fhr');
    await page.locator('#quick-fhr').fill('144'); await page.locator('#quick-fhr').press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'quick-cervix');
    await page.locator('#quick-cervix').press('Control+Enter');
    assert.equal((await state(page)).clinical.observations.find(o => o.time === 1).pulse, 85);
    const beforeInvalid = (await state(page)).clinical;
    await page.locator('#quick-fhr').fill('999'); await rail.locator('button[type=submit]').click();
    assert.deepEqual((await state(page)).clinical, beforeInvalid, 'Native validation blocks invalid measurements');
    await page.locator('#quick-fhr').fill('145'); await rail.locator('button[type=submit]').click();
    await page.locator('[data-entry-group=maternal]>summary').click();
    await page.locator('#quick-systolic').fill('120'); await page.locator('#quick-diastolic').fill('80');
    await page.locator('#quick-temperature').fill('37.2'); await rail.locator('button[type=submit]').click();
    s = await state(page); const o = s.clinical.observations.find(o => o.time === 1);
    assert.equal(o.systolic,120); assert.equal(o.diastolic,80); assert.equal(o.temperature,37.2);
    await page.locator('[data-entry-group=maternal]>summary').click();
    await page.screenshot({path:path.join(os.tmpdir(),'vesando-bedside-desktop.png'),fullPage:true});
    console.log('PASS: side-by-side recording, redraw, per-time drafts, previous-value hints, Enter/Ctrl Enter, validation, maternal fields and record/next');

    await rail.getByRole('checkbox', {name:'Tự lưu trên máy này', exact:true}).check();
    await page.waitForFunction(() => document.querySelector('#app')._vnode.component.setupState.deviceCurrent);
    await page.locator('#quick-fhr').fill('146');
    await page.waitForFunction(() => document.querySelector('#app')._vnode.component.setupState.deviceCurrent);
    await page.reload(); await ready(page);
    s = await state(page); assert.equal(s.auto, true); assert.equal(s.drafts[1].fhr, '146');
    assert.equal(s.clinical.observations.find(o => o.time === 1).fhr, 145);
    await page.locator('.quick-entry button[type=submit]').click();
    console.log('PASS: opt-in local autosave restores committed values and unfinished drafts separately');

    for (const width of [320,390,768,1024,1440]) for (const theme of ['light','dark']) {
      await page.setViewportSize({width,height:900});
      await page.evaluate(async ({theme,width}) => {const a=document.querySelector('#app')._vnode.component.setupState;a.theme=theme;a.bedsideOpen=width>760;await a.selectTool('overview');await Vue.nextTick();window.scrollTo(0,0)},{theme,width});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, width+' '+theme+' page overflow');
      if (width <= 760) {
        assert.equal(await page.locator('#quick-fhr').isVisible(), false);
        await page.locator('.bedside-toggle').click();
        assert.equal(await page.locator('#quick-fhr').isVisible(), true);
        assert.equal((await state(page)).sheet, false);
        assert.equal(await page.locator('.workarea').getAttribute('inert'), null, 'The chart remains interactive');
        assert.equal(await page.locator('.toolbox-backdrop').count(), 0);
        assert.ok((await chart.locator('svg.partograph').boundingBox()).y < (await rail.boundingBox()).y, 'The actual chart stays visible above the dock');
        const save = rail.locator('button[type=submit]');
        await save.scrollIntoViewIfNeeded();
        const sb = await save.boundingBox(); rb = await rail.boundingBox();
        assert.ok(sb.width>=44 && sb.height>=44 && sb.y>=rb.y && sb.y+sb.height<=rb.y+rb.height+1, 'Save is reachable inside the non-modal dock');
        const nextFhr=(await state(page)).clinical.observations.find(o=>o.time===1).fhr+1;
        await page.locator('#quick-fhr').fill(String(nextFhr));
        await page.locator('.bedside-toggle').click();
        assert.equal((await state(page)).drafts[1].fhr, String(nextFhr));
        await page.evaluate(async()=>document.querySelector('#app')._vnode.component.setupState.openClinicalEntry());
        assert.equal(await page.evaluate(() => document.activeElement.id), 'quick-fhr');
        await save.click();
        assert.equal((await state(page)).clinical.observations.find(o=>o.time===1).fhr,nextFhr);
      } else {
        rb = await rail.boundingBox(); cb = await chart.boundingBox();
        assert.ok(rb.x>=cb.x+cb.width && Math.abs(rb.y-cb.y)<2);
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if ([390,1440].includes(width)) await page.screenshot({path:path.join(os.tmpdir(),'vesando-bedside-'+width+'-'+theme+'.png')});
    }
    await page.setViewportSize({width:390,height:900});
    await page.evaluate(async()=>document.querySelector('#app')._vnode.component.setupState.openClinicalEntry());
    const previousFhr=(await state(page)).clinical.observations.find(o=>o.time===1).fhr;
    await page.locator('#quick-fhr').fill('90');await rail.locator('button[type=submit]').click();
    assert.equal(await page.locator('.clinical-assessment.critical').isVisible(),true,'Clinical warnings stay visible while the mobile input dock is expanded');
    await page.locator('#quick-fhr').fill(String(previousFhr));await rail.locator('button[type=submit]').click();
    await page.evaluate(async()=>{await document.querySelector('#app')._vnode.component.setupState.openClinicalEntry('systolic')});
    assert.equal(await page.evaluate(()=>document.activeElement.id),'quick-systolic');
    await page.setViewportSize({width:390,height:480});
    await page.locator('#quick-systolic').fill('121');
    let compactSave=rail.locator('button[type=submit]'), compactBox=await compactSave.boundingBox();
    assert.ok(compactBox.y>=0&&compactBox.y+compactBox.height<480,'Save stays visible with a reduced viewport');
    assert.ok((await rail.boundingBox()).y>(await page.locator('.workbench-bar').boundingBox()).height,'The compact dock header stays below the application toolbar');
    await compactSave.click();
    assert.equal((await state(page)).clinical.observations.find(o=>o.time===1).systolic,121);
    assert.equal(await page.locator('.toast').isVisible(),false,'Inline confirmation leaves the mobile chart and save button unobstructed');
    await page.screenshot({path:path.join(os.tmpdir(),'vesando-bedside-compact.png')});
    await page.setViewportSize({width:390,height:900});
    await page.locator('.bedside-secondary').getByRole('button',{name:'Bảng thông số',exact:true}).click();
    assert.equal(await page.locator('.table-scroll').isVisible(),true);
    assert.equal(await rail.count(),0);
    await page.keyboard.press('Escape');
    await page.getByRole('radio',{name:'Soạn đề',exact:true}).click();
    assert.deepEqual((await state(page)).cases,exam);
    assert.deepEqual(errors,[]);
    console.log('PASS: ten responsive/theme layouts, mobile collapse/expand, live chart access, draft retention, reachable save at reduced height, group focus and table navigation; no runtime errors');
  } finally {
    if (browser) await browser.close();
    server.closeAllConnections(); await new Promise(r=>server.close(r));
  }
})().catch(e=>{console.error(e);process.exitCode=1});
