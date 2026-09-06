(() => {
  function bindAdminLogin() {
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
})();
