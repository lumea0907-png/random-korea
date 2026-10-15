/* Random Korea PC A nature explorer — region buttons only.
   The map instance is created by existing main.js; random selection stays untouched. */
(function () {
  'use strict';
  const regions = {
    seoul: [37.5665, 126.978, 10],
    gyeonggi: [37.4138, 127.5183, 9],
    gangwon: [37.8228, 128.1555, 9],
    chungcheong: [36.6357, 127.491, 9],
    jeolla: [35.55, 127.05, 9],
    gyeongsang: [35.9, 128.35, 9],
    jeju: [33.38, 126.55, 10]
  };
  function activate(buttons, chosen) {
    buttons.forEach(function (button) {
      const active = button.dataset.region === chosen;
      button.classList.toggle('is-current', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  function setup() {
    const nav = document.querySelector('#travel .rk-a-region-nav');
    if (!nav) return;
    const buttons = Array.from(nav.querySelectorAll('button[data-region]'));
    nav.addEventListener('click', function (event) {
      const button = event.target.closest('button[data-region]');
      if (!button || !nav.contains(button)) return;
      const map = window.rkTravelMap;
      if (!map || !window.L) {
        const notice = document.getElementById('mapNotice');
        if (notice) notice.textContent = '지도가 준비되지 않았습니다. 잠시 후 다시 시도해 주세요.';
        return;
      }
      const region = button.dataset.region;
      if (region === 'all') {
        const reset = document.getElementById('resetMapBtn');
        if (reset) reset.click();
        else map.setView([36.3, 127.8], 7);
      } else if (regions[region]) {
        map.flyTo([regions[region][0], regions[region][1]], regions[region][2], {duration:.65});
      }
      activate(buttons, region);
    });
    const reset = document.getElementById('resetMapBtn');
    if (reset) reset.addEventListener('click', function () {activate(buttons, 'all');});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, {once:true});
  else setup();
}());
