import app from "./entry-fix.js";
import publicApp from "./admin-final.js";

function escapeAttr(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;")}

async function publicAds(env){
  const empty={enabled:false,adsterra:{enabled:false,code:"",placement:"head",pages:"all"},monetag:{enabled:false,zone:"",code:"",placement:"head",pages:"all"}};
  try{
    const raw=await env.AKHISAVE_SETTINGS.get("site_settings_extended");
    if(!raw)return empty;
    const x=JSON.parse(raw)||{},a=x.ads&&typeof x.ads==="object"?x.ads:{};
    const av=a.adsterra&&typeof a.adsterra==="object"?a.adsterra:(typeof a.adsterra==="boolean"?{enabled:a.adsterra,code:a.adsterraCode||""}:{});
    const mv=a.monetag&&typeof a.monetag==="object"?a.monetag:{enabled:Boolean(a.monetag),zone:a.zone||"",code:""};
    return {enabled:Boolean(a.enabled||av.enabled||mv.enabled),adsterra:{enabled:Boolean(av.enabled),code:String(av.code||a.adsterraCode||"") ,placement:av.placement||"head",pages:av.pages||"all"},monetag:{enabled:Boolean(mv.enabled),zone:String(mv.zone||a.zone||""),code:String(mv.code||"") ,placement:mv.placement||"head",pages:mv.pages||"all"}};
  }catch{return empty}
}

function pageType(path){if(path==='/'||path==='/index.html')return 'home';if(/result\.html$/i.test(path))return 'result';return 'tools'}
function allowed(ad,type){return Boolean(ad?.enabled)&&(ad.pages==='all'||!ad.pages||ad.pages===type)}
function injectAds(html,ads,path){
  if(!ads.enabled)return html;
  const type=pageType(path),head=[];
  if(allowed(ads.adsterra,type)&&ads.adsterra.code)head.push(ads.adsterra.code);
  if(allowed(ads.monetag,type)){
    const code=ads.monetag.code||((ads.monetag.zone)?`<script>(function(s){s.dataset.zone='${escapeAttr(ads.monetag.zone)}';s.src='https://nap5k.com/tag.min.js'})(document.documentElement.appendChild(document.createElement('script')))</script>`:'');
    if(code)head.push(code);
  }
  return head.length?html.replace(/<\/head>/i,head.join('')+'</head>'):html;
}

export default {async fetch(request,env,ctx){
  const url=new URL(request.url);
  const isPublic=request.method==='GET'&&!url.pathname.startsWith('/api/')&&!/^\/admin(?:\.html)?\/?$/i.test(url.pathname);
  if(isPublic){
    const r=await publicApp.fetch(request,env,ctx);
    if(!r.ok)return r;
    const ct=r.headers.get('content-type')||'';
    if(!ct.includes('text/html'))return r;
    const ads=await publicAds(env);
    const html=injectAds(await r.text(),ads,url.pathname);
    const h=new Headers(r.headers);h.set('Cache-Control','no-store');h.delete('content-length');
    return new Response(html,{status:r.status,headers:h});
  }
  return app.fetch(request,env,ctx);
}};
