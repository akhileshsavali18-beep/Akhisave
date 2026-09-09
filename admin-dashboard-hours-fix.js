/* Final dashboard presentation fixes. Runs after V8 and re-applies after V8 redraws. */
(function(){
  if(window.__AKHISAVE_HOURS_FIX__) return;
  window.__AKHISAVE_HOURS_FIX__=true;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function hourLabel(h){h=((Number(h)||0)%24+24)%24;const a=h===0?'12 AM':h<12?h+' AM':h===12?'12 PM':(h-12)+' PM';const e=(h+1)%24,b=e===0?'12 AM':e<12?e+' AM':e===12?'12 PM':(e-12)+' PM';return a+' – '+b}
  function readableHours(){
    const box=document.getElementById('v8hours'); if(!box)return;
    box.querySelectorAll('.v8row').forEach(row=>{const span=row.querySelector('span');if(!span)return;const raw=(span.textContent||'').trim();if(/^\d{1,2}$/.test(raw))span.textContent=hourLabel(Number(raw));});
  }
  async function recentVisitors(){
    const dashboard=document.getElementById('dashboard');if(!dashboard)return;
    if(!document.getElementById('akRecentVisitorsFix')){
      const card=document.createElement('div');card.id='akRecentVisitorsFix';card.className='v8c';card.innerHTML='<div class="v8title">👥 Recent Visitors</div><div class="v8sub">Privacy-safe visitor details from recent human page views.</div><div id="akRecentVisitorsList" class="v8list"><div class="v8note">Loading recent visitors…</div></div>'; 
      const visitorCard=Array.from(dashboard.querySelectorAll('.v8c')).find(x=>/Visitor Analytics/i.test(x.textContent||''));
      if(visitorCard) visitorCard.insertAdjacentElement('afterend',card); else dashboard.appendChild(card);
    }
    const list=document.getElementById('akRecentVisitorsList');if(!list)return;
    try{
      const r=await fetch('/api/admin/analytics?days=1',{credentials:'same-origin',cache:'no-store'});const a=await r.json();
      const vs=Array.isArray(a.recentVisitors)?a.recentVisitors:[];
      if(!vs.length){list.innerHTML='<div class="v8note">No recent visitor details recorded yet.</div>';return;}
      list.innerHTML=vs.slice(0,30).map(v=>'<div class="v8row" style="display:block"><div style="display:flex;justify-content:space-between;gap:8px"><strong>Visitor '+esc(v.id||'—')+'</strong><span>'+esc(v.type||'Visitor')+'</span></div><div class="v8sub" style="margin-top:5px">🌍 '+esc(v.country||'Unknown')+' · 📱 '+esc(v.device||'Unknown')+' · 🌐 '+esc(v.browser||'Unknown')+' · 💻 '+esc(v.os||'Unknown')+'</div><div class="v8sub">📄 '+esc(v.page||'Unknown')+' · 🕐 '+esc(v.localTime||v.time||'Unknown')+'</div></div>').join('');
    }catch(e){list.innerHTML='<div class="v8note">Recent visitor data unavailable.</div>';}
  }
  function run(){readableHours();recentVisitors();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  new MutationObserver(function(){readableHours();if(document.getElementById('v8visitor')&&!document.getElementById('akRecentVisitorsFix'))recentVisitors();}).observe(document.documentElement,{childList:true,subtree:true});
})();
