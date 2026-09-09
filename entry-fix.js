import base from "./entry.js";
import worker from "./worker.js";

const DEFAULT_EXTENDED={ads:{enabled:false,adsterra:{enabled:false,code:"",placement:"head",pages:"all"},monetag:{enabled:false,zone:"11717101",code:"",placement:"head",pages:"all"}},seo:{title:"Instagram Downloader - Photos, Reels, Videos & Stories | AkhiSave",description:"AkhiSave is a fast Instagram downloader to download public Instagram photos, reels, videos and stories by URL or username.",keywords:"",ogTitle:"",ogDescription:"",ogImage:""}};

function cleanText(v,max){return String(v??"").replace(/[<>]/g,"").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,"").trim().slice(0,max)}
function escapeHtml(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;")}
function escapeAttr(v){return escapeHtml(v)}
function sanitizeAdCode(value){
  let raw=String(value??"").replace(/\r/g,"").trim();
  if(!raw)return "";
  raw=raw.replace(/scriptatOptions\s*=\s*/gi,"<script>atOptions = ");
  raw=raw.replace(/src=(['"])(https?:\/\/[^'"]*highrevenueformat\.com[^'"]+)\1\s*\/script/gi,"<script src=\"$2\"></script>");
  raw=raw.replace(/\/script\b/gi,"</script>");
  if(!/<script\b/i.test(raw)&&/atOptions\s*=/.test(raw))raw=`<script>${raw}</script>`;
  const blocks=raw.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi)||[];
  return blocks.filter(b=>/atOptions\s*=|highrevenueformat\.com|adsterra\.com|invoke\.js/i.test(b)).slice(0,6).join("\n");
}
function provider(input,key,fallbackZone){
  const v=input?.[key];
  if(v&&typeof v==="object")return v;
  if(typeof v==="boolean")return {enabled:v,code:key==='adsterra'?(input?.adsterraCode??input?.adCode??input?.code??""):input?.code??"",zone:input?.zone??fallbackZone};
  if(typeof v==="string")return {enabled:true,code:v,zone:input?.zone??fallbackZone};
  return {enabled:Boolean(input?.[`${key}Enabled`]),code:key==='adsterra'?(input?.adsterraCode??input?.adCode??""):input?.[`${key}Code`]??"",zone:input?.zone??fallbackZone};
}
function normalizeAds(input){
  const a=input&&typeof input==="object"?input:{};
  const x=provider(a,'adsterra','');
  const m=provider(a,'monetag','11717101');
  const global= a.enabled===true || x.enabled===true || m.enabled===true;
  return {
    enabled:global,
    adsterra:{enabled:x.enabled===true,code:sanitizeAdCode(x.code),placement:["head","body-start","content-top","body-end"].includes(x.placement)?x.placement:"head",pages:["all","home","tools","result"].includes(x.pages)?x.pages:"all"},
    monetag:{enabled:m.enabled===true,zone:String(m.zone??"11717101").replace(/[^0-9]/g,"").slice(0,30)||"11717101",code:cleanText(m.code,30000),placement:["head","body-start","content-top","body-end"].includes(m.placement)?m.placement:"head",pages:["all","home","tools","result"].includes(m.pages)?m.pages:"all"}
  };
}
async function extendedSettings(env){
  try{
    const raw=await env.AKHISAVE_SETTINGS.get("site_settings_extended");
    if(!raw)return structuredClone(DEFAULT_EXTENDED);
    const x=JSON.parse(raw)||{},a=x.ads&&typeof x.ads==="object"?x.ads:{},s=x.seo&&typeof x.seo==="object"?x.seo:{};
    const ads=normalizeAds(a);
    return {ads,seo:{title:cleanText(s.title||DEFAULT_EXTENDED.seo.title,140),description:cleanText(s.description||DEFAULT_EXTENDED.seo.description,220),keywords:cleanText(s.keywords,300),ogTitle:cleanText(s.ogTitle||s.title||DEFAULT_EXTENDED.seo.title,140),ogDescription:cleanText(s.ogDescription||s.description||DEFAULT_EXTENDED.seo.description,220),ogImage:cleanText(s.ogImage,500)}};
  }catch{return structuredClone(DEFAULT_EXTENDED)}
}
function pageType(path){if(path==='/'||path==='/index.html')return 'home';if(/result\.html$/.test(path))return 'result';return 'tools'}
function allowed(ad,type){return !!ad?.enabled&&(ad.pages==='all'||!ad.pages||ad.pages===type)}
function inject(html,ads,path){
  if(!ads?.enabled)return html;
  const type=pageType(path),parts={head:"",start:"",content:"",end:""};
  for(const [name,ad] of [["adsterra",ads.adsterra],["monetag",ads.monetag]]){
    if(!allowed(ad,type))continue;
    let code=ad.code||"";
    if(name==='monetag'&&!code&&ad.zone)code=`<script>(function(s){s.dataset.zone='${escapeAttr(ad.zone)}';s.src='https://nap5k.com/tag.min.js'})(document.documentElement.appendChild(document.createElement('script')))</script>`;
    if(!code)continue;
    if(ad.placement==='head')parts.head+=code;
    else if(ad.placement==='body-start')parts.start+=`<div class="akhisave-ad akhisave-ad-${name}">${code}</div>`;
    else if(ad.placement==='content-top')parts.content+=`<div class="akhisave-ad akhisave-ad-${name}">${code}</div>`;
    else parts.end+=`<div class="akhisave-ad akhisave-ad-${name}">${code}</div>`;
  }
  if(parts.head)html=html.replace(/<\/head>/i,parts.head+'</head>');
  if(parts.start)html=html.replace(/<body([^>]*)>/i,'<body$1>'+parts.start);
  if(parts.content)html=html.replace(/<main([^>]*)>/i,'<main$1>'+parts.content);
  if(parts.end)html=html.replace(/<\/body>/i,parts.end+'</body>');
  return html;
}
async function auth(request,env,ctx){return worker.fetch(new Request(new URL('/api/admin/status',request.url),{headers:request.headers}),env,ctx)}

export default {async fetch(request,env,ctx){
  const url=new URL(request.url);
  if(url.pathname==='/api/admin/settings'){
    const a=await auth(request,env,ctx);if(!a.ok)return a;
    if(!env.AKHISAVE_SETTINGS)return new Response(JSON.stringify({success:false,error:'Settings storage is not connected yet.'}),{status:503,headers:{'Content-Type':'application/json'}});
    if(request.method==='GET'){
      const r=await worker.fetch(request,env,ctx),d=await r.json().catch(()=>({}));if(!r.ok)return new Response(JSON.stringify(d),{status:r.status,headers:{'Content-Type':'application/json'}});
      const ext=await extendedSettings(env);return new Response(JSON.stringify({...d,settings:{...(d.settings||{}),ads:ext.ads,seo:{...((d.settings||{}).seo||{}),...ext.seo}}}),{status:200,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
    }
    if(request.method==='PUT'){
      const body=await request.json().catch(()=>({}));
      const old=await extendedSettings(env),ads=normalizeAds(body.ads||old.ads),seo=body.seo&&typeof body.seo==='object'?body.seo:old.seo;
      const next={ads,seo:{title:cleanText(seo.title||old.seo.title,140),description:cleanText(seo.description||old.seo.description,220),keywords:cleanText(seo.keywords,300),ogTitle:cleanText(seo.ogTitle||seo.title||old.seo.title,140),ogDescription:cleanText(seo.ogDescription||seo.description||old.seo.description,220),ogImage:cleanText(seo.ogImage,500)}};
      await env.AKHISAVE_SETTINGS.put('site_settings_extended',JSON.stringify(next));
      const forwarded={...body,ads:{monetag:ads.monetag.enabled,zone:ads.monetag.zone},seo:next.seo};
      const r=await worker.fetch(new Request(request.url,{method:'PUT',headers:request.headers,body:JSON.stringify(forwarded)}),env,ctx),d=await r.json().catch(()=>({}));
      if(!r.ok)return new Response(JSON.stringify(d),{status:r.status,headers:{'Content-Type':'application/json'}});
      return new Response(JSON.stringify({...d,settings:{...(d.settings||{}),ads:next.ads,seo:next.seo}}),{status:r.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
    }
  }
  if(request.method==='GET'&&!url.pathname.startsWith('/api/')&&!/^\/admin(?:\.html)?\/?$/i.test(url.pathname)){
    const r=await worker.fetch(request,env,ctx);if(!r.ok)return r;
    const ct=r.headers.get('content-type')||'';if(!ct.includes('text/html'))return r;
    const ext=await extendedSettings(env);let html=await r.text();const s=ext.seo;
    if(url.pathname==='/'||url.pathname==='/index.html'){
      html=html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${escapeHtml(s.title)}</title>`);
      html=html.replace(/<meta\s+name=["']description["'][^>]*>/i,`<meta name="description" content="${escapeAttr(s.description)}">`);
    }
    html=inject(html,ext.ads,url.pathname);
    const h=new Headers(r.headers);h.set('Cache-Control','no-store');h.delete('content-length');return new Response(html,{status:r.status,headers:h});
  }
  return base.fetch(request,env,ctx);
}};
