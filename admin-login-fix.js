(() => {
  function unlockAdminUI() {
    const style = document.getElementById('akhisave-click-unlock') || document.createElement('style');
    style.id = 'akhisave-click-unlock';
    style.textContent = `
      #loginView.hidden{pointer-events:none!important}
      #adminView:not(.hidden){pointer-events:auto!important}
      #drawerOverlay:not(.show){display:none!important;visibility:hidden!important;pointer-events:none!important}
      #drawerOverlay.show{display:block!important;visibility:visible!important;pointer-events:auto!important;z-index:9998!important}
      #drawer{z-index:9999!important}
      #drawer:not(.open){pointer-events:none!important;visibility:hidden!important}
      #drawer.open{pointer-events:auto!important;visibility:visible!important}
      .topbar{position:sticky!important;z-index:10000!important;pointer-events:auto!important}
      .topbar *, .top-left, .top-right, .iconbtn, .logout{pointer-events:auto!important}
      .bottom{z-index:10000!important;pointer-events:auto!important}
      .bottom *, .bottom button{pointer-events:auto!important}
      main.wrap{position:relative!important;z-index:1!important;pointer-events:auto!important}
      #ak-suite{position:relative!important;z-index:2!important;pointer-events:auto!important}
      #ak-suite button,#ak-suite input,#ak-suite textarea,#ak-suite select{pointer-events:auto!important}
    `;
    if (!style.parentNode) document.head.appendChild(style);

    const overlay = document.getElementById('drawerOverlay');
    if (overlay && !overlay.classList.contains('show')) {
      overlay.style.display = 'none';
      overlay.style.visibility = 'hidden';
      overlay.style.pointerEvents = 'none';
    }
    const drawer = document.getElementById('drawer');
    if (drawer && !drawer.classList.contains('open')) {
      drawer.style.pointerEvents = 'none';
      drawer.style.visibility = 'hidden';
    }
  }

  function bindAdminLogin() {
    unlockAdminUI();
    const form = document.getElementById('loginForm');
    const password = document.getElementById('password');
    const error = document.getElementById('loginError');
    if (!form || !password || !error) return;

    form.onsubmit = async (e) => {
      e.preventDefault();
      error.textContent = '';
      const button = form.querySelector('button[type="submit"]');
      if (button) { button.disabled = true; button.textContent = 'Logging in…'; }
      try {
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ password: password.value })
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.success) {
          password.value = '';
          document.getElementById('loginView')?.classList.add('hidden');
          document.getElementById('adminView')?.classList.remove('hidden');
          unlockAdminUI();
          if (typeof window.showAdmin === 'function') window.showAdmin();
          else location.reload();
          return;
        }
        error.textContent = data.error || `Login failed (${response.status}).`;
      } catch (err) {
        error.textContent = 'Could not connect to the admin server.';
      } finally {
        if (button) { button.disabled = false; button.textContent = 'Login'; }
      }
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindAdminLogin);
  else bindAdminLogin();

  // Re-apply the hit-testing fix if the admin page changes drawer state.
  document.addEventListener('click', () => setTimeout(unlockAdminUI, 0), true);
})();
