import base from "./entry-adsterra-fix.js";

const DEFAULT_KEY="b5f10b469c2566d06ff288ac7dc9b5b2";

async function getKey(env){
  try{
    const raw=await env.AKHISAVE_SETTINGS.get("site_settings_extended");
    const x=JSON.parse(raw||"{}")||{},a=x.ads&&typeof x.ads==="object"?x.ads:{},v=a.adsterra&&typeof a.adsterra==="object"?a.adsterra:{};
    const code=String(v.code||a.adsterraCode||a.adCode||"");
    return(code.match(/(?:key\s*['\"]?\s*[:=]\s*['\"]|highrevenueformat\.com\/)([a-z0-9]+)/i)||[])[1]||DEFAULT_KEY;
  }catch{return DEFAULT_KEY}
}

function removeAds(html){
  let out=html;
  out=out.replace(/<div[^>]*(?:data-ak-adsterra|akhisave-ad-adsterra)[^>]*>[\s\S]*?<\/div>/gi,"");
  out=out.replace(/<script[^>]*>[\s\S]*?atOptions[\s\S]*?<\/script>\s*<script[^>]*highrevenueformat\.com[\s\S]*?<\/script>/gi,"");
  out=out.replace(/script\s+atOptions[\s\S]*?(?:\/script|$)/gi,"");
  out=out.replace(/scriptatOptions[\s\S]*?(?:\/script|$)/gi,"");
  out=out.replace(/<script[^>]*highrevenueformat\.com[\s\S]*?<\/script>/gi,"");
  out=out.replace(/atOptions\s*=\s*[\s\S]*?highrevenueformat\.com[\s\S]*?(?:\/script|$)/gi,"");
  out=out.replace(/<scriptatOptions[\s\S]*?(?:\/script|$)/gi,"");
  out=out.replace(/>\s*script\s*</gi,">");
  return out;
}

function ad(key){return `<div class="akhisave-ad akhisave-ad-adsterra" data-ak-adsterra="1" style="width:300px;min-height:250px;margin:18px auto;text-align:center;overflow:hidden"><script>atOptions = { 'key' : '${key}', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };</script><script src="https://www.highrevenueformat.com/${key}/invoke.js"></script></div>`}

function addThree(html,key){
  const top=ad(key),mid=ad(key),bottom=ad(key);let out=html;
  const main=/<main\b([^>]*)>([\s\S]*?)<\/main>/i.exec(out);
  if(main){
    const inner=main[2],target=inner.length*.55,re=/<\/(?:section|article|div)>/gi,positions=[];let m;
    while((m=re.exec(inner)))if(m.index>inner.length*.3&&m.index<inner.length*.75)positions.push(m.index+m[0].length);
    const pos=positions.length?positions.reduce((b,p)=>Math.abs(p-target)<Math.abs(b-target)?p:b,positions[0]):Math.floor(target);
    const withMid=inner.slice(0,pos)+mid+inner.slice(pos);
    out=out.slice(0,main.index)+`<main${main[1]}>${top}${withMid}</main>`+out.slice(main.index+main[0].length);
  }else{
    out=out.replace(/<body([^>]*)>/i,"<body$1>"+top+mid);
  }
  out=out.replace(/<\/body>/i,bottom+"</body>");
  return out;
}

function injectResizerUi(html,path){
  if(path!=="/"&&path!=="/index.html")return html;
  return html.replace(/<\/body>/i,'<script src="/image-resizer-ui-fix.js?v=1"></script></body>');
}

function injectSeo(html,path){
  if(path!=="/"&&path!=="/index.html")return html;
  const title="Free Image Resizer Online – Resize Images Easily | AkhiSave";
  const description="Resize images online for free with AkhiSave. Change image dimensions, lock aspect ratio, preview your image and download the resized image instantly.";
  let out=html;
  out=out.replace(/<title>[\s\S]*?<\/title>/i,`<title>${title}</title>`);
  out=out.replace(/<meta\s+name=["']description["'][^>]*>/i,`<meta name="description" content="${description}">`);
  if(!/name=["']keywords["']/i.test(out))out=out.replace(/<\/head>/i,`<meta name="keywords" content="image resizer, resize image online, free image resizer, image resize online, resize JPG, resize PNG, image dimensions, resize photo online"><meta name="robots" content="index,follow"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="https://akhisave.online/"><meta property="og:type" content="website"><script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"WebApplication","name":"AkhiSave Image Resizer","url":"https://akhisave.online/","description":description,"applicationCategory":"UtilitiesApplication","operatingSystem":"Any","offers":{"@type":"Offer","price":0,"priceCurrency":"USD"}})}</script></head>`);
  return out;
}

function injectResizerSeoScript(html,path){
  if(path!=="/"&&path!=="/index.html")return html;
  return html.replace(/<\/body>/i,'<script src="/image-resizer-seo.js?v=1"></script></body>');
}

function injectBrandCss(html,path){
  if(path.startsWith("/api/")||/^\/admin(?:\.html)?\/?$/i.test(path))return html;
  const css='<style id="ak-public-brand-size">.headin .brand,.navin .brand{margin-right:auto!important}.headin,.navin{justify-content:flex-start!important}.headin .brand img,.navin .brand img{width:280px!important;height:70px!important;max-width:100%!important;object-fit:contain!important;object-position:left center!important}@media(max-width:700px){.headin .brand img,.navin .brand img{width:280px!important;height:70px!important}.headin,.navin{min-height:82px!important}}@media(max-width:430px){.headin .brand img,.navin .brand img{width:280px!important;height:70px!important}}</style>';
  return outInject(html,css);
}
function outInject(html,css){return /<\/head>/i.test(html)?html.replace(/<\/head>/i,css+'</head>'):html.replace(/<body([^>]*)>/i,'<body$1>'+css);}

export default {async fetch(request,env,ctx){
  const url=new URL(request.url);
  const r=await base.fetch(request,env,ctx);
  if(request.method!=="GET")return r;

  if(/^\/admin(?:\.html)?\/?$/i.test(url.pathname)){
    const ct=r.headers.get("content-type")||"";
    if(!ct.includes("text/html"))return r;
    const h=new Headers(r.headers);
    h.delete("content-length");
    h.set("Cache-Control","no-store");
    return new Response(r.body,{status:r.status,headers:h});
  }

  if(url.pathname.startsWith("/api/"))return r;
  const ct=r.headers.get("content-type")||"";
  if(!ct.includes("text/html"))return r;
  const key=await getKey(env),html=removeAds(await r.text()),finalHtml=injectBrandCss(injectResizerSeoScript(injectSeo(injectResizerUi(addThree(html,key),url.pathname),url.pathname),url.pathname),url.pathname);
  const h=new Headers(r.headers);h.delete("content-length");h.set("Cache-Control","no-store");
  return new Response(finalHtml,{status:r.status,headers:h});
}};
