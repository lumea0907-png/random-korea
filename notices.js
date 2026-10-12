/* 랜덤코리아 공지 팝업. 기존 notices.js 전체를 이 파일로 교체하세요. */
(() => {
  'use strict';
  // 실제 페이지가 준비되면 주소를 넣으세요. 회원 권한은 해당 페이지/서버에서 확인해야 합니다.
  const LINKS = { coupon: '', event: '' };
  const source = document.currentScript?.src || location.href;
  const art = new URL('./notice-travel-art.png', source).href;
  const preview = new URLSearchParams(location.search).get('notice_preview') === '1';
  function start() {
    const host = document.querySelector('.poster-notices');
    if (!host || host.dataset.rkReady) return;
    host.dataset.rkReady = '1';
    const style = document.createElement('style');
    style.textContent = `
.poster-hero > .poster-notices.rk-notice-pair{position:fixed;inset:84px auto auto 50%;transform:translateX(-50%);width:min(860px,calc(100vw - 32px));height:auto;max-height:calc(100dvh - 100px);min-height:0!important;display:flex;align-items:flex-start;gap:18px;margin:0;padding:0 0 12px;overflow:auto;z-index:10000;pointer-events:none;scrollbar-width:thin}
.rk-notice-pair,.rk-notice-pair *{box-sizing:border-box}
.rk-notice-pair .poster-notice{position:relative;flex:1 1 0;width:0;min-width:0;max-width:none;display:flex;align-self:stretch;flex-direction:column;margin:0;background:#fcf7ee;color:#38291e;border:1px solid #967e68;border-radius:20px;box-shadow:0 12px 36px #38291e30;overflow:hidden;pointer-events:auto;text-align:left}
.rk-notice-pair .poster-notice[hidden],.poster-hero > .rk-notice-pair.no-notices{display:none!important}
.rk-notice-pair .rk-notice-copy{padding:28px 30px 0;position:relative;z-index:1}
.rk-notice-pair .rk-notice-label{display:inline-block;border-radius:30px;padding:6px 13px;background:#efd8c8;color:#904525;font:600 13px/1.5 'Noto Sans KR',sans-serif;letter-spacing:0}
.rk-notice-pair h2{margin:18px 0 18px;color:#38291e;font:700 clamp(25px,2.6vw,34px)/1.45 'Noto Serif KR',serif;letter-spacing:-1.4px;word-break:keep-all}
.rk-notice-pair h2 em{font-style:normal;color:#a64e2f}
.rk-notice-pair .rk-notice-text{margin:0;color:#513e30;font:400 15px/1.85 'Noto Sans KR',sans-serif;letter-spacing:-.4px;word-break:keep-all}
.rk-notice-pair .rk-notice-art{height:190px;flex-shrink:0;background-repeat:no-repeat;background-size:200% 100%;background-position:left center;margin-top:8px}
.rk-notice-pair .rk-news-art{background-position:right center}
.rk-notice-pair .rk-notice-actions{padding:0 28px 18px;margin-top:-25px;position:relative;z-index:1;display:grid;gap:8px;flex:1;align-content:start;min-height:112px}
.rk-notice-pair .rk-notice-cta{display:flex;align-items:center;justify-content:center;text-align:center;min-height:52px;padding:12px;border:1px solid #54341e;border-radius:15px;background:#54341e;color:#fff9f0;text-decoration:none;font:700 16px/1.5 'Noto Sans KR',sans-serif;cursor:pointer;box-shadow:none}
.rk-notice-pair .rk-notice-secondary{background:none;border:0;border-radius:4px;padding:4px;min-height:32px;text-align:center;color:#984524;text-decoration:underline;text-underline-offset:4px;font:600 13px/1.5 'Noto Sans KR',sans-serif;cursor:pointer}
.rk-notice-pair [disabled]{cursor:default;opacity:.75}
.rk-notice-pair .rk-pending{font-size:11px;font-weight:400;margin-left:7px}
.rk-notice-pair .poster-footer{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 18px;border-top:1px solid #e6d8c7;background:#fbf6ed;color:#513e30}
.rk-notice-pair .poster-footer label{display:flex;align-items:center;gap:7px;min-height:38px;font:400 12px/1.5 'Noto Sans KR',sans-serif;cursor:pointer}
.rk-notice-pair .poster-footer input{appearance:auto;width:17px;height:17px;margin:0;accent-color:#754b30}
.rk-notice-pair .poster-footer button{min-width:58px;min-height:38px;padding:5px;background:none;border:0;color:#513e30;font:500 13px/1.5 'Noto Sans KR',sans-serif;cursor:pointer;box-shadow:none}
.rk-notice-pair :focus-visible{outline:3px solid #b46236;outline-offset:3px}
@media(max-width:620px){.poster-hero > .poster-notices.rk-notice-pair{position:relative;inset:auto;transform:none;width:100%;max-height:none;display:grid;grid-template-columns:1fr;overflow:visible;gap:16px;padding:0;margin:0 0 20px}.rk-notice-pair .poster-notice{width:100%;max-width:440px;justify-self:center}.rk-notice-pair .rk-notice-copy{padding:24px 24px 0}.rk-notice-pair h2{font-size:29px}.rk-notice-pair .rk-notice-text{font-size:14px}.rk-notice-pair .rk-notice-art{height:180px}.rk-notice-pair .rk-notice-actions{min-height:95px;padding:0 22px 15px}.rk-notice-pair .poster-footer{padding:8px 16px}}
@media(prefers-reduced-motion:reduce){.rk-notice-pair *{scroll-behavior:auto}}
`;
    document.head.append(style);
    host.classList.add('rk-notice-pair');
    const content = [
      {label:'공지사항', title:'어디로 떠날지 고민될 때,<br><em>랜덤코리아</em>', text:'랜덤으로 만나는 새로운 여행지부터<br>그곳의 먹거리와 꼭 가봐야 할 명소까지.<br>다양한 할인 프로모션과 함께<br>더 즐거운 여행을 시작해 보세요.', actions:'<a class="rk-notice-cta" href="#travel" data-travel>랜덤 여행지 뽑기　›</a>'},
      {label:'새로운 소식', title:'회원이라면 누리는<br><em>특별한 여행 혜택</em>', text:'랜덤코리아 회원 전용 쿠폰북에서<br>다양한 할인 혜택을 만나보세요.<br>국내·해외 무료 여행의 기회!<br>회원 전용 여행 경품 이벤트에도 응모해 보세요.', actions:'<button type="button" class="rk-notice-cta" data-link="coupon" disabled>회원 전용 쿠폰북 보기<span class="rk-pending">연결 준비 중</span></button><button type="button" class="rk-notice-secondary" data-link="event" disabled>여행 이벤트 자세히 보기 · 연결 준비 중</button>'}
    ];
    const cards = [...host.querySelectorAll('.poster-notice')];
    cards.slice(0,2).forEach((card,i) => {
      const data = content[i];
      const key = 'random-korea.poster.' + card.dataset.notice + '.hideUntil';
      const titleId = 'rk-popup-title-' + i;
      card.classList.remove('dark');
      card.setAttribute('aria-labelledby', titleId);
      card.innerHTML = `<div class="rk-notice-copy"><span class="rk-notice-label">${data.label}</span><h2 id="${titleId}">${data.title}</h2><p class="rk-notice-text">${data.text}</p></div><div class="rk-notice-art ${i?'rk-news-art':''}" aria-hidden="true"></div><div class="rk-notice-actions">${data.actions}</div><div class="poster-footer"><label><input type="checkbox">24시간 동안 보지 않기</label><button type="button" data-close aria-label="${data.label} 닫기">닫기 ×</button></div>`;
      card.querySelector('.rk-notice-art').style.backgroundImage = `url("${art}")`;
      try { card.hidden = !preview && Number(localStorage.getItem(key)) > Date.now(); } catch { card.hidden = false; }
      card.querySelector('[data-close]').addEventListener('click', () => {
        if (card.querySelector('input').checked && !preview) {
          try { localStorage.setItem(key,String(Date.now()+86400000)); } catch { /* 저장 제한 시 이번 화면에서만 닫기 */ }
        }
        card.hidden = true;
        update();
        const next = cards.find(x=>!x.hidden)?.querySelector('a,button:not([disabled]),input');
        if(next) next.focus({preventScroll:true});
      });
      card.querySelector('[data-travel]')?.addEventListener('click', () => {
        cards.forEach(x=>x.hidden=true); update();
        const target=document.getElementById('travel');
        if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}
      });
      card.querySelectorAll('[data-link]').forEach(button => {
        const raw=LINKS[button.dataset.link];
        if(!raw) return;
        let target; try{target=new URL(raw,location.href);}catch{return;}
        if(!['https:','http:'].includes(target.protocol)) return;
        const link=document.createElement('a');
        link.className=button.className; link.href=target.href;
        link.textContent=button.dataset.link==='coupon'?'회원 전용 쿠폰북 보기　›':'여행 이벤트 자세히 보기 →';
        button.replaceWith(link);
      });
    });
    function update(){host.classList.toggle('no-notices',cards.every(card=>card.hidden));}
    update();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
