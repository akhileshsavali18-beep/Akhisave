import app from "./entry-fix.js";

const DEFAULT_KEY="b5f10b469c2566d06ff288ac7dc9b5b2";

function adsterraCode(key){
  return `<script>atOptions = { 'key' : '${key}', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };</script><script src="https://www.highrevenueformat.com/${key}/invoke.js"></script>`;
}

async function settings(env){
  try{
    const raw=await env.AKHISAVE_SETTINGS.get("site_settings_extended");
    const x=JSON.parse(raw||"{}")||{},a=x.ads&&typeof x.ads==="object"?x.ads:{};
    const v=a.adsterra&&typeof a.adsterra==="object"?a.adsterra:{};
    const code=String(v.code||a.adsterraCode||a.adCode||"");
    const enabled=Boolean(v.enabled||a.adsterra===true||a.adsterraEnabled===true);
    const key=(code.match(/(?:key\s*['\"]?\s*[:=]\s*['\"]|highrevenueformat\.com\/)([a-z0-9]+)/i)||[])[1]||DEFAULT_KEY;
    return {enabled,key,hasCode:Boolean(code)};
  }catch{return {enabled:false,key:DEFAULT_KEY,hasCode:false}}
}

function removeAdsterra(html){
  let out=html;
  out=out.replace(/<script\b[^>]*>[\s\S]*?atOptions[\s\S]*?<\/script>\s*<script\b[^>]*highrevenueformat\.com[\s\S]*?<\/script>/gi,"");
  out=out.replace(/scriptatOptions\s*=\s*[\s\S]*?\/scriptscript\s+src=[\s\S]*?\/script/gi,"");
  out=out.replace(/atOptions\s*=\s*[\s\S]*?\/scriptscript\s+src=[\s\S]*?\/script/gi,"");
  out=out.replace(/<scriptatOptions\s*=\s*[\s\S]*?\/script/gi,"");
  return out;
}

export default {async fetch(request,env,ctx){
  const url=new URL(request.url);
  const r=await app.fetch(request,env,ctx);
  if(request.method!=="GET"||url.pathname.startsWith("/api/")||/^\/admin(?:\.html)?\/?$/i.test(url.pathname))return r;
  const ct=r.headers.get("content-type")||"";
  if(!ct.includes("text/html"))return r;
  const s=await settings(env);
  let html=removeAdsterra(await r.text());
  if(s.enabled&&s.hasCode){
    const block=`<div class="akhisave-ad akhisave-ad-adsterra" style="width:300px;min-height:250px;margin:16px auto;display:flex;justify-content:center;align-items:flex-start;overflow:hidden">${adsterraCode(s.key)}</div>`;
    if(/<main\b/i.test(html)) html=html.replace(/<main([^>]*)>/i,'<main$1>'+block);
    else if(/<body\b/i.test(html)) html=html.replace(/<body([^>]*)>/i,'<body$1>'+block);
    else html=html.replace(/<\/body>/i,block+'</body>');
  }
  const h=new Headers(r.headers);h.set("Cache-Control","no-store");h.delete("content-length");
  return new Response(html,{status:r.status,headers:h});
}};
