import base from "./entry.js";

const DEFAULT_KEY="b5f10b469c2566d06ff288ac7dc9b5b2";

function canonicalAdsterra(key){
  return `<div class="akhisave-ad akhisave-ad-adsterra" style="width:300px;min-height:250px;margin:18px auto;text-align:center;overflow:hidden"><script>atOptions = { 'key' : '${key}', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };</script><script src="https://www.highrevenueformat.com/${key}/invoke.js"></script></div>`;
}

async function settings(env){
  try{
    const raw=await env.AKHISAVE_SETTINGS.get("site_settings_extended");
    const x=JSON.parse(raw||"{}")||{},a=x.ads&&typeof x.ads==="object"?x.ads:{};
    const v=a.adsterra&&typeof a.adsterra==="object"?a.adsterra:{};
    const code=String(v.code||a.adsterraCode||a.adCode||"");
    const enabled=Boolean(a.enabled===true||v.enabled===true||a.adsterra===true||a.adsterraEnabled===true);
    const key=(code.match(/(?:key\s*['\"]?\s*[:=]\s*['\"]|highrevenueformat\.com\/)([a-z0-9]+)/i)||[])[1]||DEFAULT_KEY;
    return {enabled,key,hasCode:Boolean(code)};
  }catch{return {enabled:false,key:DEFAULT_KEY,hasCode:false}}
}

function removeAdsterra(html){
  let out=html;
  out=out.replace(/<script[^>]*>[\s\S]*?atOptions[\s\S]*?<\/script>[\s\S]*?<script[^>]*highrevenueformat\.com[\s\S]*?<\/script>/gi,"");
  out=out.replace(/scriptatOptions\s*=\s*[\s\S]*?\/scriptscript\s+src\s*=\s*[\"']?https?:\/\/[^\s\"']*highrevenueformat\.com[^\s\"']*[\"']?\s*\/script/gi,"");
  out=out.replace(/scriptatOptions\s*=\s*[\s\S]*?highrevenueformat\.com[^\s<]*\s*\/script/gi,"");
  out=out.replace(/atOptions\s*=\s*[\s\S]*?highrevenueformat\.com[^\s<]*\s*\/script/gi,"");
  out=out.replace(/<scriptatOptions\s*=\s*[\s\S]*?\/script/gi,"");
  out=out.replace(/No ads\. No account required for the core image resizer\.?/gi,"");
  // Remove the old sanitizer's bare text "script" without touching real <script> tags.
  out=out.replace(/^\s*script\s*/i,"");
  out=out.replace(/(<body[^>]*>)\s*script\s*/i,"$1");
  return out;
}

function injectThree(html,ad){
  if(!ad.enabled||!ad.hasCode)return html;
  const top=canonicalAdsterra(ad.key);
  const middle=canonicalAdsterra(ad.key);
  const bottom=canonicalAdsterra(ad.key);
  let out=html;

  // Top ad: keep it directly inside the main content area when possible.
  if(/<main\b/i.test(out)){
    out=out.replace(/<main([^>]*)>/i,'<main$1>'+top);
  }else if(/<body\b/i.test(out)){
    out=out.replace(/<body([^>]*)>/i,'<body$1>'+top);
  }else{
    out=top+out;
  }

  // Middle ad: place it after the first page heading/subtitle, before the upload/tool area.
  let placedMiddle=false;
  out=out.replace(/(<h1\b[^>]*>[\s\S]*?<\/h1>)([\s\S]*?<p\b[^>]*>[\s\S]*?<\/p>)/i,(m,h,p)=>{placedMiddle=true;return h+p+middle;});
  if(!placedMiddle)out=out.replace(/(<h1\b[^>]*>[\s\S]*?<\/h1>)/i,m=>{placedMiddle=true;return m+middle;});
  if(!placedMiddle&&/<main\b/i.test(out))out=out.replace(/(<main[^>]*>)/i,'$1'+middle);

  // Bottom ad: keep it at the end of the page.
  if(/<\/body>/i.test(out))out=out.replace(/<\/body>/i,bottom+'</body>');
  else out+=bottom;
  return out;
}

export default {async fetch(request,env,ctx){
  const url=new URL(request.url);
  const r=await base.fetch(request,env,ctx);
  if(request.method!=="GET"||url.pathname.startsWith("/api/")||/^\/admin(?:\.html)?\/?$/i.test(url.pathname))return r;
  const ct=r.headers.get("content-type")||"";
  if(!ct.includes("text/html"))return r;
  const ad=await settings(env);
  const html=injectThree(removeAdsterra(await r.text()),ad);
  const h=new Headers(r.headers);h.set("Cache-Control","no-store");h.delete("content-length");
  return new Response(html,{status:r.status,headers:h});
}};
