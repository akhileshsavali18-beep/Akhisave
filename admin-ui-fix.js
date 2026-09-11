(() => {
  async function refreshDashboardMaintenance() {
    const dashboard = document.getElementById('dashboard');
    const status = dashboard?.querySelector('.ak-status');
    if (!status) return;
    try {
      const r = await fetch('/api/admin/settings', {credentials:'same-origin', cache:'no-store'});
      const d = await r.json();
      const s = d.settings || d;
      const on = !!s.maintenance;
      const first = status.firstElementChild;
      if (first) first.innerHTML = 'Website <b style="color:' + (on ? '#b06b00' : '#16864a') + '">● ' + (on ? 'Maintenance' : 'Online') + '</b><div style="margin-top:4px;color:#718096;font-size:9px">Manage in Settings</div>';
    } catch {}
  }

  function fixAdminTabs() {
    refreshDashboardMaintenance();
    const tools = document.getElementById('tools');
    if (tools) tools.style.removeProperty('display');
    const settings = document.getElementById('settings');
    if (!settings || settings.dataset.akSettingsFixed) return;
    settings.dataset.akSettingsFixed = '1';

    const style = document.createElement('style');
    style.textContent = `
      #settings .ak-settings-general,#settings .ak-settings-panel{background:#fff;border:1px solid #e4eaf2;border-radius:16px;padding:16px;margin-bottom:12px;box-shadow:0 10px 30px rgba(18,38,68,.06)}
      #settings .ak-settings-general h2,#settings .ak-settings-panel h2{margin:0;color:#0a1628;font-size:17px}
      #settings .ak-settings-general p,#settings .ak-settings-panel>p{margin:5px 0;color:#68778b;font-size:10px;line-height:1.55}
      #settings .ak-settings-general .ak-brand-row{display:flex;align-items:center;gap:12px;margin-top:12px;padding:11px;border:1px solid #e4eaf2;border-radius:12px;background:#f7faff}
      #settings .ak-settings-general img{width:42px;height:42px;object-fit:contain;border-radius:10px;background:#fff}
      #settings .ak-settings-panel .ak-switch-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid #edf1f6}
      #settings .ak-settings-panel .ak-switch-row:last-of-type{border-bottom:0}
      #settings .ak-settings-panel .ak-switch-copy b{display:block;color:#0a1628;font-size:12px}
      #settings .ak-settings-panel .ak-switch-copy span{display:block;color:#718096;font-size:10px;margin-top:3px}
      #settings .ak-settings-panel .field{margin-top:12px}
      #settings .ak-settings-panel .field label{display:block;margin-bottom:6px;color:#172033;font-weight:700;font-size:11px}
      #settings .ak-settings-panel .field input,#settings .ak-settings-panel .field textarea{width:100%;box-sizing:border-box;background:#fff;color:#0a1628;border:1px solid #d8e1ec;border-radius:11px;padding:11px 12px;font:inherit;outline:none}
      #settings .ak-settings-panel .field textarea{min-height:78px;resize:vertical}
      #settings .ak-settings-panel .field input:focus,#settings .ak-settings-panel .field textarea:focus{border-color:#1677ff;box-shadow:0 0 0 3px rgba(22,119,255,.08)}
      #settings .ak-settings-panel .ak-note{margin-top:10px;padding:9px 10px;border-radius:10px;background:#f7faff;color:#68778b;font-size:9px;line-height:1.5}
      #settings .ak-settings-panel .ak-actions{margin-top:14px}
      #settings .ak-settings-panel .ak-msg{margin-top:8px;color:#68778b;font-size:10px;min-height:14px}
      @media(max-width:560px){#settings .ak-settings-general,#settings .ak-settings-panel{padding:14px}.ak-settings-panel .ak-switch-copy span{max-width:230px}}
    `;
    document.head.appendChild(style);

    const sections = [...settings.querySelectorAll('.section')];
    if (sections[0]) sections[0].style.display = 'none';
    if (sections[1]) sections[1].style.display = 'none';
    settings.style.removeProperty('display');

    const general = document.createElement('section');
    general.className = 'ak-settings-general';
    general.innerHTML = '<h2>General</h2><p>Basic AkhiSave website identity and branding.</p><div class="ak-brand-row"><img src="/Logo.png" alt="AkhiSave"><div><b style="font-size:12px;color:#0a1628">AkhiSave</b><div style="font-size:9px;color:#68778b;margin-top:3px">All-in-one online tools</div></div></div>';
    settings.insertBefore(general, settings.firstChild);

    const website = document.createElement('section');
    website.className = 'ak-settings-panel';
    website.innerHTML = '<h2>Website Controls</h2><p>Control the public website state and show a message to visitors.</p><div class="ak-switch-row"><div class="ak-switch-copy"><b>Maintenance Mode</b><span>Temporarily pause normal public use.</span></div><input id="akSettingsMaintenance" class="switch" type="checkbox"></div><div class="field"><label>Announcement / Banner</label><input id="akSettingsAnnouncement" maxlength="180" placeholder="Optional announcement"></div><div class="ak-actions"><button id="akSettingsSave" class="btn primary" style="width:100%">Save Website Controls</button></div><div id="akSettingsMsg" class="ak-msg"></div>';
    settings.insertBefore(website, general.nextSibling);

    const legacy = [...settings.querySelectorAll('.section')];
    legacy.forEach(sec => {
      const text = String(sec.textContent || '').toLowerCase();
      const heading = String(sec.querySelector('h2,h3')?.textContent || '').trim().toLowerCase();
      if (heading === 'ads control' || text.includes('adsterra') || text.includes('monetag')) sec.style.display = 'none';
      if (heading === 'seo' || text.includes('seo title') || text.includes('meta description')) sec.style.display = 'none';
      if (heading === 'save settings' || text.includes('reset ads')) sec.style.display = 'none';
    });

    const ads = document.createElement('section');
    ads.className = 'ak-settings-panel';
    ads.innerHTML = '<h2>Ads Control</h2><p>Control advertising providers separately. A network must also have valid publisher code/zone data before an ad can appear.</p><div class="ak-switch-row"><div class="ak-switch-copy"><b>Master Ads</b><span>Allow ads to run on the public website.</span></div><input id="akAdsMaster" class="switch" type="checkbox"></div><div class="ak-switch-row"><div class="ak-switch-copy"><b>Adsterra</b><span>Enable Adsterra when its publisher code is connected.</span></div><input id="akAdsAdsterra" class="switch" type="checkbox"></div><div class="field"><label>Adsterra Ad Code</label><textarea id="akAdsAdsterraCode" placeholder="Paste the complete Adsterra ad code/script"></textarea></div><div class="ak-switch-row"><div class="ak-switch-copy"><b>Monetag</b><span>Enable Monetag when its publisher zone is connected.</span></div><input id="akAdsMonetag" class="switch" type="checkbox"></div><div class="field"><label>Monetag Zone ID</label><input id="akAdsMonetagZone" maxlength="80" inputmode="numeric" placeholder="Your Monetag zone ID"></div><div class="ak-note">Master Ads ON + provider ON is required. Adsterra also needs its actual publisher code. Monetag needs a valid zone ID or full tag code.</div><div class="ak-actions"><button id="akAdsSave" class="btn primary" style="width:100%">Save Ads Settings</button></div><div id="akAdsMsg" class="ak-msg"></div>';
    settings.insertBefore(ads, website.nextSibling);

    const seo = document.createElement('section');
    seo.className = 'ak-settings-panel';
    seo.innerHTML = '<h2>SEO</h2><p>Search-engine metadata and social sharing preview for the public website.</p><div class="field"><label>SEO Title</label><input id="akSeoTitle" maxlength="140" placeholder="AkhiSave - All-in-one online tools"></div><div class="field"><label>Meta Description</label><textarea id="akSeoDescription" maxlength="220" placeholder="Describe AkhiSave in search results"></textarea></div><div class="field"><label>Keywords</label><input id="akSeoKeywords" maxlength="300" placeholder="online tools, image tools, PDF tools"></div><div class="field"><label>Open Graph Title</label><input id="akSeoOgTitle" maxlength="140" placeholder="Title shown when sharing on social media"></div><div class="field"><label>Open Graph Description</label><textarea id="akSeoOgDescription" maxlength="220" placeholder="Description shown in social previews"></textarea></div><div class="field"><label>Social Preview Image</label><input id="akSeoOgImage" maxlength="500" placeholder="https://example.com/preview.jpg"></div><div class="ak-note">Recommended social preview image: a clear AkhiSave branded image suitable for link sharing.</div><div class="ak-actions"><button id="akSeoSave" class="btn primary" style="width:100%">Save SEO Settings</button></div><div id="akSeoMsg" class="ak-msg"></div>';
    settings.insertBefore(seo, ads.nextSibling);

    const $ = id => document.getElementById(id);
    async function getSettings() { const r = await fetch('/api/admin/settings', {credentials:'same-origin', cache:'no-store'}); const d = await r.json(); if (!r.ok || d.success === false) throw Error(d.error || 'Could not load settings'); return d.settings || d; }
    function fill(s) { $('akSettingsMaintenance').checked=!!s.maintenance; $('akSettingsAnnouncement').value=s.announcement||''; const a=s.ads||{}, adsterra=a.adsterra||{}, monetag=a.monetag||{}; $('akAdsMaster').checked=a.enabled===true; $('akAdsAdsterra').checked=adsterra.enabled===true; $('akAdsAdsterraCode').value=adsterra.code||''; $('akAdsMonetag').checked=monetag.enabled===true; $('akAdsMonetagZone').value=monetag.zone||'11717101'; const seo=s.seo||{}; $('akSeoTitle').value=seo.title||''; $('akSeoDescription').value=seo.description||''; $('akSeoKeywords').value=seo.keywords||''; $('akSeoOgTitle').value=seo.ogTitle||seo.title||''; $('akSeoOgDescription').value=seo.ogDescription||seo.description||''; $('akSeoOgImage').value=seo.ogImage||''; }
    async function save(patch,msgId){try{const s=await getSettings();Object.keys(patch).forEach(k=>s[k]=patch[k]);const w=await fetch('/api/admin/settings',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(s),cache:'no-store'});const x=await w.json();if(!w.ok||x.success===false)throw Error(x.error||'Could not save settings');const saved=x.settings||x;if(patch.ads&&(!saved.ads||saved.ads.enabled!==patch.ads.enabled))throw Error('Ads setting was not persisted. Deploy the latest Worker code first.');if(patch.ads&&saved.ads){if(Boolean(saved.ads.adsterra?.enabled)!==Boolean(patch.ads.adsterra?.enabled))throw Error('Adsterra setting was not persisted. Deploy the latest Worker code first.');if(Boolean(saved.ads.monetag?.enabled)!==Boolean(patch.ads.monetag?.enabled))throw Error('Monetag setting was not persisted. Deploy the latest Worker code first.');}if(patch.ads)fill(saved);$(msgId).textContent='Settings saved.';refreshDashboardMaintenance()}catch(e){$(msgId).textContent=e.message}}
    $('akSettingsSave').onclick=()=>save({maintenance:$('akSettingsMaintenance').checked,announcement:$('akSettingsAnnouncement').value},'akSettingsMsg');
    $('akAdsSave').onclick=()=>save({ads:{enabled:$('akAdsMaster').checked,adsterra:{enabled:$('akAdsAdsterra').checked,code:$('akAdsAdsterraCode').value,placement:'body-end',pages:'all'},monetag:{enabled:$('akAdsMonetag').checked,zone:$('akAdsMonetagZone').value,code:'',placement:'head',pages:'all'}}},'akAdsMsg');
    $('akSeoSave').onclick=()=>save({seo:{title:$('akSeoTitle').value,description:$('akSeoDescription').value,keywords:$('akSeoKeywords').value,ogTitle:$('akSeoOgTitle').value,ogDescription:$('akSeoOgDescription').value,ogImage:$('akSeoOgImage').value}},'akSeoMsg');
    getSettings().then(fill).catch(e=>{$('akSettingsMsg').textContent=e.message;$('akAdsMsg').textContent=e.message;$('akSeoMsg').textContent=e.message});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fixAdminTabs); else fixAdminTabs();

  function modernAdminShell(){
    if(document.documentElement.dataset.akModernAdmin==='1')return;
    document.documentElement.dataset.akModernAdmin='1';
    const style=document.createElement('style');
    style.id='ak-modern-admin-style';
    style.textContent=`
      :root{--ak-blue:#1677ff;--ak-cyan:#16c9e8;--ak-text:#0a1628;--ak-muted:#68778b;--ak-line:#e4eaf2;--ak-soft:#f7faff;--ak-shadow:0 14px 38px rgba(18,38,68,.07)}
      body{background:#f7faff!important;color:var(--ak-text)!important}.topbar{box-shadow:0 1px 0 var(--ak-line),0 8px 30px rgba(18,38,68,.04)!important}.card,.statcard,.section,.feature,.aks-card,.aks-stat{border-radius:18px!important;box-shadow:var(--ak-shadow)!important}.btn,.iconbtn,.logout,.mini{border-radius:11px!important;transition:.18s ease!important}.btn:hover,.iconbtn:hover,.logout:hover,.mini:hover{transform:translateY(-1px)}.btn.primary{background:linear-gradient(135deg,var(--ak-blue),var(--ak-cyan))!important;box-shadow:0 8px 20px rgba(22,119,255,.16)!important}.field input,.field textarea,.field select,.aks-input{border-radius:11px!important}.drawer{box-shadow:18px 0 45px rgba(18,38,68,.08)!important}.drawer a{border-radius:10px!important;margin:3px 8px!important}.bottom{height:72px!important;padding:7px 10px!important;background:rgba(255,255,255,.97)!important;box-shadow:0 -10px 30px rgba(18,38,68,.07)!important;backdrop-filter:blur(16px)!important}.bottomin{max-width:620px!important;height:100%!important;margin:auto!important;display:grid!important;grid-template-columns:repeat(5,1fr)!important;gap:5px!important}.bottom button,.bottom .bottom-btn{border:0!important;background:transparent!important;border-radius:13px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:4px!important;font-size:9px!important;font-weight:800!important;color:#7a8798!important}.bottom button.active,.bottom .bottom-btn.active{background:#edf5ff!important;color:var(--ak-blue)!important}.ak-bottom-icon{width:19px;height:19px;stroke:currentColor;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}.ak-blog-tab{position:relative}.ak-blog-tab:after{content:'NEW';position:absolute;top:4px;right:10px;font-size:6px;line-height:11px;padding:0 4px;border-radius:999px;background:#1677ff;color:#fff}.ak-modern-blog-tab{display:none!important}
      #akAdminBlogTab{min-height:50vh}.ak-admin-page-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 14px}.ak-admin-page-head h1{font-size:25px;letter-spacing:-1px;margin:0}.ak-admin-page-head p{margin:5px 0 0;color:var(--ak-muted);font-size:11px}
      @media(min-width:701px){.bottom{display:none!important}}@media(max-width:700px){main.wrap{padding-bottom:92px!important}.topbar{position:sticky!important;top:0!important}.drawer{max-width:88vw!important}.bottom{display:block!important}.ak-admin-page-head{margin-top:3px}.ak-admin-page-head h1{font-size:21px}}
    `;
    document.head.appendChild(style);

    const icon=(name)=>({home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',tools:'<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',blog:'<path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4z"/><path d="M9 4v12a4 4 0 0 0 4 4"/><path d="M8 8h7M8 11h7"/>',settings:'<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="4"/>',more:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',refresh:'<path d="M20 11a8 8 0 1 0 1 4"/><path d="M20 4v7h-7"/>',logout:'<path d="M10 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5"/><path d="m15 8 4 4-4 4M19 12H9"/>'}[name]||'');
    const svg=n=>`<svg class="ak-bottom-icon" viewBox="0 0 24 24" aria-hidden="true">${icon(n)}</svg>`;

    const bottom=document.querySelector('.bottom');
    if(bottom){
      const bin=bottom.querySelector('.bottomin')||bottom;
      const tabs=[['dashboard','Dashboard','home'],['tools','Tools','tools'],['blog','Blog','blog'],['settings','Settings','settings'],['more','More','more']];
      bin.innerHTML=tabs.map(([id,label,ic])=>`<button type="button" class="bottom-btn ${id==='blog'?'ak-blog-tab':''}" data-tab="${id}" aria-label="${label}">${svg(ic)}<span>${label}</span></button>`).join('');
      bin.querySelectorAll('.bottom-btn').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const tab=btn.dataset.tab;if(tab==='more'){document.getElementById('openDrawer')?.click();return}if(typeof window.go==='function')window.go(tab);else{document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.id===tab));document.querySelectorAll('.bottom-btn').forEach(x=>x.classList.toggle('active',x===btn))}}));
    }

    const drawer=document.getElementById('drawer');
    if(drawer){
      const open=document.getElementById('openDrawer'),close=document.getElementById('closeDrawer');
      if(open)open.innerHTML=svg('menu');
      if(close)close.innerHTML=svg('close');
      const refresh=document.getElementById('refresh');if(refresh)refresh.innerHTML=svg('refresh');
      const logout=document.getElementById('logout');if(logout)logout.innerHTML=svg('logout');
    }

    function createBlogTab(){
      const settings=document.getElementById('settings'),panel=settings?.querySelector('.ak-blog-panel');
      if(!settings||!panel||document.getElementById('akAdminBlogTab'))return !!document.getElementById('akAdminBlogTab');
      const tab=document.createElement('section');tab.id='akAdminBlogTab';tab.className='tab';tab.innerHTML='<div class="ak-admin-page-head"><div><h1>Blog</h1><p>Write, publish and manage AkhiSave articles.</p></div><button type="button" class="btn primary" id="akBlogTopNew">Create New Post</button></div>';
      settings.parentNode.insertBefore(tab,settings);tab.appendChild(panel);panel.classList.add('ak-modern-blog-panel');
      document.getElementById('akBlogTopNew')?.addEventListener('click',()=>document.getElementById('akBlogNew')?.click());
      return true;
    }
    let tries=0;const timer=setInterval(()=>{if(createBlogTab()||++tries>30)clearInterval(timer)},250);
    const observer=new MutationObserver(()=>createBlogTab());observer.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',modernAdminShell);else modernAdminShell();
})();
