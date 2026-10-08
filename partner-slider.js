/* 실제 제휴 업체가 정해지면 아래 5개 항목을 수정하세요.
   image: 업체 이미지 파일 경로 / url: 업체 상세 페이지 주소
   자동 전환 간격: 5000 = 5초 */
(() => {
  const ads = [
    {title:'서울 제휴 업체',description:'서울 여행에서 만나는 특별한 공간',image:'',url:'./partners.html',region:'서울'},
    {title:'경기 제휴 업체',description:'가까운 곳에서 즐기는 새로운 여행',image:'',url:'./partners.html',region:'경기'},
    {title:'강원 제휴 업체',description:'자연 속에서 찾는 편안한 휴식',image:'',url:'./partners.html',region:'강원'},
    {title:'부산·경상 제휴 업체',description:'여행의 즐거움을 더하는 지역 업체',image:'',url:'./partners.html',region:'경상'},
    {title:'제주 제휴 업체',description:'제주에서 만나는 특별한 하루',image:'',url:'./partners.html',region:'제주'}
  ];
  const interval = 5000;
  const root = document.getElementById('rkPartnerCarousel');
  if (!root) return;
  const track = root.querySelector('.rk-ad-track');
  const controls = root.querySelector('.rk-ad-controls');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, timer = null, paused = false, hovering = false, focused = false;
  const dots = [];
  ads.forEach((ad,i) => {
    const link = document.createElement('a');
    link.className = 'rk-ad-slide'; link.href = ad.url;
    link.setAttribute('aria-label',ad.title+' · 광고 예시 · 업체 목록 보기');
    if(ad.image){const image=document.createElement('img');image.src=ad.image;image.alt='';image.addEventListener('error',()=>image.remove());link.append(image);}
    [['span','rk-ad-label','광고 · '+ad.region+' · 등록 준비 중'],['strong','rk-ad-title',ad.title],['span','rk-ad-description',ad.description],['span','rk-ad-link','제휴 업체 둘러보기 →']].forEach(([tag,cls,text])=>{const el=document.createElement(tag);el.className=cls;el.textContent=text;link.append(el);});
    track.append(link);
    const dot=document.createElement('button');dot.type='button';dot.className='rk-ad-dot';dot.setAttribute('aria-label',(i+1)+'번째 광고 보기');dot.addEventListener('click',()=>{show(i);schedule();});dots.push(dot);controls.append(dot);
  });
  const pause=document.createElement('button');pause.type='button';pause.className='rk-ad-pause';pause.textContent='일시정지';pause.setAttribute('aria-pressed','false');controls.append(pause);
  function show(index){current=(index+ads.length)%ads.length;track.style.transform='translateX(-'+current*100+'%)';dots.forEach((dot,i)=>dot.setAttribute('aria-current',String(i===current)));Array.from(track.children).forEach((slide,i)=>{slide.setAttribute('aria-hidden',String(i!==current));slide.tabIndex=i===current?0:-1;});}
  function schedule(){clearTimeout(timer);timer=null;if(paused||hovering||focused||document.hidden||reduced.matches)return;timer=setTimeout(()=>{show(current+1);schedule();},interval);}
  pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'자동재생':'일시정지';pause.setAttribute('aria-pressed',String(paused));schedule();});
  root.addEventListener('mouseenter',()=>{hovering=true;schedule();});root.addEventListener('mouseleave',()=>{hovering=false;schedule();});root.addEventListener('focusin',()=>{focused=true;schedule();});root.addEventListener('focusout',event=>{focused=root.contains(event.relatedTarget);schedule();});document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',schedule);
  show(0);schedule();
})();
