/* 랜덤코리아 메인 공지 팝업 v20 */
(() => {
  'use strict';
  const source = document.currentScript?.src || location.href;
  const art = new URL('./notice-travel-art.png', source).href;
  const couponArt = new URL('./notice-coupon-art.png', source).href;
  const eventArt = new URL('./notice-event-art.png', source).href;
  const preview = new URLSearchParams(location.search).get('notice_preview') === '1';

  function start() {
    const host = document.querySelector('.poster-notices');
    if (!host || host.dataset.rkReady) return;
    host.dataset.rkReady = '1';

    const style = document.createElement('style');
    style.textContent = `
.poster-hero > .poster-notices.rk-notice-pair{position:fixed;inset:136px auto auto 50%;transform:translateX(-50%);width:min(1240px,calc(100vw - 56px));height:auto;max-height:calc(100dvh - 170px);min-height:0!important;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));align-items:stretch;gap:16px;margin:0;padding:0 0 12px;overflow:auto;z-index:10000;pointer-events:none;scrollbar-width:thin}
.rk-notice-pair,.rk-notice-pair *{box-sizing:border-box}
.rk-notice-pair .poster-notice{position:relative;flex:initial;width:auto;min-width:0;max-width:none;min-height:min(670px,calc(100dvh - 180px));display:flex;align-self:stretch;flex-direction:column;margin:0;background:#fcf7ee;color:#38291e;border:1px solid #967e68;border-radius:18px;box-shadow:0 12px 36px #38291e30;overflow:hidden;pointer-events:auto;text-align:left}
.rk-notice-pair .poster-notice[hidden],.poster-hero > .rk-notice-pair.no-notices{display:none!important}
.rk-notice-pair .rk-notice-copy{padding:22px 22px 0;position:relative;z-index:1;flex:1}
.rk-notice-pair .rk-notice-label{display:inline-block;border-radius:30px;padding:6px 12px;background:#efd8c8;color:#904525;font:600 12px/1.5 'Noto Sans KR',sans-serif;letter-spacing:0}
.rk-notice-pair h2{margin:15px 0 13px;color:#38291e;font:700 clamp(22px,2vw,29px)/1.42 'Noto Serif KR',serif;letter-spacing:-1.2px;word-break:keep-all}
.rk-notice-pair h2 em{font-style:normal;color:#a64e2f}
.rk-notice-pair .rk-notice-text{margin:0;color:#513e30;font:400 13px/1.8 'Noto Sans KR',sans-serif;letter-spacing:-.35px;word-break:keep-all}
.rk-notice-pair .rk-notice-art{height:216px;flex:0 0 216px;background-repeat:no-repeat;background-size:200% 100%;background-position:left center;margin-top:8px}
.rk-notice-pair .rk-news-art{background-color:#eee0cd;background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center}
.rk-notice-pair .rk-event-art{height:216px;flex:0 0 216px;margin-top:8px;background-size:cover;background-position:center}
.rk-notice-pair .rk-notice-actions{padding:0 21px 14px;margin-top:-13px;position:relative;z-index:1;display:grid;gap:6px;align-content:start}
.rk-notice-pair .rk-notice-cta{display:flex;align-items:center;justify-content:center;text-align:center;min-height:48px;padding:10px 12px;border:1px solid #54341e;border-radius:13px;background:#54341e;color:#fff9f0;text-decoration:none;font:700 13px/1.45 'Noto Sans KR',sans-serif;cursor:pointer;box-shadow:none}
.rk-notice-pair .poster-footer{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 13px;border-top:1px solid #e6d8c7;background:#fbf6ed;color:#513e30}
.rk-notice-pair .poster-footer label{display:flex;align-items:center;gap:6px;min-height:36px;font:400 10px/1.5 'Noto Sans KR',sans-serif;cursor:pointer;white-space:nowrap}
.rk-notice-pair .poster-footer input{appearance:auto;width:15px;height:15px;margin:0;accent-color:#754b30}
.rk-notice-pair .poster-footer button{min-width:52px;min-height:36px;padding:4px;background:none;border:0;color:#513e30;font:500 11px/1.5 'Noto Sans KR',sans-serif;cursor:pointer;white-space:nowrap}
.rk-notice-pair :focus-visible{outline:3px solid #b46236;outline-offset:3px}
@media(max-width:900px){.poster-hero>.poster-notices.rk-notice-pair{top:120px;width:min(760px,calc(100vw - 32px));grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.rk-notice-pair .poster-notice{min-height:min(610px,calc(100dvh - 160px))}.rk-notice-pair h2{font-size:25px}}
@media(max-width:620px){.poster-hero>.poster-notices.rk-notice-pair{position:fixed;inset:104px 12px 12px;width:auto;max-height:none;transform:none;display:grid;grid-template-columns:1fr;grid-auto-rows:min-content;gap:14px;padding:0 0 12px;overflow:auto}.rk-notice-pair .poster-notice{width:100%;max-width:440px;justify-self:center;min-height:min(560px,calc(100dvh - 128px))}.rk-notice-pair .rk-notice-copy{padding:20px 22px 0}.rk-notice-pair h2{font-size:27px;margin:13px 0 12px}.rk-notice-pair .rk-notice-text{font-size:13px}.rk-notice-pair .rk-notice-art,.rk-notice-pair .rk-event-art{height:170px;flex-basis:170px}.rk-notice-pair .rk-notice-actions{padding:0 20px 13px}.rk-notice-pair .poster-footer{padding:6px 13px}}
@media(prefers-reduced-motion:reduce){.rk-notice-pair *{scroll-behavior:auto}}
`;
    document.head.append(style);
    host.classList.add('rk-notice-pair');

    const content = [
      {label:'공지사항',title:'어디로 떠날지 고민될 때,<br><em>랜덤코리아</em>',text:'랜덤으로 만나는 새로운 여행지부터<br>그곳의 먹거리와 꼭 가봐야 할 명소까지.<br>다양한 할인 프로모션과 함께<br>더 즐거운 여행을 시작해 보세요.',art:'travel',actions:'<a class="rk-notice-cta" href="#travel" data-travel>랜덤 여행지 뽑기　›</a>'},
      {label:'회원 전용 혜택',title:'회원가입하고<br><em>할인 쿠폰북 혜택 한가득!</em>',text:'랜덤코리아 회원 전용 쿠폰북에서<br>제휴된 맛집, 카페, 숙박업체의<br>다양한 할인 혜택을 만나보세요.<br>지금 회원가입하고 더 특별한<br>여행을 준비하세요.',art:'coupon',actions:'<a class="rk-notice-cta" href="./couponbook.html">회원 전용 쿠폰북 보기　›</a>'},
      {label:'새로운 소식 · 응모권 이벤트',title:'1분 회원가입하고<br><em>무료여행 응모권 받자!</em>',text:'국내여행부터 해외여행까지,<br>회원 전용 이벤트에 응모해 보세요.<br>당첨되면 무료 여행의 기회가 찾아옵니다.',art:'event',actions:'<a class="rk-notice-cta" href="#memberAuth" data-event>국내·해외 무료여행 응모하기　›</a>'}
    ];
    const cards=[...host.querySelectorAll('.poster-notice')];
    cards.forEach((card,i)=>{
      const data=content[i];
      if(!data)return;
      const key='random-korea.poster.'+card.dataset.notice+'.hideUntil';
      const titleId='rk-popup-title-'+i;
      card.classList.remove('dark');
      card.setAttribute('aria-labelledby',titleId);
      const artMarkup=data.art==='coupon'
        ? `<div class="rk-notice-art rk-news-art" aria-hidden="true" style="background-image:url('${couponArt}')"></div>`
        : data.art==='event'
          ? `<div class="rk-event-art" aria-hidden="true" style="background-image:url('${eventArt}')"></div>`
          : '<div class="rk-notice-art" aria-hidden="true"></div>';
      card.innerHTML=`<div class="rk-notice-copy"><span class="rk-notice-label">${data.label}</span><h2 id="${titleId}">${data.title}</h2><p class="rk-notice-text">${data.text}</p></div>${artMarkup}<div class="rk-notice-actions">${data.actions}</div><div class="poster-footer"><label><input type="checkbox">24시간 동안 보지 않기</label><button type="button" data-close aria-label="${data.label} 닫기">닫기 ×</button></div>`;
      if(data.art==='travel') card.querySelector('.rk-notice-art').style.backgroundImage=`url("${art}")`;
      try{card.hidden=!preview&&Number(localStorage.getItem(key))>Date.now()}catch{card.hidden=false}
      card.querySelector('[data-close]').addEventListener('click',()=>{
        if(card.querySelector('input').checked&&!preview){try{localStorage.setItem(key,String(Date.now()+86400000))}catch{}}
        card.hidden=true;update();
        const next=cards.find(x=>!x.hidden)?.querySelector('a,button:not([disabled]),input');
        if(next)next.focus({preventScroll:true});
      });
      card.querySelector('[data-travel]')?.addEventListener('click',()=>{
        cards.forEach(x=>x.hidden=true);update();
        const target=document.getElementById('travel');
        if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true})}
      });
      card.querySelector('[data-event]')?.addEventListener('click',()=>{
        cards.forEach(x=>x.hidden=true);update();
        const login=document.getElementById('kakaoLoginBtn')||document.getElementById('memberAuth');
        if(login){login.scrollIntoView({behavior:'smooth',block:'center'});login.focus({preventScroll:true})}
      });
    });
    function update(){host.classList.toggle('no-notices',cards.every(card=>card.hidden))}
    update();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
