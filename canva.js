'use strict';
// Canva-style tooltips: a dark bubble for controls that carry a title or are icon-only.
// The native title is parked in data-cv-tip while hovered so the browser does not show a second tooltip.
(function(){
  const tip=document.createElement('div');tip.className='cv-tip';tip.setAttribute('role','tooltip');tip.hidden=true;
  let target=null,timer=0;
  const label=el=>{
    const title=el.getAttribute('title')||el.dataset.cvTip;
    if(title)return title;
    const aria=el.getAttribute('aria-label');
    // Only icon-only controls repeat their aria-label; labelled buttons already say it.
    return aria&&!el.textContent.trim()?aria:'';
  };
  const place=()=>{
    if(!target)return;
    const r=target.getBoundingClientRect(),t=tip.getBoundingClientRect(),gap=8;
    const below=r.bottom+gap+t.height<=innerHeight;
    const x=Math.max(8,Math.min(innerWidth-t.width-8,r.left+r.width/2-t.width/2));
    tip.style.left=x+'px';tip.style.top=(below?r.bottom+gap:r.top-gap-t.height)+'px';
    tip.dataset.side=below?'below':'above';
  };
  const hide=()=>{
    clearTimeout(timer);tip.hidden=true;
    if(target?.dataset.cvTip&&!target.hasAttribute('title'))target.setAttribute('title',target.dataset.cvTip);
    if(target)delete target.dataset.cvTip;
    target=null;
  };
  const show=el=>{
    // An open menu already explains itself; a tip over it would cover the first item.
    if(el.matches('details[open]>summary'))return;
    // Chart marks have their own hover readout; a second bubble would cover the point toolbar.
    if(el.closest('svg.partograph'))return;
    const text=label(el);if(!text)return;
    hide();target=el;
    if(el.hasAttribute('title')){el.dataset.cvTip=el.getAttribute('title');el.removeAttribute('title')}
    timer=setTimeout(()=>{if(target!==el||!el.isConnected)return;tip.textContent=text;tip.hidden=false;place()},350);
  };
  const candidate=e=>e.target.closest?.('button,summary,a,[role=button],[role=radio],[title]');
  document.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;const el=candidate(e);if(el&&el!==target)show(el)});
  document.addEventListener('pointerout',e=>{if(target&&!target.contains(e.relatedTarget))hide()});
  // A tap can move focus (menus focus their first item); touch users get no bubble for that.
  let touchedAt=0;document.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')touchedAt=Date.now()},true);
  document.addEventListener('focusin',e=>{const el=candidate(e);if(el&&el.matches(':focus-visible')&&Date.now()-touchedAt>1000)show(el)});
  document.addEventListener('focusout',hide);
  document.addEventListener('pointerdown',hide,true);
  document.addEventListener('toggle',e=>{if(e.target.open)hide()},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});
  addEventListener('scroll',hide,true);
  if(document.body)document.body.appendChild(tip);else document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(tip),{once:true});
})();
// Phone: a menu opened as a bottom sheet closes when dragged down by its top edge, like Canva's sheets.
(function(){
  const SHEETS='.workspace-menu[open]>div,.case-menu[open]>.case-menu-list,.rail-more[open]>.rail-more-panel,.next-exact-time[open]>form';
  let drag=null;
  const begin=(target,y)=>{
    if(innerWidth>760)return false;
    const sheet=target.closest?.(SHEETS);
    if(!sheet||y-sheet.getBoundingClientRect().top>34||target.closest('button,a,input,select,label'))return false;
    drag={sheet,start:y,dy:0};return true;
  };
  const move=y=>{if(!drag)return;drag.dy=Math.max(0,y-drag.start);drag.sheet.style.setProperty('transform','translateY('+drag.dy+'px)','important');drag.sheet.style.setProperty('transition','none','important')};
  const end=()=>{if(!drag)return;const {sheet,dy}=drag;drag=null;sheet.style.removeProperty('transform');sheet.style.removeProperty('transition');if(dy>60)sheet.parentElement.open=false};
  document.addEventListener('touchstart',e=>{if(e.touches.length===1)begin(e.target,e.touches[0].clientY)},{passive:true});
  document.addEventListener('touchmove',e=>{if(!drag)return;e.preventDefault();move(e.touches[0].clientY)},{passive:false});
  document.addEventListener('touchend',end);document.addEventListener('touchcancel',end);
  document.addEventListener('mousedown',e=>{if(e.button===0&&begin(e.target,e.clientY))e.preventDefault()});
  document.addEventListener('mousemove',e=>move(e.clientY));document.addEventListener('mouseup',end);
})();
