(() => {
  const $ = id => document.getElementById(id);
  const api = async (url, options) => { const r=await fetch(url,options); const d=await r.json().catch(()=>({})); if(!r.ok||d.success===false)throw new Error(d.error||'Request failed'); return d; };
  const esc = v => String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
  const DEFAULT_CATS=[
    {id:'cat-image',name:'Image Tools'},
    {id:'cat-pdf',name:'PDF Tools'},
    {id:'cat-generator',name:'Generator Tools'},
    {id:'cat-social',name:'Social Tools'},
    {id:'cat-utility',name:'Calculator & Utility'},
    {id:'cat-other',name:'Other Tools'}
  ];
  async function cats(){let d=await api('/api/admin/categories');let a=Array.isArray(d.categories)?d.categories:[];if(!a.length){await api('/api/admin/categories',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({categories:DEFAULT_CATS})});a=DEFAULT_CATS}return a;}
  function categoryFor(t){if(t.id==='image-resizer'||t.id==='image-crop'||t.id==='image-compress')return 'cat-image';if(t.id==='image-pdf'||t.engine==='image-pdf')return 'cat-pdf';if(t.platform==='instagram'||t.platform==='youtube'||t.platform==='tiktok'||t.platform==='facebook'||t.platform==='twitter')return 'cat-social';if(t.platform==='utility')return 'cat-utility';return 'cat-other';}
  async function normalizeRegistry(){try{const d=await api('/api/admin/tools');const tools=Array.isArray(d.tools)?d.tools:[];const ids=tools.map(t=>t.id);const expected=['instagram-photo','instagram-reels','instagram-video','instagram-story','instagram-dp','youtube-downloader','tiktok-downloader','facebook-downloader','image-crop','image-pdf','image-compress'];if(expected.length===tools.length&&expected.every(id=>ids.includes(id))&&!ids.includes('image-resizer')){const out=[{id:'image-resizer',platform:'utility',name:'Image Resizer',icon:'↔️',engine:'image-resizer',type:'image-resizer',enabled:true,description:'Resize images directly in the browser.',button:'Resize & Download',placeholder:'Choose an image',order:10,categoryId:'cat-image'},...tools.map(t=>({...t,enabled:false,order:(Number(t.order)||0)+10,categoryId:categoryFor(t)}))];await api('/api/admin/tools',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({tools:out})});}} catch(e){} }
  async function enhanceCategories(){const box=$('aksCats');if(!box||box.dataset.enhanced)return;box.dataset.enhanced='1';const observer=new MutationObserver(async()=>{const tags=box.querySelectorAll('.aks-tag');if(!tags.length)return;tags.forEach((tag,i)=>{if(tag.querySelector('[data-cat-edit]'))return;const b=document.createElement('button');b.className='aks-btn alt';b.textContent='Edit';b.dataset.catEdit=i;b.onclick=async()=>{const a=await cats().catch(()=>[]);if(!a[i])return;const name=prompt('Category name',a[i].name);if(name===null)return;const clean=name.trim().slice(0,60);if(!clean)return;if(a.some((c,j)=>j!==i&&c.name.toLowerCase()===clean.toLowerCase())){alert('Category already exists.');return}a[i].name=clean;await api('/api/admin/categories',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({categories:a})});location.reload()};tag.insertBefore(b,tag.lastElementChild)});});observer.observe(box,{childList:true,subtree:true});}
  async function enhanceTools(){const list=$('atmList');if(!list||list.dataset.categoryEnhanced)return;list.dataset.categoryEnhanced='1';const observer=new MutationObserver(async()=>{if(!list.querySelector('.atm-tool'))return;const [a,d]=await Promise.all([cats().catch(()=>[]),api('/api/admin/tools').catch(()=>({tools:[]}))]);const tools=Array.isArray(d.tools)?d.tools:[];list.querySelectorAll('button[data-act="edit"]').forEach(btn=>{const row=btn.closest('.atm-tool');if(!row||row.querySelector('[data-tool-category]'))return;const index=Number(btn.dataset.i),target=tools[index];const select=document.createElement('select');select.dataset.toolCategory='1';select.style.cssText='border:1px solid #d8e1ec;border-radius:8px;padding:6px 7px;background:#fff;color:#0a1628;font-size:9px;max-width:150px';select.innerHTML='<option value="">No category</option>'+a.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>').join('');select.value=target?.categoryId||categoryFor(target||{});select.onchange=async()=>{try{const fresh=await api('/api/admin/tools');const all=Array.isArray(fresh.tools)?fresh.tools:[];const realIndex=all.findIndex(x=>x.id===target?.id);if(realIndex<0)return;all[realIndex].categoryId=select.value||null;await api('/api/admin/tools',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({tools:all})});if(typeof window.toast==='function')window.toast('Category assigned.')}catch(e){alert(e.message)}};row.querySelector('.atm-actions')?.before(select)});});observer.observe(list,{childList:true,subtree:true});}
  function enhanceStats(){
    const custom=$('atmCustom');
    if(custom){custom.id='atmCategories';custom.previousElementSibling&&(custom.previousElementSibling.textContent='CATEGORIES');}
    const addCat=$('atmAddCategory');
    if(addCat){addCat.classList.remove('secondary');addCat.classList.add('primary');}
    const stats=$('atmCategories');
    if(stats) stats.textContent=document.querySelectorAll('#atmList .atm-tool').length?document.querySelectorAll('[data-tool-category]').length?new Set(Array.from(document.querySelectorAll('[data-tool-category]')).map(x=>x.value).filter(Boolean)).size:0:0;
  }
  function observeStats(){
    const list=$('atmList');
    if(!list)return;
    const update=()=>{enhanceStats(); if($('atmCategories')) cats().then(a=>{$('atmCategories').textContent=a.length}).catch(()=>{});};
    update();
    new MutationObserver(update).observe(list,{childList:true,subtree:true});
  }
  async function start(){await normalizeRegistry();await cats();enhanceCategories();enhanceTools();enhanceStats();observeStats();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();