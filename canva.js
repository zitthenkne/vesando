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
    const text=label(el);if(!text)return;
    hide();target=el;
    if(el.hasAttribute('title')){el.dataset.cvTip=el.getAttribute('title');el.removeAttribute('title')}
    timer=setTimeout(()=>{if(target!==el||!el.isConnected)return;tip.textContent=text;tip.hidden=false;place()},350);
  };
  const candidate=e=>e.target.closest?.('button,summary,a,[role=button],[role=radio],[title]');
  document.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;const el=candidate(e);if(el&&el!==target)show(el)});
  document.addEventListener('pointerout',e=>{if(target&&!target.contains(e.relatedTarget))hide()});
  document.addEventListener('focusin',e=>{const el=candidate(e);if(el&&el.matches(':focus-visible'))show(el)});
  document.addEventListener('focusout',hide);
  document.addEventListener('pointerdown',hide,true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});
  addEventListener('scroll',hide,true);
  if(document.body)document.body.appendChild(tip);else document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(tip),{once:true});
})();
