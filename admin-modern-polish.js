(()=>{
  if(window.__AKHISAVE_ADMIN_POLISH_V1__)return;
  window.__AKHISAVE_ADMIN_POLISH_V1__=true;
  const I={
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    tools:'<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.5"/><path d="m5 17 4-4 3 3 2-2 5 3"/>',
    crop:'<path d="M8 3v13a5 5 0 0 0 5 5h8"/><path d="M3 8h13a5 5 0 0 0 5-5"/>',
    pdf:'<path d="M6 2h9l4 4v16H6z"/><path d="M15 2v5h5M9 13h6M9 17h5"/>',
    compress:'<path d="m8 3-5 5 5 5M16 3l5 5-5 5M3 19l5-5M21 19l-5-5"/>',
    camera:'<path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
    bot:'<rect x="5" y="7" width="14" height="12" rx="3"/><path d="M12 3v4M9 12h.01M15 12h.01M9 16h6"/><path d="M3 11v4M21 11v4"/>',
    user:'<circle cx="12" cy="8" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/>',
    shield:'<path d="M12 3 20 6v5c0 5-3.3 8.2-8 10-4.7-1.8-8-5-8-10V6z"/><path d="m9 12 2 2 4-4"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    external:'<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/>'
  };
  const svg=k=>'<svg class="ak-modern-svg" viewBox="0 0 24 24" aria-hidden="true">'+(I[k]||I.info)+'</svg>';
  function iconBox(el,k){el.innerHTML=svg(k);el.dataset.akPolished='1'}
  function toolKey(text){
    const t=(text||'').toLowerCase();
    if(t.includes('resizer')||t.includes('resize'))return'image';
    if(t.includes('crop'))return'crop';
    if(t.includes('compress'))return'compress';
    if(t.includes('pdf'))return'pdf';
    if(t.includes('download'))return'camera';
    return'tools';
  }
  function tools(){
    document.querySelectorAll('#tools .toolicon,#tools .atm-icon').forEach(el=>{
      const holder=el.closest('.toolrow,.atm-tool,.card,.section')||el.parentElement;
      iconBox(el,toolKey(holder?.textContent||''));
    });
    document.querySelectorAll('#tools .toolrow,.atm-tool').forEach(row=>{
      const text=row.textContent||'';
      const icon=row.querySelector('.toolicon,.atm-icon');
      if(icon)iconBox(icon,toolKey(text));
    });
  }
  function dashboard(){
    const d=document.getElementById('dashboard');if(!d)return;
    d.querySelectorAll('.v8row').forEach(row=>{
      const span=row.querySelector('span');if(!span)return;
      const raw=(span.textContent||'').replace(/^\s*[\p{Extended_Pictographic}\uFE0F]+\s*/u,'').trim();
      if(/human page views/i.test(raw))span.innerHTML=svg('user')+'<span>'+raw+'</span>';
      else if(/bot|crawler/i.test(raw))span.innerHTML=svg('bot')+'<span>'+raw+'</span>';
    });
    d.querySelectorAll('h1,h2,h3').forEach(h=>{
      if(h.dataset.akPolished)return;
      const raw=(h.textContent||'').replace(/^[^A-Za-z0-9]+/,'').trim();
      if(/bots?\s+vs\s+human/i.test(raw)){h.innerHTML=svg('user')+'<span>'+raw+'</span>';h.dataset.akPolished='1'}
    });
  }
  function more(){
    const d=document.getElementById('more');if(!d||d.dataset.akMoreV2)return;
    d.dataset.akMoreV2='1';
    d.innerHTML='<div class="ak-more-head"><div><div class="ak-eyebrow">AKHISAVE ADMIN</div><h1>More</h1><p>Site information, security and quick access.</p></div></div>'+
      '<div class="ak-more-grid">'+
      '<section class="ak-more-card"><div class="ak-more-title">'+svg('home')+'<div><b>Site Management</b><span>Public website information</span></div></div><div class="ak-more-actions"><a href="/faq.html">FAQ</a><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="/dmca.html">DMCA</a><a href="/contact.html">Contact</a></div></section>'+
      '<section class="ak-more-card"><div class="ak-more-title">'+svg('shield')+'<div><b>Security</b><span>Admin protection status</span></div></div><div class="ak-more-list"><div><span>Admin session</span><b>Secure</b></div><div><span>API keys & secrets</span><b>Private</b></div><div><span>HTTPS</span><b>On</b></div></div></section>'+
      '<section class="ak-more-card"><div class="ak-more-title">'+svg('info')+'<div><b>Admin Information</b><span>AkhiSave control center</span></div></div><div class="ak-more-list"><div><span>Panel</span><b>Active</b></div><div><span>Public website</span><a href="/">Open website '+svg('external')+'</a></div></div></section>'+
      '</div>';
  }
  function nav(){
    const b=document.querySelector('.bottom'),bin=b?.querySelector('.bottomin');if(!b||!bin)return;
    b.classList.add('ak-bottom-fixed');bin.classList.add('ak-bottom-grid');
    bin.querySelectorAll('.bottom-btn').forEach(btn=>{
      btn.style.minWidth='0';btn.style.width='100%';btn.style.maxWidth='none';btn.style.overflow='hidden';
      const sp=btn.querySelector('span:last-child');if(sp){sp.style.maxWidth='100%';sp.style.overflow='hidden';sp.style.textOverflow='ellipsis';sp.style.whiteSpace='nowrap'}
    });
  }
  function run(){tools();dashboard();more();nav()}
  function start(){run();setTimeout(run,250);setTimeout(run,900);setTimeout(run,1800);setInterval(run,2500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
  const st=document.createElement('style');st.textContent=`
    .ak-modern-svg{width:19px;height:19px;flex:0 0 19px;stroke:currentColor;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
    #dashboard .v8row>span{display:inline-flex;align-items:center;gap:7px}
    #dashboard h2,#dashboard h3{display:flex;align-items:center;gap:8px}
    #dashboard h2 .ak-modern-svg,#dashboard h3 .ak-modern-svg{width:21px;height:21px;flex:0 0 21px}
    #tools .toolicon,#tools .atm-icon{display:flex!important;align-items:center!important;justify-content:center!important;font-size:0!important}
    #tools .toolicon .ak-modern-svg,#tools .atm-icon .ak-modern-svg{width:21px;height:21px}
    .ak-bottom-fixed{left:0!important;right:0!important;bottom:0!important;width:100%!important;box-sizing:border-box!important;overflow:hidden!important}
    .ak-bottom-grid{width:100%!important;min-width:0!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;box-sizing:border-box!important}
    .ak-bottom-grid .bottom-btn{min-width:0!important;width:100%!important;max-width:none!important;padding-left:2px!important;padding-right:2px!important;box-sizing:border-box!important;overflow:hidden!important}
    .ak-bottom-grid .bottom-btn span:last-child{display:block!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
    .ak-more-head{margin:0 0 16px;padding:2px 0}.ak-eyebrow{font-size:8px;font-weight:900;letter-spacing:1.3px;color:#1677ff;margin-bottom:5px}.ak-more-head h1{margin:0!important;font-size:28px!important;letter-spacing:-1px}.ak-more-head p{margin:5px 0 0!important;color:#68778b!important;font-size:11px!important}
    .ak-more-grid{display:grid;gap:12px}.ak-more-card{background:#fff;border:1px solid #e4eaf2;border-radius:18px;padding:16px;box-shadow:0 12px 30px rgba(18,38,68,.06)}.ak-more-title{display:flex;align-items:center;gap:11px}.ak-more-title>.ak-modern-svg{width:23px;height:23px;flex:0 0 23px;color:#1677ff}.ak-more-title b{display:block;font-size:14px;color:#0a1628}.ak-more-title span{display:block;margin-top:3px;font-size:9px;color:#718096}.ak-more-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:14px}.ak-more-actions a{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;border:1px solid #d8e1ec;background:#f7faff;color:#43536a;border-radius:10px;padding:9px 11px;font-size:9px;font-weight:800}.ak-more-actions a:hover{border-color:#1677ff;color:#1677ff;background:#edf5ff}.ak-more-list{margin-top:12px}.ak-more-list>div{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;border-top:1px solid #edf1f6;font-size:10px;color:#53657d}.ak-more-list b{color:#16864a;text-transform:uppercase;font-size:8px;letter-spacing:.4px}.ak-more-list a{display:inline-flex;align-items:center;gap:5px;color:#1677ff;text-decoration:none;font-weight:800;font-size:9px}.ak-more-list a .ak-modern-svg{width:13px;height:13px}
    @media(max-width:700px){.ak-more-card{padding:15px}.ak-more-head h1{font-size:26px!important}}
  `;document.head.appendChild(st);
})();