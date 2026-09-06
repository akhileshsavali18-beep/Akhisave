(function(){
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function num(v){return typeof v==='number'&&Number.isFinite(v)?v:null}
  function pick(o,keys){for(const k of keys){const n=num(o&&o[k]);if(n!==null)return n}return null}
  function totalize(data,keys){
    const direct=pick(data,keys);if(direct!==null)return direct;
    for(const k of ['totals','summary','total','analytics']){if(data&&data[k]&&typeof data[k]==='object'){const n=pick(data[k],keys);if(n!==null)return n}}
    return null;
  }
  function rowsFrom(data){
    const candidates=[data?.days,data?.daily,data?.data,data?.records];
    for(const a of candidates)if(Array.isArray(a))return a;
    return [];
  }
  function render(data,days){
    const card=document.querySelector('[data-panel="dashboard"]');if(!card)return;
    const values=[
      ['PAGE VIEWS',totalize(data,['pageViews','page_views','views'])],
      ['VISITORS',totalize(data,['visitors','uniqueVisitors','unique_visitors'])],
      ['DOWNLOADS',totalize(data,['downloads','download_success','successes'])],
      ['ATTEMPTS',totalize(data,['attempts','download_attempts'])],
      ['FAILURES',totalize(data,['failures','download_failures'])]
    ];
    let grid=card.querySelector('.adh-grid');
    if(!grid){grid=document.createElement('div');grid.className='adh-grid';const note=card.querySelector('#aksDashNote');card.insertBefore(grid,note||null)}
    grid.innerHTML=values.map(x=>'<div class="aks-stat"><span>'+x[0]+'</span><b>'+(x[1]===null?'—':x[1].toLocaleString())+'</b></div>').join('');
    let tools=data?.tools||data?.topTools||data?.top_tools||data?.toolUsage||data?.tool_usage;
    if(tools&&typeof tools==='object'&&!Array.isArray(tools))tools=Object.entries(tools).map(([name,count])=>({name,count}));
    if(Array.isArray(tools)&&tools.length){
      let box=card.querySelector('.adh-tools');if(!box){box=document.createElement('div');box.className='adh-tools';card.appendChild(box)}
      const top=tools.map(x=>({name:x.name||x.tool||x.id||'Unknown',count:num(x.count??x.downloads??x.uses)??0})).sort((a,b)=>b.count-a.count).slice(0,8);
      box.innerHTML='<div class="adh-title">TOP TOOLS</div>'+top.map(x=>'<div class="aks-row"><div><b>'+esc(x.name)+'</b></div><span>'+x.count.toLocaleString()+'</span></div>').join('');
    }
    const rows=rowsFrom(data);
    let table=card.querySelector('.adh-daily');
    if(rows.length){
      if(!table){table=document.createElement('div');table.className='adh-daily';card.appendChild(table)}
      const recent=rows.slice(-days).reverse();
      table.innerHTML='<div class="adh-title">DAILY BREAKDOWN</div><table class="aks-table"><thead><tr><th>DATE</th><th>VIEWS</th><th>DOWNLOADS</th><th>FAILURES</th></tr></thead><tbody>'+recent.map(r=>'<tr><td>'+esc(r.date||r.day||r.key||'—')+'</td><td>'+pick(r,['pageViews','page_views','views'])??'—'+'</td><td>'+pick(r,['downloads','download_success','successes'])??'—'+'</td><td>'+pick(r,['failures','download_failures'])??'—'+'</td></tr>').join('')+'</tbody></table>';
    }
    const note=card.querySelector('#aksDashNote');if(note)note.textContent='Analytics: last '+days+' days. Data comes directly from the existing tracking API.';
  }
  async function load(days){
    const card=document.querySelector('[data-panel="dashboard"]');if(!card)return;
    let data;try{const r=await fetch('/api/admin/analytics?days='+days,{credentials:'same-origin',cache:'no-store'});data=await r.json();if(!r.ok||data.success===false)throw Error(data.error||'Analytics unavailable');render(data,days)}catch(e){const n=card.querySelector('#aksDashNote');if(n)n.textContent='Analytics unavailable: '+e.message}
  }
  function init(){
    const card=document.querySelector('[data-panel="dashboard"]');if(!card||card.dataset.dashboardFix==='1')return;card.dataset.dashboardFix='1';
    const style=document.createElement('style');style.textContent='.adh-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:10px}.adh-title{font-size:9px;font-weight:900;color:#66758a;margin:14px 0 6px}.adh-tools,.adh-daily{margin-top:4px}@media(max-width:700px){.adh-grid{grid-template-columns:repeat(2,1fr)}}';document.head.appendChild(style);
    const old=card.querySelector('#aksDashRefresh');if(old)old.onclick=function(){load(7)};
    let range=document.createElement('div');range.style.cssText='display:flex;gap:6px;flex-wrap:wrap;margin-top:10px';range.innerHTML='<button class="aks-btn alt" data-days="7">7 Days</button><button class="aks-btn alt" data-days="14">14 Days</button><button class="aks-btn alt" data-days="30">30 Days</button>';card.querySelector('.aks-head').appendChild(range);range.querySelectorAll('button').forEach(b=>b.onclick=()=>load(Number(b.dataset.days)));load(7);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,50));else setTimeout(init,50);
})();
