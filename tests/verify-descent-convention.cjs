// Display contract confirmed by the author: one head curve, 2/5 aligned with station 0.
const ROOT=require('node:path').join(__dirname,'..');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const script=['core.js','components.js','app.js'].map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n'),html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8')+'\n<script>'+script+'</script>';
const sandbox={window:{},document:{readyState:'loading',addEventListener(){}},Blob,TextEncoder,Uint8Array,DataView,atob,btoa};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(ROOT,'clinical-rules.js'),'utf8'),sandbox);vm.runInContext(script,sandbox);const core=sandbox.window.PartographCore;
const pairs=[[5,-3],[4,-2],[3,-1],[2,0],[1,1],[0,2]],patient={startTime:'08:00',date:'2026-10-25'};
const sample=kind=>core.validateCase({id:'CONVENTION',title:'Một đường độ lọt · hai cách đọc',patient,observations:pairs.map(([descent,station],i)=>({time:i,cervix:4+i,...(kind!=='station'?{descent}:{}),...(kind!=='fifths'?{station}:{}),...(i===5?{occiputPosition:'LOA'}:{})}))});
const fifths=sample('fifths'),station=sample('station'),both=sample('both');
const paths=svg=>Array.from(svg.matchAll(/<polyline data-series="des" points="([^"]+)"/g),m=>m[1]);
function tickY(svg,attr,value){const tag=Array.from(svg.matchAll(/<text\b[^>]*>/g),m=>m[0]).find(t=>t.includes(attr+'="'+value+'"'));assert.ok(tag,'Visible tick '+attr+'='+value);return tag.match(/\by="([^"]+)"/)[1]}
for(const standard of ['who1993','modified','lcg'])for(const design of [{},{cellWidth:1.5,rowHeight:.7,sectionHeights:{progress:1.4}},{showNotes:false,valueLabels:true}]){
  const options={standard,design},a=core.buildSVG(fifths,options,true).inner,b=core.buildSVG(station,options,true).inner,c=core.buildSVG(both,options,true).inner;
  assert.deepEqual(paths(a),paths(b),'Both input conventions draw the same trajectory in '+standard);assert.deepEqual(paths(a),paths(c));assert.equal(paths(c).length,1,'Exactly one descent line');
  assert.equal((c.match(/data-head-time=/g)||[]).length,6,'Exactly one measured point at each time');assert.ok(!c.includes('data-series="station"'));
  for(const [descent,st] of pairs)assert.equal(tickY(c,'data-descent-tick',descent),tickY(c,'data-station-tick',st),descent+'/5 aligns with station '+st);
  assert.equal((c.match(/data-head-marker="true"/g)||[]).length,1,'One position figure at the recorded moment');assert.ok(c.includes('data-angle="225"'));
  assert.ok(!c.includes('NaN')&&!c.includes('Infinity'));assert.ok(!c.includes('chart-editable-cell'),'Export has no editing controls');
}
assert.ok(station.observations.every(o=>o.descent===null),'Drawing never adds an unrecorded abdominal measurement');assert.ok(fifths.observations.every(o=>o.station===null),'Drawing never adds an unrecorded vaginal measurement');
assert.deepEqual(Array.from(core.parseCases(core.caseJSON(station))[0].observations,o=>o.station),[-3,-2,-1,0,1,2]);
const conflict=core.validateCase({id:'CONFLICT',patient,observations:[{time:0,descent:3,station:0}]});const original=JSON.stringify(conflict),conflictSVG=core.buildSVG(conflict,{design:{showNotes:false}},true).inner;
assert.equal(core.headPlotLevel(conflict.observations[0]),3);assert.ok(conflictSVG.includes('Hai cách ghi không khớp'));assert.equal(JSON.stringify(conflict),original);assert.equal((conflictSVG.match(/data-head-time=/g)||[]).length,1);
const outside=core.validateCase({id:'OUTSIDE',patient,observations:[{time:0,station:3}]});const outsideSVG=core.buildSVG(outside,{design:{showNotes:false}},true).inner;assert.ok(outsideSVG.includes('Ngoài thang station'));assert.equal((outsideSVG.match(/data-head-time=/g)||[]).length,0,'An out-of-range value is never clamped to a false endpoint');assert.equal(outside.observations[0].station,3);
console.log('PASS: one identical head curve for /5, station or both; all six ticks align in 9 model/layout combinations; LOA, raw data, conflicting inputs and out-of-range values preserved');
