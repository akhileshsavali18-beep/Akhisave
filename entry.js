import app from "./admin-final.js";
import worker from "./worker.js";
import { track, analyticsResponse } from "./analytics-core.js";

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}})}
function cleanText(v,max){return String(v??"").replace(/[<>]/g,"").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,"").trim().slice(0,max)}
function escapeHtml(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;")}
function escapeAttr(v){return escapeHtml(v)}
const DEFAULT_EXTENDED={ads:{enabled:false,adsterra:{enabled:false,code:`<script>atOptions = { 'key' : 'b5f10b469c2566d06ff288ac7dc9b5b2', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };</script><script src="https://www.highrevenueformat.com/b5f10b469c2566d06ff288ac7dc9b5b2/invoke.js"></script>`},monetag:{enabled:false,zone:"11717101",code:""}},seo:{title:"Instagram Downloader - Photos, Reels, Videos & Stories | AkhiSave",description:"AkhiSave is a fast Instagram downloader to download public Instagram photos, reels, videos and stories by URL. No password required.",keywords:"",ogTitle:"",ogDescription:"",ogImage:""}};
async function extendedSettings(env){try{const raw=await env.AKHISAVE_SETTINGS.get('site_settings_extended');if(!raw)return structuredClone(DEFAULT_EXTENDED);const x=JSON.parse(raw)||{},a=x.ads&&typeof x.ads==='object'?x.ads:{},oldAdsterra=typeof a.adsterra==='boolean'?{enabled:a.adsterra,code:a.adsterraId||''}:a.adsterra||{},oldMonetag=typeof a.monetag==='boolean'?{enabled:a.monetag,zone:a.zone||'11717101',code:''}:a.monetag||{};const s=x.seo&&typeof x.seo==='object'?x.seo:{};return{ads:{enabled:a.enabled!==false,adsterra:{enabled:Boolean(oldAdsterra.enabled),code:cleanText(oldAdsterra.code||DEFAULT_EXTENDED.ads.adsterra.code,30000)},monetag:{enabled:Boolean(oldMonetag.enabled),zone:cleanText(oldMonetag.zone||'11717101',80),code:cleanText(oldMonetag.code,30000)}},seo:{title:cleanText(s.title||DEFAULT_EXTENDED.seo.title,140),description:cleanText(s.description||DEFAULT_EXTENDED.seo.description,220),keywords:cleanText(s.keywords,300),ogTitle:cleanText(s.ogTitle||s.title||DEFAULT_EXTENDED.seo.title,140),ogDescription:cleanText(s.ogDescription||s.description||DEFAULT_EXTENDED.seo.description,220),ogImage:cleanText(s.ogImage,500)}}}catch{return structuredClone(DEFAULT_EXTENDED)}}
function derivedCategory(t){const id=String(t?.id||'').toLowerCase(),e=String(t?.engine||t?.type||'').toLowerCase(),p=String(t?.platform||'').toLowerCase();if(['image-resizer','image-crop','image-compress'].includes(id)||['image-resizer','image-crop','image-compress'].includes(e))return'cat-image';if(id==='image-pdf'||e==='image-pdf')return'cat-pdf';if(['instagram','youtube','tiktok','facebook','twitter'].includes(p))return'cat-social';if(p==='utility')return'cat-utility';return'cat-other'}
async function toolCategories(env){try{return JSON.parse(await env.AKHISAVE_SETTINGS.get('tool_category_map')||'{}')}catch{return{}}}
function publicPageType(path){if(path==='/'||path==='/index.html')return'home';if(/result\.html$/.test(path))return'result';return'tools'}
function allowedAd(ad,type){return !!ad?.enabled && (ad.pages==='all'||!ad.pages||ad.pages===type)}
function injectPublicAds(html,ads,path){if(!ads?.enabled)return html;const type=publicPageType(path);const chunks=[];if(allowedAd(ads.monetag,type)){const code=ads.monetag.code||((ads.monetag.zone)?`<script>(function(s){s.dataset.zone='${escapeAttr(ads.monetag.zone)}';s.src='https://nap5k.com/tag.min.js'})(document.documentElement.appendChild(document.createElement('script')))</script>`:'');if(code)chunks.push(code)}if(allowedAd(ads.adsterra,type)&&ads.adsterra.code)chunks.push(ads.adsterra.code);if(!chunks.length)return html;const head=chunks.join('');return html.replace(/<\/head>/i,head+'</head>')}

export default {async fetch(request,env,ctx){
  const url=new URL(request.url);
  if(url.pathname==='/api/track')return track(request,env);
  if(url.pathname==='/api/admin/settings'){
    const auth=await worker.fetch(new Request(new URL('/api/admin/status',request.url),{headers:request.headers}),env,ctx);
    if(!auth.ok)return auth;
    if(!env.AKHISAVE_SETTINGS)return json({success:false,error:'Settings storage is not connected yet.'},503);
    if(request.method==='GET'){
      const r=await worker.fetch(request,env,ctx),d=await r.json().catch(()=>({}));
      if(!r.ok||d.success===false)return json(d,r.status);
      const ext=await extendedSettings(env);return json({...d,settings:{...(d.settings||{}),ads:ext.ads,seo:{...((d.settings||{}).seo||{}),...ext.seo}}});
    }
    if(request.method==='PUT'){
      const body=await request.json().catch(()=>({}));
      const ext=await extendedSettings(env),a=body.ads&&typeof body.ads==='object'?body.ads:ext.ads,s=body.seo&&typeof body.seo==='object'?body.seo:ext.seo;
      const adsterra=typeof a.adsterra==='boolean'?{enabled:a.adsterra,code:cleanText(a.adsterraId,30000)}:(a.adsterra||{}),monetag=typeof a.monetag==='boolean'?{enabled:a.monetag,zone:a.zone||'11717101',code:''}:(a.monetag||{});
      const next={ads:{enabled:Boolean(a.enabled),adsterra:{enabled:Boolean(adsterra.enabled),code:cleanText(adsterra.code||DEFAULT_EXTENDED.ads.adsterra.code,30000)},monetag:{enabled:Boolean(monetag.enabled),zone:cleanText(monetag.zone||'11717101',80),code:cleanText(monetag.code,30000)}},seo:{title:cleanText(s.title||ext.seo.title,140),description:cleanText(s.description||ext.seo.description,220),keywords:cleanText(s.keywords,300),ogTitle:cleanText(s.ogTitle||s.title||ext.seo.title,140),ogDescription:cleanText(s.ogDescription||s.description||ext.seo.description,220),ogImage:cleanText(s.ogImage,500)}};
      await env.AKHISAVE_SETTINGS.put('site_settings_extended',JSON.stringify(next));
      const forwarded={...body,ads:{monetag:Boolean(next.ads.monetag.enabled),zone:next.ads.monetag.zone},seo:{title:next.seo.title,description:next.seo.description}};
      const r=await worker.fetch(new Request(request.url,{method:'PUT',headers:request.headers,body:JSON.stringify(forwarded)}),env,ctx),d=await r.json().catch(()=>({}));
      if(!r.ok||d.success===false)return json(d,r.status);
      return json({...d,settings:{...(d.settings||{}),ads:next.ads,seo:next.seo}});
    }
  }
  if(url.pathname==='/api/admin/tools'){
    const auth=await worker.fetch(new Request(new URL('/api/admin/status',request.url),{headers:request.headers}),env,ctx);
    if(!auth.ok)return auth;
    if(request.method==='GET'){
      const r=await app.fetch(request,env,ctx),d=await r.json().catch(()=>({}));
      if(!r.ok||d.success===false)return new Response(JSON.stringify(d),{status:r.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
      const map=await toolCategories(env);let changed=false;const tools=(d.tools||[]).map(t=>{let c=Object.prototype.hasOwnProperty.call(map,t.id)?map[t.id]:(t.categoryId||derivedCategory(t));if(!Object.prototype.hasOwnProperty.call(map,t.id)){map[t.id]=c;changed=true}return{...t,categoryId:c||null}});if(changed&&env.AKHISAVE_SETTINGS)await env.AKHISAVE_SETTINGS.put('tool_category_map',JSON.stringify(map));return json({...d,tools});
    }
    if(request.method==='PUT'){
      const body=await request.json().catch(()=>({})),incoming=Array.isArray(body.tools)?body.tools:[],map=await toolCategories(env);for(const t of incoming){if(t?.id&&Object.prototype.hasOwnProperty.call(t,'categoryId'))map[String(t.id)]=t.categoryId||null;else if(t?.id&&!Object.prototype.hasOwnProperty.call(map,String(t.id)))map[String(t.id)]=derivedCategory(t)}if(env.AKHISAVE_SETTINGS)await env.AKHISAVE_SETTINGS.put('tool_category_map',JSON.stringify(map));const forwarded=new Request(request.url,{method:'PUT',headers:request.headers,body:JSON.stringify({tools:incoming})});const r=await app.fetch(forwarded,env,ctx),d=await r.json().catch(()=>({}));if(!r.ok||d.success===false)return json(d,r.status);const tools=(d.tools||[]).map(t=>({...t,categoryId:Object.prototype.hasOwnProperty.call(map,t.id)?map[t.id]:(t.categoryId||derivedCategory(t))||null}));return json({...d,tools});
    }
  }
  if(url.pathname==='/api/admin/analytics'){
    const auth=await worker.fetch(new Request(new URL('/api/admin/status',request.url),{headers:request.headers}),env,ctx);
    if(!auth.ok)return auth;
    return analyticsResponse(env,url);
  }
  if(url.pathname==='/admin-ui-fix.js'){
    const original=await env.ASSETS.fetch(request);if(!original.ok)return original;const h=new Headers(original.headers);h.set('Cache-Control','no-store');return new Response(original.body,{status:original.status,headers:h});
  }
  if(url.pathname==='/admin-dashboard-fix-v5.js'){
    const original=await env.ASSETS.fetch(request);
    if(!original.ok)return original;
    let js=await original.text();
    js=js.replace("const visitors=mode==='1'?num(a.today?.visitors):sum(rows,'visitors');\n   const newVisitors=mode==='1'?num(a.today?.newVisitors):sum(rows,'newVisitors');\n   const returning=mode==='1'?num(a.today?.returning):sum(rows,'returning');","const visitors=num(a.summary?.visitors);\n   const newVisitors=num(a.summary?.newVisitors);\n   const returning=num(a.summary?.returning);");
    const h=new Headers(original.headers);h.set('Cache-Control','no-store');return new Response(js,{status:original.status,headers:h});
  }
  if(request.method==='GET'&&url.pathname==='/'){
    const r=await app.fetch(request,env,ctx);if(!r.ok)return r;
    const ext=await extendedSettings(env),ct=r.headers.get('content-type')||'';if(!ct.includes('text/html'))return r;
    let html=await r.text();const s=ext.seo;
    html=html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${escapeHtml(s.title)}</title>`);
    html=html.replace(/<meta\s+name=["']description["'][^>]*>/i,`<meta name="description" content="${escapeAttr(s.description)}">`);
    const head=[];if(s.keywords)head.push(`<meta name="keywords" content="${escapeAttr(s.keywords)}">`);if(s.ogTitle)head.push(`<meta property="og:title" content="${escapeAttr(s.ogTitle)}">`);if(s.ogDescription)head.push(`<meta property="og:description" content="${escapeAttr(s.ogDescription)}">`);if(s.ogImage)head.push(`<meta property="og:image" content="${escapeAttr(s.ogImage)}">`);if(head.length)html=html.replace(/<\/head>/i,head.join('')+'</head>');
    html=injectPublicAds(html,ext.ads,url.pathname);
    const h=new Headers(r.headers);h.set('Cache-Control','no-store');return new Response(html,{status:r.status,headers:h});
  }
  if(request.method==='GET'&&!url.pathname.startsWith('/api/')&&!/^\/admin(?:\.html)?\/?$/i.test(url.pathname)){
    const r=await app.fetch(request,env,ctx);if(!r.ok)return r;
    const ct=r.headers.get('content-type')||'';if(!ct.includes('text/html'))return r;
    const ext=await extendedSettings(env);let html=await r.text();html=injectPublicAds(html,ext.ads,url.pathname);const h=new Headers(r.headers);h.set('Cache-Control','no-store');return new Response(html,{status:r.status,headers:h});
  }
  return app.fetch(request,env,ctx);
}};
