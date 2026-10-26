// Regression fixture from the user's exam. No AI service or medical advice is generated.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const os=require('node:os');
const http=require('node:http');
const narrative=`PHẦN 1: THÔNG TIN HÀNH CHÍNH & TIỀN CĂN
Sanh thường 2 lần: năm 2023 bé 3,4 kg; năm 2025 bé 3,4 kg.
Thai 38 tuần 6 ngày nhập viện. Nhóm máu Rh(-); tiêm Anti-D lúc 28 tuần; chưa dự trù máu; GBS âm tính.
Câu hỏi: Cần hỏi thêm gì liên quan đến 2 lần sanh trước? Cần tư vấn gì lúc sanh và sau sanh để dự phòng cho mẹ và con?
PHẦN 2: DIỄN TIẾN CHUYỂN DẠ
16:30 ngày 17/10: CTC 3 cm, xóa 60%, ngôi đầu, station -3, ối còn, cơn co thưa.
09:30 ngày 18/10: CTC 3 cm, xóa 60%, ngôi đầu, station -3, ối còn; bắt đầu tăng co.
10:30 ngày 18/10: CTC 3 cm, xóa 60%, ngôi đầu, station -3, ối còn; 2 cơn/10 phút, mỗi cơn 20 giây; tăng liều thuốc tăng co.
12:00 ngày 18/10: CTC 3 cm, xóa 60%, ngôi đầu, station -3; 3 cơn/10 phút, mỗi cơn 40 giây.
15:20 ngày 18/10: CTC 4 cm, xóa 70%, ngôi đầu, station -3, ối còn; giữ 3 cơn/10 phút.
17:00 ngày 18/10: CTC 6 cm, xóa 80%, ngôi đầu, station -2, ối vỡ; duy trì 3 cơn/10 phút.
17:30 ngày 18/10: CTC mở trọn 10 cm, ngôi đầu, chẩm trái trước (CTT), station +1; ối vỡ nước trắng đục; không chồng xương; 3 cơn/10 phút; sanh lúc này.`;
const fixture={id:'EXAM-17-18-OCT',title:'Chuyển đề qua ngày · station và kiểu thế',fluidNotation:'vn',narrative,patient:{startTime:'16:30',date:'',dateLabel:'17/10 · chưa nêu năm',gestationalAge:'38 tuần 6 ngày'},observations:[
  {time:0,cervix:3,effacement:60,presentation:'Ngôi đầu',station:-3,fluid:'C'},
  {time:17,cervix:3,effacement:60,presentation:'Ngôi đầu',station:-3,fluid:'C'},
  {time:18,cervix:3,effacement:60,presentation:'Ngôi đầu',station:-3,fluid:'C',contractions:2,duration:20},
  {time:19.5,cervix:3,effacement:60,presentation:'Ngôi đầu',station:-3,contractions:3,duration:40},
  {time:22+50/60,cervix:4,effacement:70,presentation:'Ngôi đầu',station:-3,fluid:'C',contractions:3},
  {time:24.5,cervix:6,effacement:80,presentation:'Ngôi đầu',station:-2,contractions:3},
  {time:25,cervix:10,presentation:'Ngôi đầu',station:1,fetalPosition:'Chẩm trái trước (CTT)',occiputPosition:'LOA',fluid:'T',moulding:'0',contractions:3}
],events:[{time:17,label:'Bắt đầu tăng co'},{time:18,label:'Tăng liều thuốc tăng co'},{time:24.5,label:'Ối vỡ'},{time:25,label:'Sanh'}]};
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8'),script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
const sandbox={window:{},document:{readyState:'loading',addEventListener(){}},Blob,TextEncoder,Uint8Array,DataView,atob,btoa};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(__dirname,'clinical-rules.js'),'utf8'),sandbox);vm.runInContext(script,sandbox);const core=sandbox.window.PartographCore;
vm.runInContext(fs.readFileSync(path.join(__dirname,'enhancements.js'),'utf8'),sandbox);
const data=core.parseCases(JSON.stringify(fixture))[0];
assert.deepEqual(Array.from(data.observations,o=>o.time),[0,17,18,19.5,1370/60,24.5,25]);
assert.equal(core.clockAt(data,data.observations[4].time),'15:20 (+1d)');assert.equal(core.clockAt(data,25),'17:30 (+1d)');
assert.equal(data.patient.date,'');assert.equal(data.patient.dateLabel,fixture.patient.dateLabel);assert.equal(data.narrative,narrative);
for(const o of data.observations){assert.equal(o.descent,null);assert.equal(o.fhr,null);assert.equal(o.oxyDose,null);assert.equal(o.oxyRate,null)}
assert.equal(data.observations[5].fluid,'');assert.equal(data.observations[4].duration,null);assert.equal(data.observations[6].effacement,null);
assert.equal(core.clinicalHeadMarker(data.observations[6]).angle,225);assert.equal(core.clinicalHeadMarker(data.observations[0]),null);
assert.equal(core.clinicalHeadMarker({...data.observations[6],occiputPosition:''}).angle,225);
assert.equal(core.parseCases(core.caseJSON(data))[0].observations[4].time,1370/60);
const roundtrip=core.parseCases(core.caseJSON(data))[0];assert.equal(JSON.stringify(roundtrip),JSON.stringify(data));
for(const standard of ['who1993','modified','lcg']){
  const drawing=core.buildSVG(data,{standard},true),svg=drawing.inner;
  assert.ok(svg.includes('data-station-axis="true"'));assert.ok(!svg.includes('data-station-plot')&&!svg.includes('data-position-band'),'Station remains on the usual progress grid');assert.ok(svg.includes('data-angle="225"'));
  assert.ok(svg.includes('XÓA CTC'));assert.ok(svg.includes(fixture.patient.dateLabel));assert.ok(!svg.includes('NaN')&&!svg.includes('Infinity'));
  assert.equal(core.chartTimeline(data,standard).unplot(core.chartTimeline(data,standard).plot(25)),25);
  assert.ok(!svg.includes('chart-editable-cell'),'Export contains no edit targets');
}
const modified=core.progressTrace(data,'modified'),who=core.progressTrace(data,'who1993');
assert.equal(modified[4].region,'on');assert.equal(modified[5].region,'left');assert.equal(modified[6].region,'left');assert.equal(who[1].region,'action');
const both=core.validateCase({...data,observations:[{time:0,cervix:4,descent:5,station:-3},{time:1,cervix:5,descent:2,station:0},{time:2,cervix:6,descent:1,station:1,occiputPosition:'LOA'}]});
const bothSVG=core.buildSVG(both,{standard:'modified'},true).inner;assert.ok(bothSVG.includes('data-series="des"')&&!bothSVG.includes('data-series="station"'));assert.equal((bothSVG.match(/data-head-time=/g)||[]).length,3,'One head point per observation even when both conventions are given');
assert.equal(core.parseCases(core.caseJSON(both))[0].observations[0].descent,5);assert.equal(core.parseCases(core.caseJSON(both))[0].observations[0].station,-3);
for(const observations of [[{time:73,cervix:4}],[{time:1.001,cervix:4}],[{time:0,station:6}],[{time:0,effacement:101}],[{time:0},{time:0.000001}]])assert.throws(()=>core.validateCase({...data,observations}));
assert.equal(core.validateCase({...data,events:[{time:1370/60,label:'Khám 15:20'}]}).events[0].time,1370/60);
assert.equal(sandbox.parseChartMoment('17:30',data),25);assert.equal(sandbox.parseChartMoment('15:20',data),1370/60);assert.equal(sandbox.parseChartMoment('+25',data),25);
assert.equal(sandbox.parseChartMoment('16:30',{...data,observations:[{time:0},{time:24}]}),null,'Repeated clock times require an explicit elapsed hour');
const tabular=sandbox.studioParseTable('time\tstation\teffacement\n22.8333333333333\t-3\t70\n25\t1\t',data).next;assert.equal(tabular.observations[4].time,1370/60);assert.equal(tabular.observations[6].station,1);assert.equal(sandbox.studioParseTable('time\tstation\n17:30\t1',data).rows[0].time,25);
console.log('PASS: original exam data, exact minutes/25 hours, unknown year, independent descent scales, missing data, LOA, deterministic line regions, round trips and clean SVG in all 3 models');

if(process.argv.includes('--browser'))(async()=>{
  const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),assets=new Set(['index.html','studio.css','workspace.css','interaction.css','theme.css','canvas.css','clinical-rules.js','guidance.js','enhancements.js']);
  const server=http.createServer((req,res)=>{const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(!assets.has(file)){res.writeHead(404);res.end();return}res.setHeader('Content-Type',(file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html')+';charset=utf-8');res.end(fs.readFileSync(path.join(__dirname,file)))});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'}),output=path.join(os.tmpdir(),'vesando-focused-ui');fs.mkdirSync(output,{recursive:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(7000);
    await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForSelector('#app:not([v-cloak])');
    await page.getByLabel('Ý tưởng sản đồ muốn tạo',{exact:true}).fill(narrative);await page.getByRole('button',{name:'Bắt đầu với AI',exact:true}).click();
    await page.getByRole('button',{name:'Chuyển nguyên đề',exact:false}).click();
    const prompt=await page.getByLabel('Prompt tạo JSON sản đồ',{exact:true}).inputValue();assert.ok(prompt.includes('KHÔNG làm tròn'));assert.ok(prompt.includes('Chẩm trái trước (CTT) = LOA'));assert.ok(!prompt.includes('bội số 0.5'));assert.ok(prompt.includes(narrative));
    await page.getByRole('button',{name:'Bước 2: Nhập kết quả AI',exact:true}).click();await page.locator('#json-workbench-input').fill(JSON.stringify(fixture));
    await page.getByRole('button',{name:'Xem trước sản đồ',exact:true}).click();await page.locator('.ai-exam-trace>summary').click();
    assert.equal(await page.locator('.ai-exam-trace tbody tr').count(),7);assert.ok((await page.locator('.ai-exam-trace').innerText()).includes('15:20 (+1d)'));assert.ok((await page.locator('.ai-exam-trace').innerText()).includes('Chẩm trái trước'));
    for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});assert.equal(await page.locator('.json-workbench').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);await page.screenshot({path:path.join(output,'exam-transfer-'+width+'.png')})}
    await page.setViewportSize({width:1440,height:1000});
    await page.getByLabel('Tôi đã đối chiếu tên, ngày và cách hiểu các mốc giờ.',{exact:true}).check();await page.getByRole('button',{name:'Áp dụng',exact:true}).click();await page.waitForSelector('.json-workbench',{state:'detached'});
    assert.equal(await page.locator('.case-card:visible [data-head-time]').count(),7);
    const applied=await page.evaluate(()=>JSON.parse(JSON.stringify(document.querySelector('#app')._vnode.component.setupState.activeCase)));assert.equal(applied.observations.length,7);assert.equal(applied.observations[6].station,1);assert.equal(applied.observations[4].time,1370/60);assert.equal(applied.narrative,narrative);
    for(const [query,time] of [['15:20',1370/60],['+25',25]]){const menu=page.locator('.case-card:visible .moment-browser');await menu.locator('summary').click();await menu.getByLabel('Giờ cần đến',{exact:true}).fill(query);await menu.getByRole('button',{name:'Đến mốc',exact:true}).click();assert.equal(await page.evaluate(()=>document.querySelector('#app')._vnode.component.setupState.viewTime),time)}
    const image=await page.evaluate(data=>{const core=window.PartographCore;return core.svgDocument(core.buildSVG(core.parseCases(JSON.stringify(data))[0],{standard:'who1993'},true))},fixture);
    fs.writeFileSync(path.join(output,'exam-transfer-who1993.svg'),image);await page.setContent('<style>body{margin:0}svg{display:block}</style>'+image);await page.locator('svg').screenshot({path:path.join(output,'exam-transfer-who1993.png')});
    const bothImage=core.svgDocument(core.buildSVG(both,{standard:'modified'},true));fs.writeFileSync(path.join(output,'both-descent-scales.svg'),bothImage);await page.setContent('<style>body{margin:0}svg{display:block}</style>'+bothImage);await page.locator('svg').screenshot({path:path.join(output,'both-descent-scales.png')});const detail=await page.evaluate(()=>{const svg=document.querySelector('svg'),r=svg.getBoundingClientRect(),top=svg.querySelector('[data-reference=alert]').getBoundingClientRect().top-30,bottom=svg.querySelector('[data-descent-tick="0"]').getBoundingClientRect().bottom+42;return {x:0,y:Math.max(0,top),width:r.width,height:bottom-Math.max(0,top)}});await page.screenshot({path:path.join(output,'descent-shared-axis-detail.png'),clip:detail});
    assert.deepEqual(errors,[]);await page.close();console.log('PASS: browser transfer workflow, per-exam review, 4 responsive widths and actual SVG screenshots');
  }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
