import app from "./worker-wrapper.js";

const LOGO="/4dc6e410-9139-4401-a2f8-84e67a0a29b2.png";
const ICON="/307a3722-6c83-4b6b-a3fa-a5a840bf5d4b.png";
const WORDMARK="/eb358ee7-8d58-460f-87fa-feb2edd6cd3d.png";
const OLD_LOGO="/38364009-f822-430a-9f51-694b12b8d9ef.png";
const BAD_AD=/(monetag|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165)/i;
const BANNER=`<div class="ak-ad ak-ad-banner"><script>atOptions={'key':'b5f10b469c2566d06ff288ac7dc9b5b2','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highrevenueformat.com/b5f10b469c2566d06ff288ac7dc9b5b2/invoke.js"></script></div>`;
const NATIVE=`<div class="ak-ad ak-ad-native"><script async="async" data-cfasync="false" src="https://pl31187879.profitableratecpmnetwork.com/70d4c0990517d13f426b27f0fcfc6836/invoke.js"></script><div id="container-70d4c0990517d13f426b27f0fcfc6836"></div></div>`;

function cleanHtml(html){
  let out=html;
  // Remove the old Monetag notification/IPP/OnClick code only. Keep the requested Adsterra banner/native code.
  out=out.replace(/<script\b[^>]*(?:monetag|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165)[^>]*>[\s\S]*?<\/script>/gi,"");
  out=out.replace(/<iframe\b[^>]*(?:monetag|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com)[^>]*>[\s\S]*?<\/iframe>/gi,"");
  out=out.replace(/<div\b[^>]*(?:class|id)=["'][^"']*(?:social-bar|monetag)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,"");
  out=out.replace(/<div\s+class=["']ad["'][^>]*>[\s\S]*?<\/div>/gi,"");
  out=out.replaceAll(OLD_LOGO,LOGO).replaceAll("/akhisave-mark.svg",ICON);
  out=out.replace(/\s*[·•]\s*Public content only/gi,"");

  // Put the hamburger INSIDE the existing top bar, not as a floating page button.
  const menuBtn=`<button class="ak-menu-btn" id="akMenuBtn" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>`;
  out=out.replace(/(<header\b[^>]*>\s*<div\s+class=["']navin["'][^>]*>)/i,"$1"+menuBtn);
  const menuPanel=`<div class="ak-menu-backdrop" id="akMenuBackdrop"></div><aside class="ak-menu" id="akMenu"><div class="ak-menu-head"><img src="${ICON}" alt="AkhiSave"><b>AkhiSave</b><button id="akMenuClose" aria-label="Close menu">×</button></div><a href="/#tools">Tools</a><a href="/#how">How it works</a><a href="/faq.html">FAQ</a></aside><script>(function(){var b=document.getElementById('akMenuBtn'),m=document.getElementById('akMenu'),x=document.getElementById('akMenuClose'),o=document.getElementById('akMenuBackdrop');if(!b)return;function set(v){document.body.classList.toggle('ak-menu-open',v);b.setAttribute('aria-expanded',String(v))}b.onclick=function(){set(true)};if(x)x.onclick=function(){set(false)};if(o)o.onclick=function(){set(false)};if(m)m.querySelectorAll('a').forEach(function(a){a.onclick=function(){set(false)}})})();</script>`;
  out=out.replace(/<\/body>/i,menuPanel+"</body>");

  // Three clean, non-floating ad placements: top, middle and bottom.
  out=out.replace(/<\/header>/i,"</header>"+BANNER);
  out=out.replace(/<\/main>/i,NATIVE+BANNER+"</main>");
  out=out.replace(/(<footer\b[^>]*>)/i,BANNER+"$1");

  const css=`<style id="akhisave-unified-website-ui">
:root{--ak-bg:#070812;--ak-panel:#0f1422;--ak-text:#f7f8fc;--ak-muted:#8e99ad;--ak-purple:#765cff;--ak-pink:#ff3d91}
html{background:var(--ak-bg)!important;scroll-behavior:smooth}body{background:radial-gradient(900px 500px at 0 -10%,#765cff22,transparent 62%),radial-gradient(800px 500px at 100% 0,#ff3d911b,transparent 62%),var(--ak-bg)!important;color:var(--ak-text)!important;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
header,body>header{position:sticky!important;top:0!important;z-index:100!important;background:#070812e8!important;border-bottom:1px solid #ffffff0b!important;backdrop-filter:blur(20px)!important}header .navin{position:relative!important;min-height:66px!important;padding-right:70px!important}header .brand{display:flex!important;align-items:center!important;text-decoration:none!important}.brand img{content:url('${LOGO}')!important;width:170px!important;height:58px!important;object-fit:contain!important;border-radius:0!important;display:block!important}.brand strong,.brand b{display:none!important}
.navlinks{display:none!important}.back{margin-right:54px!important}
.ak-menu-btn{position:absolute!important;right:12px!important;top:50%!important;transform:translateY(-50%)!important;width:44px!important;height:44px!important;border:1px solid #ffffff12!important;border-radius:12px!important;background:#0e1422!important;color:#fff!important;display:flex!important;flex-direction:column!important;justify-content:center!important;align-items:center!important;gap:5px!important;z-index:120!important;cursor:pointer!important}.ak-menu-btn span{width:20px!important;height:2px!important;border-radius:2px!important;background:#fff!important}.ak-menu-backdrop{position:fixed!important;inset:0!important;background:#0008!important;opacity:0!important;pointer-events:none!important;transition:.2s!important;z-index:150!important}.ak-menu{position:fixed!important;right:14px!important;top:76px!important;width:min(300px,calc(100vw - 28px))!important;padding:12px!important;border:1px solid #ffffff16!important;border-radius:20px!important;background:#0b101d!important;box-shadow:0 25px 80px #000b!important;transform:translateY(-18px)!important;opacity:0!important;pointer-events:none!important;transition:.22s!important;z-index:160!important}.ak-menu-open .ak-menu-backdrop{opacity:1!important;pointer-events:auto!important}.ak-menu-open .ak-menu{transform:translateY(0)!important;opacity:1!important;pointer-events:auto!important}.ak-menu-head{display:flex;align-items:center;gap:10px;padding:6px 6px 12px;border-bottom:1px solid #ffffff0d}.ak-menu-head img{width:38px;height:38px;object-fit:contain}.ak-menu-head b{flex:1;font-size:16px}.ak-menu-head button{border:0;background:transparent;color:#fff;font-size:28px;line-height:1;cursor:pointer}.ak-menu>a{display:block;padding:14px 12px;margin-top:4px;border-radius:12px;color:#aab5c8;text-decoration:none;font-size:13px;font-weight:800}.ak-menu>a:hover{background:#ffffff08;color:#fff}
/* Same homepage background/card language on every public page. */
body:not(:has(.hero)){background:radial-gradient(900px 500px at 0 -10%,#765cff22,transparent 62%),radial-gradient(800px 500px at 100% 0,#ff3d911b,transparent 62%),#070812!important}body:not(:has(.hero)) main{max-width:1080px!important;margin:0 auto!important;padding:54px 18px 70px!important}body:not(:has(.hero)) main h1{font-size:clamp(38px,7vw,58px)!important;line-height:1!important;letter-spacing:-2.5px!important;color:#f7f8fc!important}body:not(:has(.hero)) main h2{color:#f7f8fc!important}body:not(:has(.hero)) main p,body:not(:has(.hero)) main li{color:#8e99ad!important;line-height:1.8!important}body:not(:has(.hero)) .card,body:not(:has(.hero)) .faq{background:linear-gradient(155deg,#111a2b,#0c121f)!important;border:1px solid #ffffff0d!important;border-radius:18px!important;color:#f7f8fc!important}body:not(:has(.hero)) .btn{background:linear-gradient(135deg,#765cff,#ff3d91)!important;color:#fff!important}footer{background:transparent!important;color:#667287!important;border-top:1px solid #ffffff0b!important}
/* Ads are normal flow blocks, never fixed and never notification overlays. */
.ak-ad{width:100%;display:flex;justify-content:center;align-items:center;overflow:hidden;margin:22px auto;min-height:50px;position:relative;z-index:1}.ak-ad-banner{min-height:250px;max-width:300px}.ak-ad-native{max-width:720px;min-height:250px}.ak-ad-native>div{width:100%}.ak-ad script{max-width:100%}
/* Remove only old empty ad placeholders. */
.ad{display:none!important}
@media(max-width:650px){header .navin{min-height:66px!important;padding:0 64px 0 12px!important}.brand img{width:150px!important;height:52px!important}.ak-menu-btn{right:12px!important}.ak-menu{top:72px!important;right:10px!important}body:not(:has(.hero)) main{padding:40px 13px 55px!important}body:not(:has(.hero)) main h1{font-size:40px!important}.ak-ad{margin:16px auto}.ak-ad-banner{width:300px!important;min-height:250px!important}.ak-ad-native{width:100%!important;min-height:250px!important}}
</style>`;
  out=out.replace(/<\/head>/i,css+"</head>");
  return out;
}

async function cleanResponse(response){
  const type=response.headers.get("content-type")||"";
  if(!type.includes("text/html"))return response;
  const out=cleanHtml(await response.text());
  const headers=new Headers(response.headers);
  headers.delete("content-length");headers.delete("content-encoding");
  headers.set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0");headers.set("Pragma","no-cache");
  return new Response(out,{status:response.status,statusText:response.statusText,headers});
}

export default{async fetch(request,env,ctx){const u=new URL(request.url);if(u.pathname.startsWith('/admin'))return app.fetch(request,env,ctx);return cleanResponse(await app.fetch(request,env,ctx))}};
