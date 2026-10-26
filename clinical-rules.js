'use strict';
// Software bounds, not clinical thresholds. Preserve measurements to the minute.
const CASE_HOURS=72,CASE_MOMENTS=300;
const validElapsed=t=>typeof t==='number'&&Number.isFinite(t)&&t>=0&&t<=CASE_HOURS&&Math.abs(t*60-Math.round(t*60))<.001;
const minuteTime=t=>Math.round(t*60)/60;
// Teaching conventions: UMP handout (2020), printed pp. 34–40; WHO LCG (2020/2021).
// The historical alert lines identify chart regions, not diagnoses or treatment orders.
const MODEL_SPECS={
  who1993:{label:'WHO 1993 · giảng dạy UMP',short:'WHO 1993',active:3,origin:8,source:'UMP 2020 · Handout tr. 36–37'},
  modified:{label:'Modified · pha hoạt động 4 cm',short:'WHO Modified',active:4,origin:0,source:'UMP 2020 · Handout tr. 37'},
  lcg:{label:'WHO LCG · mẫu số thích nghi',short:'WHO LCG',active:5,origin:0,source:'WHO LCG 2020/2021'}
};
function modelSpec(standard){return MODEL_SPECS[standard]||MODEL_SPECS.modified}
function chartTimeline(c,standard,view={}){
  const spec=modelSpec(standard),original=standard==='who1993',lc=standard==='lcg';
  const first=lc?null:c.observations.find(o=>o.cervix!==null&&o.cervix>=spec.active);
  const shift=first?spec.origin+first.cervix-spec.active-first.time:0;
  const plot=t=>original&&first&&t<first.time?t:t+shift;
  // Blank space created by translation is not elapsed clinical time. Ambiguous
  // overlaps after a late transition must be edited via the time-indexed form.
  const unplot=x=>{
    if(!original||!first){const t=x-shift;return t>=0&&t<=72?t:null}
    const candidates=[];
    if(x>=0&&x<first.time&&x<=72)candidates.push(x);
    const active=x-shift;if(active>=first.time&&active<=72)candidates.push(active);
    return candidates.length===1?candidates[0]:null;
  };
  const recorded=c.observations.filter(o=>Object.entries(o).some(([key,value])=>key!=='time'&&value!==null&&value!==undefined&&value!==''&&(!Array.isArray(value)||value.some(Boolean))));
  const end=Math.max(0,...recorded.map(o=>plot(o.time)),original&&first?first.time:0);
  const padding=Number.isFinite(view.timePadding)?Math.max(0,Math.min(8,view.timePadding)):0;
  const referenceEnd=lc?0:spec.origin+4+10-spec.active;
  const needed=Math.max(4,referenceEnd,Math.ceil(end+padding));
  const requested=view.timeMode==='full'?24:view.timeMode==='manual'&&Number.isFinite(view.timeHours)?Math.max(4,Math.min(48,Math.ceil(view.timeHours))):0;
  const hours=Math.max(needed,requested);
  return {first,shift,plot,unplot,hours,needed,referenceEnd,requested,expanded:requested>0&&needed>requested,end,original,latent:c.observations.filter(o=>first&&o.time<first.time)};
}
// Every entry uses the same anchoring point as the final chart; do not re-anchor per row.
function progressTrace(c,standard){
  const tl=chartTimeline(c,standard),spec=modelSpec(standard);
  return c.observations.map(o=>{let region='unknown',label='Chưa có CTC',delta=null;
    if(o.cervix!==null){
      if(standard==='lcg'){region='lcg';label='LCG · không có hai đường tham chiếu'}
      else if(!tl.first||o.cervix<spec.active||o.time<tl.first.time){region='latent';label='Trước mốc hoạt động của mẫu'}
      else{delta=tl.plot(o.time)-(spec.origin+o.cervix-spec.active);region=delta>=4?'action':delta>1e-8?'right':delta< -1e-8?'left':'on';label={action:'Chạm / vượt hành động',right:'Giữa báo động và hành động',left:'Bên trái báo động',on:'Trên báo động'}[region]}
    }
    return {...o,clock:clockAt(c,o.time),plotTime:tl.plot(o.time),region,regionLabel:label,delta};
  });
}
function progressEvidence(c,standard){
  const spec=modelSpec(standard),tl=chartTimeline(c,standard);
  const obs=c.observations.filter(o=>o.cervix!==null),last=obs.at(-1);
  if(!last)return {region:'unknown',label:'Chưa có độ mở CTC',last:null};
  if(last.cervix>=10){const delta=standard==='lcg'?null:tl.plot(last.time)-(spec.origin+10-spec.active);return {region:'second',referenceRegion:delta===null?'lcg':delta>=4?'action':delta>1e-8?'right':'left',delta,label:'CTC mở trọn · giai đoạn II',last}}
  if(last.cervix<spec.active)return {region:'latent',label:'Chưa đạt mốc hoạt động của mẫu ('+spec.active+' cm)',last};
  if(standard==='lcg')return {region:'lcg',label:'Pha tích cực · đối chiếu thời gian LCG',last};
  const delta=tl.plot(last.time)-(spec.origin+last.cervix-spec.active);
  return {region:delta>=4?'action':delta>1e-8?'right':'left',delta,last,
    label:delta>=4?'Chạm / vượt đường hành động':delta>1e-8?'Giữa báo động và hành động':Math.abs(delta)<1e-8?'Trên đường báo động':'Bên trái đường báo động'};
}
const FLUID_LABELS={I:'I · Ối còn',C:'C · Ối trong',M:'M · Phân su, chưa ghi mức', 'M+':'M+ · Phân su (+)','M++':'M++ · Phân su (++)','M+++':'M+++ · Phân su (+++)',B:'B · Lẫn máu',A:'A · Ối vỡ, không thấy dịch'};
function optionLabel(field,value,notation='vn'){
  if(field.key==='occiputPosition')return HEAD_POSITIONS.find(p=>p.id===value)?.label||value;
  if(field.key==='fluid'){const label=FLUID_LABELS[value];return label?fluidDisplay(value,notation)+(notation==='vn'&&value==='C'?' · Ối trắng':label.slice(label.indexOf(' · '))):value}
  const labels={deceleration:{E:'Sớm',L:'Muộn',V:'Biến đổi',N:'Không',U:'Chưa rõ'},position:{A:'Chẩm trước',P:'Chẩm sau',T:'Chẩm ngang',U:'Chưa rõ'},companion:{Y:'Có',N:'Không',D:'Từ chối',U:'Chưa rõ'},painRelief:{Y:'Có',N:'Không',D:'Từ chối',U:'Chưa rõ'},oralFluid:{Y:'Có',N:'Không',D:'Từ chối',U:'Chưa rõ'},posture:{MO:'Di chuyển',SP:'Nằm ngửa',U:'Chưa rõ'}};
  return labels[field.key]?.[value]||value;
}
function fluidDisplay(value,notation){return notation==='vn'?({I:'C',C:'T',M:'X','M+':'X+','M++':'X++','M+++':'X+++',A:'K',B:'Máu'}[value]||value):value}
function lcgAlert(key,value){
  if(value===null||value===undefined||value==='')return false;
  const n=Number(value);
  switch(key){
    case 'fhr':return n<110||n>=160;
    case 'contractions':return n<=2||n>5;
    case 'duration':return n<20||n>60;
    case 'fluid':return value==='M+++'||value==='B';
    case 'deceleration':return value==='L';
    case 'position':return value==='P'||value==='T';
    case 'moulding':case 'caput':return value==='+++';
    case 'pulse':return n<60||n>=120;
    case 'systolic':return n<80||n>=140;
    case 'diastolic':return n>=90;
    case 'temperature':return n<35||n>=37.5;
    case 'protein':case 'acetone':return ['++','+++','++++'].includes(value);
    case 'companion':case 'painRelief':case 'oralFluid':return value==='N';
    case 'posture':return value==='SP';
    default:return false;
  }
}
function assessment(c,standard){
  const obs=[...c.observations].sort((a,b)=>a.time-b.time);
  const latest=obs.filter(o=>FIELD_DEFS.some(f=>!blank(o[f.key]))).at(-1);
  const progress=progressEvidence(c,standard),lc=standard==='lcg',spec=modelSpec(standard);
  const checks=[],notes=[];
  const add=(code,message,level='warn',source=lc?'WHO LCG · cột ALERT':'UMP 2020 · Handout tr. 38–40',time=latest?.time)=>checks.push({code,message,level,source,time});
  if(!latest)return {level:'',title:'Chưa đủ dữ liệu đánh giá',time:'—',reasons:['Chưa có thông số được ghi nhận.'],checks,progress};
  const dil=obs.filter(o=>o.cervix!==null),last=dil.at(-1);
  if(last){
    if(!lc){
      const region=progress.referenceRegion||progress.region;
      if(region==='action')add('action-line','CTC chạm hoặc vượt đường hành động của mô hình lịch sử: cần đánh giá đầy đủ 3P và quyết định quản lý; không tự suy ra chỉ định mổ.','critical',spec.source,last.time);
      else if(region==='right')add('alert-line','CTC nằm bên phải đường báo động: cần tìm nguyên nhân tiến triển chậm. Vị trí này không tự xác định bất xứng đầu chậu.','warn',spec.source,last.time);
      else if(region==='left')notes.push('Nằm trên / bên trái đường báo động không đồng nghĩa chuyển dạ bình thường. Đọc cùng ngôi thai, cơn co và tình trạng mẹ–thai. [UMP 2020, tr. 38]');
    }
    if(lc&&last.cervix>=5&&last.cervix<10){
      const limits={5:6,6:5,7:3,8:2.5,9:2},limit=limits[last.cervix];
      let since=last.time;for(let i=dil.length-2;i>=0;i--){if(dil[i].cervix!==last.cervix)break;since=dil[i].time}
      if(limit&&last.time-since>=limit)add('lcg-progress','CTC '+last.cervix+' cm được ghi nhận không đổi qua '+(last.time-since)+' giờ; đạt ngưỡng '+limit+' giờ của LCG.','warn','WHO LCG · Cervix',last.time);
      if(!limit)notes.push('CTC có số lẻ: chưa gán ngưỡng thời gian LCG của một mức nguyên; cần đối chiếu trực tiếp.');
    }
    if(dil.length>1&&last.cervix<dil.at(-2).cervix)add('cervix-regression','Độ mở mới thấp hơn lần trước: kiểm tra số liệu, người khám và tình trạng cổ tử cung; không suy ra một chẩn đoán từ sai khác này.','warn','Kiểm tra nhất quán dữ liệu',last.time);
    if(last.time<latest.time)notes.push('CTC gần nhất lúc '+clockAt(c,last.time)+'. Chưa có khám mới để xác nhận không tiến triển.');
  }
  const paired=obs.filter(o=>o.cervix!==null&&o.descent!==null),a=paired.at(-2),b=paired.at(-1);
  if(a&&b&&b.time>a.time&&b.cervix>a.cervix&&b.descent>=a.descent&&b.descent>0){
    add('descent-discordance','CTC tăng '+a.cervix+' → '+b.cervix+' cm, nhưng đầu còn trên vệ '+a.descent+' → '+b.descent+'/5: cần đánh giá sự xuống, kiểu thế và trở ngại cơ học, kể cả khi CTC bên trái báo động.','warn','UMP 2020 · Handout tr. 38',b.time);
  }
  const o=latest;
  if(o.fhr!==null&&(lc?lcgAlert('fhr',o.fhr):(o.fhr<120||o.fhr>160)))add('fhr','Tim thai '+o.fhr+' lần/phút ngoài ngưỡng đối chiếu của mẫu; cần đánh giá thai trực tiếp. Một giá trị không đủ phân loại CTG hay chẩn đoán suy thai.','critical',lc?'WHO LCG · FHR <110 hoặc ≥160':'WHO/ICM 2008 · mô hình cổ điển 120–160',o.time);
  if(o.contractions!==null&&o.contractions>5)add('frequent-contractions','Ghi nhận '+o.contractions+' cơn/10 phút: cần đánh giá cơn co và tim thai; tần số không cho biết cường độ hoặc trương lực nền.','critical','WHO LCG · >5 cơn/10 phút; UMP 2020 tr. 38');
  if(!lc&&(o.fluid==='B'||o.fluid.startsWith('M')))add('fluid','Nước ối '+(o.fluid==='B'?'lẫn máu':'có phân su')+': đối chiếu tình trạng thai, không kết luận suy thai chỉ từ màu ối.','warn','UMP 2020 · Handout tr. 35; đánh giá mẹ–thai');
  if(!lc&&o.moulding==='+++')add('moulding','Uốn khuôn +++: đánh giá ngôi, kiểu thế, độ xuống và khung chậu. Không dùng riêng dấu hiệu này để khẳng định CPD.','warn','UMP 2020 · lưu đồ trái/phải báo động');
  if(!lc){
    // Maternal vital signs and latent phase for the historical charts (LCG has its own ALERT column below).
    if(o.systolic!==null&&o.diastolic!==null&&(o.systolic>=140||o.diastolic>=90)){const severe=o.systolic>=160||o.diastolic>=110;add('maternal-bp','Huyết áp '+o.systolic+'/'+o.diastolic+' mmHg'+(severe?' (mức nặng: tâm thu ≥ 160 hoặc tâm trương ≥ 110)':' (tâm thu ≥ 140 hoặc tâm trương ≥ 90)')+(['++','+++','++++'].includes(o.protein)?', đạm niệu '+o.protein:'')+': cần đánh giá tăng huyết áp trong thai kỳ và các dấu hiệu nặng.',severe?'critical':'warn','ISSHP 2021 · ngưỡng huyết áp')}
    if(o.temperature!==null&&o.temperature>=38)add('maternal-fever','Nhiệt độ '+String(o.temperature).replace('.',',')+' °C: cần tìm nguyên nhân sốt trong chuyển dạ, kể cả nhiễm trùng ối; đối chiếu mạch mẹ và tim thai.','warn','ACOG CO 712 · sốt trong chuyển dạ');
    if(o.pulse!==null&&o.pulse>100)add('maternal-pulse','Mạch mẹ '+o.pulse+' lần/phút (> 100): cần đối chiếu nhiệt độ, mất máu, đau và tình trạng mất nước.','warn','Ngưỡng nhịp nhanh người lớn');
    const firstCervix=dil[0];
    if(firstCervix&&last&&last.cervix<spec.active&&last.time-firstCervix.time>=8)add('prolonged-latent','Độ mở CTC chưa đạt '+spec.active+' cm sau '+(last.time-firstCervix.time)+' giờ theo dõi: pha tiềm thời kéo dài theo mô hình (tối đa 8 giờ).','warn','WHO 1994 · Hướng dẫn sử dụng sản đồ',last.time);
  }
  if(lc){
    const labels={contractions:'Tần số cơn co ≤2/10 phút',duration:'Thời gian cơn co <20 hoặc >60 giây',fluid:'Nước ối M+++ hoặc lẫn máu',deceleration:'Nhịp giảm muộn',position:'Kiểu thế sau / ngang',caput:'Bướu huyết thanh +++',moulding:'Uốn khuôn +++',pulse:'Mạch mẹ <60 hoặc ≥120 lần/phút',systolic:'HA tâm thu <80 hoặc ≥140 mmHg',diastolic:'HA tâm trương ≥90 mmHg',temperature:'Nhiệt độ <35 hoặc ≥37,5 °C',protein:'Đạm niệu ≥++',acetone:'Acetone ≥++',companion:'Chưa có người đồng hành',painRelief:'Chưa được giảm đau',oralFluid:'Chưa uống dịch',posture:'Đang nằm ngửa'};
    for(const [key,label] of Object.entries(labels))if(lcgAlert(key,o[key])&&!(key==='contractions'&&o[key]>5))add('lcg-'+key,label+' — đạt tiêu chí đối chiếu LCG.', ['deceleration','systolic','diastolic'].includes(key)?'critical':'warn');
    if(o.fluid.startsWith('M')&&o.fluid!=='M+++')notes.push('Có phân su: cần ghi rõ mức độ. Tiêu chí ALERT về ối của LCG là M+++ hoặc máu; không tự quy mọi M thành M+++.');
    const push=c.patient.pushingStart,validPara=/^\d{4}$/.test(c.patient.para),nulliparous=validPara&&Number(c.patient.para[0])+Number(c.patient.para[1])===0;
    if(push!==null){
      if(!last||last.cervix<10||push<last.time&&dil.every(d=>d.time>push||d.cervix<10))notes.push('Mốc bắt đầu rặn chưa được đối chiếu với CTC mở trọn; kiểm tra lại trước khi tính ngưỡng giai đoạn II.');
      else if(!validPara)notes.push('Chưa có Para hợp lệ để đối chiếu thời gian rặn.');
      else if(latest.time-push>=(nulliparous?3:2))add('lcg-pushing','Thời gian từ bắt đầu rặn đạt ngưỡng '+(nulliparous?3:2)+' giờ của LCG; cần đánh giá trực tiếp.','warn','WHO LCG · User’s manual, giai đoạn II');
    }
  }
  const missing=['fhr','cervix','descent','contractions','pulse','systolic','diastolic','temperature'].filter(k=>blank(o[k]));
  if(missing.length)notes.push('Mốc này còn thông số chưa đo. Giá trị cũ không được tự coi là hiện tại.');
  if(!lc)notes.push('Đường 1 cm/giờ thuộc mô hình giảng dạy lịch sử; không dùng riêng tốc độ này làm chỉ định can thiệp hiện hành. [WHO 2018, khuyến cáo 7–8]');
  const level=checks.some(x=>x.level==='critical')?'critical':checks.length?'warn':'';
  return {level,title:(level==='critical'?'Cần đánh giá sớm · ':level?'Cần đối chiếu · ':'')+progress.label,time:clockAt(c,latest.time),checks,progress,
    reasons:[...checks.map(x=>clockAt(c,x.time)+' · '+x.message+' ['+x.source+']'),...notes]};
}
