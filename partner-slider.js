const rkPartnerScriptBase = document.currentScript?.src || location.href;
(async () => {
  const base=rkPartnerScriptBase;
  function loadScript(name){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=new URL(name,base).href;s.onload=resolve;s.onerror=reject;document.head.append(s);});}
  try{await loadScript('partners-common.js');await loadScript('partners-data.js');}catch{console.warn('업체 데이터를 불러오지 못했습니다.');return;}
  let ads;try{ads=RKPartner.validate(window.RK_PARTNERS).filter(x=>RKPartner.active(x)&&x.hero).sort((a,b)=>a.order-b.order);}catch{console.warn('업체 데이터 형식을 확인하세요.');return;}
  if(!ads.length){const root=document.getElementById('rkPartnerCarousel');if(root)root.hidden=true;return;}
  const style=document.createElement('style');
  style.textContent=`.rk-ad-carousel .rk-ad-slide.rk-uhjs{background:#203326}.rk-ad-carousel .rk-uhjs::after{display:none}.rk-ad-carousel .rk-uhjs img{inset:0 0 0 auto;width:43%;height:100%;object-fit:contain;background:#ededed;transform:none;animation:none!important}.rk-ad-carousel .rk-uhjs .rk-ad-copy{width:57%;padding:20px}.rk-ad-carousel .rk-uhjs .rk-ad-title{font-size:clamp(23px,2vw,32px)}.rk-ad-carousel .rk-uhjs .rk-ad-label{letter-spacing:1px}.rk-ad-carousel .rk-uhjs .rk-ad-link{font-size:12px;padding:10px;min-height:44px;box-sizing:border-box;display:flex;align-items:center;text-decoration:none}.rk-uhjs-actions{display:flex;flex-wrap:wrap;gap:8px}.rk-ad-carousel .rk-uhjs .rk-ad-description{margin-bottom:8px}@media(max-width:400px){.rk-ad-carousel .rk-uhjs .rk-ad-copy{padding:14px}.rk-ad-carousel .rk-uhjs .rk-ad-title{font-size:23px}}`;
  document.head.append(style);
  const interval = 7000;
  const root = document.getElementById('rkPartnerCarousel');
  if(!root)return;
  const track=root.querySelector('.rk-ad-track'),controls=root.querySelector('.rk-ad-controls');
  track.replaceChildren();controls.replaceChildren();
  const progress=document.createElement('div'),fill=document.createElement('div');progress.className='rk-ad-progress';fill.className='rk-ad-progress-fill';progress.append(fill);root.querySelector('.rk-ad-window').append(progress);
  let current=0,paused=false,timer=null;const slides=[],dots=[];
  ads.forEach((ad,i)=>{
    const link=document.createElement(ad.real?'div':'a');link.className='rk-ad-slide';if(!ad.real)link.href=ad.url||'./partners.html';link.setAttribute('aria-label',ad.real?ad.name+' 광고':ad.name+' · 광고 예시 · 업체 및 혜택 보기');if(ad.real){link.classList.add('rk-uhjs');link.setAttribute('role','group');}
    const img=document.createElement('img');img.src=ad.image;img.alt='';img.decoding='async';img.addEventListener('error',()=>img.remove());link.append(img);
    const copy=document.createElement('div');copy.className='rk-ad-copy';
    (ad.real?[['span','rk-ad-label','광고 · '+ad.region],['strong','rk-ad-title',ad.title||ad.name],['span','rk-ad-description',ad.benefit||'예약 및 매장 소식 확인하기']]:[['span','rk-ad-label','광고 예시 · '+ad.region],['strong','rk-ad-title',ad.title||ad.name],['span','rk-ad-description',ad.name+' · 가상 업체'],['span','rk-ad-benefit','회원 혜택 · '+ad.benefit+' (예시)'],['span','rk-ad-link','업체·혜택 확인하기 →']]).forEach(([tag,cls,text])=>{const el=document.createElement(tag);el.className=cls;el.textContent=text;if(cls==='rk-ad-title')el.style.whiteSpace='pre-line';copy.append(el);});
    if(ad.real){
      const actions=document.createElement('div');actions.className='rk-uhjs-actions';
      [['예약하기 ↗',ad.booking],['업체 소식 보기 ↗',ad.url||'./partners.html']].filter(([,url])=>url).forEach(([text,url])=>{const a=document.createElement('a');a.className='rk-ad-link';a.textContent=text;a.href=url;a.target='_blank';a.rel='sponsored noopener noreferrer';a.setAttribute('aria-label',ad.name+' '+text+' (새 탭)');actions.append(a);});
      copy.append(actions);
    }
    link.append(copy);track.append(link);slides.push(link);
    const dot=document.createElement('button');dot.type='button';dot.className='rk-ad-dot';dot.setAttribute('aria-label',(i+1)+'번째 광고 보기');dot.addEventListener('click',()=>show(i));dots.push(dot);controls.append(dot);
  });
  const pause=document.createElement('button');pause.type='button';pause.className='rk-ad-pause';pause.textContent='일시정지';pause.setAttribute('aria-pressed','false');controls.append(pause);
  function schedule(){clearTimeout(timer);timer=null;if(paused||document.hidden)return;timer=setTimeout(()=>show((current+1)%ads.length),interval);}
  function show(index){current=index;slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===current);slide.inert=i!==current;slide.tabIndex=i===current?0:-1;slide.setAttribute('aria-hidden',String(i!==current));});dots.forEach((dot,i)=>dot.setAttribute('aria-current',String(i===current)));fill.style.animation='none';void fill.offsetWidth;fill.style.animation='rk-ad-progress '+interval+'ms linear forwards';fill.style.animationPlayState=paused?'paused':'running';schedule();}
  pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'자동재생':'일시정지';pause.setAttribute('aria-pressed',String(paused));root.classList.toggle('is-paused',paused);fill.style.animationPlayState=paused?'paused':'running';if(!paused)show(current);else schedule();});
  document.addEventListener('visibilitychange',()=>{root.classList.toggle('is-paused',paused||document.hidden);fill.style.animationPlayState=paused||document.hidden?'paused':'running';if(!document.hidden&&!paused)show(current);else schedule();});
  show(0);
})();
