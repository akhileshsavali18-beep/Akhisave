(function(){
  async function req(url,opt){const r=await fetch(url,opt);const d=await r.json().catch(()=>({}));if(!r.ok||d.success===false)throw Error(d.error||'Request failed');return d}
  function removeDashboardWebsiteControls(){
    const dash=document.getElementById('dashboard');if(!dash)return;
    dash.querySelectorAll('#akDashWebsiteControls,[data-ak-dashboard-website-controls]').forEach(e=>e.remove());
    dash.querySelectorAll('.card.section').forEach(e=>{
      const h=e.querySelector('h1,h2,h3');
      if(h&&/website\s+controls/i.test(h.textContent||''))e.remove();
    });
  }
  async function init(){
    try{
      removeDashboardWebsiteControls();
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
