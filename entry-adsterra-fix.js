import base from "./entry.js";

const DEFAULT_KEY="b5f10b469c2566d06ff288ac7dc9b5b2";
const SEO_DEFAULTS={title:"Free Online Tools – Image, PDF & Name Generator | AkhiSave",description:"AkhiSave offers free online tools for images, PDFs, name generation and more. Fast, simple tools that work without APIs or account registration.",keywords:"free online tools, image tools, PDF tools, name generator, image resizer, image compressor, image cropper, PDF converter",ogTitle:"Free Online Tools – Image, PDF & Name Generator | AkhiSave",ogDescription:"Free image tools, PDF tools, name generators and more on AkhiSave. Simple online tools without APIs or account registration."};

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

function rewriteSeoObject(d){
  const out={...d};const s={...(out.settings?.seo||{})};
  const legacy=/instagram downloader|download public instagram|instagram photos|instagram reels/i;
  if(legacy.test(String(s.title||"))||!s.title)s.title=SEO_DEFAULTS.title;
  if(legacy.test(String(s.description||"))||!s.description)s.description=SEO_DEFAULTS.description;
  if(legacy.test(String(s.keywords||"))||!s.keywords)s.keywords=SEO_DEFAULTS.keywords;
  if(legacy.test(String(s.ogTitle||"))||!s.ogTitle)s.ogTitle=SEO_DEFAULTS.ogTitle;
  if(legacy.test(String(s.ogDescription||"))||!s.ogDescription)s.ogDescription=SEO_DEFAULTS.ogDescription;
  out.settings={...(out.settings||{}),seo:s};return out;
}

function applySeoHtml(html){
  let out=html;
  out=out.replace(/<title>[\s\S]*?<\/title>/i,`<title>${SEO_DEFAULTS.title}</title>`);
  out=out.replace(/<meta\s+name=["']description["'][^>]*>/i,`<meta name="description" content="${SEO_DEFAULTS.description}">`);
  out=out.replace(/<meta\s+name=["']keywords["'][^>]*>/i,`<meta name="keywords" content="${SEO_DEFAULTS.keywords}">`);
  out=out.replace(/<meta\s+property=["']og:title["'][^>]*>/i,`<meta property="og:title" content="${SEO_DEFAULTS.ogTitle}">`);
  out=out.replace(/<meta\s+property=["']og:description["'][^>]*>/i,`<meta property="og:description" content="${SEO_DEFAULTS.ogDescription}">`);
  return out;
}

function removeAdsterra(html){
  let out=html;
  out=out.replace(/<script[^>]*>[\s\S]*?atOptions[\s\S]*?<\/script>[\s\S]*?<script[^>]*highrevenueformat\.com[\s\S]*?<\/script>/gi,"");
  out=out.replace(/scriptatOptions\s*=\s*[\s\S]*?highrevenueformat\.com[\s\S]*?(?:\/script|$)/gi,"");
  out=out.replace(/atOptions\s*=\s*[\s\S]*?highrevenueformat\.com[\s\S]*?(?:\/script|$)/gi,"");
  out=out.replace(/<scriptatOptions\s*=\s*[\s\S]*?(?:\/script|$)/gi,"");
  out=out.replace(/No ads\. No account required for the core image resizer\.?/gi,"");
  out=out.replace(/>\s*script\s*</gi,"><");
  out=out.replace(/^\s*script\s*/i,"");
  return out;
}

function insertMiddle(html,ad){
  const marker=canonicalAdsterra(ad.key);
  const mainMatch=/<main\b([^>]*)>([\s\S]*?)<\/main>/i.exec(html);
  if(!mainMatch)return html.replace(/<\/body>/i,marker+"</body>");
  const inner=mainMatch[2],target=inner.length*0.55,candidates=[];
  const re=/<\/(?:section|article|div)>/gi;let m;
  while((m=re.exec(inner)))if(m.index>inner.length*0.30&&m.index<inner.length*0.75)candidates.push(m.index+m[0].length);
  let pos=candidates.length?candidates.reduce((best,p)=>Math.abs(p-target)<Math.abs(best-target)?p:best,candidates[0]):Math.floor(target);
  if(!candidates.length){const fallback=inner.indexOf("</div>",Math.floor(target));pos=fallback>=0?fallback+6:inner.length;}
  const nextInner=inner.slice(0,pos)+marker+inner.slice(pos);
  return html.slice(0,mainMatch.index)+`<main${mainMatch[1]}>${nextInner}</main>`+html.slice(mainMatch.index+mainMatch[0].length);
}

function injectThree(html,ad){
  if(!ad.enabled||!ad.hasCode)return html;
  const top=canonicalAdsterra(ad.key),bottom=canonicalAdsterra(ad.key);let out=html;
  if(/<main\b/i.test(out))out=out.replace(/<main([^>]*)>/i,'<main$1>'+top);
  else if(/<body\b/i.test(out))out=out.replace(/<body([^>]*)>/i,'<body$1>'+top);else out=top+out;
  out=insertMiddle(out,ad);
  if(/<\/body>/i.test(out))out=out.replace(/<\/body>/i,bottom+'</body>');else out+=bottom;
  return out;
}

export default {async fetch(request,env,ctx){
  const url=new URL(request.url);
  const body=request.method==='PUT'&&url.pathname==='/api/admin/settings'?await request.clone().json().catch(()=>({})):null;
  const r=await base.fetch(request,env,ctx);
  if(url.pathname==='/api/admin/settings'&&(request.method==='GET'||request.method==='PUT')){
    const ct=r.headers.get('content-type')||'';
    if(ct.includes('application/json')){
      const d=await r.json().catch(()=>null);
      if(d){
        const fixed=rewriteSeoObject(d);
        const outSettings={...(fixed.settings||{})};
        try{
          const raw=await env.AKHISAVE_SETTINGS.get('site_settings');
          const site=JSON.parse(raw||'{}')||{};
          outSettings.maintenance=Boolean(site.maintenance);
          outSettings.announcement=String(site.announcement||'');
        }catch{}
        if(request.method==='PUT'&&body&&env.AKHISAVE_SETTINGS){
          try{
            const raw=await env.AKHISAVE_SETTINGS.get('site_settings');
            const site=JSON.parse(raw||'{}')||{};
            if(Object.prototype.hasOwnProperty.call(body,'maintenance'))site.maintenance=Boolean(body.maintenance);
            if(Object.prototype.hasOwnProperty.call(body,'announcement'))site.announcement=String(body.announcement||'').slice(0,180);
            await env.AKHISAVE_SETTINGS.put('site_settings',JSON.stringify(site));
            outSettings.maintenance=Boolean(site.maintenance);outSettings.announcement=String(site.announcement||'');
          }catch{}
        }
        fixed.settings=outSettings;
        return new Response(JSON.stringify(fixed),{status:r.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
      }
    }
    return r;
  }
  if(request.method==='GET'&&(url.pathname==='/admin'||url.pathname==='/admin.html')){
    const ct=r.headers.get('content-type')||'';
    if(ct.includes('text/html')){
      let html=await r.text();
      if(!html.includes('/admin-dashboard-controls-fix.js'))html=html.replace(/<\/body>/i,'<script src="/admin-dashboard-controls-fix.js?v=1"></script></body>');
      const h=new Headers(r.headers);h.set('Cache-Control','no-store');h.delete('content-length');
      return new Response(html,{status:r.status,headers:h});
    }
    return r;
  }
  if(request.method!=="GET"||url.pathname.startsWith("/api/")||/^\/admin(?:\.html)?\/?$/i.test(url.pathname))return r;
  const ct=r.headers.get("content-type")||"";
  if(!ct.includes("text/html"))return r;
  const ad=await settings(env);
  const html=applySeoHtml(injectThree(removeAdsterra(await r.text()),ad));
  const h=new Headers(r.headers);h.set("Cache-Control","no-store");h.delete("content-length");
  return new Response(html,{status:r.status,headers:h});
}};
