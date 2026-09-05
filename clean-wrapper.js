import app from "./worker-wrapper.js";

const LOGO="/4dc6e410-9139-4401-a2f8-84e67a0a29b2.png";
const ICON="/307a3722-6c83-4b6b-a3fa-a5a840bf5d4b.png";
const WORDMARK="/eb358ee7-8d58-460f-87fa-feb2edd6cd3d.png";
const OLD_LOGO="/38364009-f822-430a-9f51-694b12b8d9ef.png";
const BAD_AD=/(monetag|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|profitableratecpmnetwork|highrevenueformat|adsterra|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165)/i;

function cleanHtml(html){
  let out=html;
  out=out.replace(/<script\b[^>]*(?:monetag|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|profitableratecpmnetwork|highrevenueformat|adsterra|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165)[^>]*>[\s\S]*?<\/script>/gi,"");
  out=out.replace(/<iframe\b[^>]*(?:monetag|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|profitableratecpmnetwork|highrevenueformat|adsterra)[^>]*>[\s\S]*?<\/iframe>/gi,"");
  out=out.replace(/<div\b[^>]*(?:class|id)=["'][^"']*(?:ad-banner|ad-slot|advertisement|social-bar|monetag|adsterra|container-70d4c0990517d13f426b27f0fcfc6836)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,"");
  out=out.replace(/<div\s+class=["']ad["'][^>]*>[\s\S]*?<\/div>/gi,"");
  out=out.replaceAll(OLD_LOGO,LOGO).replaceAll("/akhisave-mark.svg",ICON);
  out=out.replace(/\s*[·•]\s*Public content only/gi,"");

  const menu=`<button class="ak-menu-btn" id="akMenuBtn" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button><div class="ak-menu-backdrop" id="akMenuBackdrop"></div><aside class="ak-menu" id="akMenu"><div class="ak-menu-head"><img src="${ICON}" alt="AkhiSave"><b>AkhiSave</b><button id="akMenuClose" aria-label="Close menu">×</button></div><a href="/#tools">Tools</a><a href="/#how">How it works</a><a href="/faq.html">FAQ</a></aside>`;
  out=out.replace(/<\/body>/i,menu+`<script>(function(){var b=document.getElementById('akMenuBtn'),m=document.getElementById('akMenu'),x=document.getElementById('akMenuClose'),o=document.getElementById('akMenuBackdrop');if(!b)return;function set(v){document.body.classList.toggle('ak-menu-open',v);b.setAttribute('aria-expanded',String(v))}b.onclick=function(){set(true)};if(x)x.onclick=function(){set(false)};if(o)o.onclick=function(){set(false)};m&&m.querySelectorAll('a').forEach(function(a){a.onclick=function(){set(false)}})})();</script></body>`);

  const css=`<style id="akhisave-unified-website-ui">
:root{--ak-bg:#070812;--ak-panel:#0f1422;--ak-line:#ffffff12;--ak-text:#f7f8fc;--ak-muted:#8e99ad;--ak-purple:#765cff;--ak-pink:#ff3d91}
html{background:var(--ak-bg)!important;scroll-behavior:smooth}body{background:radial-gradient(900px 500px at 0 -10%,#765cff22,transparent 62%),radial-gradient(800px 500px at 100% 0,#ff3d911b,transparent 62%),var(--ak-bg)!important;color:var(--ak-text)!important;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
header,body>header{position:relative!important;background:#070812e8!important;border-bottom:1px solid #ffffff0b!important;color:var(--ak-text)!important;backdrop-filter:blur(20px)}
header .brand{display:flex!important;align-items:center!important;text-decoration:none!important}.brand img{content:url('${LOGO}')!important;width:170px!important;height:58px!important;object-fit:contain!important;border-radius:0!important;display:block!important}.brand strong{display:none!important}
/* Sub-pages use the same approved combined brand in their header. */
body:not(:has(.hero)) header .brand,body:not(:has(.hero)) header a[href="https://akhisave.online/"]{font-size:0!important;width:170px!important;height:58px!important;background:url('${LOGO}') center/contain no-repeat!important;color:transparent!important}
body:not(:has(.hero)) header .brand img,body:not(:has(.hero)) header a[href="https://akhisave.online/"] img{display:none!important}
.navlinks{display:none!important}
.ak-menu-btn{position:absolute;right:16px;top:50%;transform:translateY(-50%);width:44px;height:44px;border:1px solid #ffffff12;border-radius:12px;background:#0e1422;color:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:5px;z-index:120;cursor:pointer}.ak-menu-btn span{width:20px;height:2px;border-radius:2px;background:#fff}.ak-menu-backdrop{position:fixed;inset:0;background:#0008;opacity:0;pointer-events:none;transition:.2s;z-index:150}.ak-menu{position:fixed;right:14px;top:14px;width:min(300px,calc(100vw - 28px));padding:12px;border:1px solid #ffffff16;border-radius:20px;background:#0b101d;box-shadow:0 25px 80px #000b;transform:translateY(-18px);opacity:0;pointer-events:none;transition:.22s;z-index:160}.ak-menu-open .ak-menu-backdrop{opacity:1;pointer-events:auto}.ak-menu-open .ak-menu{transform:translateY(0);opacity:1;pointer-events:auto}.ak-menu-head{display:flex;align-items:center;gap:10px;padding:6px 6px 12px;border-bottom:1px solid #ffffff0d}.ak-menu-head img{width:38px;height:38px;object-fit:contain}.ak-menu-head b{flex:1;font-size:16px}.ak-menu-head button{border:0;background:transparent;color:#fff;font-size:28px;line-height:1;cursor:pointer}.ak-menu>a{display:block;padding:14px 12px;margin-top:4px;border-radius:12px;color:#aab5c8;text-decoration:none;font-size:13px;font-weight:800}.ak-menu>a:hover{background:#ffffff08;color:#fff}
.akhisave-ad-banner,.akhisave-ad-slot,.ad,.ad-banner,.ad-slot,.social-bar,[id*="ad-"]{display:none!important}
footer{background:transparent!important;color:#667287!important;border-top:1px solid #ffffff0b!important}footer a{color:#8b96aa!important}
/* All public sub-pages inherit the homepage dark gradient/card language. */
body:not(:has(.hero)) main{max-width:900px!important;margin:0 auto!important;padding:54px 18px 70px!important}body:not(:has(.hero)) main h1{font-size:clamp(38px,7vw,58px)!important;line-height:1!important;letter-spacing:-2.5px!important;color:#f7f8fc!important}body:not(:has(.hero)) main h1 span{background:linear-gradient(100deg,#fff,#bcaeff 42%,#ff6fa9 72%,#ffc37d)!important;-webkit-background-clip:text!important;color:transparent!important}body:not(:has(.hero)) main h2{color:#f7f8fc!important;font-size:20px!important}body:not(:has(.hero)) main p,body:not(:has(.hero)) main li{color:#8e99ad!important;font-size:13px!important;line-height:1.8!important}body:not(:has(.hero)) .card,body:not(:has(.hero)) .faq{background:linear-gradient(155deg,#111a2b,#0c121f)!important;border:1px solid #ffffff0d!important;border-radius:18px!important;box-shadow:none!important;color:#f7f8fc!important}body:not(:has(.hero)) .back{color:#c5b8ff!important}body:not(:has(.hero)) .notice{background:#765cff12!important;color:#aab5c8!important;border:1px solid #765cff25!important}body:not(:has(.hero)) .btn{background:linear-gradient(135deg,#765cff,#ff3d91)!important;color:#fff!important}
/* FAQ also uses the homepage spacing and typography. */
@media(max-width:650px){.brand img{width:150px!important;height:52px!important}.ak-menu-btn{right:12px}.nav{height:66px}.navin{padding-right:64px!important}.ak-menu{top:10px;right:10px}body:not(:has(.hero)) main{padding:40px 13px 55px!important}body:not(:has(.hero)) main h1{font-size:40px!important}body:not(:has(.hero)) header .brand,body:not(:has(.hero)) header a[href="https://akhisave.online/"]{width:150px!important;height:52px!important}}
</style>`;
  out=out.replace(/<\/head>/i,css+"</head>");

  const guard=`<script id="akhisave-ad-cleaner">(function(){const bad=${BAD_AD.toString()};function clean(){document.querySelectorAll('script,iframe').forEach(function(e){const s=(e.src||'')+' '+(e.textContent||'')+' '+(e.outerHTML||'');if(bad.test(s))e.remove()});document.querySelectorAll('iframe').forEach(function(e){e.remove()});document.querySelectorAll('[id],[class]').forEach(function(e){const s=String((e.id||'')+' '+(e.className||''));if(/(?:monetag|social[-_ ]?bar|ad[-_ ]?(?:banner|slot|container)|adsterra)/i.test(s))e.remove()})}clean();new MutationObserver(clean).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','id','class']})})()</script>`;
  out=out.replace(/<\/body>/i,guard+"</body>");
  return out;
}

async function cleanResponse(response){
  const type=response.headers.get("content-type")||"";
  if(!type.includes("text/html"))return response;
  const out=cleanHtml(await response.text());
  const headers=new Headers(response.headers);
  headers.delete("content-length");headers.delete("content-encoding");
  headers.set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0");headers.set("Pragma","no-cache");
  headers.set("Content-Security-Policy","default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; media-src 'self' https: blob:; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'");
  return new Response(out,{status:response.status,statusText:response.statusText,headers});
}

export default{async fetch(request,env,ctx){const u=new URL(request.url);if(u.pathname.startsWith('/admin'))return app.fetch(request,env,ctx);return cleanResponse(await app.fetch(request,env,ctx))}};
