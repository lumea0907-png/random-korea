/* Random Korea editorial card enhancements: never changes existing map/lottery logic. */
(()=>{'use strict';
const init=()=>{
  document.querySelectorAll('[data-rk-v15-region]').forEach(card=>{
    card.addEventListener('click',()=>{
      const code=card.getAttribute('data-rk-v15-region');
      const btn=document.querySelector('.rk-a-region-button[data-region="'+code+'"]');
      if(btn)btn.click(); // focus existing Leaflet map only; does not narrow lottery pool
    });
  });
  const rows=Array.isArray(window.RK_PARTNERS)?window.RK_PARTNERS:[];
  document.querySelectorAll('[data-rk-v15-partner]').forEach(card=>{
    const target=card.getAttribute('data-rk-v15-partner');if(!target)return;
    const p=rows.find(x=>x.name===target&&x.enabled!==false&&x.directory!==false);
    if(p&&p.id){card.setAttribute('href','./partner-detail.html?id='+encodeURIComponent(p.id));}
  });
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
