// Browser checks: set PLAYWRIGHT_MODULE and, if needed, CHROME_EXECUTABLE.
// Reference bands beside quick entry: neutral when empty, green inside, red outside; follow the chosen standard.
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
      const band=key=>page.locator('label.field:has(#quick-'+key+') .quick-range');
      assert.match(await band('fhr').textContent(),/^Ngưỡng 120–160$/);
      assert.equal(await band('cervix').count(),0,'Cervix has no fixed band');
      await page.fill('#quick-fhr','172');assert.match(await band('fhr').getAttribute('class'),/\balert\b/);assert.match(await band('fhr').textContent(),/Ngoài ngưỡng/);
      await page.fill('#quick-fhr','140');assert.match(await band('fhr').getAttribute('class'),/\bok\b/);
      await page.fill('#quick-contractions','6');assert.match(await band('contractions').getAttribute('class'),/\balert\b/);
      await page.fill('#quick-pulse','88');assert.match(await band('pulse').getAttribute('class'),/\bok\b/);
      // The band text follows the selected standard.
      await page.evaluate(()=>{document.querySelector('#app')._vnode.component.setupState.standard='lcg'});
      await page.fill('#quick-fhr','159');assert.match(await band('fhr').textContent(),/Trong ngưỡng 110–159/);
      await page.fill('#quick-fhr','160');assert.match(await band('fhr').getAttribute('class'),/\balert\b/);
      assert.deepEqual(errors,[]);await page.close();
    }
    console.log('PASS: quick entry reference bands');
  }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
