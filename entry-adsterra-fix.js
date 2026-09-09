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
  // Remove normal Adsterra script pairs produced by the old entry.js.
  out=out.replace(/<script[^>]*>[\s\S]*?atOptions[\s\S]*?<\/script>[\s\S]*?<script[^>]*highrevenueformat\.com[\s\S]*?<\/script>/gi,"");
  // Remove the old sanitizer's malformed, visible Adsterra text.
  out=out.replace(/scriptatOptions\s*=\s*[\s\S]*?highrevenueformat\.com[\s\S]*?(?:\/script|$)/gi,"");
  out=out.replace(/atOptions\s*=\s*[\s\S]*?highrevenueformat\.com[\s\S]*?(?:\/script|$)/gi,"");
  out=out.replace(/<scriptatOptions\s*=\s*[\s\S]*?(?:\/script|$)/gi,"");
  out=out.replace(/No ads\. No account required for the core image resizer\.?/gi,"");
  // The old sanitizer can leave a bare text node containing only "script".
  out=out.replace(/>\s*script\s*</gi,"><");
  out=out.replace(/^\s*script\s*/i,"");
  return out;
}

function insertMiddle(html,ad){
  const marker=canonicalAdsterra(ad.key);
  const mainMatch=/<main\b([^>]*)>([\s\S]*?)<\/main>/i.exec(html);
  if(!mainMatch)return html.replace(/<\/body>/i,marker+"</body>");
  const inner=mainMatch[2];
  // Pick a structural closing tag around the visual midpoint instead of putting
  // the middle ad immediately below the heading/subtitle.
  const target=inner.length*0.55;
  const candidates=[];
  const re=/<\/(?:section|article|div)>/gi;
  let m;
  while((m=re.exec(inner))){
    if(m.index>inner.length*0.30 && m.index<inner.length*0.75)candidates.push(m.index+m[0].length);
  }
  let pos=candidates.length?candidates.reduce((best,p)=>Math.abs(p-target)<Math.abs(best-target)?p:best,candidates[0]):Math.floor(target);
  if(!candidates.length){
    const fallback=inner.indexOf("</div>",Math.floor(target));
    if(fallback>=0)pos=fallback+6;
    else pos=inner.length;
  }
  const nextInner=inner.slice(0,pos)+marker+inner.slice(pos);
  return html.slice(0,mainMatch.index)+`<main${mainMatch[1]}>${nextInner}</main>`+html.slice(mainMatch.index+mainMatch[0].length);
}

function injectThree(html,ad){
  if(!ad.enabled||!ad.hasCode)return html;
  const top=canonicalAdsterra(ad.key);
  const bottom=canonicalAdsterra(ad.key);
  let out=html;

  // Exactly one top ad, immediately inside the main content area.
  if(/<main\b/i.test(out))out=out.replace(/<main([^>]*)>/i,'<main$1>'+top);
  else if(/<body\b/i.test(out))out=out.replace(/<body([^>]*)>/i,'<body$1>'+top);
  else out=top+out;

  // Exactly one middle ad, around the visual midpoint of the tool content.
  out=insertMiddle(out,ad);

  // Exactly one bottom ad, at the end of the page.
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
