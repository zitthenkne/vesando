'use strict';
/* Single-file architecture: validated JSON / table / SVG input → Vue state → SVG → PNG / PDF.
   SVG geometry is shared by rendering and pointer conversion; no external data service is used. */
const G={width:1180,left:158,plotWidth:960,hour:40,half:20,fhrY:86,fhrH:128,fluidY:222,progressY:284,progressH:220,contractionY:562,contractionH:100};
// WHO/ICM 2008, Fig. 4.1–4.2 (pp. 57–59): shared 0–10 axis;
// abdominal head descent 0–5 occupies the lower half. It is not vaginal station.
const cervixY=v=>G.progressY+G.progressH-v*G.progressH/10;
const descentY=v=>cervixY(v);
// Display convention explicitly selected by the author: 2/5 shares station 0.
// Resolve one drawing point without changing either recorded measurement.
function headPlotLevel(o){return finite(o.descent)?o.descent:finite(o.station)?2-o.station:null}
function headConventionConflict(o){return finite(o.descent)&&finite(o.station)&&Math.abs(o.station-(2-o.descent))>1e-8}
const fetalHeartY=v=>G.fhrY+(200-clamp(v,80,200))*G.fhrH/120;
function plotValueAt(y,field){if(field==='fhr')return Math.round(clamp(200-(y-G.fhrY)*120/G.fhrH,80,200));const value=(G.progressY+G.progressH-y)*10/G.progressH;return field==='descent'?Math.round(clamp(value,0,5)):Math.round(clamp(value,0,10)*2)/2}
function plotBounds(field){return field==='fhr'?{y:G.fhrY,height:G.fhrH}:field==='descent'?{y:cervixY(5),height:G.progressH/2}:{y:G.progressY,height:G.progressH}}
const SERIES_LIST=[{key:'ctc',label:'CTC'},{key:'des',label:'Đầu trên vệ'},{key:'fhr',label:'Tim thai'},{key:'pulse',label:'Mạch mẹ'},{key:'alert',label:'Báo động'},{key:'action',label:'Hành động'}];
const PALETTES=[
  {id:'clinical',label:'Lâm sàng',colors:['#d42f4e','#2469ab','#172b3a','#172b3a','#b65c24','#b72935']},
  {id:'accessible',label:'Dễ phân biệt',colors:['#9c4f00','#006b85','#20313f','#4b5662','#7e5200','#7c2460']},
  {id:'okabe',label:'Mù màu · Okabe–Ito',colors:['#d55e00','#0072b2','#000000','#cc79a7','#e69f00','#882255']},
  {id:'soft',label:'Pastel dịu',colors:['#e0566f','#4a8fd6','#3d5a6c','#6b7f90','#d9944a','#cf4f5b']},
  {id:'contrast',label:'Tương phản cao',colors:['#c0002a','#0047ab','#000000','#2b2b2b','#a14a00','#8a0014']},
  {id:'ink',label:'Mực xanh',colors:['#172b3a','#546b7c','#172b3a','#172b3a','#696969','#172b3a']}
];
const EVENT_COLORS=[{color:'#6d28d9',label:'Tím (mặc định)'},{color:'#0e6b62',label:'Xanh y khoa'},{color:'#1f5fbf',label:'Xanh dương'},{color:'#b45309',label:'Hổ phách'},{color:'#b4233c',label:'Đỏ'},{color:'#475569',label:'Xám'}],EVENT_SIZES={s:.88,m:1,l:1.15};
const mixHex=(a,b,t)=>'#'+[1,3,5].map(i=>{const x=parseInt(a.slice(i,i+2),16);return Math.round(x+(parseInt(b.slice(i,i+2),16)-x)*t).toString(16).padStart(2,'0')}).join('');
// Callout colours from one base colour; the default violet keeps its original hand-tuned shades.
function notePalette(color,mono){if(mono)return {ink:'#222222',text:'#111111',edge:'#9a9a9a',leader:'#777777',fill:'#ffffff'};const c=/^#[\da-f]{6}$/i.test(color||'')?color.toLowerCase():EVENT_COLORS[0].color;if(c===EVENT_COLORS[0].color)return {ink:c,text:'#3b1a7a',edge:'#c9b8f5',leader:'#a78bfa',fill:'#fbf9ff'};return {ink:c,text:mixHex(c,'#000000',.45),edge:mixHex(c,'#ffffff',.62),leader:mixHex(c,'#ffffff',.35),fill:mixHex(c,'#ffffff',.96)}}
const POINT_NAMES={cervix:'CTC',descent:'Đầu trên vệ',fhr:'Tim thai'},POINT_UNITS={cervix:' cm',descent:'/5',fhr:' lần/phút'},SERIES_OF={cervix:'ctc',descent:'des',fhr:'fhr'};
const QUICK_COLORS=['#d42f4e','#2469ab','#0e6b62','#172b3a','#b45309','#6d28d9'];
const SYMBOL_LABELS={cross:'×',circle:'○',dot:'●',square:'□',diamond:'◇',plus:'+',none:'—'};
const SYMBOL_NAMES={cross:'Chữ X',circle:'Tròn rỗng',dot:'Chấm đặc',square:'Vuông',diamond:'Thoi',plus:'Dấu cộng',none:'Không ký hiệu'};
const DESIGN_DEFAULTS={cellWidth:1.2,rowHeight:.82,labelWidth:158,sectionHeights:{},stroke:1.45,grid:1.15,font:1.08,exportNarrative:false,showLegend:true,fluidNotation:'vn',paperFont:'sans',gridColor:'#a8b4bf',gridOpacity:1,valueLabels:false,anonymize:false,timeLabelStep:1,showFhrBand:true,fhrLabelStep:20,fhrBand:'auto',vitalsLabelStep:20,showClock:true,minorGrid:true,headerLayout:'grid',textFollowsRegion:false,showHeader:true,showCaseTitle:true,showHeadMarkers:true,eventGuides:true,showNotes:true,showEvents:true,zoneShading:false,sectionAccent:false,hiddenSeries:[],lockedSeries:[],lockedLayers:[],rowLabels:{},watermark:'',titleAlign:'right',timeMode:'auto',timeHours:8,timePadding:0,rowMode:'auto',sections:{},imageScale:3,series:{
  ctc:{color:'#d42f4e',marker:'cross',size:5,width:1.8,dash:'solid'},des:{color:'#2469ab',marker:'circle',size:5,width:1.6,dash:'dashed'},
  fhr:{color:'#172b3a',marker:'dot',size:3,width:1.7,dash:'solid'},pulse:{color:'#172b3a',marker:'dot',size:3,width:1.5,dash:'solid'},
  alert:{color:'#b65c24',marker:'none',size:4,width:1,dash:'solid'},action:{color:'#b72935',marker:'none',size:4,width:2,dash:'solid'}
}};
function designOptions(raw={}){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))raw={};const d={...DESIGN_DEFAULTS,...Object.fromEntries(Object.keys(DESIGN_DEFAULTS).filter(k=>Object.hasOwn(raw,k)).map(k=>[k,raw[k]])),series:{}};
  for(const [key,min,max] of [['cellWidth',.65,2.4],['rowHeight',.5,2],['stroke',.75,2.5],['grid',.5,2],['font',.9,1.25]])d[key]=clamp(finite(raw[key])?raw[key]:DESIGN_DEFAULTS[key],min,max);
  for(const {key} of SERIES_LIST){const base=DESIGN_DEFAULTS.series[key],s={...base,...raw.series?.[key]};d.series[key]={color:/^#[\da-f]{6}$/i.test(s.color)?s.color:base.color,marker:Object.hasOwn(SYMBOL_LABELS,s.marker)?s.marker:base.marker,size:clamp(finite(s.size)?s.size:base.size,2,10),width:clamp(finite(s.width)?s.width:base.width,.5,5),dash:['solid','dashed','dotted','none'].includes(s.dash)?s.dash:base.dash}}
  for(const key of ['alert','action'])if(d.series[key].dash==='none')d.series[key].dash='solid';
  d.timeMode=['auto','manual','full'].includes(raw.timeMode)?raw.timeMode:'auto';
  d.timeHours=clamp(finite(raw.timeHours)?Math.ceil(raw.timeHours):8,4,48);d.timePadding=clamp(finite(raw.timePadding)?raw.timePadding:0,0,8);d.imageScale=[1,2,3,4].includes(raw.imageScale)?raw.imageScale:3;
  d.rowMode=['auto','all','custom'].includes(raw.rowMode)?raw.rowMode:'auto';d.sections=Object.fromEntries(CHART_SECTIONS.map(g=>[g.id,raw.sections?.[g.id]!==false]));
  d.fluidNotation=raw.fluidNotation==='who'?'who':'vn';
  d.paperFont=raw.paperFont==='serif'?'serif':'sans';d.gridColor=/^#[\da-f]{6}$/i.test(raw.gridColor)?raw.gridColor:DESIGN_DEFAULTS.gridColor;
  d.gridOpacity=clamp(finite(raw.gridOpacity)?raw.gridOpacity:1,.2,1);d.timeLabelStep=[.5,1,2].includes(raw.timeLabelStep)?raw.timeLabelStep:1;
  for(const k of ['valueLabels','anonymize'])d[k]=raw[k]===true;d.showFhrBand=raw.showFhrBand!==false;
  d.lockedLayers=Array.isArray(raw.lockedLayers)?raw.lockedLayers.filter(id=>['header','fhr','progress','contractions','medication','mother','notes'].includes(id)):[];
  d.lockedSeries=Array.isArray(raw.lockedSeries)?SERIES_LIST.map(s=>s.key).filter(k=>raw.lockedSeries.includes(k)):[];
  d.watermark=typeof raw.watermark==='string'?raw.watermark.trim().slice(0,60):'';d.titleAlign=['left','center','right'].includes(raw.titleAlign)?raw.titleAlign:'right';
  d.rowLabels=Object.fromEntries(Object.entries(raw.rowLabels&&typeof raw.rowLabels==='object'&&!Array.isArray(raw.rowLabels)?raw.rowLabels:{}).filter(([k,v])=>typeof v==='string'&&k.length<60).slice(0,30).map(([k,v])=>[k,v.trim().slice(0,32)]));
  for(const k of ['showClock','minorGrid','showHeader','showCaseTitle','showHeadMarkers','eventGuides','showNotes','showEvents'])d[k]=raw[k]!==false;
  for(const k of ['zoneShading','sectionAccent'])d[k]=raw[k]===true;d.hiddenSeries=Array.isArray(raw.hiddenSeries)?SERIES_LIST.map(s=>s.key).filter(k=>raw.hiddenSeries.includes(k)):[];d.headerLayout=raw.headerLayout==='line'?'line':'grid';d.textFollowsRegion=raw.textFollowsRegion===true;
  for(const k of ['fhrLabelStep','vitalsLabelStep'])d[k]=[10,20,40].includes(raw[k])?raw[k]:20;d.fhrBand=[110,120].includes(raw.fhrBand)?raw.fhrBand:'auto';
  d.labelWidth=clamp(finite(raw.labelWidth)?raw.labelWidth:158,130,260);
  d.sectionHeights=Object.fromEntries(RESIZE_SECTIONS.map(g=>[g.id,clamp(finite(raw.sectionHeights?.[g.id])?raw.sectionHeights[g.id]:1,.65,2.5)]));
  return d;
}
const CHART_SECTIONS=[
  {id:'fhr',label:'Tim thai',from:80,to:222,keys:['fhr']},
  {id:'fluid',label:'Ối & biến dạng',from:222,to:278,keys:['fluid','moulding']},
  {id:'contractions',label:'Cơn co',from:552,to:684,keys:['contractions','duration','contractionCells']},
  {id:'oxy',label:'Oxytocin',from:684,to:738,keys:['oxyDose','oxyRate']},
  {id:'medication',label:'Thuốc & dịch truyền',from:738,to:830,keys:['medication','ivFluids']},
  {id:'vitals',label:'Mạch & huyết áp',from:830,to:999,keys:['pulse','systolic','diastolic']},
  {id:'temperature',label:'Nhiệt độ',from:999,to:1037,keys:['temperature']},
  {id:'urine',label:'Nước tiểu',from:1037,to:1135,keys:['protein','acetone','urineVolume']}
];
const SECTION_ACCENT={fhr:'#0d9488',fluid:'#0284c7',progress:'#e11d48',contractions:'#d97706',oxy:'#7c3aed',medication:'#9333ea',vitals:'#16a34a',temperature:'#ea580c',urine:'#0891b2'};
const RESIZE_SECTIONS=[{id:'header',label:'Thông tin ca',from:0,to:80},...CHART_SECTIONS,{id:'progress',label:'CTC & đầu trên vệ',from:278,to:552}].sort((a,b)=>a.from-b.from);
// Arrow notes get their own band above the cervicograph: one row of callouts, two when labels are many or long.
function nextEventStyle(raw){
  const r=raw&&typeof raw==='object'?raw:{};
  return {dx:clamp(Number(r.dx)||0,-1000,1000),dy:clamp(Number(r.dy)||0,0,96),z:clamp(Math.round(Number(r.z)||0),0,30),kind:['short','box','arrow'].includes(r.kind)?r.kind:'arrow'};
}
function noteRows(c){const list=c.events||[];if(!list.length)return 0;return Math.max(list.reduce((sum,e)=>sum+Math.min(e.label.length,48)*5.1+40,0)>1050?2:1,1+Math.ceil(Math.max(...list.map(e=>e.layout?.dy||0))/24))}
function noteBandHeight(c){const rows=noteRows(c);return rows?22+rows*24:0}
function chartRows(c,d,compact,editable,field){
  const present=id=>{const g=CHART_SECTIONS.find(g=>g.id===id);return c.observations.some(o=>g.keys.some(k=>!blank(o[k])&&(!Array.isArray(o[k])||o[k].some(Boolean))))};
  const hidden=CHART_SECTIONS.filter(g=>!(compact&&g.from>=830)&&!(editable&&(g.id==='contractions'||g.id==='fhr'))&&(d.rowMode==='auto'?!['oxy','medication'].includes(g.id)&&!present(g.id):d.rowMode==='custom'?!d.sections[g.id]:false));
  const noteBand=d.showEvents?noteBandHeight(c):0,bands=RESIZE_SECTIONS.flatMap(g=>{const scale=hidden.some(h=>h.id===g.id)?0:d.sectionHeights[g.id];return g.id==='fluid'&&noteBand?[{...g,to:g.to-6,scale},{...g,from:g.to-6,scale:noteBand/6}]:[{...g,scale}]});
  const y=v=>v+bands.reduce((sum,g)=>sum+clamp(v-g.from,0,g.to-g.from)*(g.scale-1),0);
  const inverse=v=>{let shift=0;for(const g of bands){const start=g.from+shift,height=(g.to-g.from)*g.scale;if(v<start)return v-shift;if(g.scale&&v<start+height)return g.from+(v-start)/g.scale;shift+=(g.to-g.from)*(g.scale-1)}return v-shift};
  return {hidden,y,inverse,present};
}
function seriesDash(s){return s.dash==='dashed'?'7 4':s.dash==='dotted'?'1 4':''}
function symbolSVG(x,y,s,design,mono=false){
  const scale=design.sectionHeights?.[RESIZE_SECTIONS.find(g=>y>=g.from&&y<g.to)?.id]||1;
  const color=mono?'#000000':s.color,r=s.size,rx=r/design.cellWidth,ry=r/(design.rowHeight*scale),sw=Math.max(1,s.width),attrs=' stroke="'+color+'" stroke-width="'+sw+'" stroke-linecap="round"';
  if(s.marker==='none')return '';
  if(['circle','dot'].includes(s.marker))return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+(s.marker==='dot'?color:'white')+'"'+attrs+'/>';
  if(s.marker==='square')return '<rect x="'+(x-rx)+'" y="'+(y-ry)+'" width="'+rx*2+'" height="'+ry*2+'" fill="white"'+attrs+'/>';
  if(s.marker==='diamond')return '<polyline points="'+x+','+(y-ry)+' '+(x+rx)+','+y+' '+x+','+(y+ry)+' '+(x-rx)+','+y+' '+x+','+(y-ry)+'" fill="white"'+attrs+'/>';
  const cross=s.marker==='cross';return '<path d="M '+(x-rx)+' '+(cross?y-ry:y)+' L '+(x+rx)+' '+(cross?y+ry:y)+' M '+(cross?x-rx:x)+' '+(y+ry)+' L '+(cross?x+rx:x)+' '+(y-ry)+'" fill="none"'+attrs+'/>';
}
// Viewed from below: maternal left is on the right of the page; pubis is above.
const HEAD_POSITIONS=[
  {id:'ROA',label:'Chẩm phải trước',angle:135},{id:'OA',label:'Chẩm vệ',angle:180},{id:'LOA',label:'Chẩm trái trước',angle:225},
  {id:'ROT',label:'Chẩm phải ngang',angle:90},{id:'LOT',label:'Chẩm trái ngang',angle:270},
  {id:'ROP',label:'Chẩm phải sau',angle:45},{id:'OP',label:'Chẩm cùng',angle:0},{id:'LOP',label:'Chẩm trái sau',angle:315}
];
function clinicalHeadMarker(o){
  if(o.headMarker)return o.headMarker;
  const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const label=normalize(o.fetalPosition).replace(/^kieu the\s+/,'').replace(/cham chau/,'cham').replace(/\s*\([^)]*\)\s*$/,'');
  const position=HEAD_POSITIONS.find(p=>p.id===o.occiputPosition||p.id===String(o.fetalPosition||'').trim().toUpperCase()||normalize(p.label)===label||p.id==='LOA'&&label==='ctt');
  return position?{angle:position.angle,size:12,fontanelles:'both'}:null;
}
function headMarkerSVG(x,y,marker,design,color,mono=false){
  const r=marker.size,a=marker.angle*Math.PI/180,ink=mono?'#000000':marker.color||color;
  // Compensate before layoutSVG so rotation and size survive unequal cell scales.
  const point=(u,v)=>[(x+(u*Math.cos(a)-v*Math.sin(a))*r/design.cellWidth),(y+(u*Math.sin(a)+v*Math.cos(a))*r/(design.rowHeight*(design.sectionHeights?.progress||1)))].join(' ');
  const path=points=>'M '+points.map(p=>point(...p)).join(' L ');
  const visibility=marker.fontanelles||'both',single=visibility!=='both';
  const sutures=visibility==='posterior'?[[[0,-1],[0,-.22]],[[-.2,.13],[-.8,.6]],[[.2,.13],[.8,.6]]]:visibility==='anterior'?[[[0,-1],[0,-.63]],[[0,-.07],[0,1]],[[-.25,-.35],[-.93,-.35]],[[.25,-.35],[.93,-.35]]]:[[[0,-1],[0,-.78]],[[0,-.22],[0,.33]],[[-.25,-.5],[-.86,-.5]],[[.25,-.5],[.86,-.5]],[[-.2,.68],[-.65,.76]],[[.2,.68],[.65,.76]]];
  const fontanel=(name,points)=>'<path data-fontanelle="'+name+'" d="'+path(points)+'" fill="white" stroke="'+ink+'" stroke-width="1" stroke-linejoin="round"/>';
  let shapes='';
  if(visibility!=='posterior'){const cy=single?-.35:-.5;shapes+=fontanel('anterior',[[0,cy-.28],[.25,cy],[0,cy+.28],[-.25,cy],[0,cy-.28]])}
  if(visibility!=='anterior'){const cy=single?-.22:.33;shapes+=fontanel('posterior',[[0,cy],[.2,cy+.35],[-.2,cy+.35],[0,cy]])}
  return '<g data-head-marker="true" data-angle="'+marker.angle+'" data-fontanelles="'+visibility+'"><circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="white" stroke="'+ink+'" stroke-width="1.2"/><path d="'+sutures.map(path).join(' ')+'" fill="none" stroke="'+ink+'" stroke-width="1"/>'+shapes+'</g>';
}
/* Remap coordinates, never scale the SVG group: text and circles remain undistorted.
   The inverse map in pointer() uses the same two factors. */
function layoutSVG(body,d){
  const n=v=>String(Math.round(v*1000)/1000),sx=d.cellWidth,sy=d.rowHeight,Y=d.mapY||((v)=>v),X=d.mapX||((v)=>v);
  return body.replace(/<(?:text|line|rect|circle|polyline|path)\b[^>]*>/g,tag=>{
    const grid=tag.includes('data-grid=');
    const top=Number(tag.match(/\by="(-?[\d.]+)"/)?.[1]||0);
    const textScale=Math.min(1,d.sectionHeights?.[RESIZE_SECTIONS.find(g=>top>=g.from&&top<g.to)?.id]||1);
    const left=Number(tag.match(/\bx="(-?[\d.]+)"/)?.[1]||0);
    tag=tag.replace(/(?<![\w-])(x|x1|x2|cx|y|y1|y2|cy|width|height)="(-?[\d.]+)"/g,(_,key,value)=>key+'="'+n(['x','x1','x2','cx','width'].includes(key)?(key==='width'?X(left+Number(value))-X(left):X(Number(value)))*sx:(key==='height'?Y(top+Number(value))-Y(top):Y(Number(value)))*sy)+'"');
    tag=tag.replace(/points="([^"]+)"/g,(_,points)=>'points="'+points.trim().split(/\s+/).map(pair=>pair.split(',').map((v,i)=>n(i?Y(Number(v))*sy:X(Number(v))*sx)).join(',')).join(' ')+'"');
    tag=tag.replace(/d="(M [^"]+)"/g,(_,path)=>'d="'+path.replace(/([ML])\s+(-?[\d.]+)\s+(-?[\d.]+)/g,(_,cmd,x,y)=>cmd+' '+n(X(Number(x))*sx)+' '+n(Y(Number(y))*sy))+'"');
    tag=tag.replace(/rotate\((-?[\d.]+)\s+([\d.]+)\s+([\d.]+)\)/g,(_,angle,x,y)=>'rotate('+n(Math.atan(Math.tan(Number(angle)*Math.PI/180)*sy*(d.progressScale||1)/sx)*180/Math.PI)+' '+n(X(Number(x))*sx)+' '+n(Y(Number(y))*sy)+')');
    tag=tag.replace(/font-size="([\d.]+)"/g,(_,v)=>'font-size="'+n(v*d.font*textScale)+'"').replace(/stroke-width="([\d.]+)"/g,(_,v)=>'stroke-width="'+n(v*(grid?d.grid:d.stroke))+'"');
    return tag;
  });
}
const NULL_FIELDS=['station','effacement','fhr','cervix','descent','contractions','duration','oxyDose','oxyRate','pulse','systolic','diastolic','temperature','urineVolume'];
const PATIENT_TEXT_FIELDS=['name','code','para','gestationalAge','riskFactors','onset','rupturedAt','presentation','fetalPosition','dateLabel'];
const FIELD_DEFS=[
  {key:'fhr',label:'Tim thai (lần/phút)',min:30,max:240}, {key:'fluid',label:'Ối',options:['I','C','M','M+','M++','M+++','B','A']},
  {key:'moulding',label:'Biến dạng uốn khuôn',options:['0','+','++','+++']}, {key:'cervix',label:'Độ mở CTC (cm)',min:0,max:10,step:.5},
  {key:'descent',label:'Đầu còn trên vệ (/5)',min:0,max:5}, {key:'station',label:'Station · khám âm đạo (cm)',min:-5,max:5,step:.5}, {key:'effacement',label:'Xóa cổ tử cung (%)',min:0,max:100},
  {key:'occiputPosition',label:'Kiểu thế chẩm',options:HEAD_POSITIONS.map(p=>p.id)}, {key:'contractions',label:'Cơn co / 10 phút',min:0,max:10}, {key:'duration',label:'Thời gian cơn co (giây)',min:1,max:180},
  {key:'oxyDose',label:'Oxytocin (IU/L)',min:0,max:1000,step:.1}, {key:'oxyRate',label:'Oxytocin (giọt/phút)',min:0,max:1000},
  {key:'medication',label:'Thuốc',type:'text'}, {key:'ivFluids',label:'Dịch truyền',type:'text'}, {key:'pulse',label:'Mạch mẹ (lần/phút)',min:20,max:250},
  {key:'systolic',label:'HA tâm thu (mmHg)',min:40,max:300}, {key:'diastolic',label:'HA tâm trương (mmHg)',min:20,max:200}, {key:'temperature',label:'Nhiệt độ (°C)',min:30,max:45,step:.1},
  {key:'protein',label:'Đạm niệu',options:['0','+','++','+++','++++']}, {key:'acetone',label:'Acetone',options:['0','+','++','+++','++++']}, {key:'urineVolume',label:'Nước tiểu (ml)',min:0,max:5000},
  {key:'presentation',label:'Ngôi',type:'text'}, {key:'fetalPosition',label:'Kiểu thế chi tiết',type:'text'},
  {key:'deceleration',label:'LCG · Nhịp giảm',options:['N','E','L','V']}, {key:'position',label:'LCG · Kiểu thế',options:['A','P','T']}, {key:'caput',label:'LCG · Bướu huyết thanh',options:['0','+','++','+++']},
  {key:'companion',label:'LCG · Người đồng hành',options:['Y','N','D','U']}, {key:'painRelief',label:'LCG · Giảm đau',options:['Y','N','D','U']}, {key:'oralFluid',label:'LCG · Uống dịch',options:['Y','N','D','U']}, {key:'posture',label:'LCG · Tư thế',options:['MO','SP','U']}
];
const clone=x=>JSON.parse(JSON.stringify(x));
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const blank=x=>x===null||x===undefined||x==='';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function today(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function emptyObservation(time){const o={time};for(const f of FIELD_DEFS)o[f.key]=f.type==='text'||f.options?'':null;return o}
function clockAt(c,h){if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(c.patient.startTime)||!finite(h))return '—';const [a,b]=c.patient.startTime.split(':').map(Number);const mins=Math.round(a*60+b+h*60);const day=Math.floor(mins/1440);return String(Math.floor(((mins%1440)+1440)%1440/60)).padStart(2,'0')+':'+String(((mins%60)+60)%60).padStart(2,'0')+(day?' ('+(day>0?'+':'')+day+'d)':'')}
function validateCase(input,index=0){
  const fail=m=>{throw new Error('Ca '+(index+1)+': '+m)};
  if(!input||typeof input!=='object'||Array.isArray(input))fail('phải là một đối tượng JSON.');
  const c={id:typeof input.id==='string'?input.id.slice(0,80):'CASE-'+String(index+1).padStart(3,'0'),title:typeof input.title==='string'?input.title.trim().slice(0,180):'Ca lâm sàng '+(index+1),narrative:typeof input.narrative==='string'?input.narrative.slice(0,12000):'',assessment:typeof input.assessment==='string'?input.assessment.slice(0,4000):'',plan:typeof input.plan==='string'?input.plan.slice(0,4000):'',patient:{},observations:[]};
  const p=input.patient??{};if(typeof p!=='object'||Array.isArray(p))fail('patient phải là một đối tượng.');
  for(const k of ['name','code','para','gestationalAge','riskFactors','onset','rupturedAt','presentation','fetalPosition','dateLabel'])c.patient[k]=typeof p[k]==='string'?p[k].slice(0,240):'';
  c.patient.startTime=p.startTime??'08:00';if(typeof c.patient.startTime==='string'&&/^\d:[0-5]\d$/.test(c.patient.startTime))c.patient.startTime='0'+c.patient.startTime;if(typeof c.patient.startTime!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(c.patient.startTime))fail('startTime phải có định dạng HH:mm.');
  c.patient.date=p.date??today();if(c.patient.date!==''&&(typeof c.patient.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(c.patient.date)||Number.isNaN(Date.parse(c.patient.date+'T00:00:00'))||new Date(c.patient.date+'T12:00:00').getDate()!==Number(c.patient.date.slice(-2))))fail('ngày không hợp lệ.');
  c.patient.pushingStart=blank(p.pushingStart)?null:p.pushingStart;if(c.patient.pushingStart!==null&&(!finite(c.patient.pushingStart)||c.patient.pushingStart<0||c.patient.pushingStart>CASE_HOURS))fail('pushingStart phải nằm trong 0–72 giờ.');
  if(!blank(input.events)){if(!Array.isArray(input.events)||input.events.length>30)fail('events cần là danh sách tối đa 30 ghi chú sự kiện.');const [sh,sm]=c.patient.startTime.split(':').map(Number);const events=input.events.map((e,i)=>{if(!e||typeof e!=='object'||Array.isArray(e))fail('ghi chú sự kiện '+(i+1)+' không hợp lệ.');let t=e.time;if(typeof t==='string'&&/^([01]?\d|2[0-3]):[0-5]\d$/.test(t.trim())){const [h,m]=t.trim().split(':').map(Number);t=(h*60+m-sh*60-sm+1440)%1440/60}else if(typeof t==='string'&&t.trim()!==''&&!Number.isNaN(Number(t)))t=Number(t);if(!validElapsed(t))fail('ghi chú sự kiện '+(i+1)+': time phải từ 0–72 giờ, chính xác đến phút.');const label=typeof e.label==='string'?e.label.trim().slice(0,60):'';if(!label)fail('ghi chú sự kiện '+(i+1)+' cần nội dung label.');const color=typeof e.color==='string'&&/^#[\da-f]{6}$/i.test(e.color)&&e.color.toLowerCase()!==EVENT_COLORS[0].color?e.color.toLowerCase():null;return {time:minuteTime(t),label,...(color?{color}:{}),...(['s','l'].includes(e.size)?{size:e.size}:{}),...(e.layout?{layout:nextEventStyle(e.layout)}:{})}}).sort((a,b)=>a.time-b.time);if(events.length)c.events=events}
  if(!Array.isArray(input.observations)||input.observations.length<1||input.observations.length>CASE_MOMENTS)fail('observations cần có 1–'+CASE_MOMENTS+' mốc.');
  const times=new Set();
  input.observations.forEach((raw,i)=>{
    if(!raw||typeof raw!=='object'||Array.isArray(raw))fail('mốc '+(i+1)+' không hợp lệ.');
    if(!validElapsed(raw.time))fail('time tại mốc '+(i+1)+' phải từ 0–72 giờ và chính xác đến phút.');
    const time=minuteTime(raw.time);if(times.has(time))fail('trùng thời điểm '+time+' giờ.');times.add(time);
    const o=emptyObservation(time);const r={...raw};if(r.duration===0||r.contractions===0)r.duration=null;
    for(const f of FIELD_DEFS){let v=r[f.key];if(blank(v))continue;if(f.options){if(!f.options.includes(String(v)))fail(f.label+' tại '+raw.time+' giờ không đúng ký hiệu.');o[f.key]=String(v)}else if(f.type==='text'){if(typeof v!=='string')fail(f.label+' phải là văn bản.');o[f.key]=v.slice(0,240)}else{if(typeof v==='string'&&v.trim()!==''&&!Number.isNaN(Number(v)))v=Number(v);if(!finite(v)||v<f.min||v>f.max)fail(f.label+' tại '+raw.time+' giờ phải là số trong '+f.min+'–'+f.max+'.');if(f.step!==.1&&Math.abs(v/(f.step||1)-Math.round(v/(f.step||1)))>1e-7)fail(f.label+' không đúng bước '+(f.step||1)+'.');o[f.key]=v}}
    if(o.systolic!==null&&o.diastolic!==null&&o.systolic<=o.diastolic)fail('HA tâm thu phải lớn hơn HA tâm trương tại '+o.time+' giờ.');
    if(o.contractions===0&&o.duration===0)o.duration=null;if(o.contractions===0&&o.duration!==null)fail('mốc '+o.time+' giờ không có cơn co: duration phải là null.');
    if(raw.headMarker!==undefined&&raw.headMarker!==null){const m=raw.headMarker;if(typeof m!=='object'||Array.isArray(m)||!finite(m.angle)||m.angle<0||m.angle>360||!finite(m.size)||m.size<8||m.size>20)fail('headMarker cần angle từ 0–360 độ và size từ 8–20.');if(m.fontanelles!==undefined&&!['both','posterior','anterior'].includes(m.fontanelles))fail('headMarker.fontanelles cần both, posterior hoặc anterior.');if(m.hidden!==undefined&&typeof m.hidden!=='boolean')fail('headMarker.hidden cần true hoặc false.');if(m.placement!==undefined&&!['auto','point','callout'].includes(m.placement))fail('headMarker.placement cần auto, point hoặc callout.');if(m.color!==undefined&&(typeof m.color!=='string'||!/^#[\da-f]{6}$/i.test(m.color)))fail('headMarker.color cần mã màu hex 6 ký tự.');o.headMarker={angle:m.angle,size:m.size,...(m.fontanelles?{fontanelles:m.fontanelles}:{}),...(m.color?{color:m.color.toLowerCase()}:{}),...(m.placement&&m.placement!=='auto'?{placement:m.placement}:{}),...(m.hidden?{hidden:true}:{})}}
    if(raw.contractionCells!==undefined){if(!Array.isArray(raw.contractionCells)||raw.contractionCells.length!==5||raw.contractionCells.some(v=>!Number.isInteger(v)||v<0||v>3))fail('contractionCells cần 5 giá trị nguyên 0–3.');const cells=raw.contractionCells;const count=cells.filter(Boolean).length;if(o.contractions!==null&&o.contractions!==count)fail('contractionCells không khớp số cơn co tại '+o.time+' giờ.');o.contractions=count;o.contractionCells=[...cells]}
    c.observations.push(o);
  });
  if(input.provenance&&typeof input.provenance==='object'&&!Array.isArray(input.provenance))c.provenance=Object.fromEntries(Object.entries(input.provenance).filter(([k,v])=>/^(title|narrative|assessment|plan|patient\.[a-zA-Z]+|observations\.\d+(?:\.\d+)?\.[a-zA-Z]+|events\.\d+(?:\.\d+)?\.label)$/.test(k)&&['source','ai','user','unverified'].includes(v)).slice(0,1800));
  c.observations.sort((a,b)=>a.time-b.time);return c;
}
function caseJSON(value){
  const encode=c=>({...clone(c),fluidNotation:'vn',observations:c.observations.map(o=>({...o,fluid:fluidDisplay(o.fluid,'vn')}))});
  return JSON.stringify(Array.isArray(value)?value.map(encode):encode(value),null,2);
}
function markUserSources(before,next){
  const sources={...(next.provenance||{})},same=(a,b)=>JSON.stringify(a??null)===JSON.stringify(b??null),mark=(path,a,b)=>{if(!same(a,b))sources[path]='user'};
  for(const k of ['title','narrative','assessment','plan'])mark(k,before[k],next[k]);
  for(const k of [...PATIENT_TEXT_FIELDS,'startTime','date','pushingStart'])mark('patient.'+k,before.patient[k],next.patient[k]);
  for(const o of next.observations){const old=before.observations.find(p=>p.time===o.time)||{};for(const k of ['time',...FIELD_DEFS.map(f=>f.key),'headMarker','contractionCells'])mark('observations.'+o.time+'.'+k,old[k],o[k])}
  for(const e of next.events||[])if(!(before.events||[]).some(p=>same(p,e)))sources['events.'+e.time+'.label']='user';
  if(Object.keys(sources).length)next.provenance=sources;return next;
}
function parseCasePayload(text){
  if(typeof text!=='string'||!text.trim())throw new Error('Chưa có dữ liệu JSON.');if(text.length>2000000)throw new Error('Dữ liệu vượt giới hạn 2 MB.');
  let parsed;const sources=[text.trim(),...Array.from(text.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi),m=>m[1].trim())];
  for(const s of sources){try{parsed=JSON.parse(s);break}catch{}}
  if(parsed===undefined){/* A single balanced scan preserves nested JSON and avoids quadratic work. */
    let start=-1,stack=[],quote=false,escape=false;
    for(let j=0;j<text.length;j++){const ch=text[j];if(start<0){if(ch!=='{'&&ch!=='[')continue;start=j;stack=[ch];quote=false;escape=false;continue}if(quote){if(escape)escape=false;else if(ch==='\\')escape=true;else if(ch==='"')quote=false;continue}if(ch==='"'){quote=true;continue}if(ch==='{'||ch==='[')stack.push(ch);else if(ch==='}'||ch===']'){if(stack.pop()!==(ch==='}'?'{':'[')){start=-1;stack=[];continue}if(!stack.length){try{parsed=JSON.parse(text.slice(start,j+1));break}catch{}start=-1}}}
  }
  if(parsed===undefined)throw new Error('JSON không hợp lệ. Kiểm tra dấu phẩy, dấu ngoặc và dấu nháy kép.');
  return parsed;
}
function parseCases(text,notation='who'){
  const parsed=parseCasePayload(text);
  const list=Array.isArray(parsed)?parsed:(parsed&&Array.isArray(parsed.cases)?parsed.cases:[parsed]);const review=parsed&&!Array.isArray(parsed)&&parsed.kind==='partograph-review'?{standard:['who1993','modified','lcg'].includes(parsed.standard)?parsed.standard:null,design:parsed.design&&typeof parsed.design==='object'&&!Array.isArray(parsed.design)?parsed.design:null,mono:parsed.mono===true,compact:parsed.compact===true}:null;if(!list.length||list.length>12)throw new Error('Mỗi lần nhập cần 1–12 ca.');
  const codes={C:'I',T:'C',K:'A',X:'M','X+':'M+','X++':'M++','X+++':'M+++','Máu':'B'};
  const cases=list.map((raw,index)=>{
    const declared=raw?.fluidNotation??parsed?.fluidNotation??notation;
    if(!['vn','who','auto'].includes(declared))throw new Error('Ca '+(index+1)+': fluidNotation phải là "vn" hoặc "who".');
    if(declared!=='vn')return validateCase(raw,index);
    const observations=Array.isArray(raw?.observations)?raw.observations.map(o=>{
      if(blank(o?.fluid))return o;
      let f=typeof o.fluid==='string'?o.fluid.trim():o.fluid;if(typeof f==='string'){if(['c','t','k','x'].includes(f.toLowerCase()))f=f.toUpperCase();else if(f.toLowerCase()==='máu'||f.toLowerCase()==='mau')f='Máu';else if(/^x\+{1,3}$/i.test(f))f='X'+f.slice(1)}
      if(!Object.hasOwn(codes,f))throw new Error('Ca '+(index+1)+': ký hiệu ối Việt cần C (còn), T (trắng), K (khô), X (xanh) hoặc Máu.');
      return {...o,fluid:codes[f]};
    }):raw?.observations;
    return validateCase({...raw,observations},index);
  });const ids=new Set();cases.forEach((c,i)=>{if(ids.has(c.id))c.id+='-'+(i+1);ids.add(c.id)});if(review)cases.review=review;return cases;
}
function chartCellFields(key,scope='observation'){
  if(scope==='observation'){const keys=key==='vitals'?['pulse','systolic','diastolic']:key==='contractions'?['contractions','duration']:key==='care'?['medication','ivFluids']:['oxy','oxyDose','oxyRate'].includes(key)?['oxyDose','oxyRate']:[key];return keys.map(k=>FIELD_DEFS.find(f=>f.key===k)).filter(Boolean).map(f=>({...f,multiline:f.type==='text',maxlength:240}))}
  if(scope==='patient'){const groups={identity:[['code','Mã ca'],['name','Họ tên'],['para','Para'],['gestationalAge','Tuổi thai']],clock:[['date','Ngày bắt đầu','date'],['startTime','Giờ bắt đầu','time']],clockAt:[['clockAt','Giờ thực tại mốc này','time']],presentation:[['presentation','Ngôi'],['fetalPosition','Kiểu thế chi tiết']]};return (groups[key]||[]).map(([key,label,type])=>({key,label,type:type||'text',required:!!type,maxlength:240}))}
  const labels={title:'Tên tình huống',narrative:'Đề bài',assessment:'Đánh giá',plan:'Kế hoạch'};return scope==='case'&&labels[key]?[{key,label:labels[key],type:'text',multiline:key!=='title',maxlength:key==='title'?180:key==='narrative'?12000:4000,required:key==='title'}]:[];
}
/* Giving one axis mark a new clock time moves startTime by the same amount, so every other mark follows.
   The shift is taken the short way round the clock (±12 h); the date follows across midnight. */
function shiftClock(c,data){
  if(data.caseId!==c.id)throw new Error('Ca đã thay đổi. Chọn lại ô cần sửa.');
  const value=String(data.values?.clockAt??''),old=clockAt(c,data.time).slice(0,5);
  if(!finite(data.time)||old!==data.expected?.clockAt)throw new Error('Giá trị đã thay đổi. Đóng và chọn lại ô này.');
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(value))throw new Error('Nhập giờ dạng HH:mm, ví dụ 13:30.');
  const minutes=t=>t.split(':').reduce((h,m)=>h*60+Number(m),0),delta=((minutes(value)-minutes(old))%1440+2160)%1440-720,start=minutes(c.patient.startTime)+delta,day=Math.floor(start/1440),draft=clone(c),m=(start%1440+1440)%1440;
  draft.patient.startTime=String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
  if(day&&draft.patient.date){const d=new Date(draft.patient.date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+day);draft.patient.date=d.toISOString().slice(0,10)}
  return markUserSources(c,validateCase(draft));
}
// Moves this observation and every later one (with their arrow notes) by ±30 minutes; earlier data stays put.
function shiftFrom(c,data){
  if(data.caseId!==c.id)throw new Error('Ca đã thay đổi. Chọn lại điểm.');
  const t=data.time,d=data.delta;if(!finite(t)||![-.5,.5].includes(d))throw new Error('Mỗi lần dời 30 phút.');
  const draft=clone(c),moving=draft.observations.filter(o=>o.time>=t);
  if(!moving.length)throw new Error('Không có mốc nào từ thời điểm này.');
  if(moving.some(o=>!validElapsed(o.time+d)))throw new Error('Dời ra ngoài khoảng 0–72 giờ.');
  if(d<0&&draft.observations.some(o=>o.time===t+d))throw new Error('Mốc '+clockAt(c,t+d)+' đã có dữ liệu; chưa thể dời sớm hơn.');
  for(const o of moving)o.time+=d;for(const e of draft.events||[])if(e.time>=t)e.time=Math.max(0,e.time+d);
  return markUserSources(c,validateCase(draft));
}
function changeChartCell(c,data){
  if(data.scope==='shift')return shiftFrom(c,data);
  if(data.scope==='patient'&&data.key==='clockAt')return shiftClock(c,data);
  if(!['observation','patient','case'].includes(data.scope))throw new Error('Phạm vi sửa ô không hợp lệ.');
  if(data.caseId!==c.id)throw new Error('Ca đã thay đổi. Chọn lại ô cần sửa.');
  const fields=chartCellFields(data.key,data.scope);if(!fields.length)throw new Error('Ô này không hỗ trợ sửa dữ liệu.');
  const draft=clone(c);let target;
  if(data.scope==='observation'){
    if(!validElapsed(data.time))throw new Error('Chọn mốc trong 0–72 giờ, chính xác đến phút.');
    target=draft.observations.find(o=>o.time===data.time);if(!target){target=emptyObservation(data.time);draft.observations.push(target)}
  }else target=data.scope==='patient'?draft.patient:draft;
  for(const f of fields){if(JSON.stringify(target[f.key]??'')!==JSON.stringify(data.expected?.[f.key]??''))throw new Error('Giá trị đã thay đổi. Đóng và chọn lại ô này.');const v=data.values?.[f.key];target[f.key]=f.options||f.type==='text'||['date','time'].includes(f.type)?String(v??''):(blank(v)?null:Number(v))}
  if(data.scope==='observation'&&fields.some(f=>['duration','contractions'].includes(f.key))){delete target.contractionCells;if(target.contractions===0)target.duration=null}
  if(data.scope==='observation'&&fields.some(f=>f.key==='descent')&&target.descent===null)delete target.headMarker;
  return markUserSources(c,validateCase(draft));
}
function removeChartPoint(c,data){
  if(!['cervix','descent','fhr'].includes(data.field))throw new Error('Chọn điểm số đo cần xóa.');
  const draft=clone(c),o=draft.observations.find(o=>o.time===data.time);
  if(!o||blank(o[data.field])||data.fromValue!==undefined&&o[data.field]!==data.fromValue)throw new Error('Điểm đã thay đổi. Chọn lại trước khi xóa.');
  o[data.field]=null;if(data.field==='descent')delete o.headMarker;return markUserSources(c,validateCase(draft));
}
function changeChartPoint(c,data){
  const fields=['cervix','descent','fhr'];
  if(!fields.includes(data.field)&&data.field!=='contraction')throw new Error('Thông số không hỗ trợ chỉnh trực tiếp.');
  if(!validElapsed(data.time))throw new Error('Chọn mốc trong 0–72 giờ, chính xác đến phút.');
  if(data.field!=='contraction'&&!finite(data.value))throw new Error('Điểm cần có giá trị dạng số.');
  const draft=clone(c),moving=data.fromTime!==undefined;
  const source=moving?draft.observations.find(o=>o.time===data.fromTime):null;
  if(moving&&(!fields.includes(data.field)||!source||blank(source[data.field])))throw new Error('Điểm đã thay đổi. Chọn lại điểm trên sản đồ.');
  if(moving&&data.fromValue!==undefined&&source[data.field]!==data.fromValue)throw new Error('Điểm đã thay đổi. Chọn lại trước khi kéo.');
  let target=draft.observations.find(o=>o.time===data.time);
  const occupied=data.field!=='contraction'&&target&&target!==source&&!blank(target[data.field]),swapping=occupied&&moving&&data.swap===true;
  if(occupied&&!swapping)throw new Error('Mốc này đã có cùng thông số. Kéo đến ô trống hoặc chọn đổi chỗ hai điểm.');
  if(swapping&&target[data.field]!==data.targetValue)throw new Error('Điểm ở giờ đích đã thay đổi. Kéo lại để đối chiếu trước khi đổi chỗ.');
  if(!target){target=emptyObservation(data.time);draft.observations.push(target)}
  if(data.field==='contraction'){
    if(!Number.isInteger(data.row)||data.row<0||data.row>4)throw new Error('Ô cơn co không hợp lệ.');
    const cells=target.contractionCells||Array.from({length:5},(_,i)=>i<(target.contractions??0)?(target.duration===null?0:target.duration<20?1:target.duration<=40?2:3):0);
    cells[data.row]=(cells[data.row]+1)%4;target.contractionCells=cells;target.contractions=cells.filter(Boolean).length;target.duration=null;
  }else{
    if(moving&&target!==source){source[data.field]=swapping?target[data.field]:null;if(data.field==='descent'){const displaced=target.headMarker;if(source.headMarker)target.headMarker=source.headMarker;else delete target.headMarker;if(swapping&&displaced)source.headMarker=displaced;else delete source.headMarker}}
    target[data.field]=data.value;
  }
  return markUserSources(c,validateCase(draft));
}
const basePatient={code:'MÔ PHỎNG',name:'Sản phụ giả định',para:'0000',gestationalAge:'39 tuần 2 ngày',date:today(),startTime:'08:00',riskFactors:'',onset:'Tự nhiên',rupturedAt:'',pushingStart:null};
function makePreset(id,title,short,subtitle,narrative,rows,patient={},events){return {...validateCase({id,title,narrative,patient:{...basePatient,...patient},events,observations:rows.map(r=>({...emptyObservation(r[0]),fhr:r[1],cervix:r[2],descent:r[3],contractions:r[4],duration:r[5],fluid:r[6]||'I',moulding:r[7]||'0',pulse:82,systolic:115,diastolic:75,temperature:36.8,protein:'0',acetone:'0',...r[8]}))}),short,subtitle}}
const PRESETS=[
  makePreset('CASE-001','Chuyển dạ tiến triển thuận lợi','Tiến triển thuận lợi','Tiến triển thuận lợi · con so','Sản phụ 26 tuổi, con so, thai 39 tuần 2 ngày, vào viện vì đau bụng từng cơn. Lúc 08:00: cổ tử cung mở 4 cm, đầu còn 4/5 trên vệ, ngôi chỏm, kiểu thế chẩm chậu trái ngang, ối còn; tim thai 140 lần/phút. Lúc 09:30 gây tê ngoài màng cứng giảm đau; 10:00 bấm ối, nước ối trắng. Trong quá trình theo dõi, các thông số được ghi trên sản đồ. Lúc 12:00, cổ tử cung mở 8 cm, đầu còn 1/5 trên vệ; lúc 14:00, cổ tử cung mở trọn, kiểu thế chẩm vệ.\nYêu cầu: Nhận xét tình trạng mẹ, thai và tiến triển chuyển dạ; đề xuất kế hoạch theo dõi phù hợp.',[[0,140,4,4,2,25,'I','0',{pulse:82,urineVolume:150,headMarker:{angle:270,size:12}}],[0.5,144,null,null,2,25,'I','0',{pulse:84}],[1,142,null,null,3,30,'I','0',{pulse:82}],[1.5,138,null,null,3,30,'I','0',{pulse:86,medication:'Bupivacain 0,1% + Fentanyl 2 mcg/ml (NMC)',ivFluids:'Ringer lactat 500 ml TM'}],[2,140,6,3,3,35,'C','0',{pulse:84,urineVolume:200,headMarker:{angle:225,size:12}}],[2.5,144,null,null,3,35,'C','0',{pulse:86}],[3,142,null,null,4,40,'C','0',{pulse:88}],[3.5,140,null,null,4,40,'C','0',{pulse:86}],[4,146,8,1,4,45,'C','+',{pulse:88,urineVolume:150,headMarker:{angle:200,size:12}}],[4.5,144,null,null,4,45,'C','+',{pulse:90}],[5,140,null,null,4,45,'C','+',{pulse:88}],[5.5,142,null,null,4,45,'C','+',{pulse:90}],[6,144,10,0,4,45,'C','+',{pulse:92,urineVolume:120,acetone:'+',headMarker:{angle:180,size:12}}]],{presentation:'Ngôi chỏm',fetalPosition:'Chẩm chậu trái ngang'},[{time:0,label:'Nhập phòng sinh'},{time:1.5,label:'Gây tê ngoài màng cứng'},{time:2,label:'Bấm ối · nước ối trắng'},{time:6,label:'CTC mở trọn · hướng dẫn rặn'}]),
  makePreset('CASE-002','CTC mở chậm · đầu xuống kém','Đầu xuống kém','Độ mở chậm · đầu cao · uốn khuôn tăng','Sản phụ 29 tuổi, con so, thai 40 tuần 3 ngày, vào viện lúc 08:00 khi cổ tử cung mở 4 cm, đầu còn 5/5 trên vệ. Qua theo dõi, cơn co 4–5 cơn/10 phút, mỗi cơn 45–50 giây; cổ tử cung chỉ tiến triển đến 6 cm rồi không thay đổi qua các lần khám tiếp theo, đầu vẫn cao, uốn khuôn tăng đến +++. Tim thai và thông số mẹ được thể hiện trên sản đồ.\nYêu cầu: Phân tích bằng chứng gợi ý chuyển dạ tắc nghẽn, các yếu tố cần đánh giá thêm và hướng xử trí. Không khẳng định CPD chỉ từ đường biểu diễn.',[[0,140,4,5,3,35],[1,144,null,null,4,45,'C'],[2,146,5,5,4,45,'C','+'],[3,148,null,null,4,45,'C','+'],[4,150,6,4,4,50,'C','++'],[5,152,null,null,5,50,'C','++'],[6,154,6,4,5,50,'C','+++'],[7,158,null,null,5,50,'C','+++'],[8,162,6,4,5,50,'M','+++',{pulse:105}]],{gestationalAge:'40 tuần 3 ngày'}),
  makePreset('CASE-003','Tim thai bất thường kèm cơn co quá nhiều','Tim thai giảm · cơn co nhiều','Nhịp tim thai giảm · tăng tần số cơn co','Sản phụ 31 tuổi, para 1001, thai 39 tuần, theo dõi chuyển dạ từ 08:00 với cổ tử cung mở 4 cm, tim thai 145 lần/phút. Đến 11:00 ghi nhận 6 cơn co/10 phút, mỗi cơn khoảng 70 giây. Tim thai giảm còn 105 rồi 90 lần/phút; nước ối lẫn phân su.\nYêu cầu: Nhận diện các dấu hiệu cần đánh giá khẩn; nêu thông tin cần bổ sung (thời gian nhịp giảm, liên quan cơn co, CTG, can thiệp đang dùng) và hướng tiếp cận. Chẩn đoán nguyên nhân cần dựa trên thăm khám toàn diện.',[[0,145,4,4,3,35],[.5,146,null,null,3,35],[1,144,5,3,4,45,'C'],[1.5,148,null,null,4,45,'C'],[2,150,6,2,5,55,'C'],[2.5,120,null,null,6,65,'M'],[3,105,7,2,6,70,'M','+',{deceleration:'L'}],[3.5,90,null,null,6,70,'M','+',{deceleration:'L'}]],{para:'1001',gestationalAge:'39 tuần'})
,
  makePreset('CASE-004','Pha tiềm thời kéo dài','Pha tiềm thời kéo dài','Độ mở dưới 3 cm sau 8 giờ · cơn co thưa','Sản phụ 24 tuổi, con so, thai 40 tuần, vào viện lúc 08:00 vì đau bụng. Cổ tử cung mở 1 cm, đầu còn 5/5 trên vệ, ối còn. Cơn co 2 cơn/10 phút, mỗi cơn khoảng 20 giây. Khám lại lúc 12:00 và 16:00: cổ tử cung mở 2 cm. Tim thai và các thông số mẹ ổn định.\nYêu cầu: Xác định giai đoạn chuyển dạ theo mô hình WHO 1993; nhận xét thời gian pha tiềm thời và các yếu tố cần đánh giá trước khi quyết định xử trí.',[[0,140,1,5,2,20],[1,138,null,null,2,20],[2,142,null,null,2,20],[3,140,null,null,2,25],[4,144,2,5,2,25],[5,140,null,null,2,25],[6,142,null,null,2,25],[7,140,null,null,2,25],[8,138,2,5,2,25]],{gestationalAge:'40 tuần'}),
  makePreset('CASE-005','Sốt trong chuyển dạ sau ối vỡ lâu','Sốt · ối vỡ lâu','Nhiệt độ, mạch mẹ và tim thai nền tăng dần','Sản phụ 27 tuổi, con so, thai 39 tuần 5 ngày, ối vỡ lúc 20:00 ngày hôm trước (khoảng 12 giờ trước khi theo dõi trên sản đồ). Lúc 08:00: cổ tử cung mở 4 cm, nước ối trong. Trong 4 giờ theo dõi, nhiệt độ tăng từ 37,4 lên 38,4 °C, mạch mẹ tăng lên 112 lần/phút, tim thai nền tăng lên 168 lần/phút.\nYêu cầu: Nhận diện các dấu hiệu bất thường về mẹ và thai trên sản đồ; nêu chẩn đoán cần đặt ra, thông tin cần bổ sung và hướng xử trí. Không kết luận nguyên nhân chỉ từ các giá trị trên sản đồ.',[[0,150,4,4,3,35,'C','0',{temperature:37.4,pulse:92}],[1,156,null,null,3,35,'C','0',{temperature:37.6,pulse:96}],[2,160,5,3,3,40,'C','0',{temperature:37.9,pulse:100}],[3,164,null,null,4,40,'C','0',{temperature:38.2,pulse:106}],[4,168,6,3,4,40,'C','0',{temperature:38.4,pulse:112}]],{gestationalAge:'39 tuần 5 ngày'}),
  makePreset('CASE-006','Tăng huyết áp trong chuyển dạ','Tăng huyết áp · đạm niệu','Huyết áp tăng dần · đạm niệu +++ · nước tiểu giảm','Sản phụ 33 tuổi, para 1001, thai 38 tuần, chưa ghi nhận tăng huyết áp trước đó. Lúc 08:00: cổ tử cung mở 4 cm, huyết áp 150/100 mmHg, đạm niệu ++. Trong 4 giờ, huyết áp tăng lên 165/110 mmHg, đạm niệu +++, lượng nước tiểu giảm; cổ tử cung mở 8 cm lúc 12:00.\nYêu cầu: Nhận xét các thông số mẹ trên sản đồ; nêu chẩn đoán cần đặt ra, các xét nghiệm và theo dõi bổ sung, nguyên tắc xử trí trong chuyển dạ.',[[0,140,4,4,3,35,'I','0',{systolic:150,diastolic:100,protein:'++',urineVolume:100}],[1,138,null,null,3,40,'I','0',{systolic:155,diastolic:102,protein:'++'}],[2,142,6,3,4,40,'C','0',{systolic:160,diastolic:105,protein:'++',urineVolume:60}],[3,140,null,null,4,40,'C','0',{systolic:162,diastolic:108,protein:'+++'}],[4,138,8,2,4,45,'C','0',{systolic:165,diastolic:110,protein:'+++',urineVolume:40}]],{para:'1001',gestationalAge:'38 tuần'}),
  makePreset('CASE-007','Cơn co thưa · tăng co bằng oxytocin','Tăng co bằng oxytocin','Cơn co thưa · không tiến triển · đáp ứng sau oxytocin','Sản phụ 28 tuổi, con so, thai 39 tuần 4 ngày, ối đã vỡ, nước ối trong. Lúc 08:00: cổ tử cung mở 5 cm, đầu còn 3/5 trên vệ, cơn co 2 cơn/10 phút, mỗi cơn khoảng 20 giây. Lúc 10:00 cổ tử cung không thay đổi; bắt đầu truyền oxytocin 5 IU pha trong 500 ml (10 IU/L), 8 giọt/phút, tăng dần theo đáp ứng cơn co. Sau đó cơn co đạt 4 cơn/10 phút, 40–45 giây; cổ tử cung mở 7 cm lúc 12:00 và 9 cm lúc 14:00.\nYêu cầu: Nhận xét nguyên nhân chậm tiến triển ban đầu; nêu chỉ định, điều kiện và các thông số cần theo dõi khi tăng co bằng oxytocin.',[[0,140,5,3,2,20,'C'],[1,142,null,null,2,20,'C'],[2,138,5,3,2,25,'C','0',{oxyDose:10,oxyRate:8}],[2.5,140,null,null,3,30,'C','0',{oxyDose:10,oxyRate:12}],[3,142,null,null,3,35,'C','0',{oxyDose:10,oxyRate:16}],[3.5,140,null,null,4,40,'C','0',{oxyDose:10,oxyRate:16}],[4,144,7,2,4,40,'C','0',{oxyDose:10,oxyRate:16}],[5,140,null,null,4,45,'C','0',{oxyDose:10,oxyRate:16}],[6,142,9,1,4,45,'C','0',{oxyDose:10,oxyRate:16}]],{gestationalAge:'39 tuần 4 ngày'})
];
// Teaching topics shown on the template gallery.
const PRESET_TOPICS={'CASE-001':['Bình thường','Tiến triển'],'CASE-002':['Ngưng tiến triển','Uốn khuôn'],'CASE-003':['Tim thai','Cơn co'],'CASE-004':['Pha tiềm thời'],'CASE-005':['Nhiễm trùng','Mẹ & thai'],'CASE-006':['Tăng huyết áp','Đạm niệu'],'CASE-007':['Oxytocin','Cơn co']};
function alignment(c,standard){return chartTimeline(c,standard).shift}
function textSVG(x,y,text,opts=''){return '<text x="'+x+'" y="'+y+'" '+opts+'>'+esc(text)+'</text>'}
function wrapText(s,max=115){const out=[];for(const paragraph of String(s).split('\n')){let line='';for(const word of paragraph.split(/\s+/)){if(line.length+word.length>max&&line){out.push(line);line=''}line+=(line?' ':'')+word}out.push(line)}return out}
/* Fits text into a 24-unit chart row of `room` rendered px: one line, else two smaller lines.
   f = rendered/declared font ratio, u = font-to-row-unit ratio (row scaling differs from font scaling). */
function chartTextFit(text,room,f,u){
  const s=String(text).replace(/\s+/g,' ').trim(),chars=size=>Math.max(1,Math.floor(room/(.53*size*f)));
  const one=Math.min(8.5,20/(1.25*u));if(s.length<=chars(one))return {lines:[s],size:one,baselines:[12+.36*one*u]};
  const size=Math.min(7.5,20/(2.3*u)),per=chars(size),pitch=1.12*size*u,cap=.72*size*u,top=12-(pitch+cap)/2;
  let lines=wrapText(s.split(' ').map(w=>w.length>per?w.slice(0,Math.max(1,per-1))+'…':w).join(' '),Math.max(1,per-1));
  if(lines.length>2)lines=[lines[0],lines[1].slice(0,Math.max(0,per-1)).trimEnd()+'…'];
  return {lines,size,baselines:lines.length>1?[top+cap,top+cap+pitch]:[12+.36*size*u]};
}
const ACCENTS=[{id:'teal',label:'Xanh y khoa',color:'#0e6b62'},{id:'blue',label:'Xanh dương',color:'#1f5fbf'},{id:'green',label:'Xanh lá',color:'#2f7d32'},{id:'amber',label:'Hổ phách',color:'#b45309'},{id:'rose',label:'Hồng san hô',color:'#c0415c'}],DOSSIER_TABS=['brief','legend','drawing','actions'];
const WORKSPACE_DEFAULTS={labels:true,timeline:false,hints:false,diagnostics:false,chartHeader:false,caseStrip:false,dossierOpen:false,clinicalAlerts:true,clinicalReminders:true,rememberPrompt:false,spacing:'compact',dock:'side',panelMode:'dock',dragAxis:'free',accent:'teal',radius:'normal',dossierTab:'brief'};
function workspacePreferences(raw={}){
  const clean={...WORKSPACE_DEFAULTS};if(!raw||typeof raw!=='object')return clean;
  for(const key of ['labels','timeline','hints','diagnostics','chartHeader','caseStrip','dossierOpen','clinicalAlerts','clinicalReminders','rememberPrompt'])if(typeof raw[key]==='boolean')clean[key]=raw[key];
  for(const [key,allowed] of Object.entries({spacing:['compact','comfortable'],dock:['bottom','side'],panelMode:['dock','overlay'],dragAxis:['value','time','free'],accent:ACCENTS.map(a=>a.id),radius:['sharp','normal','soft'],dossierTab:DOSSIER_TABS}))if(allowed.includes(raw[key]))clean[key]=raw[key];
  return clean;
}
function commandSearch(value){return String(value).normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[đĐ]/g,'d').toLowerCase()}
const DEVICE_SESSION_KEY='partograph-session-v1',DEVICE_BACKUP_KEY='partograph-session-backup-v1',DEVICE_AUTO_KEY='partograph-session-autosave-v1';
function validateDeviceSession(raw){
  if(typeof raw==='string'){if(raw.length>2000000)throw Error('Bản lưu vượt giới hạn 2 MB.');raw=JSON.parse(raw)}
  if(!raw||raw.kind!=='partograph-workspace'||raw.version!==1)throw Error('Tệp này không phải bản lưu phiên làm việc được hỗ trợ.');
  const c=raw.content,v=raw.view||{};
  if(!c||!Array.isArray(c.cases)||!c.cases.length||c.cases.length>12)throw Error('Bản lưu cần chứa từ 1 đến 12 ca hợp lệ.');
  const list=c.cases.map((item,i)=>validateCase(item,i)),clinical=validateCase(c.clinical),quickDrafts={};
  for(const [time,draft] of Object.entries(c.quickDrafts||{})){
    if(!validElapsed(Number(time))||!draft||typeof draft!=='object'||Array.isArray(draft))throw Error('Bản nháp theo dõi không hợp lệ.');
    quickDrafts[time]={};for(const [key,value] of Object.entries(draft)){if(!FIELD_DEFS.some(f=>f.key===key)||!['string','number'].includes(typeof value)||String(value).length>240||typeof value==='number'&&!Number.isFinite(value))throw Error('Ô nhập trong bản lưu không hợp lệ.');quickDrafts[time][key]=value}
  }
  const examDraft=c.examDraft?validateCase(c.examDraft):null;
  if(examDraft&&!list.some(item=>item.id===examDraft.id))throw Error('Không tìm thấy ca gốc của bản nháp.');
  const activeIndex=clamp(Number.isInteger(v.activeCaseIndex)?v.activeCaseIndex:0,0,list.length-1);
  return {kind:'partograph-workspace',version:1,savedAt:typeof raw.savedAt==='string'&&Number.isFinite(Date.parse(raw.savedAt))?raw.savedAt:null,content:{cases:list,clinical,standard:['who1993','modified','lcg'].includes(c.standard)?c.standard:'who1993',mono:c.mono===true,compact:c.compact===true,design:designOptions(c.design),quickDrafts,examDraft},view:{mode:v.mode==='clinical'?'clinical':'exam',activeCaseIndex:activeIndex,selectedMoment:clamp(Number.isInteger(v.selectedMoment)?v.selectedMoment:0,0,list[activeIndex].observations.length-1),selectedTime:validElapsed(v.selectedTime)?minuteTime(v.selectedTime):clinical.observations[0].time,editingMoment:Math.max(0,Number.isInteger(v.editingMoment)?v.editingMoment:0)}};
}
const LIBRARY_KEYS={exam:'partograph-library-exam-v1',clinical:'partograph-library-clinical-v1'};
function blankLibraryCase(kind){return validateCase({id:kind.toUpperCase()+'-'+crypto.randomUUID(),title:kind==='exam'?'Đề chưa đặt tên':'Hồ sơ chưa đặt tên',patient:{...basePatient,code:'',name:'',para:'',gestationalAge:'',onset:''},observations:[{time:0}]})}
// A project contains only its own library's data. Reuse the session validator at the storage boundary.
function libraryEntry(raw,kind){
  if(!raw||typeof raw.id!=='string'||!raw.id||raw.id.length>100||!Number.isFinite(Date.parse(raw.updatedAt)))throw Error('Một sản phẩm có định dạng chưa hợp lệ.');
  const content=raw.content;
  if(!content||(kind==='exam'?!Array.isArray(content.cases):!content.clinical))throw Error('Sản phẩm thiếu dữ liệu.');
  const checked=validateDeviceSession({kind:'partograph-workspace',version:1,content:{...content,cases:kind==='exam'?content.cases:[PRESETS[0]],clinical:kind==='clinical'?content.clinical:PRESETS[0],examDraft:kind==='exam'?content.examDraft:null,quickDrafts:kind==='clinical'?content.quickDrafts:{}},view:{...raw.view,mode:kind}});
  const c=checked.content,v=checked.view;
  return {id:raw.id,updatedAt:raw.updatedAt,content:{standard:c.standard,design:c.design,mono:c.mono,compact:c.compact,...(kind==='exam'?{cases:c.cases,examDraft:c.examDraft}:{clinical:c.clinical,quickDrafts:c.quickDrafts})},view:kind==='exam'?{activeCaseIndex:v.activeCaseIndex,selectedMoment:v.selectedMoment,editingMoment:v.editingMoment}:{selectedTime:v.selectedTime}};
}
function libraryCase(project,kind){return kind==='clinical'?project.content.clinical:project.content.examDraft||project.content.cases[project.view.activeCaseIndex]}
function libraryThumbnail(project,kind){const c=libraryCase(project,kind);return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svgDocument(buildSVG(c,{...project.content,design:{...project.content.design,anonymize:true}},true)))}
function readProjectLibrary(kind){const raw=JSON.parse(localStorage.getItem(LIBRARY_KEYS[kind])||'[]');if(!Array.isArray(raw))throw Error('Danh sách không hợp lệ.');const items=raw.map(p=>libraryEntry(p,kind));if(new Set(items.map(p=>p.id)).size!==items.length)throw Error('Mã sản phẩm bị trùng.');return items}
function buildSVG(c,options={},exporting=false,cursor=null){
  const marked=(field,time)=>!exporting&&!!options.alertMarks?.some(m=>m.field===field&&m.time===time),MARK='#e11d48';
  const {mono=false,compact=false,standard='modified',editable:canEdit=false,field='cervix'}=options;const editable=canEdit&&!exporting;const lc=standard==='lcg',spec=modelSpec(standard),timeline=chartTimeline(c,standard,designOptions(options.design)),offset=timeline.shift;if(editable){const focusTime=cursor?.time??options.activeTime;if(finite(focusTime))timeline.hours=Math.max(timeline.hours,Math.ceil(timeline.plot(focusTime)))}const hours=timeline.hours;const geometry=window.PartographCore.G;const hour=Math.max(40,640/hours),tailCell=editable||c.observations.some(o=>timeline.plot(o.time)===hours&&FIELD_DEFS.some(f=>!['cervix','descent','station','fhr','pulse','systolic','diastolic'].includes(f.key)&&!blank(o[f.key]))),columns=hours*2+(tailCell?1:0),G={...geometry,hour,plotWidth:columns*hour/2,width:geometry.width-geometry.plotWidth+columns*hour/2};const X=t=>G.left+timeline.plot(t)*G.hour;const CY=cervixY;const DY=descentY;const FY=fetalHeartY;const py=v=>850+(180-clamp(v,60,180))*144/120;
  const design=designOptions(options.design),rowLayout=chartRows(c,design,compact,editable,field);const off=k=>design.hiddenSeries.includes(k);const colors=Object.fromEntries(SERIES_LIST.map(({key})=>[key,mono?'#000000':design.series[key].color]));const note=notePalette(null,mono);let notesComplete=true;
  const noteDisc=(cx,cy,ty,n,ink=note.ink,k=1)=>'<circle cx="'+cx+'" cy="'+cy+'" r="'+6.5*k+'" fill="'+ink+'"/>'+textSVG(cx,ty,String(n),'font-size="'+8*k+'" font-weight="700" text-anchor="middle" fill="#ffffff"');
  const prefix='p'+String(c.id).replace(/[^\w-]/g,'')+(mono?'m':'c');const rows=[];let body='';const begin=id=>{body+='<!--section:'+id+'-->'},end=()=>{body+='<!--endsection-->'};
  const line=(x1,y1,x2,y2,stroke='#a7b3bf',width=.65,extra='')=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+stroke+'" stroke-width="'+width+'" '+extra+'/>';
  const rect=(x,y,w,h,fill,extra='')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" '+extra+'/>';
  const label=(y,name,unit='')=>{if(design.sectionAccent&&!mono){const accent=SECTION_ACCENT[RESIZE_SECTIONS.find(g=>y>=g.from&&y<g.to)?.id];if(accent)body+=rect(2,y-12,3,unit?29:16,accent,'rx="1.5"')}const k=design.textFollowsRegion?Math.max(.85,Math.min(1.5,design.sectionHeights[RESIZE_SECTIONS.find(g=>y>=g.from&&y<g.to)?.id]||1)):1;body+=textSVG(10,y,design.rowLabels[name]||name,'font-size="'+(11*k).toFixed(1)+'" font-weight="600"');if(unit)body+=textSVG(10,y+15*k,unit,'font-size="'+(9*k).toFixed(1)+'" fill="#5f6b76"')};
  const grid=(y,h,step)=>{if(design.minorGrid)body+=rect(G.left,y,G.plotWidth,h,'url(#'+prefix+'-mm)');for(let i=0;i<=columns;i++)body+=line(G.left+i*G.hour/2,y,G.left+i*G.hour/2,y+h,mono?'#777':design.gridColor,i%2? .45:.8,'data-grid="true" opacity="'+design.gridOpacity+'"');for(let j=0;j<=Math.round(h/step);j++)body+=line(G.left,y+j*step,G.left+G.plotWidth,y+j*step,mono?'#777':design.gridColor,.65,'data-grid="true" opacity="'+design.gridOpacity+'"');body+=rect(G.left,y,G.plotWidth,h,'none','data-grid="true" stroke="'+(mono?'#222':'#6b7b8b')+'" stroke-width=".9"')};
  const cellFocusTime=timeline.unplot(0)??c.observations.find(o=>timeline.unplot(timeline.plot(o.time))===o.time)?.time??0;
  const cellHit=(key,time,x,y,w,h,scope='observation')=>{
    if(exporting||options.designEditing||options.directCells===false||design.lockedSeries.includes(SERIES_OF[key]||key))return '';
    const label=scope==='observation'?(key==='vitals'?'Mạch và huyết áp':key==='care'?'Thuốc và dịch truyền':FIELD_DEFS.find(f=>f.key===key)?.label||key):({identity:'Thông tin sản phụ',clock:'Ngày và giờ bắt đầu',clockAt:'Giờ thực',presentation:'Ngôi và kiểu thế',title:'Tên tình huống',narrative:'Đề bài',assessment:'Đánh giá',plan:'Kế hoạch'}[key]||key);
    return rect(x,y,w,h,'transparent','class="chart-editable-cell" data-cell-key="'+key+'" data-cell-scope="'+scope+'" data-cell-time="'+time+'" tabindex="'+(scope!=='observation'&&key!=='clockAt'||time===cellFocusTime?0:-1)+'" role="button" aria-label="Sửa '+esc(label)+(scope==='observation'||key==='clockAt'?' lúc '+esc(clockAt(c,time)):'')+'"');
  };
  const rowHits=(key,y,h)=>{if(exporting||options.designEditing||options.directCells===false)return;for(let col=0;col<(key==='vitals'?columns+1:columns);col++){const time=timeline.unplot(col/2);if(time===null||time<0||time>CASE_HOURS)continue;const x=G.left+col*G.hour/2,left=Math.max(G.left,x-(key==='vitals'?G.hour/4:0)),right=Math.min(G.left+G.plotWidth,x+(key==='vitals'?G.hour/4:G.hour/2));if(right>left)body+=cellHit(key,time,left,y,right-left,h)}};
  const tableRow=(y,name,key,unit='')=>{grid(y,24,24);label(y+15,name,unit);for(const o of c.observations){if(blank(o[key]))continue;const xx=X(o.time)+(timeline.plot(o.time)===hours&&!tailCell?-10:10);if(xx<G.left||xx>G.left+G.plotWidth)continue;const value=String(key==='fluid'?fluidDisplay(o[key],design.fluidNotation):o[key]);const alert=lc&&lcgAlert(key,o[key])||marked(key,o.time);body+='<g><title>'+esc(name+': '+value+' · '+clockAt(c,o.time))+'</title>';if(alert)body+='<circle '+(marked(key,o.time)?'class="alert-mark" data-mark="'+key+'@'+o.time+'" stroke-width="2" ':'')+'cx="'+xx+'" cy="'+(y+12)+'" r="10" fill="none" stroke="'+(mono?'#000':'#dc2626')+'"/>';
      // Free text runs across empty cells up to the next entry in the same row; "…" only when that space runs out.
      if(FIELD_DEFS.find(f=>f.key===key)?.type==='text'){const start=X(o.time)-(timeline.plot(o.time)===hours&&!tailCell?G.hour/2:0),next=c.observations.find(n=>n.time>o.time&&!blank(n[key])),limit=Math.min(G.left+G.plotWidth,next?X(next.time):Infinity),scale=design.sectionHeights[RESIZE_SECTIONS.find(g=>y>=g.from&&y<g.to)?.id]||1,f=design.font*(design.textFollowsRegion?Math.min(1.5,scale):Math.min(1,scale)),u=f/(design.rowHeight*scale),fit=chartTextFit(value,(limit-start-5)*design.cellWidth,f,u);body+=line(start+1,y+3,start+1,y+21,'#475569',1.1);fit.lines.forEach((s,i)=>body+=textSVG(start+4,y+fit.baselines[i],s,'font-size="'+fit.size+'" paint-order="stroke" stroke="#ffffff" stroke-width="2.2" stroke-linejoin="round"'))}
      else body+=textSVG(xx,y+16,value.length>4?value.slice(0,3)+'…':value,'text-anchor="middle" font-size="'+(value.length>3?7:10)+'" font-family="monospace"');body+='</g>'}rowHits(key,y,24)};
  body+='<g data-header-layer="true"'+(design.showHeader?'':' display="none"')+'>';
  body+=textSVG(10,23,lc?'PHIẾU THEO DÕI CHUYỂN DẠ · WHO LCG (THÍCH NGHI)':'BIỂU ĐỒ CHUYỂN DẠ · '+spec.short.toUpperCase(),'font-size="14" font-weight="700"');
  const scopeText=compact?'BẢN RÚT GỌN':design.rowMode==='auto'?'TỰ GỌN THEO DỮ LIỆU':design.rowMode==='custom'?'NHÓM TÙY CHỌN':'ĐẦY ĐỦ CÁC NHÓM',headerHits=[];
  if(design.headerLayout==='line'){
    body+=textSVG((G.left+G.plotWidth),23,compact?'BẢN RÚT GỌN':design.rowMode==='auto'?'TỰ GỌN THEO DỮ LIỆU':design.rowMode==='custom'?'NHÓM TÙY CHỌN':'ĐẦY ĐỦ CÁC NHÓM','font-size="9" text-anchor="end" fill="#5f6b76"');
    body+=textSVG(10,45,'Mã: '+(design.anonymize?'Ẩn danh':c.patient.code||'—')+'    Họ tên: '+(design.anonymize?'Đã ẩn':c.patient.name||'—')+'    Para: '+(c.patient.para||'—')+'    Tuổi thai: '+(c.patient.gestationalAge||'—'),'font-size="10"');
    body+=textSVG(10,63,'Ngày: '+(c.patient.dateLabel||c.patient.date.split('-').reverse().join('/')||'Chưa ghi ngày')+'    Bắt đầu: '+c.patient.startTime,'font-size="10" fill="#526474"')+textSVG(340,63,c.title.slice(0,110),'font-size="10" fill="#526474"');
    if(c.patient.presentation||c.patient.fetalPosition)body+=textSVG(340,78,[c.patient.presentation&&('Ngôi: '+c.patient.presentation),c.patient.fetalPosition&&('Kiểu thế: '+c.patient.fetalPosition)].filter(Boolean).join('    ·    '),'font-size="9"');
    {const cw=.56*10*design.font/design.cellWidth,segs=(y,h,x0,list)=>{let x=x0;for(const [k,s] of list){const w=s.length*cw;headerHits.fields.push([k,x,w,y,h]);x+=w}};headerHits.fields=[];segs(33,16,10,[['code','Mã: '+(design.anonymize?'Ẩn danh':c.patient.code||'—')],['name','    Họ tên: '+(design.anonymize?'Đã ẩn':c.patient.name||'—')],['para','    Para: '+(c.patient.para||'—')],['gestationalAge','    Tuổi thai: '+(c.patient.gestationalAge||'—')]]);segs(51,16,10,[['date','Ngày: '+(c.patient.dateLabel||c.patient.date.split('-').reverse().join('/')||'Chưa ghi ngày')],['startTime','    Bắt đầu: '+c.patient.startTime]]);if(c.patient.presentation||c.patient.fetalPosition)headerHits.fields.push(['presentation',340,G.left+G.plotWidth-340,68,13])}headerHits.push(['identity',0,8,30,G.left+G.plotWidth-8,20,'patient'],['clock',0,8,50,326,20,'patient'],['title',0,336,50,G.left+G.plotWidth-340,20,'case']);if(c.patient.presentation||c.patient.fetalPosition)headerHits.push(['presentation',0,336,70,G.left+G.plotWidth-336,10,'patient']);
  }else{
    // Labelled field strip, as on the printed form; each field keeps the inline editor of its group.
    const HR=G.left+G.plotWidth,HW=HR-10,hf=design.font/design.cellWidth,hu=design.font/design.rowHeight,top=30,labelY=top+5+7.5*hu*.75,valueY=labelY+4+10.5*hu*.8,h=Math.min(46,valueY-top+10.5*hu*.25+6),ranges={};
    if(design.showCaseTitle)body+=textSVG(design.titleAlign==='left'?10:design.titleAlign==='center'?(10+HR)/2:HR,24,c.title.slice(0,90),'font-size="10.5" font-weight="600" text-anchor="'+(design.titleAlign==='left'?'start':design.titleAlign==='center'?'middle':'end')+'" fill="#334155"');
    const fields=[['HỌ TÊN',design.anonymize?'Đã ẩn':c.patient.name,.22,'identity'],['MÃ',design.anonymize?'Ẩn danh':c.patient.code,.12,'identity'],['PARA',c.patient.para,.08,'identity'],['TUỔI THAI',c.patient.gestationalAge,.13,'identity'],['NGÀY',(c.patient.dateLabel||c.patient.date.split('-').reverse().join('/')||'Chưa ghi ngày'),.11,'clock'],['GIỜ BẮT ĐẦU',c.patient.startTime,.1,'clock'],...(c.patient.presentation||c.patient.fetalPosition?[['NGÔI · KIỂU THẾ',[c.patient.presentation,c.patient.fetalPosition].filter(Boolean).join(' · '),.24,'presentation']]:[])],share=fields.reduce((n,f)=>n+f[2],0);let x=10;
    body+=rect(10,top,HW,h,'#f8fafc','stroke="#94a3b8" stroke-width=".8"');
    headerHits.fields=[];const FM={'HỌ TÊN':'name','MÃ':'code','PARA':'para','TUỔI THAI':'gestationalAge','NGÀY':'date','GIỜ BẮT ĐẦU':'startTime','NGÔI · KIỂU THẾ':'presentation'};for(const [i,[label,value,w,key]] of fields.entries()){const width=HW*w/share,fieldHit=FM[label]?headerHits.fields.push([FM[label],x,width]):0,max=Math.max(3,Math.floor((width-14)/(.56*10.5*hf))),v=String(value||'—');if(i)body+=line(x,top+6,x,top+h-6,'#dde3ea',.7);body+=textSVG(x+8,labelY,label,'font-size="7.5" font-weight="700" fill="#64748b" letter-spacing=".5"')+textSVG(x+8,valueY,v.length>max?v.slice(0,max-1)+'…':v,'font-size="10.5" font-weight="600"'+(value?'':' fill="#94a3b8"'));ranges[key]=[ranges[key]?.[0]??x,x+width];x+=width}
    for(const [key,[a,b]] of Object.entries(ranges))headerHits.push([key,0,a,top,b-a,h,'patient']);const titleWidth=Math.min(380,HW),titleLeft=design.titleAlign==='left'?10:design.titleAlign==='center'?(10+HR-titleWidth)/2:HR-titleWidth;headerHits.push(['title',0,titleLeft,13,titleWidth,15,'case']);
  }
  body+='</g>';
  begin('fhr');grid(G.fhrY,G.fhrH,G.fhrH/12);if(design.showFhrBand)body+=rect(G.left,FY(160),G.plotWidth,FY(design.fhrBand==='auto'?(lc?110:120):design.fhrBand)-FY(160),mono?'#eeeeee':'#e6f4ea');grid(G.fhrY,G.fhrH,G.fhrH/12);for(let v=80+design.fhrLabelStep;v<200;v+=design.fhrLabelStep)if(design.fhrLabelStep>10)body+=line(G.left,FY(v),G.left+G.plotWidth,FY(v),mono?'#555':design.gridColor,1.05,'data-grid="true" opacity="'+design.gridOpacity+'"');
  label(125,'TIM THAI','nhịp/phút');for(let v=80;v<=200;v+=design.fhrLabelStep)body+=textSVG(145,FY(v)+3,v,'font-size="9" text-anchor="end" font-family="monospace"');
  const shown=c.observations.filter(o=>X(o.time)>=G.left&&X(o.time)<=(G.left+G.plotWidth));const series=(key,y)=>{const id=key==='cervix'?'ctc':key==='descent'?'des':key,s=design.series[id],dash=seriesDash(s);const list=off(id)?[]:shown.filter(o=>o[key]!==null);const groups=timeline.original&&timeline.first?[list.filter(o=>o.time<timeline.first.time),list.filter(o=>o.time>=timeline.first.time)]:[list];for(const group of groups)if(group.length>1&&s.dash!=='none')body+='<polyline data-series="'+id+'" points="'+group.map(o=>X(o.time)+','+y(o[key])).join(' ')+'" fill="none" stroke="'+colors[id]+'" stroke-width="'+s.width+'" stroke-linecap="round" stroke-linejoin="round" '+(dash?'stroke-dasharray="'+dash+'"':'')+'/>';return list};
  for(const o of series('fhr',FY)){body+='<g data-observation-time="'+o.time+'" data-observation-field="fhr" tabindex="0" role="button" aria-label="'+esc('Xem tim thai lúc '+clockAt(c,o.time))+'"><title>'+esc(clockAt(c,o.time)+' · Tim thai '+o.fhr+' lần/phút')+'</title>'+symbolSVG(X(o.time),FY(o.fhr),design.series.fhr,design,mono)+'';if(o.fhr<80||o.fhr>200){body+=textSVG(X(o.time),FY(o.fhr)+(o.fhr<80?-7:13),(o.fhr<80?'↓':'↑')+o.fhr,'font-size="9" text-anchor="middle" font-weight="700"')}body+='</g>'}
  end();begin('fluid');tableRow(G.fluidY,'ỐI','fluid');tableRow(G.fluidY+24,'CHỒNG KHỚP','moulding');
  end();grid(G.progressY,G.progressH,22);label(357,'ĐỘ MỞ CTC','cm');label(421,'ĐẦU TRÊN VỆ','/5 · khám bụng');
  for(let v=0;v<=10;v++)body+=textSVG(145,CY(v)+3,v,'font-size="10" text-anchor="end" font-family="monospace"');for(let v=0;v<=5;v++)body+=textSVG((G.left+G.plotWidth+10),DY(v)+3,v+'/5','data-descent-tick="'+v+'" font-size="9" font-family="monospace"');
  {const edge=G.left+G.plotWidth;body+='<g data-station-axis="true">'+textSVG(edge+46,CY(5)-14,'Station','font-size="7.5" text-anchor="middle" font-weight="600" fill="'+colors.des+'"')+line(edge+34,CY(5)-5,edge+34,CY(0)+4,'#94a3b8',.6);
    for(let fifth=0;fifth<=5;fifth++){const value=2-fifth;body+=line(edge+36,DY(fifth),edge+40,DY(fifth),'#64748b',.6)+textSVG(edge+47,DY(fifth)+3,value>0?'+'+value:String(value),'data-station-tick="'+value+'" font-size="8.5" text-anchor="middle" font-family="monospace" fill="'+colors.des+'"')}body+='</g>';
  }
  if(lc){body+=rect(G.left,CY(5),G.plotWidth,CY(0)-CY(5),mono?'#f6f6f6':'#f7f9fb','opacity=".65"');}
  else {
    // Risk zones: amber between the two reference lines, pale red to the right of the action line (colour only, clipped to the grid).
    if(design.zoneShading&&!mono){const a=spec.origin,w=10-spec.active,R=G.left+G.plotWidth,x=t=>G.left+t*G.hour,far=Math.max(R,x(a+4+w))+1,yA=CY(spec.active),yT=CY(10),yB=CY(0),zid=prefix+'-zone',zone=(pts,fill,op)=>'<polyline data-zone="true" points="'+pts.map(p=>p.join(',')).join(' ')+'" fill="'+fill+'" fill-opacity="'+op+'" stroke="none" clip-path="url(#'+zid+')"/>';
      body+='<clipPath id="'+zid+'">'+rect(G.left,G.progressY,G.plotWidth,G.progressH,'#000')+'</clipPath>'+zone([[x(a),yA],[x(a+w),yT],[x(a+4+w),yT],[x(a+4),yA]],'#f59e0b',.2)+zone([[x(a+4),yB],[x(a+4),yA],[x(a+4+w),yT],[far,yT],[far,yB]],'#e11d48',.12)}
    for(const [id,start] of [['alert',spec.origin],['action',spec.origin+4]]){
    if(off(id))continue;const style=design.series[id],dash=mono&&id==='action'&&style.dash==='solid'?'7 4':seriesDash(style),stop=start+10-spec.active;
    if(stop<=start)continue;
    if(style.dash!=='none')body+=line(G.left+start*G.hour,CY(spec.active),G.left+stop*G.hour,CY(spec.active+stop-start),colors[id],style.width,'data-reference="'+id+'" '+(dash?'stroke-dasharray="'+dash+'"':''));
    const mid=start+(stop-start)/2;
    if(style.marker!=='none')body+=symbolSVG(G.left+mid*G.hour,CY(spec.active+mid-start),style,design,mono);
    if(style.dash!=='none'&&stop-start>=2){const xx=G.left+mid*G.hour,yy=CY(spec.active+mid-start)-7,angle=-Math.atan(22/G.hour)*180/Math.PI;body+=textSVG(xx,yy,id==='alert'?'ĐƯỜNG BÁO ĐỘNG':'ĐƯỜNG HÀNH ĐỘNG','font-size="9" text-anchor="middle" fill="'+colors[id]+'" transform="rotate('+angle+' '+xx+' '+yy+')"')}
  }}
  if(timeline.original){body+=line(G.left,CY(3),G.left+Math.min(8,hours)*G.hour,CY(3),mono?'#333':'#81918a',1);body+=textSVG(G.left+5,CY(3)-7,'PHA TIỀM THỜI','font-size="9" fill="#64748b"');if(timeline.first&&timeline.shift!==0&&!off('ctc')){const f=timeline.first,raw=G.left+f.time*G.hour,target=X(f.time);const prev=timeline.latent.filter(o=>o.cervix!==null).at(-1);if(prev&&design.series.ctc.dash!=='none'){const dash=seriesDash(design.series.ctc);body+=line(X(prev.time),CY(prev.cervix),raw,CY(f.cervix),colors.ctc,design.series.ctc.width,'data-series="ctc"'+(dash?' stroke-dasharray="'+dash+'"':''))}body+=symbolSVG(raw,CY(f.cervix),design.series.ctc,design,mono);body+=line(raw,CY(f.cervix),target,CY(f.cervix),mono?'#555':'#63797b',1,'stroke-dasharray="4 3" data-translation="true"');body+=textSVG((raw+target)/2,CY(f.cervix)-10,'Tịnh tiến một lần','font-size="9" text-anchor="middle" fill="#526474"')}}
  body+='<!--event-guides-->';
  for(const o of series('cervix',CY))body+='<g data-observation-time="'+o.time+'" data-observation-field="cervix" tabindex="0" role="button" aria-label="'+esc('Xem CTC lúc '+clockAt(c,o.time))+'"><title>'+esc(clockAt(c,o.time)+' · CTC '+o.cervix+' cm')+'</title>'+symbolSVG(X(o.time),CY(o.cervix),design.series.ctc,design,mono)+'</g>';
  /* Head figures that would cover a cervix cross, another point or the grid edge move to the most open spot nearby
     (straight up when that is clear), leaving the plain descent symbol on the measured point and an arrow to it.
     Room is measured in rendered px against points, both series lines, the alert/action lines and the grid edge. */
  const headPlot=off('des')?[]:shown.filter(o=>{const level=headPlotLevel(o);return finite(level)&&level>=0&&level<=5}).map(o=>({...o,plotLevel:headPlotLevel(o),plotField:finite(o.descent)?'descent':'station'}));
  const headConflicts=c.observations.filter(headConventionConflict),outsideHeads=c.observations.filter(o=>!finite(o.descent)&&finite(o.station)&&(headPlotLevel(o)<0||headPlotLevel(o)>5));
  const hx=design.cellWidth,hy=design.rowHeight*(design.sectionHeights.progress||1),dSize=design.series.des.size,px2=(x,y)=>[x*hx,y*hy];
  const dots=[...shown.filter(o=>o.cervix!==null).map(o=>({x:X(o.time),y:CY(o.cervix),r:design.series.ctc.size+2})),...headPlot.map(o=>({x:X(o.time),y:DY(o.plotLevel),r:dSize+1,time:o.time}))];
  const joins=(list,y)=>list.slice(1).map((o,i)=>[X(list[i].time),y(list[i]),X(o.time),y(o)]),segs=[...joins(shown.filter(o=>o.cervix!==null),o=>CY(o.cervix)),...joins(headPlot,o=>DY(o.plotLevel))];
  if(!lc)for(const start of [spec.origin,spec.origin+4]){const stop=start+10-spec.active;if(stop>start)segs.push([G.left+start*G.hour,CY(spec.active),G.left+stop*G.hour,CY(spec.active+stop-start)])}
  const toSeg=(x,y,[x1,y1,x2,y2])=>{const [ax,ay]=px2(x1,y1),[bx,by]=px2(x2,y2),dx=bx-ax,dy=by-ay,t=clamp(((x-ax)*dx+(y-ay)*dy)/((dx*dx+dy*dy)||1),0,1);return Math.hypot(x-ax-t*dx,y-ay-t*dy)};
  const room=(x,y,r,skip,lines)=>{const [qx,qy]=px2(x,y),[l,t]=px2(G.left,G.progressY),[rr,b]=px2(G.left+G.plotWidth,G.progressY+G.progressH);return Math.min(qx-l-r,rr-qx-r,qy-t-r,b-qy-r,...dots.filter(d=>d.time===undefined||d.time!==skip).map(d=>{const [dx,dy]=px2(d.x,d.y);return Math.hypot(qx-dx,qy-dy)-r-d.r}),...(lines?segs.map(sg=>toSeg(qx,qy,sg)-r-1.5):[]))};
  let headCallouts=0;
  const headPoint=o=>{const style=design.series.des,baseInk=colors.des,m=design.showHeadMarkers?clinicalHeadMarker(o):null,px=X(o.time),py=DY(o.plotLevel);let figure;
    // No figure, or hidden at this moment: the usual small circle, see-through where it sits on a cervix cross.
    if(!m||m.hidden){figure=symbolSVG(px,py,style,design,mono);if(m||room(px,py,dSize,o.time,false)<3)figure=figure.replace('fill="white"','fill="none"')}
    else if(m.placement==='point'||m.placement!=='callout'&&room(px,py,m.size,o.time,false)>=3){figure=headMarkerSVG(px,py,m,design,baseInk,mono);dots.push({x:px,y:py,r:m.size,time:o.time})}
    else{const [ax,ay]=px2(px,py),near=dots.filter(d=>{const [dx,dy]=px2(d.x,d.y);return d.time!==o.time&&Math.hypot(dx-ax,dy-ay)>dSize+1}),spots=[];
      // The arrow must not run through another point either; points sitting on this one are unavoidable and ignored.
      const arrowRoom=(x,y,a)=>{const ux=Math.cos(a),uy=Math.sin(a),arrow=[x-ux*(m.size+2)/hx,y-uy*(m.size+2)/hy,px+ux*(dSize+3)/hx,py+uy*(dSize+3)/hy];return Math.min(Infinity,...near.map(d=>{const [dx,dy]=px2(d.x,d.y);return toSeg(dx,dy,arrow)-d.r-2}))};
      [m.size*2+8,m.size*2+20,m.size*3+16].forEach((reach,ri)=>{for(const deg of [-90,-60,-120,-30,-150,0,180,30,150,60,120,90]){const a=deg*Math.PI/180,x=px+Math.cos(a)*reach/hx,y=py+Math.sin(a)*reach/hy;spots.push({x,y,a,reach,ri,deg,room:Math.min(room(x,y,m.size,null,true),arrowRoom(x,y,a))})}});
      const up=spots.filter(q=>q.deg<=-60&&q.deg>=-120&&q.room>=8).sort((p,q)=>p.ri-q.ri||Math.abs(p.deg+90)-Math.abs(q.deg+90))[0],spot=up||spots.reduce((best,q)=>{const score=Math.min(q.room,30)-Math.abs(q.deg+90)/180*6-q.ri*2;return !best||score>best.score?{...q,score}:best},null);
      headCallouts++;dots.push({x:spot.x,y:spot.y,r:m.size+2});segs.push([spot.x,spot.y,px,py]);
      const ux=Math.cos(spot.a),uy=Math.sin(spot.a),from=[spot.x-ux*(m.size+2)/hx,spot.y-uy*(m.size+2)/hy],to=[px+ux*(dSize+3)/hx,py+uy*(dSize+3)/hy],wing=turn=>[to[0]+(ux*Math.cos(turn)-uy*Math.sin(turn))*6/hx,to[1]+(ux*Math.sin(turn)+uy*Math.cos(turn))*6/hy],ink=mono?'#000000':m.color||baseInk;
      figure=symbolSVG(px,py,style,design,mono).replace('fill="white"','fill="none"')+line(from[0],from[1],to[0],to[1],ink,1)+line(to[0],to[1],...wing(.45),ink,1)+line(to[0],to[1],...wing(-.45),ink,1)+'<g data-head-callout="true">'+headMarkerSVG(spot.x,spot.y,m,design,baseInk,mono)+'</g>'}
    return figure;
  };
  const headStyle=design.series.des,headDash=seriesDash(headStyle),headGroups=timeline.original&&timeline.first?[headPlot.filter(o=>o.time<timeline.first.time),headPlot.filter(o=>o.time>=timeline.first.time)]:[headPlot];
  for(const group of headGroups)if(group.length>1&&headStyle.dash!=='none')body+='<polyline data-series="des" points="'+group.map(o=>X(o.time)+','+DY(o.plotLevel)).join(' ')+'" fill="none" stroke="'+colors.des+'" stroke-width="'+headStyle.width+'" stroke-linecap="round" stroke-linejoin="round" '+(headDash?'stroke-dasharray="'+headDash+'"':'')+'/>';
  for(const o of headPlot){const x=X(o.time),y=DY(o.plotLevel),caption=clockAt(c,o.time)+' · '+(o.plotField==='descent'?'Đầu còn '+o.descent+'/5 trên vệ':'Station '+(o.station>0?'+':'')+o.station)+(headConventionConflict(o)?' · Station gốc '+o.station+' khác quy ước đọc chung':'');
    body+='<g data-head-time="'+o.time+'" data-head-source="'+o.plotField+'" '+(o.plotField==='descent'?'data-observation-time="'+o.time+'" data-observation-field="descent" tabindex="0" role="button" aria-label="'+esc('Chỉnh hình kiểu thế lúc '+clockAt(c,o.time))+'" style="cursor:pointer"':'data-station-time="'+o.time+'" data-station-value="'+o.station+'"')+'><title>'+esc(caption)+'</title>'+headPoint(o)+'</g>';
    if(o.plotField==='station')body+=cellHit('station',o.time,x-12,y-12,24,24).replace('tabindex="-1"','tabindex="0"');
    if(design.valueLabels)body+=textSVG(x+7,y+15,o.plotField==='descent'?o.descent+'/5':(o.station>0?'+':'')+o.station+' st','font-size="9" font-weight="700" paint-order="stroke" stroke="white" stroke-width="3" stroke-linejoin="round"');
  }
  let guides='';{const rows=noteRows(c),H=noteBandHeight(c),base=CHART_SECTIONS.find(g=>g.id==='fluid').to-6,by=off=>base+off*6/H,bh=px=>px*6/H;
  if(rows&&design.showEvents){body+=textSVG(10,by(H/2+4),'SỰ KIỆN','font-size="11" font-weight="600"');
    const items=[];(c.events||[]).forEach((e,i)=>{const x=X(e.time);if(x>=G.left-1&&x<=G.left+G.plotWidth+1)items.push({x,n:i+1,e,row:rows===2?items.length%2:0,k:EVENT_SIZES[e.size]||1,p:notePalette(e.color,mono)})});
    const lo=72,hi=G.width-12,gap=6,fit=(list,cap)=>{for(const it of list){it.text=cap===0?'':it.e.label.length>cap?it.e.label.slice(0,cap-1)+'…':it.e.label;it.w=(it.text?it.text.length*5.1+28:17)*it.k}
      const place=k=>{const total=k.items.reduce((sum,it)=>sum+it.w,0)+gap*(k.items.length-1),mean=k.items.reduce((sum,it)=>sum+it.x,0)/k.items.length;k.left=Math.min(hi-total,Math.max(lo,mean-total/2));k.right=k.left+total};
      const groups=list.map(it=>({items:[it]}));groups.forEach(place);for(let i=0;i<groups.length-1;){if(groups[i].right+gap>groups[i+1].left){groups[i].items.push(...groups.splice(i+1,1)[0].items);place(groups[i]);i=Math.max(0,i-1)}else i++}
      for(const k of groups){let x=k.left;for(const it of k.items){it.cx=x+it.w/2;x+=it.w+gap}}return groups.every(k=>k.left>=lo-.5)};
    for(let r=0;r<rows;r++){const list=items.filter(it=>it.row===r);const cap=[60,48,32,20,12,0].find(cap=>fit(list,cap));if(cap!==60&&list.some(it=>it.text!==it.e.label))notesComplete=false}
    for(const it of items){const layout=nextEventStyle(it.e.layout);it.cx=clamp(it.cx+layout.dx,lo+it.w/2,hi-it.w/2)}
    /* The arrow runs past the band into the top row of its time column, then a dashed guide follows the column down the cervicograph.
       A cervix/descent point near the top of that column keeps the arrow at the band edge so the head never covers it. */
    const tipTop=by(H-9),top=G.progressY,head=(x,tip,base,ink)=>'<path d="M '+x+' '+tip+' L '+(x-3.6)+' '+base+' L '+(x+3.6)+' '+base+' Z" fill="'+ink+'"/>';
    for(const it of items){const cy=15+it.row*24+(it.e.layout?.dy||0),crowded=shown.some(o=>Math.abs(X(o.time)-it.x)<8&&[o.cervix,o.descent].some(v=>v!==null&&CY(v)<top+16)),tip=crowded?by(H-1.5):top+9,base=crowded?by(H-8):top+2;
      if(it.e.layout?.kind!=='short')body+=line(it.cx,by(cy+9*it.k),it.x,tipTop,it.p.leader,.9)+line(it.x,tipTop,it.x,base,it.p.leader,1)+(it.e.layout?.kind==='box'?'':head(it.x,tip,base,it.p.ink));
      if(design.eventGuides)guides+=line(it.x,crowded?top:tip,it.x,top+G.progressH,it.p.leader,.8,'stroke-dasharray="2 3" opacity=".75" data-event-guide="true"')}
    for(const it of [...items].sort((a,b)=>(a.e.layout?.z||0)-(b.e.layout?.z||0))){const cy=15+it.row*24+(it.e.layout?.dy||0),left=it.cx-it.w/2,k=it.k,p=it.p;body+='<g data-event-time="'+it.e.time+'" data-event-index="'+(it.n-1)+'"'+(exporting?'':' tabindex="0" role="button" aria-label="'+esc('Sửa mũi tên '+it.n+': '+clockAt(c,it.e.time)+' · '+it.e.label)+'" style="cursor:pointer"')+'><title>'+esc(it.n+'. '+clockAt(c,it.e.time)+' · '+it.e.label)+'</title>'+rect(left,by(cy-9*k),it.w,bh(18*k),p.fill,'rx="'+(it.e.layout?.kind==='box'?3:9*k)+'" stroke="'+p.edge+'" stroke-width=".8"')+noteDisc(left+9*k,by(cy),by(cy+2.9*k),it.n,p.ink,k)+(it.text?textSVG(left+19*k,by(cy+3.3*k),it.text,'font-size="'+9.5*k+'" font-weight="600" fill="'+p.text+'"'):'')+'</g>'}}}
  body=body.replace('<!--event-guides-->',guides);
  if(lc&&c.patient.pushingStart!==null){body+=line(X(c.patient.pushingStart),G.progressY,X(c.patient.pushingStart),504,mono?'#222':'#0f766e',1,'stroke-dasharray="3 3"');body+=textSVG(X(c.patient.pushingStart)+5,300,'P','font-size="13" font-weight="700"')}
  label(524,'THỜI GIAN',design.showClock?'giờ theo dõi / giờ thực':'giờ theo dõi');for(let i=0;i<=hours;i+=design.timeLabelStep){body+=textSVG(G.left+i*G.hour,522,i,'font-size="10" text-anchor="middle" font-family="monospace"');const real=timeline.unplot(i);if(real===null||!design.showClock)continue;const actual=clockAt(c,real);body+=textSVG(G.left+i*G.hour,540,actual.slice(0,5),'font-size="8" text-anchor="middle" font-family="monospace"')+cellHit('clockAt',real,G.left+i*G.hour-15,529,30,24,'patient');if(actual.includes('d)'))body+=textSVG(G.left+i*G.hour,550,actual.slice(6),'font-size="6" text-anchor="middle" fill="#64748b"')}
  begin('contractions');grid(G.contractionY,G.contractionH,20);label(599,'CƠN CO TỬ CUNG','số cơn / 10 phút');for(let i=1;i<=5;i++)body+=textSVG(145,662-(i-.5)*20+3,i,'font-size="9" text-anchor="end" font-family="monospace"');
  for(const o of shown){const column=Math.min(columns-1,Math.round(timeline.plot(o.time)*2));if(o.contractions===null)continue;const kind=o.duration===null?0:o.duration<20?1:o.duration<=40?2:3;for(let n=0;n<5;n++){const cell=o.contractionCells?o.contractionCells[n]:(n<o.contractions?kind:0);const fill=cell===3?'#111':cell===2?'url(#'+prefix+'-stripes)':cell===1?'url(#'+prefix+'-dots)':'none';body+=rect(G.left+column*G.hour/2+1,662-(n+1)*20+1,G.hour/2-2,18,fill);if(!o.contractionCells&&n<o.contractions&&o.duration===null)body+=textSVG(G.left+column*G.hour/2+10,662-n*20-5,'?','font-size="12" text-anchor="middle"')}
    if(marked('contractions',o.time))body+='<rect class="alert-mark" data-mark="contractions@'+o.time+'" x="'+(G.left+column*G.hour/2-1)+'" y="'+(662-101)+'" width="'+(G.hour/2+2)+'" height="102" rx="4" fill="none" stroke="'+MARK+'" stroke-width="2" pointer-events="none"/>';
    if(o.contractions>5)body+=textSVG(G.left+column*G.hour/2+10,558,'↑'+o.contractions,'font-size="9" text-anchor="middle" font-weight="700"');
  }
  end();let bottom=830;
  begin('oxy');tableRow(690,'OXYTOCIN · IU/L','oxyDose');tableRow(714,'Giọt/phút','oxyRate');end();begin('medication');tableRow(750,'THUỐC KHÁC','medication');tableRow(774,'DỊCH TRUYỀN','ivFluids');end();
  if(!compact){begin('vitals');grid(850,144,12);label(894,'MẠCH & HUYẾT ÁP','lần/phút · mmHg');for(let v=60;v<=180;v+=design.vitalsLabelStep)body+=textSVG(145,py(v)+3,v,'font-size="9" text-anchor="end" font-family="monospace"');for(const o of series('pulse',py)){body+=symbolSVG(X(o.time),py(o.pulse),design.series.pulse,design,mono);if(marked('pulse',o.time))body+='<circle class="alert-mark" data-mark="pulse@'+o.time+'" cx="'+X(o.time)+'" cy="'+py(o.pulse)+'" r="9" fill="none" stroke="'+MARK+'" stroke-width="2" pointer-events="none"/>';if(o.pulse<60||o.pulse>180)body+=textSVG(X(o.time)+5,py(o.pulse),o.pulse,'font-size="9"')}
    for(const o of shown){if(o.systolic!==null&&o.diastolic!==null){const xx=X(o.time),a=py(o.systolic),b=py(o.diastolic);if(marked('bp',o.time))body+='<rect class="alert-mark" data-mark="bp@'+o.time+'" x="'+(xx-8)+'" y="'+(a-6)+'" width="16" height="'+(b-a+12)+'" rx="8" fill="none" stroke="'+MARK+'" stroke-width="2" pointer-events="none"/>';body+=line(xx,a,xx,b,'#111',1.2)+line(xx,a,xx-3,a+5,'#111',1.2)+line(xx,a,xx+3,a+5,'#111',1.2)+line(xx,b,xx-3,b-5,'#111',1.2)+line(xx,b,xx+3,b-5,'#111',1.2);if(o.systolic>180||o.diastolic<60)body+=textSVG(xx+4,a-4,o.systolic+'/'+o.diastolic,'font-size="8"')}}
    rowHits('vitals',850,144);end();begin('temperature');tableRow(1005,'NHIỆT ĐỘ · °C','temperature');end();begin('urine');tableRow(1045,'ĐẠM NIỆU','protein');tableRow(1069,'ACETONE','acetone');tableRow(1093,'NƯỚC TIỂU · ml','urineVolume');end();bottom=1135;
  }
  if(lc){const start=bottom+8;body+=textSVG(10,start+10,'BỔ SUNG LCG · chăm sóc hỗ trợ & đánh giá thai','font-size="10" font-weight="700"');let yy=start+20;for(const [name,key] of [['Cơn co /10 phút','contractions'],['Thời gian co · giây','duration'],['Nhịp giảm','deceleration'],['Kiểu thế','position'],['Bướu huyết thanh','caput'],['Người đồng hành','companion'],['Giảm đau','painRelief'],['Uống dịch','oralFluid'],['Tư thế','posture']]){if(design.rowMode==='auto'&&!c.observations.some(o=>!blank(o[key])))continue;tableRow(yy,name,key);yy+=24}body+=textSVG(10,yy+18,'Y: có · N: không · D: từ chối · U: chưa rõ · MO: di chuyển · SP: nằm ngửa · E/L/V: nhịp giảm sớm/muộn/biến đổi','font-size="9" fill="#526474"');bottom=yy+34;
    if(!compact){for(const [name,value] of [['ĐÁNH GIÁ',c.assessment],['KẾ HOẠCH',c.plan]]){if(!value&&design.rowMode==='auto')continue;body+=textSVG(10,bottom+15,name,'font-size="10" font-weight="700"');const lines=wrapText(value||'Chưa ghi nhận',145);lines.forEach((s,i)=>body+=textSVG(158,bottom+15+i*16,s,'font-size="10"'));body+=cellHit(name==='ĐÁNH GIÁ'?'assessment':'plan',0,4,bottom, G.width-28,Math.max(35,lines.length*16+12),'case');bottom+=Math.max(35,lines.length*16+12)}}
  }
  if(c.observations.some(o=>finite(o.effacement))){tableRow(bottom+4,'XÓA CTC · %','effacement');bottom+=36}
  /* Footer: data tables, one framed legend, then reading notes. Row units are rescaled by rowHeight and text by font,
     so vertical rhythm is derived from their ratio (fu); column text width from font/cellWidth (fx). */
  const FL=10,FR=G.left+G.plotWidth,FW=FR-FL,fu=design.font/design.rowHeight,fx=design.font/design.cellWidth,fits=(w,size=10)=>Math.max(4,Math.floor((w-12)/(.53*size*fx))),pitch=size=>Math.ceil(size*fu*1.38);
  const sectionTitle=(title,note='')=>{body+=textSVG(FL,bottom+12,title,'font-size="10" font-weight="700" letter-spacing=".3"')+(note?textSVG(FL+(title.length+1)*6.6*fx,bottom+12,note,'font-size="9" fill="#64748b"'):'');bottom+=20};
  const tableBlock=(title,note,cols,rows,hitKey)=>{if(!rows.length)return;sectionTitle(title,note);const fixed=cols.reduce((n,c)=>n+(c.w||0),0),share=cols.reduce((n,c)=>n+(c.share||0),0),widths=cols.map(c=>c.w||(FW-fixed)*c.share/share),xs=widths.map((_,i)=>FL+widths.slice(0,i).reduce((a,b)=>a+b,0));
    const head=pitch(8.5)+8,start=bottom;body+=rect(FL,bottom,FW,head,'#eef2f6');cols.forEach((c,i)=>body+=textSVG(xs[i]+6,bottom+head/2+8.5*fu*.36,c.label,'font-size="8.5" font-weight="700" fill="#475569" letter-spacing=".4"'));bottom+=head;
    for(const row of rows){const lines=row.cells.map((t,i)=>wrapText(String(t||'—'),fits(widths[i])).flatMap(l=>l.length>fits(widths[i])?l.match(new RegExp('.{1,'+fits(widths[i])+'}','g')):[l])),h=Math.max(...lines.map(l=>l.length))*pitch(10)+8;
      lines.forEach((cell,i)=>cell.forEach((t,j)=>body+=textSVG(xs[i]+6,bottom+4+pitch(10)/2+10*fu*.36+j*pitch(10),t,'font-size="10"'+(i===0?' font-family="monospace" font-weight="700"':'')+(row.cells[i]?'':' fill="#94a3b8"'))));
      body+=line(FL,bottom+h,FR,bottom+h,'#dde3ea',.7);if(hitKey)body+=cellHit(hitKey,row.time,FL,bottom,FW,h);bottom+=h}
    xs.slice(1).forEach(x=>body+=line(x,start,x,bottom,'#dde3ea',.7));body+=rect(FL,start,FW,bottom-start,'none','stroke="#94a3b8" stroke-width=".8"');bottom+=16};
  if(!rowLayout.hidden.some(g=>g.id==='medication'))tableBlock('THUỐC & DỊCH TRUYỀN','· chi tiết theo mốc',[{label:'GIỜ',w:64},{label:'THUỐC · LIỀU · ĐƯỜNG DÙNG',share:.56},{label:'DỊCH TRUYỀN',share:.44}],c.observations.filter(o=>o.medication||o.ivFluids).map(o=>({time:o.time,cells:[clockAt(c,o.time),o.medication,o.ivFluids]})),'care');
  if(c.observations.some(o=>o.presentation||o.fetalPosition)){for(const [name,key] of [['NGÔI','presentation'],['KIỂU THẾ CHI TIẾT','fetalPosition']])if(c.observations.some(o=>o[key])){tableRow(bottom+5,name,key);bottom+=32}bottom+=4;tableBlock('NGÔI & KIỂU THẾ','· chi tiết theo mốc',[{label:'GIỜ',w:64},{label:'NGÔI',share:.35},{label:'KIỂU THẾ CHI TIẾT',share:.65}],c.observations.filter(o=>o.presentation||o.fetalPosition).map(o=>({time:o.time,cells:[clockAt(c,o.time),o.presentation,o.fetalPosition]})))}
  if(!notesComplete)tableBlock('SỰ KIỆN','· nội dung đầy đủ của các thẻ đã rút gọn',[{label:'SỐ',w:40},{label:'GIỜ',w:64},{label:'NỘI DUNG',share:1}],(c.events||[]).map((e,i)=>({cells:[String(i+1),clockAt(c,e.time),e.label]})));
  // Legend: up to three columns, each a stack of symbol + caption rows.
  const legendCols=[],lp=pitch(10)+4,mid=10*fu*.36;
  if(design.showLegend){const rows=[];for(const key of ['ctc','des','fhr','pulse'].filter(key=>!off(key)&&!rowLayout.hidden.some(g=>g.id===({fhr:'fhr',pulse:'vitals'}[key]))&&!(compact&&key==='pulse')))rows.push({mark:(x,y)=>symbolSVG(x+9,y-mid,design.series[key],design,mono),text:{'ctc':'Độ mở CTC · cm','des':'Độ lọt · chung cột /5 và station','fhr':'Tim thai · lần/phút','pulse':'Mạch mẹ · lần/phút'}[key]});
    if(!compact&&!rowLayout.hidden.some(g=>g.id==='vitals'))rows.push({mark:(x,y)=>line(x+9,y-mid-7,x+9,y-mid+7,'#111',1.1)+line(x+9,y-mid-7,x+6,y-mid-3,'#111',1.1)+line(x+9,y-mid-7,x+12,y-mid-3,'#111',1.1)+line(x+9,y-mid+7,x+6,y-mid+3,'#111',1.1)+line(x+9,y-mid+7,x+12,y-mid+3,'#111',1.1),text:'Huyết áp · tâm thu / tâm trương'});
    if((c.events||[]).length)rows.push({mark:(x,y)=>noteDisc(x+9,y-mid,y-mid+2.9,1),text:'Sự kiện · thẻ đánh số, mũi tên chỉ giờ'});
    if(rows.length)legendCols.push({title:'ĐƯỜNG & KÝ HIỆU',share:.32,rows});
    if(!rowLayout.hidden.some(g=>g.id==='contractions'))legendCols.push({title:'CƠN CO · THỜI GIAN MỖI CƠN',share:.26,rows:[[1,'Dưới 20 giây'],[2,'20–40 giây'],[3,'Trên 40 giây']].map(([n,text])=>({mark:(x,y)=>rect(x+2,y-mid-6.5,15,13,n===3?'#111':'url(#'+prefix+(n===1?'-dots':'-stripes')+')','stroke="#555" stroke-width=".6"'),text}))})}
  const codes=[];if(!rowLayout.hidden.some(g=>g.id==='fluid'))codes.push(...(design.fluidNotation==='vn'?[['C','còn ối'],['T','nước ối trắng'],['K','khô, không thấy dịch'],['X','xanh, lẫn phân su'],['Máu','lẫn máu']]:[['I','còn ối'],['C','nước ối trong'],['M','lẫn phân su'],['B','lẫn máu'],['A','không thấy dịch']]).map(([code,text])=>({code,text})));
  if(design.showHeadMarkers&&c.observations.some(o=>clinicalHeadMarker(o)&&!clinicalHeadMarker(o).hidden))codes.push({code:'◇△',text:'thoi = thóp trước; tam giác = thóp sau'});if(headCallouts)codes.push({code:'○←',text:'hình kiểu thế đặt cạnh, mũi tên chỉ điểm đo'});
  if(codes.length)legendCols.push({title:design.fluidNotation==='vn'?'ỐI (KÝ HIỆU VIỆT) · KIỂU THẾ':'ỐI (KÝ HIỆU WHO) · KIỂU THẾ',share:.42,rows:codes.map(r=>({mark:(x,y)=>textSVG(x+1,y,r.code,'font-size="10" font-weight="700" font-family="monospace"'),text:r.text}))});
  if(legendCols.length){const share=legendCols.reduce((n,c)=>n+c.share,0),head=pitch(8.5)+10,tall=Math.max(...legendCols.map(c=>c.rows.length)),boxH=head+tall*lp+10,start=bottom;let x=FL;
    body+=rect(FL,start,FW,boxH,'#fbfcfd','stroke="#94a3b8" stroke-width=".8"')+rect(FL,start,FW,head,'#eef2f6')+line(FL,start+head,FR,start+head,'#dde3ea',.7);
    for(const [i,col] of legendCols.entries()){const w=FW*col.share/share;if(i)body+=line(x,start+head+6,x,start+boxH-6,'#dde3ea',.7);body+=textSVG(x+10,start+head/2+8.5*fu*.36,col.title,'font-size="8.5" font-weight="700" fill="#475569" letter-spacing=".4"');col.rows.forEach((r,j)=>{const y=start+head+lp*(j+1)-2;body+=r.mark(x+10,y)+textSVG(x+40,y,r.text.length>fits(w-30)?r.text.slice(0,fits(w-30)-1)+'…':r.text,'font-size="10"')});x+=w}
    body+=textSVG(FR-4,start+head/2+8.5*fu*.36,'CHÚ GIẢI','font-size="8.5" font-weight="700" fill="#94a3b8" text-anchor="end" letter-spacing=".6"');bottom+=boxH+18}
  // Reading notes: method, alignment and data-scope remarks; an out-of-frame warning leads in red.
  const notes=[];if(c.patient.dateLabel)notes.push({text:'Ngày bắt đầu theo đề: '+c.patient.dateLabel+'.'});const beforeActive=c.observations.filter(o=>X(o.time)<G.left),overflow=c.observations.filter(o=>X(o.time)>(G.left+G.plotWidth));
  if(overflow.length)notes.push({alert:true,text:'Ngoài khung thời gian sau căn chỉnh: '+overflow.map(o=>clockAt(c,o.time)).join(', ')+'. Cần mở phiếu tiếp theo.'});
  if(rowLayout.hidden.some(g=>rowLayout.present(g.id))||compact)notes.push({text:'BẢN TRÍCH: một số nhóm thông số được ẩn theo lựa chọn hiển thị; dữ liệu gốc được giữ trong JSON.'});
  if(beforeActive.length)notes.push({text:'Modified: '+beforeActive.length+' mốc trước pha hoạt động không nằm trên lưới này; dữ liệu vẫn giữ trong JSON. Chọn WHO 1993 để xem pha tiềm thời.'});
  notes.push({text:lc?'Nguồn: WHO LCG 2020/2021 · Ngưỡng: 5 cm ≥6 h; 6 cm ≥5 h; 7 cm ≥3 h; 8 cm ≥2.5 h; 9 cm ≥2 h.':spec.short+' · Mốc hoạt động '+spec.active+' cm · Báo động bắt đầu ở hoành độ '+spec.origin+' · Hành động lệch 4 giờ. [UMP 2020, tr. 36–37]'});
  if(timeline.first&&!lc)notes.push({text:'Căn mốc: '+clockAt(c,timeline.first.time)+' · CTC '+timeline.first.cervix+' cm → hoành độ '+timeline.plot(timeline.first.time)+'. Hoành độ sản đồ không phải thời gian chuyển dạ trước nhập viện.'});
  notes.push({text:'Quy ước đọc chung của bài: 5/5 ↔ −3; 4/5 ↔ −2; 3/5 ↔ −1; 2/5 ↔ 0; 1/5 ↔ +1; 0/5 ↔ +2. Một đường độ lọt; dữ kiện nhập gốc được giữ nguyên.'});
  if(headConflicts.length)notes.push({alert:true,text:'Hai cách ghi không khớp quy ước tại '+headConflicts.map(o=>clockAt(c,o.time)+' ('+o.descent+'/5; station '+o.station+')').join(', ')+'. Đường vẽ dùng số /5 đã cho; cần đối chiếu lại dữ kiện.'});
  if(outsideHeads.length)notes.push({alert:true,text:'Ngoài thang station −3 đến +2 của quy ước đọc chung: '+outsideHeads.map(o=>clockAt(c,o.time)+' = '+o.station).join(', ')+'. Dữ kiện gốc vẫn giữ trong bảng và JSON; không ép về mốc cuối.'});
  if(design.showHeadMarkers&&c.observations.some(o=>o.descent!==null&&o.headMarker&&!o.headMarker.hidden))notes.push({text:'Hình kiểu thế: góc xoay do người soạn chọn trên trang.'});
  if(design.showNotes!==false||headConflicts.length||outsideHeads.length){body+=textSVG(FL,bottom+10,'GHI CHÚ ĐỌC PHIẾU','font-size="8.5" font-weight="700" fill="#64748b" letter-spacing=".5"');bottom+=12+pitch(9)*.4;
  for(const n of notes){const size=n.alert?10:9,lines=wrapText(n.text,fits(FW-14,size));lines.forEach((t,i)=>{bottom+=pitch(size);if(!i)body+=textSVG(FL+1,bottom,n.alert?'!':'•','font-size="'+size+'" font-weight="700" fill="'+(n.alert?(mono?'#000':'#b91c1c'):'#94a3b8')+'"');body+=textSVG(FL+12,bottom,t,'font-size="'+size+'"'+(n.alert?' font-weight="700" fill="'+(mono?'#000':'#b91c1c')+'"':' fill="#526474"'))})}}
  bottom+=18;
  if(design.exportNarrative){body+=line(10,bottom,(G.width-25),bottom,'#a8b4bf');body+=textSVG(10,bottom+25,c.id+' · '+c.title,'font-size="13" font-weight="700"');bottom+=40;if(c.narrative){const narrativeStart=bottom;body+=textSVG(10,bottom+12,'TÌNH HUỐNG LÂM SÀNG','font-size="10" font-weight="700"');bottom+=30;for(const s of wrapText(c.narrative,145)){body+=textSVG(10,bottom,s,'font-size="11"');bottom+=19}body+=cellHit('narrative',0,8,narrativeStart,G.width-28,bottom-narrativeStart,'case')}body+=textSVG(10,bottom+10,'Sản đồ Studio · '+(mono?'Đơn sắc':'Màu lâm sàng')+' · '+hours+' giờ trên lưới · Dữ liệu do người dùng ghi nhận','font-size="9" fill="#526474"');bottom+=30}
  if(design.valueLabels){for(const [key,y] of [['cervix',CY],['fhr',FY]]){if(key==='fhr'&&rowLayout.hidden.some(g=>g.id==='fhr'))continue;for(const o of shown.filter(o=>o[key]!==null))body+=textSVG(X(o.time)+7,y(o[key])+(key==='descent'?15:-8),o[key]+(key==='descent'?'/5':''),'font-size="9" font-weight="700" paint-order="stroke" stroke="white" stroke-width="3" stroke-linejoin="round"');}}
  if(!editable&&!exporting&&finite(options.focusTime)){const xx=X(options.focusTime);if(xx>=G.left&&xx<=G.left+G.plotWidth)body+=line(xx,80,xx,compact?806:1117,'#3b777d',1,'stroke-dasharray="3 4" opacity=".55" pointer-events="none"')}
  if(editable){if(finite(options.activeTime)){const activeX=X(options.activeTime);if(activeX>=G.left&&activeX<=(G.left+G.plotWidth)){body+=rect(activeX-9,G.fhrY,18,576,mono?'#000':'#0f766e','opacity=".045" pointer-events="none"');body+=line(activeX,G.fhrY,activeX,662,mono?'#444':'#0f766e',.8,'stroke-dasharray="3 4" pointer-events="none"')}}for(const key of ['fhr','cervix']){if(key==='fhr'&&rowLayout.hidden.some(g=>g.id==='fhr'))continue;const bounds=plotBounds(key);body+=rect(G.left,bounds.y,G.plotWidth,bounds.height,'transparent','data-plot="'+key+'" style="cursor:crosshair"')}
    if(cursor){const xx=X(cursor.time),yy2=field==='fhr'?FY(cursor.value):field==='descent'?DY(cursor.value):CY(cursor.value);body+=line(xx-8,yy2,xx+8,yy2,'#0f766e',1)+line(xx,yy2-8,xx,yy2+8,'#0f766e',1)+textSVG(xx+10,yy2-10,clockAt(c,cursor.time)+' · '+cursor.value,'font-size="10" fill="#0f766e"')}
  }
  if(!rowLayout.hidden.some(g=>g.id==='contractions'))rowHits('contractions',G.contractionY,G.contractionH);
  if(design.showHeader)for(const hit of headerHits)body+=cellHit(...hit);if(design.showHeader&&options.workspace&&!exporting)for(const [f,fx,fw,fy=30,fh=40] of headerHits.fields||[])body+=rect(fx,fy,fw,fh,'transparent','class="next-header-field" data-header-field="'+f+'" role="button" tabindex="0" aria-label="Sửa thông tin ca: '+f+'"');
  if(Array.isArray(options.reviewChanges)){
    const marks=new Map();for(const change of options.reviewChanges)if(finite(change.time)){const old=marks.get(change.time);if(!old||change.kind==='remove')marks.set(change.time,change)}
    for(const [time,change] of marks){const x=X(time);if(x<G.left||x>G.left+G.plotWidth)continue;const ink=change.kind==='remove'?'#b42318':'#0f766e';body+='<g data-review-change="'+esc(change.kind)+'" data-review-time="'+time+'"><title>'+esc(change.label+' · '+({add:'Thêm',remove:'Xóa',change:'Sửa'})[change.kind])+'</title>'+rect(x-7,80,14,compact?726:1055,ink,'opacity=".08" pointer-events="none"')+line(x,80,x,compact?806:1135,ink,1.5,'stroke-dasharray="4 4" pointer-events="none"')+'</g>'}
  }
  if(options.showProvenance)for(const [key,y] of [['fhr',FY],['cervix',CY],['descent',DY]])for(const o of shown.filter(o=>o[key]!==null)){
    const source=c.provenance?.['observations.'+o.time+'.'+key]||'unverified',ink=({source:'#0f766e',ai:'#996318',user:'#2469ab',unverified:'#667085'})[source];body+='<circle data-review-source="'+source+'" cx="'+X(o.time)+'" cy="'+y(o[key])+'" r="9" fill="none" stroke="'+ink+'" stroke-width="2" stroke-dasharray="'+(source==='ai'||source==='unverified'?'3 2':'')+'"><title>'+esc(({source:'Từ đề · AI khai báo',ai:'AI bổ sung · cần đối chiếu',user:'Người dùng sửa',unverified:'Chưa đối chiếu'})[source])+'</title></circle>';
  }
  const defs='<defs><pattern id="'+prefix+'-mm" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M4 0H0V4" fill="none" stroke="'+(mono?'#e2e2e2':'#edf0f3')+'" stroke-width=".3"/></pattern><pattern id="'+prefix+'-dots" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="white"/><circle cx="2" cy="2" r=".8" fill="#111"/></pattern><pattern id="'+prefix+'-stripes" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="white"/><line x1="0" y1="0" x2="0" y2="5" stroke="#111" stroke-width="1.5"/></pattern></defs>';
  if(exporting)body=body.replace(/ tabindex="0" role="button"/g,'').replace(/ data-observation-time="[^"]+" data-observation-field="[^"]+"/g,'');
  body=body.replace(/<!--section:(\w+)-->([\s\S]*?)<!--endsection-->/g,(_,id,content)=>rowLayout.hidden.some(g=>g.id===id)?'':content);
  // Clinical alert mode: persistent ring on every point currently outside its reference (never exported).
  if(!exporting&&options.alertMarks?.length)for(const m of options.alertMarks){const ys={fhr:FY,cervix:CY,descent:DY}[m.field],o=c.observations.find(o=>o.time===m.time);if(!ys||!o||blank(o[m.field])||m.field==='fhr'&&rowLayout.hidden.some(g=>g.id==='fhr'))continue;body+='<circle class="alert-mark" data-mark="'+m.field+'@'+m.time+'" cx="'+X(m.time)+'" cy="'+ys(o[m.field])+'" r="10" fill="none" stroke="#e11d48" stroke-width="2.2" pointer-events="none"/>'}
  if(editable&&!exporting){
    body=body.replace(/ tabindex="0" role="button"(?= aria-label="(?:Xem|Chỉnh hình))/g,'');
    const order=['cervix','descent','fhr'].filter(key=>key!==field).concat(field);
    for(const key of order){if(key==='fhr'&&rowLayout.hidden.some(g=>g.id==='fhr')||off(key==='cervix'?'ctc':key==='descent'?'des':key))continue;const tabTime=options.selectedPoint?.field===key?options.selectedPoint.time:shown.find(o=>!blank(o[key]))?.time,y=key==='fhr'?FY:key==='descent'?DY:CY;
      for(const o of shown.filter(o=>o[key]!==null)){const caption=(key==='cervix'?'CTC':key==='descent'?'Đầu trên vệ':'Tim thai')+' '+o[key]+' · '+clockAt(c,o.time);
        body+='<circle data-point-hit="true" data-observation-time="'+o.time+'" data-observation-field="'+key+'" cx="'+X(o.time)+'" cy="'+y(o[key])+'" r="12" fill="transparent" tabindex="'+(o.time===tabTime?0:-1)+'" role="button" aria-label="'+esc(caption)+'" style="cursor:grab;touch-action:none"><title>'+esc(caption)+'</title></circle>';
      }
    }
  }
  const labelOffset=design.labelWidth-geometry.left,mapX=v=>v>=128?v+labelOffset:v*(128+labelOffset)/128;
  if(options.designEditing&&!exporting){for(const section of RESIZE_SECTIONS){if(rowLayout.hidden.some(g=>g.id===section.id)||compact&&section.from>=830)continue;const selected=options.selectedSection===section.id;body+='<g data-design-section="'+section.id+'" tabindex="0" role="button" aria-label="'+esc('Chỉnh kích thước '+section.label)+'">'+rect(G.width-20,section.from+6,16,18,selected?'#245c61':'#e4efec','rx="3" style="cursor:pointer"')+line(G.width-16,section.from+12,G.width-8,section.from+12,selected?'#fff':'#245c61',1.5)+line(G.width-16,section.from+17,G.width-8,section.from+17,selected?'#fff':'#245c61',1.5)+'</g>';if(selected)body+=rect(2,section.from+1,G.width-4,section.to-section.from-2,'none','stroke="#245c61" stroke-width="1.4" stroke-dasharray="5 4" pointer-events="none"')+'<g data-resize-section="'+section.id+'" tabindex="0" role="button" aria-label="Kéo đổi chiều cao '+esc(section.label)+'" style="cursor:ns-resize;touch-action:none"><title>Kéo lên/xuống để đổi chiều cao</title>'+rect(G.width/2-30,section.to-5,60,10,'#245c61','rx="3"')+line(G.width/2-12,section.to,G.width/2+12,section.to,'#fff',1.5)+'</g>'}}
  // Row labels are selectable on screen: one click opens that region's data and layout together. Invisible, never exported.
  else if(!exporting&&options.directCells!==false){for(const section of RESIZE_SECTIONS){if(section.id==='header'||rowLayout.hidden.some(g=>g.id===section.id)||compact&&section.from>=830)continue;body+='<rect data-label-section="'+section.id+'" x="0" y="'+section.from+'" width="'+(G.left-14)+'" height="'+(section.to-section.from)+'" fill="transparent" style="cursor:pointer"><title>'+esc('Chọn vùng '+section.label+' để chỉnh')+'</title></rect>'}}
  const width=Math.round(mapX(G.width)*design.cellWidth),height=Math.ceil(rowLayout.y(bottom)*design.rowHeight);
  let inner=defs+rect(0,0,width,height,'#fff')+'<g font-family="'+(design.paperFont==='serif'?'Times New Roman, serif':'Arial, sans-serif')+'" fill="#172b3a">'+layoutSVG(body,{...design,mapX,mapY:rowLayout.y,progressScale:design.sectionHeights.progress})+'</g>';
  if(design.watermark)inner+=textSVG(width/2,height/2,design.watermark,'data-watermark="true" font-family="Arial,sans-serif" font-size="'+Math.max(14,Math.min(44,width/Math.max(10,design.watermark.length)*1.25))+'" text-anchor="middle" fill="#48696c" opacity=".13" pointer-events="none" transform="rotate(-20 '+width/2+' '+height/2+')"');
  if(mono)inner=inner.replace(/#[0-9a-fA-F]{6}\b/g,hex=>{const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));const gray=Math.round(rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722).toString(16).padStart(2,'0');return '#'+gray.repeat(3)});
  return {width,height,inner,offset,timeline,hours,hour,tailCell,rowLayout,labelOffset,hiddenRows:rowLayout.hidden.map(g=>g.label),scaleX:design.cellWidth,scaleY:design.rowHeight};
}
function svgDocument(d){return '<svg xmlns="http://www.w3.org/2000/svg" width="'+d.width+'" height="'+d.height+'" viewBox="0 0 '+d.width+' '+d.height+'">'+d.inner+'</svg>'}
/* PNG pHYs metadata: pixel density is independent of raster dimensions. */
function crc32(bytes){let crc=0xffffffff;for(const b of bytes){crc^=b;for(let n=0;n<8;n++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}return (crc^0xffffffff)>>>0}
function png300(dataURL){const binary=atob(dataURL.split(',')[1]),src=Uint8Array.from(binary,c=>c.charCodeAt(0));const chunk=new Uint8Array(21);const v=new DataView(chunk.buffer);v.setUint32(0,9);chunk.set([112,72,89,115],4);v.setUint32(8,11811);v.setUint32(12,11811);chunk[16]=1;v.setUint32(17,crc32(chunk.slice(4,17)));const result=new Uint8Array(src.length+21);result.set(src.slice(0,33));result.set(chunk,33);result.set(src.slice(33),54);return new Blob([result],{type:'image/png'})}
function download(blob,name){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)}
function createPDF(canvas,settings={}){
  const jpg=Uint8Array.from(atob(canvas.toDataURL('image/jpeg',.98).split(',')[1]),c=>c.charCodeAt(0));
  const portrait=settings.orientation==='portrait'||settings.orientation!=='landscape'&&canvas.height/canvas.width>=.95,paper=settings.paper==='a3'?[841.89,1190.55]:[595.28,841.89],pageW=portrait?paper[0]:paper[1],pageH=portrait?paper[1]:paper[0],margin=clamp(Number(settings.margin)||22,8,56),areaW=pageW-2*margin,areaH=pageH-2*margin;
  let imgW=areaW,imgH=areaW*canvas.height/canvas.width;
  if(settings.fit==='page'||settings.fit!=='pages'&&imgH<=areaH*1.5){const ratio=Math.min(1,areaH/imgH);imgW*=ratio;imgH*=ratio}
  const count=Math.max(1,Math.ceil((imgH-1e-6)/areaH)),encoder=new TextEncoder(),pieces=[],offsets=[0];let size=0;
  const add=value=>{const b=typeof value==='string'?encoder.encode(value):value;pieces.push(b);size+=b.length};
  const obj=(id,head,data)=>{offsets[id]=size;add(id+' 0 obj\n'+head);if(data){add('\nstream\n');add(data);add('\nendstream')}add('\nendobj\n')};
  add('%PDF-1.4\n%PDFIMAGE\n');obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,'<< /Type /Pages /Kids ['+Array.from({length:count},(_,i)=>(4+i*2)+' 0 R').join(' ')+'] /Count '+count+' >>');
  obj(3,'<< /Type /XObject /Subtype /Image /Width '+canvas.width+' /Height '+canvas.height+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpg.length+' >>',jpg);
  for(let i=0;i<count;i++){const pageId=4+i*2,contentId=pageId+1;const content='q\n'+margin+' '+margin+' '+areaW+' '+areaH+' re W n\n'+imgW.toFixed(3)+' 0 0 '+imgH.toFixed(3)+' '+((pageW-imgW)/2).toFixed(3)+' '+(pageH-margin-imgH+i*areaH).toFixed(3)+' cm\n/Im0 Do\nQ';obj(pageId,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+pageW+' '+pageH+'] /Resources << /XObject << /Im0 3 0 R >> >> /Contents '+contentId+' 0 R >>');obj(contentId,'<< /Length '+encoder.encode(content).length+' >>',content)}
  const xref=size,total=4+2*count;add('xref\n0 '+total+'\n0000000000 65535 f \n');for(let i=1;i<total;i++)add(String(offsets[i]).padStart(10,'0')+' 00000 n \n');add('trailer\n<< /Size '+total+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF');return new Blob(pieces,{type:'application/pdf'})
}
async function rasterize(c,options){const data=buildSVG(c,options,true),scale=designOptions(options.design).imageScale;if(data.height*scale>30000||data.width*data.height*scale*scale>80000000)throw new Error('Nội dung quá dài để xuất ảnh. Hãy rút gọn văn bản tình huống.');const blob=new Blob([svgDocument(data)],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob);try{const img=new Image();img.src=url;await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Không thể dựng ảnh từ SVG.'))});const canvas=document.createElement('canvas');canvas.width=data.width*scale;canvas.height=data.height*scale;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Trình duyệt không hỗ trợ Canvas 2D.');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);return canvas}finally{URL.revokeObjectURL(url)}}
function runChecks(){let passed=0;const ok=(test,msg)=>{if(!test)throw new Error(msg);passed++};const c=clone(PRESETS[0]);ok(parseCases('Dữ liệu:\n```json\n'+JSON.stringify([c])+'\n```')[0].id===c.id,'Markdown parser');ok(parseCases('Nội dung trước '+JSON.stringify({cases:[c]})+' sau').length===1,'Balanced parser');for(const raw of ['{bad}',JSON.stringify({...c,observations:[{time:0,cervix:11}]}),JSON.stringify({...c,observations:[{time:0},{time:0}]}),JSON.stringify({...c,observations:[{time:0,systolic:80,diastolic:100}]})]){let rejected=false;try{parseCases(raw)}catch{rejected=true}ok(rejected,'Reject invalid JSON / range / duplicate / BP')}ok(buildSVG(c).height>buildSVG(c,{compact:true}).height,'Compact hides lower tiers');const lcg=buildSVG(c,{standard:'lcg'});ok(!lcg.inner.includes('ĐƯỜNG BÁO ĐỘNG'),'No old lines in LCG');ok(buildSVG(c,{mono:true}).inner.includes('stroke-dasharray="7 4"'),'Monochrome action line');ok(!assessment(validateCase({patient:basePatient,observations:[{time:0}]}),'modified').title.includes('bình thường'),'Missing data status');ok(assessment(PRESETS[2],'modified').level==='critical','FHR warning');ok(clockAt({...c,patient:{...c.patient,startTime:'23:30'}},1)==='00:30 (+1d)','Midnight rollover');return {passed,geometry:{hours:24,halfHourCells:48,alert:[[0,4],[6,10]],action:[[4,4],[10,10]]}}}
window.PartographCore={G,headPlotLevel,headConventionConflict,chartRows,progressTrace,clinicalHeadMarker,chartTimeline,modelSpec,progressEvidence,lcgAlert,fluidDisplay,cervixY,descentY,fetalHeartY,plotValueAt,plotBounds,validateCase,parseCases,caseJSON,chartCellFields,changeChartCell,buildSVG,svgDocument,assessment,alignment,clockAt,presets:PRESETS,runChecks,rasterize,png300,createPDF};
