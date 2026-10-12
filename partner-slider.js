/* 실제 업체가 정해지면 아래 5개 항목을 수정하세요.
   image: 사진 경로 / url: 업체 상세 페이지 / benefit: 회원 혜택
   지금은 같은 풍경 사진을 사용한 가상 광고 예시입니다. */
(() => {
  const ads = [
    {real:true,region:'서울 · 신사',title:'우후죽순\n신사점',name:'우후죽순 신사점',image:'./uhjs-sinsa-logo.png',url:'https://www.instagram.com/uhjs_sinsa/'},
    {region:'서울 · 마포 / 카페',title:'골목에서 찾은\n나만의 휴식.',name:'느린 오후 카페',benefit:'음료 10% 할인',image:'./partner-ad-example.jpg',url:'./partners.html'},
    {region:'강원 · 강릉 / 체험',title:'여행에 특별한\n추억을 더하세요.',name:'바람 공방',benefit:'체험 5% 할인',image:'./partner-ad-example.jpg',url:'./partners.html'},
    {region:'경상 · 경주 / 숙소',title:'고즈넉한 하루,\n천천히 머물기.',name:'달빛 한옥',benefit:'웰컴 서비스',image:'./partner-ad-example.jpg',url:'./partners.html'},
    {region:'제주 · 서귀포 / 카페',title:'제주의 여유를\n한 잔에 담아요.',name:'오름 티하우스',benefit:'디저트 제공',image:'./partner-ad-example.jpg',url:'./partners.html'}
  ];
  const style=document.createElement('style');
  style.textContent=`.rk-ad-carousel .rk-ad-slide.rk-uhjs{background:#203326}.rk-ad-carousel .rk-uhjs::after{display:none}.rk-ad-carousel .rk-uhjs img{inset:0 0 0 auto;width:43%;height:100%;object-fit:contain;background:#ededed;transform:none;animation:none!important}.rk-ad-carousel .rk-uhjs .rk-ad-copy{width:57%;padding:20px}.rk-ad-carousel .rk-uhjs .rk-ad-title{font-size:clamp(23px,2vw,32px)}.rk-ad-carousel .rk-uhjs .rk-ad-label{letter-spacing:1px}.rk-ad-carousel .rk-uhjs .rk-ad-link{font-size:12px;padding:9px 10px}@media(max-width:400px){.rk-ad-carousel .rk-uhjs .rk-ad-copy{padding:14px}.rk-ad-carousel .rk-uhjs .rk-ad-title{font-size:23px}}`;
  document.head.append(style);
  const interval = 7000;
  const root = document.getElementById('rkPartnerCarousel');
  if(!root)return;
  const track=root.querySelector('.rk-ad-track'),controls=root.querySelector('.rk-ad-controls');
  track.replaceChildren();controls.replaceChildren();
  const progress=document.createElement('div'),fill=document.createElement('div');progress.className='rk-ad-progress';fill.className='rk-ad-progress-fill';progress.append(fill);root.querySelector('.rk-ad-window').append(progress);
  let current=0,paused=false,timer=null;const slides=[],dots=[];
  ads.forEach((ad,i)=>{
    const link=document.createElement('a');link.className='rk-ad-slide';link.href=ad.url;link.setAttribute('aria-label',ad.real?ad.name+' 인스타그램 보기 (새 탭)':ad.name+' · 광고 예시 · 업체 및 혜택 보기');if(ad.real){link.classList.add('rk-uhjs');link.target='_blank';link.rel='sponsored noopener noreferrer';}
    const img=document.createElement('img');img.src=ad.image;img.alt='';img.decoding='async';img.addEventListener('error',()=>img.remove());link.append(img);
    const copy=document.createElement('div');copy.className='rk-ad-copy';
    (ad.real?[['span','rk-ad-label','광고 · '+ad.region],['strong','rk-ad-title',ad.title],['span','rk-ad-description','매장 소식은 인스타그램에서'],['span','rk-ad-link','인스타그램 보기 ↗']]:[['span','rk-ad-label','광고 예시 · '+ad.region],['strong','rk-ad-title',ad.title],['span','rk-ad-description',ad.name+' · 가상 업체'],['span','rk-ad-benefit','회원 혜택 · '+ad.benefit+' (예시)'],['span','rk-ad-link','업체·혜택 확인하기 →']]).forEach(([tag,cls,text])=>{const el=document.createElement(tag);el.className=cls;el.textContent=text;if(cls==='rk-ad-title')el.style.whiteSpace='pre-line';copy.append(el);});
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
