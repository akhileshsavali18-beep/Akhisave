(() => {
  function fixAdminTabs() {
    const tools = document.getElementById('tools');
    if (tools) tools.style.removeProperty('display');
    const settings = document.getElementById('settings');
    if (!settings || settings.dataset.akSettingsFixed) return;
    settings.dataset.akSettingsFixed = '1';
    settings.style.removeProperty('display');
    const sections = settings.querySelectorAll('.section');
    if (sections[0]) sections[0].style.display = 'none';
    if (sections[1]) sections[1].style.display = 'none';
    const wrap = document.createElement('section');
    wrap.className = 'card section';
    wrap.innerHTML = '<h2>Website Controls</h2><p>Control the public website state and show a message to visitors.</p><div class="row"><div><b>Maintenance Mode</b><div class="muted small">Temporarily pause normal public use.</div></div><input id="akSettingsMaintenance" class="switch" type="checkbox"></div><div class="field"><label>Announcement / Banner</label><input id="akSettingsAnnouncement" maxlength="180" placeholder="Optional announcement"></div><button id="akSettingsSave" class="btn primary" style="width:100%">Save Website Controls</button><div id="akSettingsMsg" class="muted small" style="margin-top:9px"></div>';
    settings.insertBefore(wrap, settings.firstChild);
    const $=id=>document.getElementById(id);
    async function load(){try{const r=await fetch('/api/admin/settings',{credentials:'same-origin',cache:'no-store'});const d=await r.json();const s=d.settings||d;if(!r.ok||d.success===false)throw Error(d.error||'Could not load settings');$('akSettingsMaintenance').checked=!!s.maintenance;$('akSettingsAnnouncement').value=s.announcement||''}catch(e){$('akSettingsMsg').textContent=e.message}}
    $('akSettingsSave').onclick=async()=>{try{const r=await fetch('/api/admin/settings',{credentials:'same-origin',cache:'no-store'});const d=await r.json();const s=d.settings||d;s.maintenance=$('akSettingsMaintenance').checked;s.announcement=$('akSettingsAnnouncement').value;const w=await fetch('/api/admin/settings',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(s)});const x=await w.json();if(!w.ok||x.success===false)throw Error(x.error||'Could not save settings');$('akSettingsMsg').textContent='Website settings saved.'}catch(e){$('akSettingsMsg').textContent=e.message}};
    load();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fixAdminTabs);
  else fixAdminTabs();
})();
