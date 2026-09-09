/* AkhiSave Admin Dashboard bridge + Bots/Human + Admin center */
(function(){
  if(window.__AKHISAVE_ADMIN_CENTER_V4__)return;
  window.__AKHISAVE_ADMIN_CENTER_V4__=true;
  function loadScript(src){var s=document.createElement('script');s.src=src;s.async=false;(document.head||document.documentElement).appendChild(s)}
  loadScript('/admin-dashboard-fix-v8.js?v=9');
  loadScript('/admin-dashboard-hours-fix.js?v=2');
  loadScript('/admin-dashboard-bot-human.js?v=1');
  function adminCenter(){
    var d=document.getElementById('more');
    if(!d)return;
    document.querySelectorAll('.navlink[data-tab="more"]').forEach(function(a){var i=a.querySelector('.drawer-icon');a.innerHTML='<span class="drawer-icon">⚙</span>Admin';if(i)a.querySelector('.drawer-icon').textContent='⚙'});
    document.querySelectorAll('.bottom-btn[data-tab="more"]').forEach(function(b){b.innerHTML='<span>⚙</span>Admin'});
    d.innerHTML='<div class="hero"><div><h1>Admin</h1><p>Site management, security and administrator information.</p></div></div>'+
      '<div class="card section"><h2>📄 Site Management</h2><p>Quick access to public website information pages.</p><div class="actions"><a class="btn secondary" href="/faq.html">Open FAQ</a><a class="btn secondary" href="/privacy.html">Privacy</a><a class="btn secondary" href="/terms.html">Terms</a><a class="btn secondary" href="/dmca.html">DMCA</a><a class="btn secondary" href="/contact.html">Contact</a></div></div>'+
      '<div class="card section"><h2>🔐 Security</h2><p>Important security information for the AkhiSave admin panel.</p><div class="row"><div><b>Admin session</b><div class="muted small">Protected admin login session.</div></div><span class="pill">SECURE</span></div><div class="row"><div><b>API keys & secrets</b><div class="muted small">Kept server-side and never displayed here.</div></div><span class="pill">PRIVATE</span></div><div class="row"><div><b>HTTPS</b><div class="muted small">Admin traffic should use secure HTTPS.</div></div><span class="pill">ON</span></div></div>'+
      '<div class="card section"><h2>🆘 Help & Support</h2><p>Quick guide for using the admin panel.</p><div class="row"><div><b>Dashboard</b><div class="muted small">View traffic, visitors, tools and analytics.</div></div></div><div class="row"><div><b>Tools</b><div class="muted small">Enable, disable and manage available tools.</div></div></div><div class="row"><div><b>Settings</b><div class="muted small">Manage website, API, storage and system settings.</div></div></div></div>'+
      '<div class="card section"><h2>ℹ️ Admin Info</h2><p>AkhiSave administrator control center.</p><div class="row"><div><b>Panel</b><div class="muted small">Private admin area</div></div><span class="pill">ACTIVE</span></div><div class="row"><div><b>Public website</b><div class="muted small">akhisave.online</div></div><a class="btn secondary" href="/">Open</a></div></div>'+
      '<div class="card section"><h2>🌐 Website Information</h2><p>Basic live website information without exposing private configuration.</p><div id="akAdminWebsiteInfo" class="grid3"><div class="statusbox"><span class="label">WEBSITE</span><div class="stat">Online</div></div><div class="statusbox"><span class="label">TOOLS</span><div id="akAdminToolCount" class="stat">—</div></div><div class="statusbox"><span class="label">ENABLED</span><div id="akAdminEnabledCount" class="stat">—</div></div></div></div>';
    fetch('/api/admin/tools',{credentials:'same-origin',cache:'no-store'}).then(function(r){return r.json()}).then(function(x){var a=x.tools||[];var c=document.getElementById('akAdminToolCount'),e=document.getElementById('akAdminEnabledCount');if(c)c.textContent=a.length;if(e)e.textContent=a.filter(function(t){return t.enabled!==false}).length}).catch(function(){});
  }
  function start(){adminCenter();setTimeout(adminCenter,300);setTimeout(adminCenter,1000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();