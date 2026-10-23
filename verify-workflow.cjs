// Task-first workflows against the real Vue app. Uses an existing Playwright install.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const os = require('node:os');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const files = new Set(['index.html', 'studio.css', 'workspace.css', 'interaction.css', 'theme.css', 'canvas.css', 'clinical-rules.js', 'guidance.js', 'enhancements.js']);
const server = http.createServer(async (req, res) => {
  const file = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
  if (!files.has(file)) { res.writeHead(404).end(); return; }
  try {
    res.setHeader('Content-Type', (file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'application/javascript' : 'text/html') + '; charset=utf-8');
    res.end(await fs.readFile(path.join(__dirname, file)));
  } catch { res.writeHead(500).end(); }
});
const state = p => p.evaluate(() => {
  const a = document.querySelector('#app')._vnode.component.setupState;
  return JSON.parse(JSON.stringify({mode:a.mode, tool:a.toolTab, cases:a.cases, clinical:a.clinical, drafts:a.quickDrafts, time:a.selectedTime, open:a.bedsideOpen, pending:a.pendingQuickTimes}));
});
async function openTools(p){if(!await p.locator('.tool-groups').evaluate(e=>e.open))await p.getByLabel('Công cụ sản đồ',{exact:true}).click()}
async function chooseMode(p,name){await p.getByRole('button',{name:'Trang bắt đầu',exact:true}).click();await p.getByRole('button',{name:new RegExp('^'+name)}).click()}
async function record(p){await openTools(p);await p.locator('.tool-palette').getByRole('button',{name:/^Ghi số đo/}).click()}
async function toggleProfile(p){const panel=p.locator('#clinical-patient-panel');if(await panel.evaluate(e=>e.open))await panel.locator('summary').click();else{await openTools(p);await p.locator('.tool-palette').getByRole('button',{name:/^Thông tin sản phụ/}).click()}}
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  let browser;
  try {
    browser = await chromium.launch({headless:true, ...(process.env.CHROME_EXECUTABLE ? {executablePath:process.env.CHROME_EXECUTABLE} : {channel:'chrome'})});
    const context = await browser.newContext({viewport:{width:1440, height:1000}, reducedMotion:'reduce'});
    const p = await context.newPage(), errors = [];
    p.setDefaultTimeout(12000);
    p.on('pageerror', e => errors.push(e.message));
    await p.goto('http://127.0.0.1:' + server.address().port);
    await p.waitForSelector('#app:not([v-cloak])');
    const original = (await state(p)).cases;
    await p.getByRole('button',{name:/^Soạn đề/}).click();
    assert.equal(await p.getByRole('button', {name:/^Viết đề mới/}).isVisible(), true);
    await p.getByRole('button', {name:/^Từ đề \/ ý tưởng/}).click();
    assert.equal(await p.locator('.json-workbench').isVisible(), true);
    await p.getByRole('button', {name:'Đóng nhập JSON', exact:true}).click();
    await p.locator('.case-menu>summary').click();await p.getByRole('button',{name:'Thư viện ca',exact:true}).click();
    assert.equal(await p.locator('.preset:visible').count(), 3);
    await p.getByRole('button', {name:'Đóng bảng công cụ', exact:true}).click();
    await p.locator('.case-menu>summary').click();await p.getByRole('button',{name:'Ca mới',exact:true}).click();
    const editor = p.locator('.editor');
    await editor.waitFor();
    await p.screenshot({path:path.join(os.tmpdir(), 'vesando-workflow-author.png'), fullPage:true});
    assert.equal(await editor.locator('.editor-brief').evaluate(e => e.open), true);
    assert.equal(await editor.locator('.editor-patient').evaluate(e => e.open), false);
    assert.equal(await editor.evaluate(e => !!(e.querySelector('.editor-values').compareDocumentPosition(e.querySelector('.editor-patient')) & Node.DOCUMENT_POSITION_FOLLOWING)), true);
    await editor.getByLabel('Tên tình huống', {exact:true}).fill('Đề kiểm tra luồng làm việc');
    await editor.getByLabel('Tình huống / đề bài', {exact:true}).fill('Dữ kiện đề bài để kiểm tra việc lưu và giữ bản nháp.');
    assert.equal((await state(p)).cases.at(-1).narrative, '', 'Typing remains a draft');
    await editor.getByRole('button', {name:'Lưu thay đổi', exact:true}).click();
    assert.equal((await state(p)).cases.at(-1).title, 'Đề kiểm tra luồng làm việc');
    assert.deepEqual((await state(p)).cases.slice(0, original.length), original, 'New authoring leaves the existing case intact');
    await openTools(p);await p.locator('.tool-palette').getByRole('button',{name:/^Trình bày/}).click();
    await chooseMode(p,'Theo dõi chuyển dạ');
    assert.equal((await state(p)).tool, 'overview', 'Tracking opens the recording task from any previous tool');
    assert.equal((await state(p)).open, true);
    await p.setViewportSize({width:390, height:844});
    await p.screenshot({path:path.join(os.tmpdir(), 'vesando-workflow-first-entry.png'), fullPage:true});
    assert.ok((await p.locator('#quick-cervix').boundingBox()).y < 500, 'A new mobile session puts the first measurement in the initial viewport');
    await p.setViewportSize({width:1440, height:1000});
    assert.deepEqual(await p.locator('.quick-fields input').evaluateAll(es => es.map(e => e.id)), ['quick-cervix','quick-descent','quick-fhr','quick-pulse','quick-contractions','quick-duration']);
    assert.equal(await p.locator('#bedside-form').evaluate(e => !!(e.querySelector('.quick-entry-actions').compareDocumentPosition(e.querySelector('.clinical-extra-groups')) & Node.DOCUMENT_POSITION_FOLLOWING)), true, 'Save follows the main measurements, ahead of secondary tools');
    await p.locator('#quick-date').fill('2026-10-23');
    await p.locator('#quick-start-time').fill('10:00');
    await p.locator('#quick-cervix').fill('4');
    await p.locator('#quick-cervix').press('Enter');
    assert.equal(await p.evaluate(() => document.activeElement.id), 'quick-descent');
    await p.locator('#quick-descent').fill('4');
    await p.locator('#quick-fhr').fill('140');
    assert.equal((await state(p)).clinical.observations[0].cervix, null);
    const beforeAdmin = await state(p);
    await toggleProfile(p);
    await p.locator('#clinical-patient-panel').getByLabel('Họ tên sản phụ', {exact:true}).fill('Sản phụ kiểm tra');
    await toggleProfile(p);
    assert.deepEqual((await state(p)).drafts, beforeAdmin.drafts, 'Administration can be completed without disturbing measurements');
    assert.equal((await state(p)).time, beforeAdmin.time);
    await p.locator('#bedside-form button[type=submit]').click();
    let s = await state(p);
    assert.equal(s.clinical.observations[0].cervix, 4);
    assert.equal(s.clinical.observations[0].descent, 4);
    assert.equal(s.clinical.patient.name, 'Sản phụ kiểm tra');
    assert.equal(s.pending.length, 0);
    await p.getByRole('button', {name:'Tiến mốc 30 phút', exact:true}).click();
    assert.equal(await p.locator('#quick-cervix').inputValue(), '', 'Old measurements are not copied into the next time');
    await p.locator('#quick-cervix').fill('5');
    await p.locator('.bedside-toggle').click();
    assert.equal(await p.locator('#quick-cervix').isVisible(), false);
    await record(p);
    assert.equal(await p.locator('#quick-cervix').inputValue(), '5');
    assert.equal(await p.evaluate(() => document.activeElement.id), 'quick-cervix');
    await chooseMode(p,'Soạn đề');
    await chooseMode(p,'Theo dõi chuyển dạ');
    assert.equal(await p.locator('#quick-cervix').inputValue(), '5', 'Returning to tracking restores the unfinished time');
    const held = await state(p);
    let layouts = 0;
    for (const width of [320,390,768,1024,1440,1920]) for (const theme of ['light','dark']) {
      await p.setViewportSize({width, height:900});
      await p.evaluate(async theme => {
        document.querySelector('#app')._vnode.component.setupState.theme = theme;
        await Vue.nextTick();
        document.querySelector('.bedside-entry-body').scrollTop = 0;
        window.scrollTo(0,0);
      }, theme);
      assert.equal((await state(p)).open, true, 'Resizing never silently closes the form');
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1, width + ': no horizontal page overflow');
      const entry = await p.locator('.bedside-entry').boundingBox(), chart = await p.locator('.clinical-chart-card').boundingBox();
      if (width > 760) assert.ok(entry.x + entry.width <= chart.x + 1, 'Reading order starts with input on desktop');
      else {
        assert.ok(entry.y + entry.height <= chart.y + 1, 'Mobile inputs are in document flow, before the chart');
        assert.notEqual(await p.locator('.bedside-entry').evaluate(e => getComputedStyle(e).position), 'fixed');
      }
      const first = await p.locator('#quick-cervix').boundingBox();
      assert.ok(first.y >= 0 && first.y + first.height < 900, width + ': first measurements are visible without opening a tool');
      const small = await p.locator('.session-toolbar button:visible,.quick-fields input').evaluateAll(es => es.filter(e => e.getBoundingClientRect().height < 44).map(e => e.outerHTML.slice(0,80)));
      assert.deepEqual(small, [], 'Main controls have 44 px touch targets');
      assert.deepEqual((await state(p)).drafts, held.drafts);
      if ([390,1440].includes(width)) await p.screenshot({path:path.join(os.tmpdir(), 'vesando-workflow-' + theme + '-' + width + '.png'), fullPage:true});
      layouts++;
    }
    await p.setViewportSize({width:390, height:844});
    await toggleProfile(p);
    assert.equal(await p.locator('#clinical-patient-panel input').first().isVisible(), true, 'Administration remains available while recording on mobile');
    await toggleProfile(p);
    await p.locator('[data-entry-group=maternal]>summary').click();
    await p.locator('#quick-systolic').fill('120');
    await p.locator('#quick-diastolic').fill('80');
    await p.locator('.quick-options > summary').click();
    await p.locator('.bedside-secondary').getByRole('button', {name:'Bảng thông số', exact:true}).click();
    assert.equal(await p.locator('.entry-table').isVisible(), true);
    await p.getByRole('button', {name:'Đóng bảng công cụ', exact:true}).click();
    await record(p);
    assert.equal(await p.locator('#quick-cervix').inputValue(), '5');
    await p.locator('#bedside-form button[type=submit]').click();
    s = await state(p);
    assert.equal(s.clinical.observations.find(o => o.time === .5).systolic, 120);
    assert.equal(s.clinical.observations.find(o => o.time === .5).diastolic, 80);
    await p.locator('.quick-options > summary').click();
    await p.getByRole('checkbox', {name:'Tự lưu trên máy này', exact:true}).check();
    await p.waitForFunction(() => document.querySelector('#app')._vnode.component.setupState.deviceCurrent);
    await p.getByRole('button', {name:'Tiến mốc 30 phút', exact:true}).click();
    await p.locator('#quick-fhr').fill('142');
    await p.waitForFunction(() => document.querySelector('#app')._vnode.component.setupState.deviceCurrent);
    await p.reload();
    await p.waitForSelector('#app:not([v-cloak])');
    await p.getByRole('button',{name:/^Tiếp tục phiên đang mở/}).click();
    s = await state(p);
    assert.equal(s.open, true);
    assert.equal(s.drafts[1].fhr, '142', 'Opt-in autosave restores unfinished measurements after a reload');
    assert.equal(s.clinical.observations.some(o => o.time === 1), false, 'Reload does not silently record drafts');
    assert.equal(s.clinical.patient.name, 'Sản phụ kiểm tra');
    assert.deepEqual(errors, []);
    console.log('PASS: authoring starts with the brief; tracking starts with measurements; optional administration, explicit saves, sequential keyboard input, retained drafts, table access; ' + layouts + ' responsive/theme layouts; no runtime errors.');
    await context.close();
  } finally { if (browser) await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => server.close());
