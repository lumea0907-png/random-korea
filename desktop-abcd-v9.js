// Reuse existing account controls, moving the real nodes between PC A and mobile menu.
// Avoid duplicate IDs and preserve auth.js/main.js event listeners.
(() => {
  'use strict';
  const pcSlot = document.getElementById('rkDesktopStatus');
  const panel = document.querySelector('.rk-account-menu .rk-account-panel');
  const count = document.getElementById('demoOnline');
  const lang = document.getElementById('languageSelect');
  const langLabel = document.querySelector('label[for="languageSelect"]');
  const loginLabel = document.getElementById('rkDesktopAccountText');
  const nickname = document.getElementById('memberNickname');
  if (!pcSlot || !panel || !count || !lang || !langLabel) return;
  const query = window.matchMedia('(min-width: 761px)');
  function moveAccountControls() {
    const parent = query.matches ? pcSlot : panel;
    // Keep accessibility label and select together. Moving preserves listeners.
    parent.prepend(count, langLabel, lang);
  }
  moveAccountControls();
  query.addEventListener?.('change', moveAccountControls);
  function updateTrigger() {
    if (!loginLabel || !nickname) return;
    loginLabel.textContent = !nickname.hidden && nickname.textContent.trim()
      ? nickname.textContent.trim().slice(0, 12) + '님'
      : '로그인 · 회원정보';
  }
  updateTrigger();
  if (nickname) new MutationObserver(updateTrigger).observe(nickname, {attributes:true, childList:true, subtree:true, characterData:true});
})();
