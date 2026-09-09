(function(){
  function esc(v){return String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))}
  async function req(url,opt){const r=await fetch(url,opt);const d=await r.json().catch(()=>({}));if(!r.ok||d.success===false)throw Error(d.error||'Request failed');return d}
  async function init(){
    try{
      const dash=document.getElementById('dashboard');
      if(dash&&!document.getElementById('akDashWebsiteControls')){
        const card=document.createElement('section');card.id='akDashWebsiteControls';card.className='card section';
        card.innerHTML='<div class="section-head"><div><h2>Website Controls</h2><p>Quickly control maintenance mode and the public announcement.</p></div></div>'+
          '<div class="row"><div class="row-main"><b>Maintenance Mode</b><div class="muted small">Temporarily show the maintenance page to visitors.</div></div><input id="akDashMaintenance" class="switch" type="checkbox"></div>'+
          '<div class="field"><label>ANNOUNCEMENT</label><input id="akDashAnnouncement" type="text" maxlength="180" placeholder="Optional announcement"></div>'+
          '<div class="actions"><button id="akDashSave" class="btn primary">Save Website Controls</button><span id="akDashMsg" class="muted small"></span></div>';
        const first=dash.querySelector('.cards'); if(first&&first.parentElement) first.parentElement.insertBefore(card,first); else dash.insertBefore(card,dash.firstChild);
        async function load(){try{const d=await req('/api/admin/settings');const s=d.settings||d;document.getElementById('akDashMaintenance').checked=!!s.maintenance;document.getElementById('akDashAnnouncement').value=s.announcement||''}catch(e){document.getElementById('akDashMsg').textContent=e.message}}
        document.getElementById('akDashSave').onclick=async function(){const msg=document.getElementById('akDashMsg');try{const d=await req('/api/admin/settings');const s=d.settings||d;s.maintenance=document.getElementById('akDashMaintenance').checked;s.announcement=document.getElementById('akDashAnnouncement').value.trim();await req('/api/admin/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(s)});msg.textContent='Saved';setTimeout(()=>msg.textContent='',1800)}catch(e){msg.textContent=e.message}};
        load();
      }
      const suite=document.getElementById('ak-suite');
      if(suite&&!document.getElementById('akAdminSecurityPanel')){
        const card=document.createElement('div');card.id='akAdminSecurityPanel';card.className='aks-card';card.dataset.panel='settings';
        card.innerHTML='<div class="aks-head"><div><h2>Admin &amp; Security</h2><p>Admin access and security status. Secrets are never displayed.</p></div><button id="akAdminSecurityRefresh" class="aks-btn alt">↻ Check</button></div><div id="akAdminSecurityStatus" class="aks-list">Checking…</div><div class="aks-note">Admin password and API secrets stay server-side. Only security status is shown here.</div>';
        suite.appendChild(card);
        async function check(){const box=document.getElementById('akAdminSecurityStatus');try{const d=await req('/api/admin/security');const c=d.checks||{};box.innerHTML='<div class="aks-row"><b>Admin session</b><span class="aks-ok">'+(c.adminSession?'OK':'CHECK')+'</span></div><div class="aks-row"><b>HTTPS</b><span class="'+(c.https?'aks-ok':'aks-bad')+'">'+(c.https?'OK':'NOT SECURE')+'</span></div><div class="aks-row"><b>Secrets exposure</b><span class="'+(!c.secretExposure?'aks-ok':'aks-bad')+'">'+(!c.secretExposure?'PROTECTED':'CHECK')+'</span></div>'}catch(e){box.textContent=e.message}}
        document.getElementById('akAdminSecurityRefresh').onclick=check;check();
      }
    }catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  const mo=new MutationObserver(()=>init());mo.observe(document.documentElement,{childList:true,subtree:true});
})();
