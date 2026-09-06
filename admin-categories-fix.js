(() => {
  const $ = id => document.getElementById(id);
  const api = async (url, options) => {
    const r = await fetch(url, options);
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d.success === false) throw new Error(d.error || 'Request failed');
    return d;
  };
  const esc = v => String(v ?? '').replace(/[&<>\"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
  async function categories() { const d = await api('/api/admin/categories'); return Array.isArray(d.categories) ? d.categories : []; }
  async function enhanceCategories() {
    const box = $('aksCats');
    if (!box || box.dataset.enhanced === '1') return;
    box.dataset.enhanced = '1';
    const observer = new MutationObserver(async () => {
      const tags = box.querySelectorAll('.aks-tag');
      if (!tags.length) return;
      const cats = await categories().catch(() => []);
      tags.forEach((tag, i) => {
        if (tag.querySelector('[data-cat-edit]')) return;
        const b = document.createElement('button');
        b.className = 'aks-btn alt'; b.textContent = 'Edit'; b.dataset.catEdit = i;
        b.onclick = async () => {
          const current = await categories().catch(() => []);
          if (!current[i]) return;
          const name = prompt('Category name', current[i].name);
          if (name === null) return;
          const clean = name.trim().slice(0,60);
          if (!clean) return;
          if (current.some((c,j) => j !== i && c.name.toLowerCase() === clean.toLowerCase())) { alert('Category already exists.'); return; }
          current[i].name = clean;
          await api('/api/admin/categories',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({categories:current})});
          location.reload();
        };
        tag.insertBefore(b, tag.lastElementChild);
      });
    });
    observer.observe(box,{childList:true,subtree:true});
  }
  async function enhanceTools() {
    const list = $('atmList'); if (!list || list.dataset.categoryEnhanced === '1') return;
    list.dataset.categoryEnhanced = '1';
    let cats = await categories().catch(() => []);
    const observer = new MutationObserver(async () => {
      if (!list.querySelector('.atm-tool')) return;
      cats = await categories().catch(() => cats);
      const buttons = list.querySelectorAll('button[data-act="edit"]');
      buttons.forEach(btn => {
        const row = btn.closest('.atm-tool'); if (!row || row.querySelector('[data-tool-category]')) return;
        const index = Number(btn.dataset.i);
        const select = document.createElement('select');
        select.dataset.toolCategory = '1';
        select.style.cssText='border:1px solid #d8e1ec;border-radius:8px;padding:6px 7px;background:#fff;color:#0a1628;font-size:9px;max-width:130px;';
        select.innerHTML='<option value="">No category</option>'+cats.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>').join('');
        select.value = window.__akToolData?.[index]?.categoryId || '';
        select.onchange = async () => {
          try {
            const d = await api('/api/admin/tools'); const tools = Array.isArray(d.tools) ? d.tools : [];
            const target = tools[index]; if (!target) return;
            target.categoryId = select.value || null;
            await api('/api/admin/tools',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({tools})});
            if (typeof window.toast === 'function') window.toast('Category assigned.');
          } catch(e) { alert(e.message); }
        };
        row.querySelector('.atm-actions')?.before(select);
      });
    });
    observer.observe(list,{childList:true,subtree:true});
  }
  function start(){ enhanceCategories(); enhanceTools(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();