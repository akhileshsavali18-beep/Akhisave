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
    settings.style.removeProperty('display');

    const style = document.createElement('style');
    style.textContent = `
      #settings .ak-settings-general,#settings .ak-settings-panel{background:#fff;border:1px solid #e4eaf2;border-radius:16px;padding:16px;margin-bottom:12px;box-shadow:0 10px 30px rgba(18,38,68,.06)}
      #settings .ak-settings-general h2,#settings .ak-settings-panel h2{margin:0;color:#0a1628;font-size:17px}
      #settings .ak-settings-general p,#settings .ak-settings-panel>p{margin:5px 0;color:#68778b;font-size:10px;line-height:1.55}
      #settings .ak-settings-general .ak-brand-row{display:flex;align-items:center;gap:12px;margin-top:12px;padding:11px;border:1px solid #e4eaf2;border-radius:12px;background:#f7faff}
      #settings .ak-settings-general img{width:42px;height:42px;object-fit:contain;border-radius:10px;background:#fff}
      #settings .ak-settings-panel .ak-help{margin:5px 0 12px;color:#718096;font-size:10px;line-height:1.5}
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
    ads.innerHTML = '<h2>Ads Control</h2><p>Control advertising providers separately. A network must also have valid publisher code/zone data before an ad can appear.</p><div class="ak-switch-row"><div class="ak-switch-copy"><b>Master Ads</b><span>Allow ads to run on the public website.</span></div><input id="akAdsMaster" class="switch" type="checkbox"></div><div class="ak-switch-row"><div class="ak-switch-copy"><b>Adsterra</b><span>Enable Adsterra when its publisher code is connected.</span></div><input id="akAdsAdsterra" class="switch" type="checkbox"></div><div class="field"><label>Adsterra Ad Code</label><textarea id="akAdsAdsterraCode" placeholder="Paste the complete Adsterra ad code/script"></textarea></div><div class="ak-switch-row"><div class="ak-switch-copy"><b>Monetag</b><span>Enable Monetag when its publisher zone is connected.</span></div><input id="akAdsMonetag" class="switch" type="checkbox"></div><div class="field"><label>Monetag Zone ID</label><input id="akAdsMonetagZone" maxlength="80" inputmode="numeric" placeholder="Your Monetag zone ID"></div><div class="ak-note">Master Ads ON + provider ON is not enough for Adsterra: its actual ad code is required. Monetag needs a valid zone ID or its full tag code.</div><div class="ak-actions"><button id="akAdsSave" class="btn primary" style="width:100%">Save Ads Settings</button></div><div id="akAdsMsg" class="ak-msg"></div>';
    settings.insertBefore(ads, website.nextSibling);

    const seo = document.createElement('section');
    seo.className = 'ak-settings-panel';
    seo.innerHTML = '<h2>SEO</h2><p>Search-engine metadata and social sharing preview for the public website.</p><div class="field"><label>SEO Title</label><input id="akSeoTitle" maxlength="140" placeholder="AkhiSave - All-in-one online tools"></div><div class="field"><label>Meta Description</label><textarea id="akSeoDescription" maxlength="220" placeholder="Describe AkhiSave in search results"></textarea></div><div class="field"><label>Keywords</label><input id="akSeoKeywords" maxlength="300" placeholder="online tools, image tools, PDF tools"></div><div class="field"><label>Open Graph Title</label><input id="akSeoOgTitle" maxlength="140" placeholder="Title shown when sharing on social media"></div><div class="field"><label>Open Graph Description</label><textarea id="akSeoOgDescription" maxlength="220" placeholder="Description shown in social previews"></textarea></div><div class="field"><label>Social Preview Image</label><input id="akSeoOgImage" maxlength="500" placeholder="https://example.com/preview.jpg"></div><div class="ak-note">Recommended social preview image: a clear AkhiSave branded image suitable for link sharing.</div><div class="ak-actions"><button id="akSeoSave" class="btn primary" style="width:100%">Save SEO Settings</button></div><div id="akSeoMsg" class="ak-msg"></div>';
    settings.insertBefore(seo, ads.nextSibling);

    const $ = id => document.getElementById(id);
    async function getSettings() {
      const r = await fetch('/api/admin/settings', {credentials:'same-origin', cache:'no-store'});
      const d = await r.json();
      if (!r.ok || d.success === false) throw Error(d.error || 'Could not load settings');
      return d.settings || d;
    }
    function fill(s) {
      $('akSettingsMaintenance').checked = !!s.maintenance;
      $('akSettingsAnnouncement').value = s.announcement || '';
      const a = s.ads || {};
      const adsterra = a.adsterra || {};
      const monetag = a.monetag || {};
      $('akAdsMaster').checked = a.enabled !== false;
      $('akAdsAdsterra').checked = adsterra.enabled === true;
      $('akAdsAdsterraCode').value = adsterra.code || '';
      $('akAdsMonetag').checked = monetag.enabled === true;
      $('akAdsMonetagZone').value = monetag.zone || '';
      const seo = s.seo || {};
      $('akSeoTitle').value = seo.title || '';
      $('akSeoDescription').value = seo.description || '';
      $('akSeoKeywords').value = seo.keywords || '';
      $('akSeoOgTitle').value = seo.ogTitle || seo.title || '';
      $('akSeoOgDescription').value = seo.ogDescription || seo.description || '';
      $('akSeoOgImage').value = seo.ogImage || '';
    }
    async function save(patch, msgId) {
      try {
        const s = await getSettings();
        Object.keys(patch).forEach(k => s[k] = patch[k]);
        const w = await fetch('/api/admin/settings', {method:'PUT', credentials:'same-origin', headers:{'Content-Type':'application/json'}, body:JSON.stringify(s)});
        const x = await w.json();
        if (!w.ok || x.success === false) throw Error(x.error || 'Could not save settings');
        $(msgId).textContent = 'Settings saved.';
        refreshDashboardMaintenance();
      } catch (e) { $(msgId).textContent = e.message; }
    }
    $('akSettingsSave').onclick = () => save({maintenance:$('akSettingsMaintenance').checked, announcement:$('akSettingsAnnouncement').value}, 'akSettingsMsg');
    $('akAdsSave').onclick = () => save({ads:{enabled:$('akAdsMaster').checked,adsterra:{enabled:$('akAdsAdsterra').checked,code:$('akAdsAdsterraCode').value,placement:'body-end',pages:'all'},monetag:{enabled:$('akAdsMonetag').checked,zone:$('akAdsMonetagZone').value,code:'',placement:'head',pages:'all'}}}, 'akAdsMsg');
    $('akSeoSave').onclick = () => save({seo:{title:$('akSeoTitle').value,description:$('akSeoDescription').value,keywords:$('akSeoKeywords').value,ogTitle:$('akSeoOgTitle').value,ogDescription:$('akSeoOgDescription').value,ogImage:$('akSeoOgImage').value}}, 'akSeoMsg');
    getSettings().then(fill).catch(e => { $('akSettingsMsg').textContent = e.message; $('akAdsMsg').textContent = e.message; $('akSeoMsg').textContent = e.message; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fixAdminTabs);
  else fixAdminTabs();
})();
