/* AkhiSave Dashboard — Bots vs Human Visitors */
(function(){
  if(window.__AKHISAVE_BOT_HUMAN__) return;
  window.__AKHISAVE_BOT_HUMAN__=true;
  const N=v=>Number.isFinite(Number(v))?Number(v):0;
  const F=v=>N(v).toLocaleString();
  const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function addCard(){
    const dashboard=document.getElementById('dashboard');
    if(!dashboard || document.getElementById('akBotHumanCard')) return;
    const card=document.createElement('div');
    card.id='akBotHumanCard';
    card.className='v8c';
    card.innerHTML='<div class="v8title">🤖 Bots vs Human Visitors</div><div class="v8sub">Human visitors are separated from detected bots/crawlers in analytics.</div><div id="akBotHumanBody" class="v8list"><div class="v8note">Loading visitor classification…</div></div>';
    const first=dashboard.querySelector('.v8c');
    if(first) first.insertAdjacentElement('afterend',card); else dashboard.appendChild(card);
    load();
  }
  async function load(){
    const body=document.getElementById('akBotHumanBody');
    if(!body)return;
    try{
      const r=await fetch('/api/admin/analytics?days=1',{credentials:'same-origin',cache:'no-store'});
      const a=await r.json();
      if(!r.ok||a.success===false) throw Error(a.error||'Analytics unavailable');
      const s=a.summary||{};
      const human=N(s.pageViews);
      const bots=N(s.botPageViews);
      const total=human+bots;
      const hp=total?human/total*100:0;
      const bp=total?bots/total*100:0;
      body.innerHTML='<div class="v8row"><span>👤 Human page views</span><strong>'+F(human)+' · '+hp.toFixed(1)+'%</strong></div>'+
        '<div class="v8bar"><i style="width:'+Math.max(0,Math.min(100,hp))+'%"></i></div>'+
        '<div class="v8row"><span>🤖 Bot / crawler page views</span><strong>'+F(bots)+' · '+bp.toFixed(1)+'%</strong></div>'+
        '<div class="v8bar"><i style="width:'+Math.max(0,Math.min(100,bp))+'%"></i></div>'+
        '<div class="v8row"><span>Total detected traffic</span><strong>'+F(total)+'</strong></div>'+
        '<div class="v8note">Bot traffic is detected separately and is not included in normal human page-view statistics. Bot detection is based on request signals and can never be 100% perfect.</div>';
    }catch(e){body.innerHTML='<div class="v8note">Bot vs human data unavailable.</div>';}
  }
  function run(){addCard();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  new MutationObserver(function(){addCard();}).observe(document.documentElement,{childList:true,subtree:true});
})();
