/* AkhiSave Admin center + dashboard loaders */
(function(){
  if(window.__AKHISAVE_ADMIN_CENTER_V6__) return;
  window.__AKHISAVE_ADMIN_CENTER_V6__=true;
  function load(src){var s=document.createElement('script');s.src=src;s.async=false;(document.head||document.documentElement).appendChild(s)}
  load('/admin-dashboard-fix-v8.js?v=10');
  load('/admin-dashboard-hours-fix.js?v=3');
  load('/admin-dashboard-bot-human.js?v=2');
  function admin(){
    var d=document.getElementById('more');
    document.querySelectorAll('.navlink[data-tab="more"]').forEach(function(a){a.innerHTML='<span class="drawer-icon">⚙</span>Admin'});
    document.querySelectorAll('.bottom-btn[data-tab="more"]').forEach(function(b){b.innerHTML='<span>⚙</span>Admin'});
    if(!d)return;
    d.innerHTML='<div class="hero"><div><h1>Admin</h1><p>Site management, security and administrator information.</p></div></div>'+
    '<div class="card section"><h2>📄 Site Management</h2><p>Quick access to public website information pages.</p><div class="actions"><a class="btn secondary" href="/faq.html">Open FAQ</a><a class="btn secondary" href="/privacy.html">Privacy</a><a class="btn secondary" href="/terms.html">Terms</a><a class="btn secondary" href="/dmca.html">DMCA</a><a class="btn secondary" href="/contact.html">Contact</a></div></div>'+
    '<div class="card section"><h2>🔐 Security</h2><div class="row"><div><b>Admin session</b><div class="muted small">Protected admin login session.</div></div><span class="pill">SECURE</span></div><div class="row"><div><b>API keys & secrets</b><div class="muted small">Kept server-side and never displayed here.</div></div><span class="pill">PRIVATE</span></div><div class="row"><div><b>HTTPS</b><div class="muted small">Admin traffic should use secure HTTPS.</div></div><span class="pill">ON</span></div></div>'+
    '<div class="card section"><h2>🆘 Help & Support</h2><div class="row"><div><b>Dashboard</b><div class="muted small">View traffic, visitors, tools and analytics.</div></div></div><div class="row"><div><b>Tools</b><div class="muted small">Enable, disable and manage available tools.</div></div></div><div class="row"><div><b>Settings</b><div class="muted small">Manage website, API, storage and system settings.</div></div></div></div>'+
    '<div class="card section"><h2>ℹ️ Admin Info</h2><div class="row"><div><b>Panel</b><div class="muted small">Private admin area</div></div><span class="pill">ACTIVE</span></div><div class="row"><div><b>Public website</b><div class="muted small">akhisave.online</div></div><a class="btn secondary" href="/">Open</a></div></div>'+
    '<div class="card section"><h2>🌐 Website Information</h2><div class="grid3"><div class="statusbox"><span class="label">WEBSITE</span><div class="stat">Online</div></div><div class="statusbox"><span class="label">TOOLS</span><div id="akAdminToolCount" class="stat">—</div></div><div class="statusbox"><span class="label">ENABLED</span><div id="akAdminEnabledCount" class="stat">—</div></div></div></div>';
    fetch('/api/admin/tools',{credentials:'same-origin',cache:'no-store'}).then(function(r){return r.json()}).then(function(x){var a=x.tools||[],c=document.getElementById('akAdminToolCount'),e=document.getElementById('akAdminEnabledCount');if(c)c.textContent=a.length;if(e)e.textContent=a.filter(function(t){return t.enabled!==false}).length}).catch(function(){});
  }
  function start(){admin();setTimeout(admin,500);setTimeout(admin,1500);setTimeout(admin,3000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
