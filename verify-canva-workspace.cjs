// Real browser coverage for the editor shell, its navigation and responsive controls.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const os = require('node:os');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assets = new Set(['index.html','studio.css','workspace.css','interaction.css','theme.css','canvas.css','clinical-rules.js','guidance.js','enhancements.js']);
const server = http.createServer(async (req, res) => {
  const file = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
  if (!assets.has(file)) { res.writeHead(404); res.end(); return; }
  try {
    res.setHeader('Content-Type', (file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'application/javascript' : 'text/html') + ';charset=utf-8');
    res.end(await fs.readFile(path.join(__dirname, file)));
  } catch { res.writeHead(500); res.end(); }
});
const snapshot = p => p.evaluate(() => {
  const a = document.querySelector('#app')._vnode.component.setupState;
  return JSON.stringify({cases:a.cases,clinical:a.clinical,design:a.design});
});
const output = path.join(os.tmpdir(), 'vesando-canva-workspace');
(async () => {
  await fs.mkdir(output, {recursive:true});
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE ? {executablePath:process.env.CHROME_EXECUTABLE} : {channel:'chrome'})});
  try {
    const context = await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
    const p = await context.newPage(), errors = [];
    p.setDefaultTimeout(8000);
    p.on('pageerror', e => errors.push(e.message));
    await p.goto('http://127.0.0.1:' + server.address().port);
    await p.waitForSelector('#app:not([v-cloak])');
    await p.locator('.home-template-disclosure>summary').click();
    await p.locator('.template-card').first().click();
    const original = await snapshot(p);
    const rail = p.locator('.creation-rail');
    await rail.getByRole('button', {name:'Trình bày',exact:true}).click();
    assert.equal(await p.locator('#studio-toolbox').isVisible(), true);
    const widthBefore = (await p.locator('.workarea').boundingBox()).width;
    await p.getByRole('button', {name:'Chuyển thành bảng nổi',exact:true}).click();
    assert.equal(await p.locator('.studio-workspace').getAttribute('data-panel'), 'overlay');
    assert.ok((await p.locator('.workarea').boundingBox()).width > widthBefore + 200);
    await p.getByRole('button', {name:'Ghim bảng bên cạnh sản đồ',exact:true}).click();
    assert.equal(await p.locator('.studio-workspace').getAttribute('data-panel'), 'dock');
    const separator = p.getByRole('separator', {name:'Độ rộng bảng công cụ'});
    const before = Number(await separator.getAttribute('aria-valuenow'));
    await separator.focus(); await p.keyboard.press('ArrowRight');
    assert.equal(Number(await separator.getAttribute('aria-valuenow')), before + 20);
    await p.getByRole('button', {name:'Đóng bảng công cụ',exact:true}).click();
    assert.equal(await p.locator('#studio-toolbox').isVisible(), false);
    assert.equal(await rail.locator('[data-tool=design]').evaluate(e => e === document.activeElement), true);
    await rail.getByRole('button', {name:'Ca mẫu',exact:true}).click();
    assert.equal(await p.locator('.toolbox-heading strong').innerText(), 'Ca mẫu');
    await rail.getByRole('button', {name:'Ca mẫu',exact:true}).click();
    assert.equal(await p.locator('#studio-toolbox').isVisible(), false);
    await rail.getByRole('button', {name:'Kiểm tra',exact:true}).click();
    assert.equal(await p.locator('.review-inspector').isVisible(), true);
    await p.keyboard.press('Escape');
    assert.equal(await rail.locator('[data-tool=review]').evaluate(e => e === document.activeElement), true);
    await p.getByRole('button', {name:'Tìm công cụ và thao tác',exact:true}).click();
    assert.equal(await p.evaluate(() => document.querySelector('#app')._vnode.component.setupState.commandOpen), true);
    await p.keyboard.press('Escape');
    assert.equal(await p.getByRole('button', {name:'Hoàn tác thao tác gần nhất',exact:true}).isVisible(), true);
    const nav = p.locator('.workarea .canvas-navigation:visible');
    await nav.getByRole('button', {name:'Phóng to nhanh',exact:true}).click();
    assert.equal(await nav.locator('.zoom-readout').innerText(), '150%');
    await nav.getByRole('button', {name:'Kéo để di chuyển vùng xem',exact:true}).click();
    assert.equal(await nav.locator('.canvas-pan').getAttribute('aria-pressed'), 'true');
    await nav.getByRole('button', {name:'Khớp sản đồ vào vùng xem',exact:true}).click();
    assert.equal(await nav.locator('.zoom-readout').innerText(), '100%');
    assert.equal(await nav.locator('.canvas-pan').getAttribute('aria-pressed'), 'false');
    assert.equal(await snapshot(p), original, 'Tool navigation and view controls preserve all case data and design');
    console.log('PASS: dock/overlay, keyboard resize, templates, review, close focus, search, zoom and pan preserve data');
    await rail.getByRole('button', {name:'Trình bày',exact:true}).click();
    await p.evaluate(() => scrollTo(0,0));
    await p.screenshot({path:path.join(output,'desktop.png')});
    for (const width of [1440,1024,768,390,320]) {
      await p.setViewportSize({width,height:900});
      for (const theme of ['light','dark']) {
        await p.evaluate(theme => document.querySelector('#app')._vnode.component.setupState.theme = theme, theme);
        assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No horizontal page overflow at ' + width + '/' + theme);
        if (width <= 760) {
          assert.equal(await rail.locator('.rail-desktop').first().isVisible(), false);
          assert.equal(await p.locator('.panel-dock-toggle').isVisible(), false);
          await p.getByRole('button',{name:'Đóng bảng công cụ',exact:true}).click();
          for (const b of await nav.locator('button').all()) {
            const box = await b.boundingBox();
            assert.ok(box.width >= 44 && box.height >= 44, '44px mobile navigation targets');
            assert.ok(box.x >= 0 && box.x + box.width <= width + 1, 'Navigation fits viewport');
          }
          await rail.getByRole('button',{name:'Trình bày',exact:true}).click();
        }
        if (width === 390 || width === 1440) await p.screenshot({path:path.join(output,width+'-'+theme+'.png')});
      }
    }
    assert.equal(await snapshot(p), original);
    assert.deepEqual(errors, []);
    console.log('PASS: 5 viewport widths in light/dark, mobile controls, no runtime errors; screenshots: ' + output);
    await context.close();
  } finally { await browser.close(); await new Promise(r => server.close(r)); }
})().catch(e => {console.error(e);process.exitCode=1;server.close()});
