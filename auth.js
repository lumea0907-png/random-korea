// LUMEA 랜덤코리아 — browser login client
(() => {
  'use strict';

  const API = 'https://damp-water-61a9random-korea-auth.audghks240.workers.dev';
  const SESSION = 'random-korea.auth.session.v1';
  const VERIFIER = 'random-korea.auth.verifier.v1';

  const login = document.getElementById('kakaoLoginBtn');
  const logout = document.getElementById('logoutBtn');
  const name = document.getElementById('memberNickname');
  const status = document.getElementById('authStatus');
  const language = document.getElementById('languageSelect');

  if (!login || !logout || !name || !status) return;

  const messages = {
    ko: {
      login: '카카오로 시작하기',
      logout: '로그아웃',
      member: '회원',
      signed: '로그인되었습니다.',
      cancelled: '로그인을 취소했습니다.',
      failed: '로그인에 실패했습니다. 다시 시도해 주세요.',
      expired: '로그인 시간이 만료됐습니다. 다시 시작해 주세요.',
      network: '로그인 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.',
      storage: '브라우저 저장 기능을 사용할 수 없습니다. 쿠키 및 사이트 데이터 설정을 확인해 주세요.',
      first: '처음 로그인하면 회원가입이 함께 진행됩니다.'
    },
    en: {
      login: 'Continue with Kakao',
      logout: 'Log out',
      member: 'Member',
      signed: 'You are logged in.',
      cancelled: 'Login cancelled.',
      failed: 'Login failed. Please try again.',
      expired: 'Login expired. Please start again.',
      network: 'Unable to connect. Please try again later.',
      storage: 'Browser storage is unavailable. Check your site data settings.',
      first: 'Your first login creates a member account.'
    },
    zh: {
      login: '使用 Kakao 登录',
      logout: '退出登录',
      member: '会员',
      signed: '已登录。',
      cancelled: '已取消登录。',
      failed: '登录失败，请重试。',
      expired: '登录已过期，请重新登录。',
      network: '无法连接，请稍后重试。',
      storage: '无法使用浏览器存储，请检查网站数据设置。',
      first: '首次登录将创建会员账户。'
    },
    ja: {
      login: 'Kakaoで始める',
      logout: 'ログアウト',
      member: '会員',
      signed: 'ログインしました。',
      cancelled: 'ログインをキャンセルしました。',
      failed: 'ログインに失敗しました。もう一度お試しください。',
      expired: 'ログインの有効期限が切れました。',
      network: '接続できません。しばらくしてからお試しください。',
      storage: 'ブラウザの保存機能を利用できません。サイトデータの設定をご確認ください。',
      first: '初回ログイン時に会員登録されます。'
    }
  };

  let member = null;
  let busy = true;
  let notice = 'first';

  const words = () => messages[language?.value] || messages.ko;

  function render() {
    const t = words();
    login.textContent = t.login;
    logout.textContent = t.logout;
    login.hidden = Boolean(member);
    logout.hidden = !member;
    name.hidden = !member;
    name.textContent = member ? (member.nickname || t.member) : '';
    login.disabled = busy;
    logout.disabled = busy;
    status.textContent = notice ? t[notice] : '';
  }

  async function request(path, options = {}) {
    const response = await fetch(API + path, {
      ...options,
      credentials: 'omit',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      signal: AbortSignal.timeout(15000)
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error('Request failed');
      error.status = response.status;
      throw error;
    }

    return data;
  }

  async function currentMember(token) {
    const data = await request('/api/me', {
      headers: { Authorization: 'Bearer ' + token }
    });

    if (!data.ok || !data.member) throw new Error('Invalid response');
    member = data.member;
  }

  login.addEventListener('click', async () => {
    if (busy) return;

    busy = true;
    notice = '';
    render();

    try {
      const bytes = crypto.getRandomValues(new Uint8Array(32));
      const verifier = btoa(String.fromCharCode(...bytes))
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replaceAll('=', '');

      const digest = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(verifier)
      );

      const challenge = [...new Uint8Array(digest)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');

      sessionStorage.setItem(VERIFIER, verifier);
      window.location.assign(API + '/auth/kakao/start?challenge=' + challenge);
    } catch {
      notice = 'storage';
      busy = false;
      render();
    }
  });

  logout.addEventListener('click', async () => {
    if (busy) return;

    busy = true;
    render();

    try {
      const token = sessionStorage.getItem(SESSION);

      if (token) {
        await request('/api/logout', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token }
        });
      }

      sessionStorage.removeItem(SESSION);
      member = null;
      notice = 'first';
    } catch {
      notice = 'network';
    } finally {
      busy = false;
      render();
    }
  });

  language?.addEventListener('change', render);

  async function initialize() {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const code = params.get('login_code');
    const error = params.get('auth_error');
    const hasCallback = params.has('login_code') || params.has('auth_error');

    if (hasCallback) {
      history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }

    render();

    try {
      if (hasCallback && error) {
        sessionStorage.removeItem(VERIFIER);
        notice = error === 'cancelled'
          ? 'cancelled'
          : error === 'kakao_failed'
            ? 'failed'
            : 'expired';
      } else if (hasCallback) {
        const verifier = sessionStorage.getItem(VERIFIER);

        if (!code || !verifier) {
          notice = 'expired';
          sessionStorage.removeItem(VERIFIER);
        } else {
          const data = await request('/api/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, verifier })
          });

          if (
            !data.ok
            || typeof data.token !== 'string'
            || !/^[A-Za-z0-9_-]{43}$/.test(data.token)
          ) {
            throw new Error('Invalid response');
          }

          sessionStorage.setItem(SESSION, data.token);
          sessionStorage.removeItem(VERIFIER);
          notice = 'signed';
        }
      }

      const token = sessionStorage.getItem(SESSION);

      if (token) {
        await currentMember(token);
        if (!hasCallback) notice = '';
      }
    } catch (error) {
      if (error.status === 401) {
        sessionStorage.removeItem(SESSION);
        sessionStorage.removeItem(VERIFIER);
        notice = 'expired';
      } else {
        notice = error.name === 'SecurityError'
          || error.name === 'QuotaExceededError'
          ? 'storage'
          : 'network';
      }
    } finally {
      busy = false;
      render();
    }
  }

  initialize();
})();