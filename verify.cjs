// Run with: node verify.cjs. No packages or browser installation required.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
const sandbox = {window:{},document:{readyState:'loading',addEventListener(){}},Blob,TextEncoder,Uint8Array,DataView,atob,btoa};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(__dirname + '/clinical-rules.js','utf8'),sandbox);
vm.runInContext(script + '\nwindow.testDesign={removeChartPoint,changeChartPoint,designOptions,layoutSVG,symbolSVG,commandSearch,headPositions:HEAD_POSITIONS,resizeSections:RESIZE_SECTIONS,defaults:DESIGN_DEFAULTS};',sandbox);
const core = sandbox.window.PartographCore;
const {designOptions,layoutSVG,defaults} = sandbox.window.testDesign;
const original = core.runChecks();
const showcase = core.presets[0];
const c = core.validateCase({...showcase,events:[]});
let checks = original.passed;
function ok(value,message){assert.ok(value,message);checks++}
// Clinical geometry: WHO/ICM 2008 Fig. 4.1–4.2, printed pp. 57–59.
ok(core.descentY(5)===core.cervixY(5),'5/5 must share the 5 cm grid line, not the 10 cm line');
ok(core.descentY(0)===core.cervixY(0),'0/5 must be at the bottom');
for(let fifth=0;fifth<=5;fifth++){
  ok(core.descentY(fifth)>=core.G.progressY+core.G.progressH/2,'Every descent point stays in the lower half');
  ok(core.plotValueAt(core.descentY(fifth),'descent')===fifth,'Descent drawing and pointer mapping must be inverses');
}
ok(core.plotBounds('descent').y===core.cervixY(5)&&core.plotBounds('descent').height===core.G.progressH/2,'Descent pointer target is restricted to the lower half');
ok(core.fetalHeartY(200)===core.G.fhrY&&core.fetalHeartY(80)===core.G.fhrY+core.G.fhrH,'FHR axis spans 80–200 in the reference partograph');
for(const bpm of [80,90,120,160,200])ok(core.plotValueAt(core.fetalHeartY(bpm),'fhr')===bpm,'FHR drawing and pointer mapping agree');
const clinicalExample=core.validateCase({...c,observations:[{time:0,cervix:8,descent:5,fhr:90,contractions:6,duration:70}]});
const clinicalSVG=core.buildSVG(clinicalExample,{design:{cellWidth:1,rowHeight:1,rowMode:'all'}}).inner;
ok(/<circle[^>]*cy="394"[^>]*r="5"[^>]*stroke="#2469ab"/.test(clinicalSVG),'Rendered 5/5 marker must lie on the middle grid line');
ok(/<circle[^>]*cy="203\.333"[^>]*r="3"/.test(clinicalSVG),'FHR 90 must be plotted at its actual position, not clamped to 100');
const lcgSVG=core.buildSVG(clinicalExample,{standard:'lcg'},true).inner;
ok(lcgSVG.includes('Thời gian co · giây')&&lcgSVG.includes('>70</text>'),'LCG adaptation must preserve numerical contraction durations');
const wide = core.buildSVG(c,{design:{cellWidth:1.65,rowHeight:.72}});
const classic = core.buildSVG(c,{design:{cellWidth:1,rowHeight:1}});
ok(wide.width > classic.width && wide.height < classic.height,'Wide layout must shorten the chart');
const mapped = layoutSVG('<line x1="10" y1="20" x2="30" y2="40" stroke-width="2"/><circle cx="10" cy="20" r="5"/><text x="10" y="20" font-size="10">A</text>',designOptions({cellWidth:1.5,rowHeight:.8,stroke:2,font:1.1}));
ok(mapped.includes('x1="15" y1="16" x2="45" y2="32" stroke-width="4"'),'Coordinate mapping must not accidentally scale stroke-width as width');
ok(mapped.includes('cx="15" cy="16" r="5"'),'Circle markers must stay circular');
ok(mapped.includes('font-size="11"'),'Font size must remain independent of row compression');
ok(!core.buildSVG(c,{},true).inner.includes('TÌNH HUỐNG LÂM SÀNG'),'Chart-only export is the default');
ok(core.buildSVG(c,{design:{exportNarrative:true}},true).inner.includes('TÌNH HUỐNG LÂM SÀNG'),'Narrative can be included');
ok(!core.buildSVG(c,{design:{showLegend:false}},true).inner.includes('CƠN CO · THỜI GIAN MỖI CƠN'),'Legend can be excluded');
const custom = core.buildSVG(c,{design:{series:{ctc:{marker:'diamond',color:'#123456',width:3,dash:'dotted'}}}});
ok(custom.inner.includes('stroke="#123456"') && custom.inner.includes('stroke-dasharray="1 4"'),'Per-series color and dash customization');
const noLine = core.buildSVG(c,{design:{series:{ctc:{dash:'none'}}}});
ok(!noLine.inner.includes('data-series="ctc"'),'Disconnected markers must not be joined');
const safe = designOptions({cellWidth:Infinity,rowHeight:-1,series:{ctc:{color:'" onload="bad',marker:'<script>',width:999}}});
ok(safe.cellWidth===defaults.cellWidth && safe.rowHeight===.5 && safe.series.ctc.width===5 && safe.series.ctc.color===defaults.series.ctc.color,'Invalid style values are bounded');
const withPosition = core.validateCase({...c,patient:{...c.patient,presentation:'Ngôi đầu',fetalPosition:'Chẩm chậu trái trước'},observations:[{...c.observations[0],fetalPosition:'Chẩm chậu trái ngang'}]});
const positionDrawing = core.buildSVG(withPosition,{},true);
ok(withPosition.patient.presentation==='Ngôi đầu' && positionDrawing.inner.includes('Chẩm chậu trái ngang'),'Presentation and position survive validation and export');
const unsafe = core.validateCase({...c,patient:{...c.patient,presentation:'<script>bad</script>'}});
ok(core.buildSVG(unsafe).inner.includes('&lt;script&gt;bad&lt;/script&gt;'),'New patient metadata is escaped');
for(const standard of ['who1993','modified','lcg'])for(const mono of [false,true])for(const compact of [false,true]){
  const d=core.buildSVG(c,{standard,mono,compact},true);
  ok(d.width>0 && d.height>0 && !/\b(?:NaN|Infinity)\b/.test(d.inner),'All standards, scopes, and palettes render finite geometry');
}
const sample=rows=>core.validateCase({...c,observations:rows});
const entry4=sample([{time:0,cervix:4,descent:5},{time:2,cervix:6,descent:4}]);
let timeline=core.chartTimeline(entry4,'who1993');
ok(timeline.plot(0)===9&&timeline.plot(2)===11,'WHO 1993: X(0,4) maps to X(9,4); subsequent data keep elapsed intervals');
ok(timeline.unplot(0)===null&&timeline.unplot(8.5)===null&&timeline.unplot(9)===0,'Translation gaps are not actual clinical time');
const transition=sample([{time:0,cervix:2,descent:5},{time:3,cervix:3,descent:4},{time:5,cervix:5,descent:3}]);
timeline=core.chartTimeline(transition,'who1993');
ok(timeline.plot(0)===0&&timeline.plot(3)===8&&timeline.plot(5)===10,'WHO 1993 transition preserves latent data and translates once');
for(const time of [0,.5,1,2.5,3,4,5,12,24])ok(timeline.unplot(timeline.plot(time))===time,'WHO 1993 pointer mapping agrees with plotted time');
ok(timeline.unplot(5)===null,'Cannot record into the artificial translated gap');
const modifiedLate=sample([{time:0,cervix:2},{time:3,cervix:6},{time:5,cervix:7}]);
timeline=core.chartTimeline(modifiedLate,'modified');
ok(timeline.plot(3)===2&&timeline.plot(5)===4,'Modified first active observation is on the alert line even when recorded late');
const whoDrawing=core.buildSVG(transition,{standard:'who1993',design:{cellWidth:1,rowHeight:1,rowMode:'all',timeMode:'full'}});
ok(whoDrawing.inner.includes('data-translation="true"'),'WHO 1993 renders translation as a separate dashed annotation');
ok(whoDrawing.inner.includes('x1="478" y1="438" x2="758" y2="284"'),'WHO 1993 alert line goes from (8,3) to (15,10)');
ok(whoDrawing.inner.includes('x1="638" y1="438" x2="918" y2="284"'),'WHO 1993 action line remains four hours to the right');
const extended=core.buildSVG(sample([{time:0,cervix:4},{time:24,cervix:9,fhr:123}]),{standard:'who1993'});
ok(extended.hours>=33&&extended.inner.includes('Tim thai 123 lần/phút'),'Long data after translation expand the sheet rather than silently disappearing');
for(const standard of ['who1993','modified']){
  const start=core.assessment(entry4,standard);
  ok(!start.checks.some(x=>x.code==='alert-line'),'Being exactly on the alert line is not a warning');
  const delayed=sample([{time:0,cervix:4},{time:2,cervix:5}]);
  ok(core.assessment(delayed,standard).checks.some(x=>x.code==='alert-line'),'Data to the right of the alert line trigger an assessment prompt');
  const action=sample([{time:0,cervix:4},{time:5,cervix:5}]);
  ok(core.assessment(action,standard).checks.some(x=>x.code==='action-line'),'Touching the action line triggers a review prompt');
}
const discordant=sample([{time:0,cervix:4,descent:4},{time:1,cervix:7,descent:4}]);
ok(core.progressEvidence(discordant,'who1993').region==='left'&&core.assessment(discordant,'who1993').checks.some(x=>x.code==='descent-discordance'),'Left-of-alert cervical progress does not hide absent head descent');
const reachingZero=sample([{time:0,cervix:8,descent:0},{time:1,cervix:10,descent:0}]);
ok(!core.assessment(reachingZero,'modified').checks.some(x=>x.code==='descent-discordance'),'Head already at 0/5 is not falsely marked as failure to descend');
const boundaries={fhr:[[109,true],[110,false],[159,false],[160,true]],contractions:[[2,true],[3,false],[5,false],[6,true]],duration:[[19,true],[20,false],[60,false],[61,true]],pulse:[[59,true],[60,false],[119,false],[120,true]],systolic:[[79,true],[80,false],[139,false],[140,true]],diastolic:[[89,false],[90,true]],temperature:[[34.9,true],[35,false],[37.4,false],[37.5,true]]};
for(const [key,values] of Object.entries(boundaries))for(const [value,expected] of values)ok(core.lcgAlert(key,value)===expected,'LCG boundary '+key+' '+value);
for(const key of Object.keys(boundaries))ok(!core.lcgAlert(key,null)&&!core.lcgAlert(key,''),'Unmeasured '+key+' must not create a false zero-value alarm');
for(const value of ['M','M+','M++'])ok(!core.lcgAlert('fluid',value),'LCG fluid criterion must not promote '+value+' to M+++');
ok(core.lcgAlert('fluid','M+++')&&core.lcgAlert('fluid','B'),'LCG fluid threshold is M+++ or blood');
for(const value of ['Y','D','U'])ok(!core.lcgAlert('companion',value),'Declined/unknown supportive care is not the same as absent care');
ok(core.lcgAlert('companion','N')&&core.lcgAlert('posture','SP'),'Supportive care criteria agree with WHO ALERT column');
ok(core.assessment(sample([{time:0,cervix:5},{time:6,cervix:5}]),'lcg').checks.some(x=>x.code==='lcg-progress'),'LCG 5 cm unchanged for six documented hours triggers review');
ok(!core.assessment(sample([{time:0,cervix:5},{time:6,fhr:140}]),'lcg').checks.some(x=>x.code==='lcg-progress'),'Elapsed time without a repeat cervical exam cannot prove arrest');
ok(!core.assessment(sample([{time:0,cervix:5.5},{time:6,cervix:5.5}]),'lcg').checks.some(x=>x.code==='lcg-progress'),'Fractional dilation is not silently floored into an unsupported LCG threshold');
ok(core.fluidDisplay('I','vn')==='C'&&core.fluidDisplay('C','vn')==='T','Vietnamese display does not confuse intact and clear WHO codes');
ok(core.fluidDisplay('M+++','vn')==='X+++','Meconium severity survives Vietnamese display');
const inputFluid=sample([{time:0,fluid:'I'},{time:1,fluid:'C'}]);
core.buildSVG(inputFluid,{design:{fluidNotation:'vn'}});
ok(inputFluid.observations[0].fluid==='I'&&inputFluid.observations[1].fluid==='C','Display notation never mutates canonical saved fluid data');
ok(core.assessment(sample([{time:0,cervix:4},{time:10,cervix:10}]),'who1993').checks.some(x=>x.code==='action-line'),'Reaching full dilation must not erase an action-line crossing');
ok(core.presets[1].patient.gestationalAge==='40 tuần 3 ngày'&&core.presets[2].patient.para==='1001','Sample demographics must agree with their narratives');
ok(!core.presets[1].short.includes('do CPD')&&!core.presets[2].short.includes('Suy thai cấp'),'Library labels describe findings rather than assigning unsupported diagnoses');
const hiddenCervix=core.buildSVG(transition,{standard:'who1993',design:{series:{ctc:{dash:'none'}}}});
ok(!hiddenCervix.inner.includes('data-series="ctc"'),'Hiding the cervical connecting line also hides the latent-to-first-exam segment');
const dashedCervix=core.buildSVG(transition,{standard:'who1993',design:{series:{ctc:{dash:'dashed'}}}});
ok(/data-series="ctc" stroke-dasharray=/.test(dashedCervix.inner),'The latent-to-first-exam segment follows the selected cervical line style');
// Data-driven frames: no rendering choice changes clinical coordinates or assessment.
const eightHours=sample([{time:0,cervix:4,fhr:140},{time:7.5,fhr:139,contractions:2,duration:25},{time:8,cervix:8,descent:2,fhr:141,contractions:4,duration:45},{time:24}]);
const eight=core.buildSVG(eightHours,{standard:'modified'});
ok(eight.hours===10,'An eight-hour Modified case expands only enough to show the entire action line');
ok(!eight.tailCell,'No extra terminal cell is needed when full references already leave room');
ok(eight.hour===64,'Short cases widen hour cells instead of shrinking the content');
ok(!eight.hiddenRows.includes('Oxytocin')&&eight.hiddenRows.includes('Mạch & huyết áp'),'Empty medication rows remain available while other unrecorded groups collapse automatically');
ok(eight.inner.includes('OXYTOCIN')&&!eight.inner.includes('MẠCH &amp; HUYẾT ÁP'),'Required medication rows remain in SVG while hidden optional sections are removed');
const beforeRender=JSON.stringify(eightHours),beforeAssessment=JSON.stringify(core.assessment(eightHours,'modified'));
for(const timeMode of ['auto','manual','full'])for(const rowMode of ['auto','custom','all']){
  const design={timeMode,timeHours:4,timePadding:0,rowMode,sections:{fhr:false,fluid:false,contractions:false,vitals:false}};
  const d=core.buildSVG(eightHours,{standard:'modified',design},true);
  ok(d.hours>=8,'A manually short window must never discard recorded data');
  ok(!/NaN|Infinity|<!--section/.test(d.inner),'All smart layouts produce complete finite SVG');
  ok(d.rowLayout.inverse(d.rowLayout.y(core.cervixY(5)))===core.cervixY(5),'Packed descent coordinates have an exact inverse');
}
ok(JSON.stringify(eightHours)===beforeRender,'Framing and section choices preserve source observations');
ok(JSON.stringify(core.assessment(eightHours,'modified'))===beforeAssessment,'Display choices never alter clinical assessment');
ok(core.buildSVG(eightHours,{design:{timePadding:2}}).hours===10,'Future padding adds the selected number of hours');
ok(core.buildSVG(eightHours,{design:{timeMode:'manual',timeHours:4}}).timeline.expanded,'A short manual frame reports automatic expansion');
ok(core.buildSVG(eightHours,{design:{timeMode:'full'}}).hours===24,'The full 24-hour form remains available');
ok(core.buildSVG(sample([{time:0},{time:24}])).hours===10,'A blank Modified case still displays both full reference lines');
ok(core.buildSVG(eightHours,{editable:true,activeTime:16}).hours===16,'Selecting a future entry opens enough interactive chart space');
ok(core.buildSVG(eightHours,{editable:true,activeTime:0},false,{time:20,value:4}).hours===20,'Keyboard cursor expands the editable frame');
const onlyCTC=sample([{time:0,cervix:4},{time:8,cervix:8}]);
const sparse=core.buildSVG(onlyCTC),all=core.buildSVG(onlyCTC,{design:{rowMode:'all'}});
ok(sparse.height<all.height/2,'A sparse case removes meaningful vertical dead space');
ok(!sparse.tailCell,'A point-only final observation does not add an unnecessary table cell');
const sparseExport=core.buildSVG(onlyCTC,{},true);
ok(!sparseExport.inner.includes('Mạch mẹ · lần/phút')&&!sparseExport.inner.includes('CƠN CO · THỜI GIAN MỖI CƠN'),'Export legends follow the sections actually shown');
for(const compact of [false,true])for(const exporting of [false,true]){const drawing=core.buildSVG(onlyCTC,{compact},exporting);ok(drawing.inner.includes('OXYTOCIN · IU/L')&&drawing.inner.includes('THUỐC KHÁC')&&drawing.inner.includes('DỊCH TRUYỀN'),'Automatic and compact drawings retain empty oxytocin, medication and IV-fluid rows, including exports');ok(!drawing.hiddenRows.includes('Oxytocin')&&!drawing.hiddenRows.includes('Thuốc & dịch truyền'),'Automatic row hiding cannot conceal medication entry points')}
ok(!core.buildSVG(onlyCTC,{design:{rowMode:'custom',sections:{oxy:false,medication:false}}},true).inner.includes('OXYTOCIN · IU/L'),'Explicit custom section choices still apply');
const terminal=core.buildSVG(eightHours,{design:{rowMode:'all',cellWidth:1,rowHeight:1}});
ok(terminal.inner.includes('x="639" y="643"')&&terminal.inner.includes('x="671" y="643"'),'The penultimate and final contractions occupy distinct cells');
const zeros=core.buildSVG(sample([{time:0,cervix:4,contractions:0,protein:'0'}]));
ok(!zeros.hiddenRows.includes('Cơn co')&&!zeros.hiddenRows.includes('Nước tiểu'),'Recorded zero values are data, not missing observations');
const excerpt=core.buildSVG(eightHours,{design:{rowMode:'custom',sections:{fhr:false}}},true);
ok(excerpt.inner.includes('BẢN TRÍCH'),'Deliberately hiding recorded information is identified on the export');
for(const standard of ['who1993','modified','lcg']){
 const auto=core.chartTimeline(transition,standard),full=core.chartTimeline(transition,standard,{timeMode:'full'});
 for(const t of [0,3,5])ok(auto.plot(t)===full.plot(t),'Automatic cropping preserves '+standard+' time translation');
}
for(const raw of [{timeHours:NaN,timePadding:Infinity,imageScale:999},{sections:null,rowMode:'invalid',timeMode:'bad'}]){
 const sanitized=designOptions(raw);
 ok(sanitized.timeHours>=4&&sanitized.timePadding<=8&&sanitized.imageScale<=4,'Unsafe display settings are sanitized');
}
// Both reference lines must remain complete even for empty/short/custom frames.
for(const standard of ['modified','who1993'])for(const compact of [false,true])for(const timeMode of ['auto','manual','full']){
  const d=core.buildSVG(sample([{time:0,cervix:4}]),{standard,compact,design:{timeMode,timeHours:4,series:{alert:{dash:'none'},action:{dash:'none'}}}},true);
  const spec=core.modelSpec(standard);
  ok(d.hours>=spec.origin+4+10-spec.active,'Frame includes the full action line for '+standard+' '+timeMode);
  for(const key of ['alert','action']){
    const tag=d.inner.match(new RegExp('<line[^>]*data-reference="'+key+'"[^>]*>'))?.[0];
    ok(!!tag,'Reference line cannot be disabled by a saved hidden-line setting');
    const attr=name=>Number(tag.match(new RegExp('\\b'+name+'="([^"]+)"'))[1]);
    ok(Math.abs(attr('y2')-d.rowLayout.y(core.cervixY(10))*d.scaleY)<.002,'Reference line reaches 10 cm after row packing');
    const end=spec.origin+(key==='action'?4:0)+10-spec.active;
    ok(Math.abs(attr('x2')-(core.G.left+end*d.hour)*d.scaleX)<.002&&attr('x2')<d.width,'Full reference endpoint remains inside exported frame');
  }
}
ok(core.buildSVG(sample([{time:0,cervix:5}]),{standard:'lcg'}).hours===4,'LCG does not inherit a historical reference-line minimum');
ok(!core.buildSVG(c,{standard:'lcg'}).inner.includes('data-reference='),'LCG still has no historical reference lines');
// Per-point head drawings survive saves and replace only their selected marker.
const headCase=core.validateCase({...c,observations:[{time:0,cervix:4,descent:4},{time:2,cervix:6,descent:3,headMarker:{angle:135,size:14}}]});
const headRoundTrip=core.parseCases(JSON.stringify(headCase))[0];
ok(headRoundTrip.observations[1].headMarker.angle===135&&headRoundTrip.observations[1].headMarker.size===14,'Head rotation and size survive JSON export/import');
ok(!headRoundTrip.observations[0].headMarker,'Other descent markers keep their original symbol');
for(const invalid of [{angle:-1,size:12},{angle:361,size:12},{angle:NaN,size:12},{angle:0,size:7},{angle:0,size:21},{angle:'90',size:12},[],true]){
  assert.throws(()=>core.validateCase({...c,observations:[{time:0,descent:3,headMarker:invalid}]}));checks++;
}
let relativePath;
for(const standard of ['who1993','modified','lcg'])for(const mono of [false,true])for(const rowMode of ['auto','all']){
  const d=core.buildSVG(headCase,{standard,mono,design:{cellWidth:1.65,rowHeight:.72,rowMode}},true);
  ok((d.inner.match(/data-head-marker="true"/g)||[]).length===1,'Only the selected descent point becomes a head drawing');
  const head=d.inner.match(/<g data-head-marker="true"[^>]*>([\s\S]*?)<\/g>/)[1];
  const circle=head.match(/<circle[^>]+>/)[0],attr=name=>Number(circle.match(new RegExp('\\b'+name+'="([^"]+)"'))[1]);
  ok(Math.abs(attr('cx')-(core.G.left+d.timeline.plot(2)*d.hour)*d.scaleX)<.002&&Math.abs(attr('cy')-d.rowLayout.y(core.descentY(3))*d.scaleY)<.002,'Head center stays at the original clinical coordinates after row packing');
  ok(attr('r')===14,'Head size remains circular under unequal chart scales');
  const vectors=[...head.matchAll(/[ML] (-?[\d.]+) (-?[\d.]+)/g)].map(m=>[Number(m[1])-attr('cx'),Number(m[2])-attr('cy')]);
  if(!relativePath)relativePath=vectors;
  ok(vectors.every((v,i)=>v.every((n,j)=>Math.abs(n-relativePath[i][j])<.003)),'Sutures retain their angle and shape across standards and row layouts');
  ok(!mono||!head.includes('#2469ab'),'Monochrome export applies to the entire head drawing');
  ok(d.inner.includes('thoi = thóp trước; tam giác = thóp sau'),'Export explains the additional symbol');
  ok(!/NaN|Infinity/.test(d.inner),'Head drawing geometry is finite');
}
ok(headCase.observations[1].time===2&&headCase.observations[1].descent===3,'Head drawings preserve recorded time and descent');
const removedHead=core.validateCase({...headCase,observations:headCase.observations.map(o=>({...o,headMarker:null}))});
ok(!core.buildSVG(removedHead).inner.includes('data-head-marker='),'Removing a head drawing restores series symbols');
// Resizing is a presentation transform. Pointer conversion must still be exact.
const resizedOptions={cellWidth:1.45,rowHeight:.9,labelWidth:225,rowMode:'all',sectionHeights:{header:1.3,fhr:1.7,fluid:.8,progress:1.8,contractions:1.5,oxy:.9,vitals:1.4}};
const originalHeadData=JSON.stringify(headCase),resized=core.buildSVG(headCase,{design:resizedOptions,designEditing:true,selectedSection:'fhr'});
for(const field of ['cervix','descent','fhr'])for(const value of (field==='fhr'?[80,110,140,160,200]:field==='descent'?[0,1,3,5]:[0,3,4,5,7.5,10])){
  const originalY=field==='fhr'?core.fetalHeartY(value):field==='descent'?core.descentY(value):core.cervixY(value);
  const pointerY=resized.rowLayout.inverse(resized.rowLayout.y(originalY));
  ok(Math.abs(pointerY-originalY)<1e-8&&core.plotValueAt(pointerY,field)===value,'Resized '+field+' coordinates convert back to the same measurement');
}
for(const section of sandbox.window.testDesign.resizeSections){
  const size=resized.rowLayout.y(section.to)-resized.rowLayout.y(section.from),scale=resizedOptions.sectionHeights[section.id]||1;
  ok(Math.abs(size-(section.to-section.from)*scale)<1e-8,'Each visible section has an independent height: '+section.id);
}
const resizedHead=resized.inner.match(/<g data-head-marker="true"[^>]*>([\s\S]*?)<\/g>/)[1],center=resizedHead.match(/<circle[^>]+>/)[0];
const centerX=Number(center.match(/cx="([^"]+)"/)[1]),centerY=Number(center.match(/cy="([^"]+)"/)[1]);
ok(Math.abs(centerX/resized.scaleX-resized.labelOffset-(core.G.left+resized.timeline.plot(2)*resized.hour))<.002,'Changing label width keeps every time series on the common time axis');
ok(Math.abs(centerY/resized.scaleY-resized.rowLayout.y(core.descentY(3)))<.002,'Head center follows only the resized progress band');
const headVectors=[...resizedHead.matchAll(/[ML] (-?[\d.]+) (-?[\d.]+)/g)].map(m=>[Number(m[1])-centerX,Number(m[2])-centerY]);
ok(headVectors.every((v,i)=>v.every((n,j)=>Math.abs(n-relativePath[i][j])<.004)),'Independent row resizing preserves head angle and shape');
ok(resized.inner.includes('data-design-section="fhr"'),'Design mode exposes context controls');
const resizedExport=core.buildSVG(headCase,{design:resizedOptions,designEditing:true,selectedSection:'fhr'},true);
ok(!resizedExport.inner.includes('data-design-section=')&&resizedExport.width===resized.width&&resizedExport.height===core.buildSVG(headCase,{design:resizedOptions},true).height,'Context controls stay out of exports; resized dimensions survive');
ok(JSON.stringify(headCase)===originalHeadData,'Section sizing never changes source observations');
const badSizing=designOptions({labelWidth:Infinity,sectionHeights:{fhr:Infinity,progress:-99,fluid:'bad'}});
ok(badSizing.labelWidth===158&&badSizing.sectionHeights.fhr===1&&badSizing.sectionHeights.progress===.65&&badSizing.sectionHeights.fluid===1,'Untrusted dimensions are bounded');
ok(sandbox.window.testDesign.commandSearch('Đổi kiểu THẾ')==='doi kieu the','Action search accepts Vietnamese without accents');
for(const standard of ['who1993','modified','lcg'])for(const compact of [false,true])for(const rowMode of ['auto','custom']){
  const d=core.buildSVG(headCase,{standard,compact,design:{...resizedOptions,rowMode,sections:{fhr:false,fluid:false,oxy:false}}});
  for(const value of [0,3,5,10])ok(Math.abs(d.rowLayout.inverse(d.rowLayout.y(core.cervixY(value)))-core.cervixY(value))<1e-8,'Height transforms remain invertible with hidden rows: '+standard+' '+rowMode);
  ok(!/NaN|Infinity/.test(d.inner),'Every resized model and scope has finite geometry');
}
const compressedText=layoutSVG('<text x="10" y="125" font-size="12">Label</text>',{...designOptions({sectionHeights:{fhr:.65}})});
ok(compressedText.includes('font-size="8.424"'),'Text scales down with compressed bands to avoid label collisions');
// One drawing choice per observation, independent of position and scale.
const expectedAngles={OA:180,ROA:135,ROT:90,ROP:45,OP:0,LOP:315,LOT:270,LOA:225};
ok(sandbox.window.testDesign.headPositions.length===8,'Exactly eight vertex positions are available');
for(const position of sandbox.window.testDesign.headPositions){
  ok(position.angle===expectedAngles[position.id],'Position uses the below-pelvis convention: '+position.id);
  for(const fontanelles of ['both','posterior','anterior']){
    const selected=core.validateCase({...c,observations:[{time:0,descent:3,headMarker:{angle:position.angle,size:16,fontanelles}}]});
    const restored=core.parseCases(JSON.stringify(selected))[0];
    ok(restored.observations[0].headMarker.fontanelles===fontanelles,'Fontanelle selection survives JSON: '+position.id+' '+fontanelles);
    for(const mono of [false,true]){
      const drawing=core.buildSVG(restored,{mono,design:{cellWidth:1.65,rowHeight:.72,sectionHeights:{progress:1.8}}},true).inner;
      ok((drawing.match(/data-fontanelle="anterior"/g)||[]).length===(fontanelles==='posterior'?0:1),'Only the chosen anterior fontanelle is exported');
      ok((drawing.match(/data-fontanelle="posterior"/g)||[]).length===(fontanelles==='anterior'?0:1),'Only the chosen posterior fontanelle is exported');
      ok(!/NaN|Infinity/.test(drawing),'All position/visibility exports have finite geometry');
    }
    ok(restored.observations[0].time===0&&restored.observations[0].descent===3,'Position choice never changes time or descent');
  }
}
for(const fontanelles of ['invalid','<script>',0,false,{},[]]){
  assert.throws(()=>core.validateCase({...c,observations:[{time:0,descent:3,headMarker:{angle:0,size:12,fontanelles}}]}));checks++;
}
// Custom point colors are data, never arbitrary SVG attributes.
const coloredHead=core.validateCase({...c,observations:[{time:0,descent:3,headMarker:{angle:225,size:16,color:'#A135D4',fontanelles:'posterior'}}]});
ok(core.parseCases(JSON.stringify(coloredHead))[0].observations[0].headMarker.color==='#a135d4','Point color survives a normalized JSON round trip');
for(const mono of [false,true]){
 const svg=core.buildSVG(coloredHead,{mono},true).inner;
 const marker=svg.match(/<g data-head-marker="true"[^>]*>([\s\S]*?)<\/g>/)[1];
 ok(mono?!marker.includes('#a135d4'):marker.includes('#a135d4'),'Custom point colors follow the selected color/monochrome output');
}
for(const color of ['red','#fff','url(x)','" onload="bad',null,12,{}]){
 assert.throws(()=>core.validateCase({...c,observations:[{time:0,descent:3,headMarker:{angle:0,size:12,color}}]}));checks++;
}
for(const cellWidth of [.65,2.4])for(const rowHeight of [.5,2]){
 const d=core.buildSVG(coloredHead,{design:{cellWidth,rowHeight}},true);
 ok(d.scaleX===cellWidth&&d.scaleY===rowHeight&&!/NaN|Infinity/.test(d.inner),'Extended canvas dimensions render at both bounds');
 const marker=d.inner.match(/<g data-head-marker="true"[^>]*>([\s\S]*?)<\/g>/)[1];
 ok(/r="16"/.test(marker),'Wider sizing range preserves circular head drawings');
}
const {changeChartPoint}=sandbox.window.testDesign;
const pointCase=core.validateCase({...c,observations:[
 {time:0,cervix:4,descent:4,fhr:140,contractions:2,duration:30,medication:'Giữ nguyên ghi chú',headMarker:{angle:225,size:14,color:'#7c3aed'}},
 {time:1,fhr:144,ivFluids:'Giữ nguyên dịch'},
 {time:2,cervix:6,descent:3,fhr:150}
]});
const pointOriginal=JSON.stringify(pointCase);
let edited=changeChartPoint(pointCase,{field:'cervix',fromTime:0,fromValue:4,time:.5,value:4.5});
ok(edited.observations.find(o=>o.time===0).cervix===null&&edited.observations.find(o=>o.time===.5).cervix===4.5,'Dragging moves only the selected measurement to its new hour/value');
ok(edited.observations.find(o=>o.time===0).fhr===140&&edited.observations.find(o=>o.time===0).descent===4,'Other measurements stay at the original hour');
edited=changeChartPoint(pointCase,{field:'descent',fromTime:0,fromValue:4,time:1,value:2});
ok(!edited.observations[0].headMarker&&edited.observations[1].headMarker.color==='#7c3aed'&&edited.observations[1].headMarker.angle===225,'Moving descent carries the point-specific head drawing');
ok(edited.observations[1].fhr===144&&edited.observations[1].ivFluids==='Giữ nguyên dịch','Moving onto another series merges without replacing other values');
edited=changeChartPoint(pointCase,{field:'cervix',time:1,value:5});
ok(edited.observations[1].cervix===5&&edited.observations[1].fhr===144,'Adding fills only the chosen empty field');
edited=changeChartPoint(pointCase,{field:'fhr',fromTime:0,fromValue:140,time:2,value:145,swap:true,targetValue:150});
ok(edited.observations.find(o=>o.time===0).fhr===150&&edited.observations.find(o=>o.time===2).fhr===145,'An explicit swap preserves the displaced point and applies the dragged value');
ok(edited.observations.find(o=>o.time===2).cervix===6&&edited.observations.find(o=>o.time===0).medication==='Giữ nguyên ghi chú','Swapping a measurement preserves all other fields');
const twoHeads=core.validateCase({...pointCase,observations:pointCase.observations.map(o=>o.time===2?{...o,headMarker:{angle:45,size:12,color:'#2469ab'}}:o)});
edited=changeChartPoint(twoHeads,{field:'descent',fromTime:0,fromValue:4,time:2,value:2,swap:true,targetValue:3});
ok(edited.observations.find(o=>o.time===0).headMarker.angle===45&&edited.observations.find(o=>o.time===2).headMarker.angle===225,'A descent swap carries each head drawing to its new hour');
ok(edited.observations.find(o=>o.time===0).descent===3&&edited.observations.find(o=>o.time===2).descent===2,'Descent swap keeps the displaced measurement');
const unmarkedSource=core.validateCase({...twoHeads,observations:twoHeads.observations.map(o=>o.time===0?{...o,headMarker:undefined}:o)});
edited=changeChartPoint(unmarkedSource,{field:'descent',fromTime:0,fromValue:4,time:2,value:2,swap:true,targetValue:3});
ok(!edited.observations.find(o=>o.time===2).headMarker&&edited.observations.find(o=>o.time===0).headMarker.angle===45,'An unmarked descent never inherits the destination head drawing');
for(const change of [
 {field:'fhr',fromTime:0,fromValue:140,time:2,value:145,swap:true,targetValue:149},
 {field:'fhr',fromTime:0,fromValue:140,time:2,value:145,swap:true},
 {field:'fhr',time:2,value:145,swap:true,targetValue:150},
 {field:'cervix',fromTime:0,time:2,value:5},
 {field:'fhr',time:0,value:130},
 {field:'cervix',fromTime:0,fromValue:7,time:1,value:5},
 {field:'descent',fromTime:1,time:0,value:2},
 {field:'cervix',time:-.5,value:5},
 {field:'cervix',time:.251,value:5},
 {field:'cervix',time:73,value:5},
 {field:'cervix',time:1,value:undefined},
 {field:'cervix',time:1,value:NaN},
 {field:'descent',time:1,value:6},
 {field:'fhr',time:1.5,value:140.5},
 {field:'unknown',time:1,value:5},
 {field:'contraction',time:1,row:5}
]){assert.throws(()=>changeChartPoint(pointCase,change));checks++}
ok(JSON.stringify(pointCase)===pointOriginal,'Successful and rejected edits never mutate the input case');
edited=changeChartPoint(pointCase,{field:'contraction',time:1,row:0});
ok(edited.observations[1].contractions===1&&edited.observations[1].duration===null&&edited.observations[1].fhr===144,'Contraction clicks share validation while retaining other data');
const hitDrawing=core.buildSVG(pointCase,{editable:true,field:'cervix'}).inner;
ok(hitDrawing.includes('data-point-hit="true"'),'Editing exposes larger focusable point targets');
const cleanPointExport=core.buildSVG(pointCase,{editable:true,field:'cervix'},true).inner;
ok(!cleanPointExport.includes('data-point-hit')&&!cleanPointExport.includes('data-plot=')&&!cleanPointExport.includes('data-contraction='),'Exports exclude all direct editing hit targets');
const removePoint=sandbox.window.testDesign.removeChartPoint;
for(const field of ['cervix','descent','fhr']){
  const deleted=removePoint(pointCase,{field,time:0,fromValue:pointCase.observations[0][field]});
  ok(deleted.observations[0][field]===null,'Delete removes only the chosen measurement');
  for(const other of ['cervix','descent','fhr'].filter(k=>k!==field))ok(deleted.observations[0][other]===pointCase.observations[0][other],'Delete preserves other series at the same time');
  ok(field==='descent'?!deleted.observations[0].headMarker:!!deleted.observations[0].headMarker,'Only deleting descent removes its head marker');
}
for(const data of [{field:'unknown',time:0},{field:'fhr',time:99},{field:'cervix',time:1},{field:'cervix',time:0,fromValue:9}]){assert.throws(()=>removePoint(pointCase,data));checks++}
ok(JSON.stringify(pointCase)===pointOriginal,'Point deletion preserves the source case on success and failure');
ok(designOptions({}).fluidNotation==='vn','Vietnamese notation is the default');
ok(!Object.hasOwn(designOptions({patient:{name:'private'}}),'patient'),'Design templates exclude unrelated data');
const vnRaw={...c,observations:[{time:0,fluid:'C'},{time:1,fluid:'T'},{time:2,fluid:'K'},{time:3,fluid:'X+++'}]};
const vnImport=core.parseCases(JSON.stringify(vnRaw),'vn')[0];
ok(vnImport.observations.map(o=>o.fluid).join(',')==='I,C,A,M+++','Explicit Vietnamese JSON notation preserves all meanings');
ok(core.parseCases(JSON.stringify({...c,observations:[{time:0,fluid:'C'}]}))[0].observations[0].fluid==='C','Existing WHO JSON C remains clear fluid');
ok(core.parseCases(JSON.stringify({fluidNotation:'vn',cases:[vnRaw]}))[0].observations[0].fluid==='I','VN notation can be declared in a JSON envelope');
ok(vnRaw.observations[0].fluid==='C','Notation conversion never mutates source data');
const paper=designOptions({paperFont:'serif',gridColor:'bad',gridOpacity:-1,timeLabelStep:99,valueLabels:true,anonymize:true});
ok(paper.paperFont==='serif'&&paper.gridColor===defaults.gridColor&&paper.gridOpacity===.2&&paper.timeLabelStep===1,'Paper controls are validated');
const anonymous=core.buildSVG({...c,patient:{...c.patient,name:'PRIVATE_NAME',code:'PRIVATE_CODE'}},{design:{anonymize:true,paperFont:'serif',valueLabels:true,gridColor:'#6789ab'}},true).inner;
ok(!anonymous.includes('PRIVATE_NAME')&&!anonymous.includes('PRIVATE_CODE')&&anonymous.includes('Đã ẩn'),'Anonymization hides only specified header fields');
ok(anonymous.includes('Times New Roman, serif')&&anonymous.includes('#6789ab'),'Font and grid customization reach exported SVG');
const normalView=core.buildSVG(c,{design:{exportNarrative:true,showLegend:true}}),exportView=core.buildSVG(c,{design:{exportNarrative:true,showLegend:true}},true);
ok(normalView.width===exportView.width&&normalView.height===exportView.height,'Noninteractive chart and export share the same layout');
ok(normalView.inner.includes('TÌNH HUỐNG LÂM SÀNG')&&normalView.inner.includes('CƠN CO · THỜI GIAN MỖI CƠN'),'Narrative and legend are visible while designing');
const publicCase=JSON.parse(core.caseJSON(c));
ok(publicCase.fluidNotation==='vn'&&publicCase.observations[0].fluid==='C','Public JSON declares VN and uses C for intact membranes');
ok(publicCase.observations.some(o=>o.fluid==='T'),'Public JSON uses T for white fluid');
ok(JSON.stringify(core.parseCases(core.caseJSON(c))[0])===JSON.stringify(core.validateCase(c)),'Vietnamese single-case JSON round-trips without data changes');
ok(core.parseCases(core.caseJSON([c,c])).every(v=>v.observations[0].fluid==='I'),'Every case in an array declares its own notation');
const mixedJSON=JSON.stringify([{...c,fluidNotation:'vn',observations:[{time:0,fluid:'C'}]},{...c,fluidNotation:'who',observations:[{time:0,fluid:'C'}]}]);
ok(core.parseCases(mixedJSON,'auto').map(v=>v.observations[0].fluid).join(',')==='I,C','Per-case declaration disambiguates C even in mixed arrays');
assert.throws(()=>core.parseCases(JSON.stringify({...c,fluidNotation:'vn',observations:[{time:0,fluid:'I'}]})));checks++;
assert.throws(()=>core.parseCases(JSON.stringify({...c,fluidNotation:'invalid'})));checks++;
const editCell=core.changeChartCell;
const fluidCell={scope:'observation',key:'fluid',caseId:c.id,time:0,expected:{fluid:c.observations[0].fluid},values:{fluid:'C'}};
const cellChanged=editCell(c,fluidCell);
ok(cellChanged.observations[0].fluid==='C'&&c.observations[0].fluid==='I','Direct cell edits validate a copy and preserve the original');
ok(cellChanged.observations[0].cervix===c.observations[0].cervix,'Direct fluid edit preserves every other field');
const newCell=editCell(c,{scope:'observation',key:'urineVolume',caseId:c.id,time:7.5,expected:{urineVolume:''},values:{urineVolume:240}});
ok(newCell.observations.find(o=>o.time===7.5).urineVolume===240&&newCell.observations.find(o=>o.time===7.5).cervix===null,'An empty cell creates only the requested observation field');
for(const data of [{...fluidCell,caseId:'stale'},{...fluidCell,expected:{fluid:'M'}},{...fluidCell,scope:'unknown'},{...fluidCell,key:'unknown'},{...fluidCell,time:1.25},{...fluidCell,values:{fluid:'invalid'}}]){assert.throws(()=>editCell(c,data));checks++}
const vitals=editCell(c,{scope:'observation',key:'vitals',caseId:c.id,time:0,expected:{pulse:c.observations[0].pulse,systolic:c.observations[0].systolic,diastolic:c.observations[0].diastolic},values:{pulse:92,systolic:125,diastolic:80}});
ok(vitals.observations[0].pulse===92&&vitals.observations[0].systolic===125&&vitals.observations[0].diastolic===80,'Blood pressure and pulse update as one validated change');
assert.throws(()=>editCell(c,{scope:'observation',key:'vitals',caseId:c.id,time:0,expected:{pulse:c.observations[0].pulse,systolic:c.observations[0].systolic,diastolic:c.observations[0].diastolic},values:{pulse:92,systolic:70,diastolic:80}}));checks++;
const cellDrawing=core.buildSVG(c,{editable:true,design:{rowMode:'all'}}).inner;
for(const key of ['fluid','moulding','oxyDose','oxyRate','medication','ivFluids','vitals','temperature','protein','acetone','urineVolume','identity','clock','title'])ok(cellDrawing.includes('data-cell-key="'+key+'"'),'Direct hit targets cover '+key);
ok(cellDrawing.includes('data-cell-key="contractions"')&&!cellDrawing.includes('data-contraction='),'One full-height target per contraction column replaces five separate cell targets');
ok(!core.buildSVG(c,{editable:true},true).inner.includes('data-cell-'),'Export contains no direct-cell controls');
const endVitals=core.buildSVG(core.validateCase({...c,observations:[{time:0,cervix:4},{time:24,pulse:90,systolic:120,diastolic:80}]}),{standard:'who1993',editable:true,design:{rowMode:'all'}}).inner;
ok(endVitals.includes('data-cell-key="vitals" data-cell-scope="observation" data-cell-time="24"'),'The final blood pressure measurement remains editable at the edge');
for(const key of ['oxy','oxyDose','oxyRate'])ok(core.chartCellFields(key).map(f=>f.key).join(',')==='oxyDose,oxyRate','Both oxytocin rows open the concentration/rate pair');
const oxyCell={scope:'observation',key:'oxy',caseId:c.id,time:0,expected:{oxyDose:c.observations[0].oxyDose,oxyRate:c.observations[0].oxyRate},values:{oxyDose:2.5,oxyRate:8}},oxyChanged=editCell(c,oxyCell);
ok(oxyChanged.observations[0].oxyDose===2.5&&oxyChanged.observations[0].oxyRate===8&&oxyChanged.observations[0].medication===c.observations[0].medication,'Oxytocin concentration and drip rate share one validated edit without changing medication');
assert.throws(()=>editCell(c,{...oxyCell,expected:{...oxyCell.expected,oxyRate:99}}));checks++;
// Arrow notes: normalisation, the dedicated band, and callout labels.
ok(showcase.events?.length===4&&showcase.observations.filter(o=>o.headMarker).length===4,'Opening case shows arrow notes and head positions');
const noted=core.validateCase({...c,events:[{time:'10:15',label:'  Bắt đầu oxytocin  '},{time:1.5,label:'Gây tê ngoài màng cứng'},{time:0.1,label:'Nhập phòng sinh'}]});
ok(JSON.stringify(noted.events)===JSON.stringify([{time:0.1,label:'Nhập phòng sinh'},{time:1.5,label:'Gây tê ngoài màng cứng'},{time:2.25,label:'Bắt đầu oxytocin'}]),'Events accept clock times, preserve exact minutes, trim labels and sort by time');
assert.throws(()=>core.validateCase({...c,events:[{time:2,label:''}]}));checks++;
assert.throws(()=>core.validateCase({...c,events:[{time:73,label:'Ngoài giờ'}]}));checks++;
ok(core.validateCase({...c,events:[]}).events===undefined,'An empty event list leaves the case unchanged');
const plain=core.buildSVG(c,{design:{cellWidth:1,rowHeight:1,rowMode:'all'}}),withNotes=core.buildSVG(noted,{design:{cellWidth:1,rowHeight:1,rowMode:'all'}});
ok(!plain.inner.includes('SỰ KIỆN')&&withNotes.inner.includes('>SỰ KIỆN<'),'The events band appears only when the case has notes');
ok(withNotes.height-plain.height>=30,'The events band adds its own vertical space instead of overlapping the cervicograph');
ok(['Nhập phòng sinh','Gây tê ngoài màng cứng','Bắt đầu oxytocin'].every(t=>withNotes.inner.includes('>'+t+'<')),'Callouts show full labels when they fit');
ok((withNotes.inner.match(/data-event-index="/g)||[]).length===3,'Each note is one clickable callout');
console.log(`PASS: ${checks} checks (including ${original.passed} existing checks).`);

