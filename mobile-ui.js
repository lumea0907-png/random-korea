/* Random Korea mobile v4: notice accessibility + one-card-at-a-time presentation.
   This script runs after notices.js and only changes mobile behavior. */
(() => {
  'use strict';
  if (!window.matchMedia('(max-width: 768px)').matches) return;
  function setup() {
    const host = document.querySelector('.poster-notices.rk-notice-pair');
    if (!host || host.dataset.mobileV4 === '1') return;
    host.dataset.mobileV4 = '1';
    const cards = Array.from(host.querySelectorAll('.poster-notice'));
    const activeCards = cards.filter(card => !card.hidden);
    let shown = activeCards[0] || null;
    function update() {
      const available = cards.filter(card => !card.hidden);
      if (!available.length) {
        host.classList.add('no-notices');
        document.body.classList.remove('rk-notice-open');
        return;
      }
      if (!shown || shown.hidden) shown = available[0];
      cards.forEach(card => {
        card.style.setProperty('display', card === shown ? 'flex' : 'none', 'important');
      });
      host.classList.remove('no-notices');
      document.body.classList.add('rk-notice-open');
    }
    cards.forEach(card => {
      const close = card.querySelector('[data-close]');
      if (!close) return;
      const quick = document.createElement('button');
      quick.type = 'button';
      quick.className = 'rk-mobile-notice-dismiss';
      quick.setAttribute('aria-label', '공지 닫기');
      quick.textContent = '×';
      quick.addEventListener('click', () => close.click());
      card.prepend(quick);
      close.addEventListener('click', () => {
        card.style.removeProperty('display');
        requestAnimationFrame(update);
      });
      card.querySelector('[data-travel]')?.addEventListener('click', () => {
        cards.forEach(c => c.style.removeProperty('display'));
        requestAnimationFrame(update);
      });
    });
    update();
    // If a notice is dismissed, the next pending notice is shown; no hidden notice can trap taps.
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, {once:true});
  else setup();
})();
