/* AkhiSave Dashboard — final bots vs human presentation */
(function(){
  if(window.__AKHISAVE_BOT_HUMAN_FINAL__) return;
  window.__AKHISAVE_BOT_HUMAN_FINAL__=true;
  function cleanAndAdd(){
    const d=document.getElementById('dashboard');
    if(!d)return;
    let c=document.getElementById('akBotHumanCard');
    if(!c){
      c=document.createElement('div'); c.id='akBotHumanCard'; c.className='v8c';
      c.innerHTML='<div class="v8title">🤖 Bots vs Human Visitors</div><div class="v8sub">Human visitors and detected bots/crawlers</div><div id="akBotHumanBody" class="v8list"><div class="v8note">Loading visitor classification…</div></div>';
      const first=d.querySelector('.v8c'); if(first) first.insertAdjacentElement('afterend',c); else d.appendChild(c);
      load();
    }
  }
  async function load(){
    const b=document.getElementById('akBotHumanBody'); if(!b)return;
    try{
      const r=await fetch('/api/admin/analytics?days=1',{credentials:'same-origin',cache:'no-store'});
      const a=await r.json(),s=a.summary||{};
      const h=Number(s.pageViews)||0,x=Number(s.botPageViews)||0,t=h+x,hp=t?h/t*100:0,bp=t?x/t*100:0;
      b.innerHTML='<div class="v8row"><span>👤 Human page views</span><strong>'+h.toLocaleString()+' · '+hp.toFixed(1)+'%</strong></div><div class="v8bar"><i style="width:'+hp+'%"></i></div><div class="v8row"><span>🤖 Bot / crawler page views</span><strong>'+x.toLocaleString()+' · '+bp.toFixed(1)+'%</strong></div><div class="v8bar"><i style="width:'+bp+'%"></i></div><div class="v8row"><span>Total detected traffic</span><strong>'+t.toLocaleString()+'</strong></div><div class="v8note">Detected bots are excluded from normal human page-view statistics.</div>';
    }catch(e){b.innerHTML='<div class="v8note">Bot vs human data unavailable.</div>';}
  }
  function start(){cleanAndAdd();setTimeout(cleanAndAdd,500);setTimeout(cleanAndAdd,1500);setTimeout(cleanAndAdd,3000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
  new MutationObserver(function(){cleanAndAdd();}).observe(document.documentElement,{childList:true,subtree:true});
})();