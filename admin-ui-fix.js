(() => {
  function fixAdminTabs() {
    const tools = document.getElementById('tools');
    if (tools) tools.style.removeProperty('display');
    const settings = document.getElementById('settings');
    if (!settings || settings.dataset.akSettingsFixed) return;
    settings.dataset.akSettingsFixed = '1';
    settings.style.removeProperty('display');

    const style = document.createElement('style');
    style.textContent = `
      #settings .ak-settings-general{background:#fff;border:1px solid #e4eaf2;border-radius:16px;padding:16px;margin-bottom:12px;box-shadow:0 10px 30px rgba(18,38,68,.06)}
      #settings .ak-settings-general h2{margin:0;color:#0a1628;font-size:17px}
      #settings .ak-settings-general p{margin:5px 0;color:#68778b;font-size:10px;line-height:1.55}
      #settings .ak-settings-general .ak-brand-row{display:flex;align-items:center;gap:12px;margin-top:12px;padding:11px;border:1px solid #e4eaf2;border-radius:12px;background:#f7faff}
      #settings .ak-settings-general img{width:42px;height:42px;object-fit:contain;border-radius:10px;background:#fff}
      @media(max-width:560px){#settings .ak-settings-general{padding:14px}}
    `;
    document.head.appendChild(style);

    const sections = [...settings.querySelectorAll('.section')];
    if (sections[0]) sections[0].style.display = 'none';
    if (sections[1]) sections[1].style.display = 'none';

    const general = document.createElement('section');
    general.className = 'ak-settings-general';
    general.innerHTML = '<h2>General</h2><p>Basic AkhiSave website identity and branding.</p><div class="ak-brand-row"><img src="/Logo.png" alt="AkhiSave"><div><b style="font-size:12px;color:#0a1628">AkhiSave</b><div style="font-size:9px;color:#68778b;margin-top:3px">All-in-one online tools</div></div></div>';
    settings.insertBefore(general, settings.firstChild);

    const wrap = document.createElement('section');
    wrap.className = 'card section';
    wrap.innerHTML = '<h2>Website Controls</h2><p>Control the public website state and show a message to visitors.</p><div class="row"><div><b>Maintenance Mode</b><div class="muted small">Temporarily pause normal public use.</div></div><input id="akSettingsMaintenance" class="switch" type="checkbox"></div><div class="field"><label>Announcement / Banner</label><input id="akSettingsAnnouncement" maxlength="180" placeholder="Optional announcement"></div><button id="akSettingsSave" class="btn primary" style="width:100%">Save Website Controls</button><div id="akSettingsMsg" class="muted small" style="margin-top:9px"></div>';
    settings.insertBefore(wrap, general.nextSibling);

    let seoFound = false;
    [...settings.querySelectorAll('.section')].forEach(sec => {
      const heading = sec.querySelector('h2,h3');
      const text = String(sec.textContent || '').toLowerCase();
      if ((heading && /^\s*seo\s*$/i.test(heading.textContent || '')) || text.includes('seo title')) {
        if (!seoFound) seoFound = true;
        else sec.style.display = 'none';
      }
    });

    const $ = id => document.getElementById(id);
    async function load() {
      try {
        const r = await fetch('/api/admin/settings', {credentials:'same-origin', cache:'no-store'});
        const d = await r.json();
        const s = d.settings || d;
        if (!r.ok || d.success === false) throw Error(d.error || 'Could not load settings');
        $('akSettingsMaintenance').checked = !!s.maintenance;
        $('akSettingsAnnouncement').value = s.announcement || '';
      } catch (e) {
        $('akSettingsMsg').textContent = e.message;
      }
    }
    $('akSettingsSave').onclick = async () => {
      try {
        const r = await fetch('/api/admin/settings', {credentials:'same-origin', cache:'no-store'});
        const d = await r.json();
        const s = d.settings || d;
        s.maintenance = $('akSettingsMaintenance').checked;
        s.announcement = $('akSettingsAnnouncement').value;
        const w = await fetch('/api/admin/settings', {method:'PUT', credentials:'same-origin', headers:{'Content-Type':'application/json'}, body:JSON.stringify(s)});
        const x = await w.json();
        if (!w.ok || x.success === false) throw Error(x.error || 'Could not save settings');
        $('akSettingsMsg').textContent = 'Website settings saved.';
      } catch (e) {
        $('akSettingsMsg').textContent = e.message;
      }
    };
    load();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fixAdminTabs);
  else fixAdminTabs();
})();
