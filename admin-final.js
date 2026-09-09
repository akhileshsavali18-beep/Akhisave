import suite from "./admin-suite.js";
import worker from "./worker.js";

const LIGHT_ADMIN = `<style id="akhisave-admin-light-final">
:root{--bg:#fff;--panel:#fff;--panel2:#fff;--line:#e4eaf2;--text:#0a1628;--muted:#68778b;--purple:#1677ff;--pink:#16c9e8}
html,body{background:#fff!important;color:#0a1628!important}
.topbar{background:rgba(255,255,255,.98)!important;border-bottom:1px solid #e4eaf2!important}
.card,.statcard,.section,.feature,.aks-card{background:#fff!important;color:#0a1628!important;border-color:#e4eaf2!important;box-shadow:0 10px 30px rgba(18,38,68,.06)!important}
.label,.muted,.hero p,.section>p{color:#68778b!important}.stat,.hero h1,.section h2{color:#0a1628!important}
.iconbtn,.logout,.btn,.mini{background:#fff!important;color:#0a1628!important;border-color:#d8e1ec!important}.btn.primary{background:linear-gradient(135deg,#1677ff,#16c9e8)!important;color:#fff!important;border:0!important}.btn.secondary{background:#f7faff!important;color:#43536a!important}
.field input,.field textarea,.field select,.loginbox input{background:#fff!important;color:#0a1628!important;border-color:#d8e1ec!important}.field input::placeholder,.field textarea::placeholder,.loginbox input::placeholder{color:#8a93a3!important}
.row,.toolrow,.aks-row{border-bottom-color:#e4eaf2!important}.statusbox,.custom-editor,.empty,.atm-tool,.atm-stat,.atm-empty{background:#f7faff!important;color:#0a1628!important;border-color:#e4eaf2!important}.toolicon,.atm-icon{background:#edf5ff!important;border-color:#d8e8fb!important}
.drawer{background:#fff!important;border-right-color:#e4eaf2!important}.drawer-head{border-bottom-color:#e4eaf2!important}.drawer a{color:#68778b!important}.drawer a.active,.drawer a:hover{background:#edf5ff!important;color:#1677ff!important}.bottom{background:#fff!important;border-top-color:#e4eaf2!important}.bottom button{color:#68778b!important}.bottom button.active{color:#1677ff!important}
.login-page{background:#fff!important}.loginbox{background:#fff!important;color:#0a1628!important;border-color:#e4eaf2!important;box-shadow:0 20px 60px rgba(18,38,68,.08)!important}.loginbox p{color:#68778b!important}.toast{background:#fff!important;color:#0a1628!important;border-color:#d8e1ec!important}
#drawerOverlay{display:none!important;pointer-events:none!important;z-index:-1!important}
#drawerOverlay.show{display:none!important;pointer-events:none!important}
#drawer:not(.open){pointer-events:none!important}
#drawer.open{pointer-events:auto!important;z-index:2147483647!important;top:0!important;bottom:0!important;height:100vh!important}
.bottom,.bottomin,.bottom button{pointer-events:auto!important;z-index:900!important}
.topbar,.topin,.top-left,.top-right,.iconbtn,.logout{pointer-events:auto!important}
@media(max-width:560px){#drawer.open{width:320px!important;max-width:86vw!important}.topbar{z-index:100!important}}
@media(max-width:700px){#dashboard .ak-grid{grid-template-columns:1fr 1fr!important}#dashboard .ak-two{grid-template-columns:1fr!important}#dashboard .ak-status{grid-template-columns:1fr 1fr!important}}
</style>`;

const TAP_FIX = `<script>(function(){
function fixAdminTaps(){
  const $=id=>document.getElementById(id);const drawer=$("drawer"),overlay=$("drawerOverlay"),topbar=document.querySelector(".topbar"),bottom=document.querySelector(".bottom");if(!drawer)return;
  if(overlay){overlay.style.display="none";overlay.style.pointerEvents="none";overlay.style.zIndex="-1";}
  const open=$("openDrawer"),close=$("closeDrawer"),refresh=$("refresh"),logout=$("logout");
  function setDrawer(opened){drawer.classList.toggle("open",opened);if(topbar)topbar.style.display=opened?"none":"";if(bottom)bottom.style.display=opened?"none":"";}
  if(open)open.onclick=function(e){e.preventDefault();e.stopPropagation();setDrawer(true);};
  if(close)close.onclick=function(e){e.preventDefault();e.stopPropagation();setDrawer(false);};
  if(refresh)refresh.onclick=function(e){e.preventDefault();e.stopPropagation();if(typeof window.loadAll==="function")window.loadAll();else location.reload();};
  if(logout)logout.onclick=async function(e){e.preventDefault();e.stopPropagation();try{await fetch("/api/admin/logout",{method:"POST",credentials:"same-origin"});}finally{location.reload();}};
  document.querySelectorAll(".bottom-btn").forEach(function(btn){btn.onclick=function(e){e.preventDefault();e.stopPropagation();const tab=btn.dataset.tab;if(typeof window.go==="function")window.go(tab);else{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.id===tab));document.querySelectorAll(".bottom-btn").forEach(x=>x.classList.toggle("active",x===btn));}};});
  document.querySelectorAll(".navlink[data-tab]").forEach(function(a){a.onclick=function(e){e.preventDefault();e.stopPropagation();const tab=a.dataset.tab;setDrawer(false);document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.id===tab));document.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("active",x.dataset.tab===tab));history.replaceState(null,"","#"+tab);};});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fixAdminTaps);else fixAdminTaps();
})();</script>`;

function stripLegacyDashboard(html){
  const start=html.indexOf('<section id="dashboard" class="tab active">');
  if(start<0)return html;
  const toolsStart=html.indexOf('<section id="tools" class="tab',start);
  if(toolsStart<0)return html;
  const dashboard=`<section id="dashboard" class="tab active">
    <div class="ak-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:9px">
      <div class="card" style="grid-column:1/-1;padding:16px"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div><h2 style="margin:0;color:#10233f">AkhiSave Dashboard</h2><p style="margin:4px 0 0;color:#718096;font-size:11px">Website-wide activity across all tool categories</p></div><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn secondary" data-ak-days="1">Today</button><button class="btn secondary" data-ak-days="7">7 Days</button><button class="btn secondary" data-ak-days="30">30 Days</button></div></div></div>
      <div class="statcard"><div class="label">VISITORS</div><div class="stat" id="akVisitors">—</div></div>
      <div class="statcard"><div class="label">TOOL USES</div><div class="stat" id="akToolUses">—</div></div>
      <div class="statcard"><div class="label">FILES PROCESSED</div><div class="stat" id="akFiles">—</div></div>
      <div class="statcard"><div class="label">ERRORS</div><div class="stat" id="akErrors">—</div></div>
      <div class="card" style="padding:16px;grid-column:span 3"><h3 style="margin:0;color:#10233f">📈 Traffic &amp; Usage</h3><p style="margin:4px 0;color:#718096;font-size:10px">Recorded analytics for the selected period</p><div id="akChart" style="min-height:120px;padding-top:12px;color:#718096;font-size:11px">Loading analytics…</div></div>
      <div class="card" style="padding:16px"><h3 style="margin:0;color:#10233f">⚡ Success Rate</h3><div id="akSuccess" style="font-size:30px;font-weight:900;color:#123c7a;margin-top:14px">—</div><p id="akSuccessSub" style="margin:4px 0;color:#718096;font-size:10px">Waiting for analytics…</p></div>
      <div class="card" style="padding:16px;grid-column:1/-1"><h3 style="margin:0;color:#10233f">🔥 Most Used Tools</h3><div id="akTopTools" style="margin-top:10px;color:#718096;font-size:11px">Loading…</div></div>
      <div class="card" style="padding:16px;grid-column:1/-1"><h3 style="margin:0;color:#10233f">📊 Category / Tool Overview</h3><div id="akOverview" style="margin-top:10px;color:#53657d;font-size:11px">Loading…</div></div>
      <div class="card" style="padding:16px;grid-column:1/-1"><h3 style="margin:0;color:#10233f">🟢 System Status</h3><div class="ak-status" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px"><div style="padding:10px;background:#f7faff;border:1px solid #e8edf5;border-radius:11px;font-size:10px">Website <b style="color:#16864a">● Online</b></div><div style="padding:10px;background:#f7faff;border:1px solid #e8edf5;border-radius:11px;font-size:10px">API <b style="color:#16864a">● Online</b></div><div style="padding:10px;background:#f7faff;border:1px solid #e8edf5;border-radius:11px;font-size:10px">Storage <b style="color:#16864a">● Connected</b></div><div style="padding:10px;background:#f7faff;border:1px solid #e8edf5;border-radius:11px;font-size:10px">Analytics <b style="color:#16864a">● Active</b></div></div></div>
    </div>
    <script>(function(){function run(){const $=id=>document.getElementById(id),fmt=v=>Number(v||0).toLocaleString();let days=7;async function load(){try{const [a,t]=await Promise.all([fetch('/api/admin/analytics?days='+days,{credentials:'same-origin',cache:'no-store'}).then(r=>r.json()),fetch('/api/admin/tools',{credentials:'same-origin',cache:'no-store'}).then(r=>r.json())]);const num=(o,ks)=>{for(const k of ks)if(typeof o?.[k]==='number')return o[k];return 0};const visitors=num(a,['visitors','uniqueVisitors','unique_visitors']),attempts=num(a,['attempts','download_attempts']),downloads=num(a,['downloads','download_success','successes']),failures=num(a,['failures','download_failures']),files=num(a,['filesProcessed','files_processed','processed']);$('akVisitors').textContent=fmt(visitors);$('akToolUses').textContent=fmt(attempts);$('akFiles').textContent=files?fmt(files):'—';$('akErrors').textContent=fmt(failures);$('akSuccess').textContent=attempts?(downloads/attempts*100).toFixed(1)+'%':'—';$('akSuccessSub').textContent=fmt(attempts)+' attempts · '+fmt(downloads)+' successful · '+fmt(failures)+' failed';const ts=a.tools&&typeof a.tools==='object'&&!Array.isArray(a.tools)?Object.entries(a.tools).map(([name,count])=>({name,count:Number(count)||0})):[];ts.sort((x,y)=>y.count-x.count);$('akTopTools').innerHTML=ts.slice(0,8).map(x=>'<div style="padding:8px 0;border-bottom:1px solid #edf1f6;display:flex;justify-content:space-between"><b>'+String(x.name).replace(/[&<>]/g,'')+'</b><strong>'+fmt(x.count)+'</strong></div>').join('')||'No tool usage recorded yet.';const all=t.tools||[];$('akOverview').innerHTML='<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #edf1f6"><b>Registered tools</b><strong>'+all.length+'</strong></div><div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #edf1f6"><b>Enabled tools</b><strong>'+all.filter(x=>x.enabled!==false).length+'</strong></div><div style="display:flex;justify-content:space-between;padding:8px 0"><b>Page views</b><strong>'+fmt(num(a,['pageViews','page_views','views']))+'</strong></div>';const daily=Array.isArray(a.daily)?a.daily:Array.isArray(a.days)?a.days:[];if(daily.length){const vals=daily.slice(-14).map(x=>num(x,['pageViews','page_views','views','visitors','downloads']));const max=Math.max(1,...vals);$('akChart').innerHTML='<div style="height:100px;display:flex;align-items:flex-end;gap:5px">'+vals.map(v=>'<div style="flex:1;height:'+Math.max(3,v/max*100)+'%;background:#1769e0;border-radius:4px"></div>').join('')+'</div>'}else $('akChart').textContent='No daily analytics recorded yet.'}catch(e){$('akChart').textContent='Analytics unavailable';$('akTopTools').textContent='Analytics unavailable';$('akOverview').textContent='Analytics unavailable'}}document.querySelectorAll('[data-ak-days]').forEach(b=>b.onclick=()=>{days=Number(b.dataset.akDays);load()});load()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run()})();</script>
  </section>`;
  return html.slice(0,start)+dashboard+html.slice(toolsStart);
}

const REMOVE_DASH_WEBSITE = `<script>(function(){function clean(){const d=document.getElementById('dashboard');if(!d)return;d.querySelectorAll('#akDashWebsiteControls,[data-ak-dashboard-website-controls]').forEach(e=>e.remove());d.querySelectorAll('.card.section').forEach(e=>{const h=e.querySelector('h1,h2,h3');if(h&&/website\\s+controls/i.test(h.textContent||''))e.remove()})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean);else clean();new MutationObserver(clean).observe(document.documentElement,{childList:true,subtree:true})})();</script>`;

export default {async fetch(request,env,ctx){
  const url=new URL(request.url);
  if(request.method==='POST'&&url.pathname==='/api/admin/login')return worker.fetch(request,env,ctx);
  const response=await suite.fetch(request,env,ctx);
  if(request.method==='GET'&&url.pathname==='/' ){
    const type=response.headers.get('content-type')||'';
    if(type.includes('text/html')){let html=await response.text();html=html.replace('</head>','<script src="/public-tools.js?v=1"></script></head>');const headers=new Headers(response.headers);headers.delete('content-length');headers.set('Cache-Control','no-store');return new Response(html,{status:response.status,headers});}
  }
  if(request.method!=='GET'||(url.pathname!=='/admin.html'&&url.pathname!=='/admin'))return response;
  const type=response.headers.get('content-type')||'';if(!type.includes('text/html'))return response;
  let html=await response.text();
  html=html.replaceAll('/307a3722-6c83-4b6b-a3fa-a5a840bf5d4b.png','/LogoName.png').replaceAll('/4dc6e410-9139-4401-a2f8-84e67a0a29b2.png','/LogoName.png').replaceAll('/38364009-f822-430a-9f51-694b12b8d9ef.png','/Logo.png').replaceAll('/eb358ee7-8d58-460f-87fa-feb2edd6cd3d.png','/Name.png');
  html=stripLegacyDashboard(html);
  html=html.replace('</head>',LIGHT_ADMIN+'</head>');
  html=html.replace('</body>',TAP_FIX+REMOVE_DASH_WEBSITE+'<script src="/admin-login-fix.js?v=4"></script><script src="/admin-ui-fix.js?v=1"></script><script src="/admin-categories-fix.js?v=2"></script><script src="/admin-dashboard-fix.js?v=4"></script></body>');
  const headers=new Headers(response.headers);headers.delete('content-length');headers.set('Cache-Control','no-store');return new Response(html,{status:response.status,headers});
}};
