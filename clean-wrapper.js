import app from "./worker-wrapper.js";

const LOGO="/4dc6e410-9139-4401-a2f8-84e67a0a29b2.png";
const ICON="/307a3722-6c83-4b6b-a3fa-a5a840bf5d4b.png";
const WORDMARK="/eb358ee7-8d58-460f-87fa-feb2edd6cd3d.png";
const OLD="/38364009-f822-430a-9f51-694b12b8d9ef.png";

const AD_TOP=`<div class="akhisave-ad-slot akhisave-ad-top" aria-label="Advertisement"><script>atOptions={'key':'b5f10b469c2566d06ff288ac7dc9b5b2','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highrevenueformat.com/b5f10b469c2566d06ff288ac7dc9b5b2/invoke.js"></script></div>`;
const AD_MIDDLE=`<div class="akhisave-ad-slot akhisave-ad-middle" aria-label="Advertisement"><script async="async" data-cfasync="false" src="https://pl31187879.profitableratecpmnetwork.com/70d4c0990517d13f426b27f0fcfc6836/invoke.js"></script><div id="container-70d4c0990517d13f426b27f0fcfc6836"></div></div>`;

function brand(out){
  out=out.replaceAll(OLD,LOGO).replaceAll("/akhisave-mark.svg",ICON);
  out=out.replace(/(<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["'])[^"']+/gi,"$1"+ICON);
  out=out.replace(/(<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["'])[^"']+/gi,"$1"+ICON);
  out=out.replace(/(<a\s+class=["']brand["'][^>]*>)[\s\S]*?(<\/a>)/gi,'$1<img class="akh-brand-combined" src="'+LOGO+'" alt="AkhiSave">$2');
  return out;
}

function publicHtml(out){
  out=brand(out);

  // Public website/result top navigation: use the logo-only and wordmark-only assets separately.
  // Admin uses the combined branding and is intentionally left unchanged.
  out=out.replace(/(<header\s+class=["']nav["'][^>]*>[\s\S]*?<a\s+class=["']brand["'][^>]*>)\s*<img\s+class=["']akh-brand-combined["'][^>]*>\s*(<\/a>)/gi,
    '$1<img class="akh-brand-logo-only" src="'+ICON+'" alt="AkhiSave logo"><img class="akh-brand-wordmark" src="'+WORDMARK+'" alt="AkhiSave">$2');

  const css=`<style id="akhisave-public-ui">
html,body{background:#fff!important;color:#172033!important}body{background-image:none!important}
.nav,.topbar,header{background:#fff!important;color:#172033!important;border-bottom:1px solid #e7ebf2!important;box-shadow:0 1px 10px rgba(20,30,50,.05)!important}.navin,.navin a,.navlinks a{color:#172033!important}.navlinks a:hover{background:#f2f5f9!important;color:#172033!important}
.brand{display:flex!important;align-items:center!important;text-decoration:none!important}.brand .akh-brand-combined{width:170px!important;height:58px!important;object-fit:contain!important;display:block!important;border:0!important;border-radius:0!important}.brand strong,.brand b{display:none!important}
.nav .brand{gap:10px!important}.nav .brand .akh-brand-logo-only{width:48px!important;height:48px!important;object-fit:contain!important;display:block!important;border-radius:0!important;flex:0 0 auto!important}.nav .brand .akh-brand-wordmark{width:112px!important;height:34px!important;object-fit:contain!important;display:block!important;border-radius:0!important;flex:0 0 auto!important}
.hero h1,h1,.heading h2,.section h2,.seo h2,.seo h3,.toolcard b,.feature h3,.step h3,.faq summary{color:#172033!important}.hero>p,.heading p,.step p,.feature p,.faq p,.seo p,.seo li,.msg,.muted{color:#667085!important}
.eyebrow{background:#fff!important;border-color:#e3e8f0!important;color:#526074!important;box-shadow:0 8px 24px rgba(23,32,51,.05)!important}
.searchbox,.toolcard,.step,.feature,.faq,.section,.card,.content-card,.legal-card,.contact-card{background:#fff!important;color:#172033!important;border-color:#dfe5ee!important;box-shadow:0 8px 28px rgba(16,24,40,.06)!important}.searchbox input{color:#172033!important}.searchbox input::placeholder{color:#98a2b3!important}.toolcard small{color:#667085!important}.ico{background:#f2f5ff!important;border-color:#e0e6f0!important}.toolbar .tab{background:#fff!important;color:#344054!important;border-color:#dfe4ec!important}.toolbar .tab.active{background:#eef2ff!important;color:#172033!important;border-color:#765cff!important}
.footer{background:#fff!important;color:#667085!important;border-top:1px solid #e7ebf2!important}.footer a,.foot a,.seo a{color:#172033!important}.footer b{color:#172033!important}
.akhisave-menu{display:none;width:42px;height:42px;border:1px solid #dfe5ee;border-radius:12px;background:#fff;color:#172033;font-size:21px;align-items:center;justify-content:center;box-shadow:0 5px 18px rgba(23,32,51,.08)}
.akhisave-ad-slot{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;max-width:728px!important;margin:18px auto!important;overflow:hidden!important;background:#fff!important;border:0!important;box-shadow:none!important}.akhisave-ad-top{min-height:250px!important}.akhisave-ad-middle{min-height:90px!important}
@media(max-width:650px){.nav{height:66px!important}.navin{position:relative!important;padding:0 12px!important}.nav .brand .akh-brand-logo-only{width:42px!important;height:42px!important}.nav .brand .akh-brand-wordmark{width:96px!important;height:30px!important}.navlinks{display:none!important;position:absolute!important;left:10px!important;right:10px!important;top:66px!important;background:#fff!important;border:1px solid #dfe5ee!important;border-radius:14px!important;padding:7px!important;box-shadow:0 15px 35px rgba(23,32,51,.16)!important;flex-direction:column!important;z-index:9999!important}.navlinks.open{display:flex!important}.navlinks a{padding:11px!important;font-size:12px!important}.akhisave-menu{display:flex!important;position:absolute!important;right:12px!important;top:12px!important;z-index:1000!important}}
</style>`;
  out=out.replace(/<\/head>/i,css+'</head>');
  if(!/<button[^>]+id=["']akhisaveMenu["']/i.test(out)){
    out=out.replace(/(<\/nav>)/i,'$1<button id="akhisaveMenu" class="akhisave-menu" type="button" aria-label="Open menu" aria-expanded="false">☰</button>');
    const js=`<script id="akhisave-menu-js">document.addEventListener('DOMContentLoaded',function(){var b=document.getElementById('akhisaveMenu'),n=document.querySelector('.navlinks');if(!b||!n)return;b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',String(o));});n.addEventListener('click',function(e){if(e.target.closest('a'))n.classList.remove('open');});});</script>`;
    out=out.replace(/<\/body>/i,js+'</body>');
  }
  if(!out.includes('akhisave-ad-top'))out=out.replace(/<\/header>/i,`</header>${AD_TOP}`);
  if(!out.includes('akhisave-ad-middle'))out=out.replace(/<\/main>/i,AD_MIDDLE+'</main>');
  return out;
}

function adminHtml(out){
  out=brand(out);
  const csp=`<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://api.socialkit.dev; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:; media-src 'self' blob: https:; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'">`;
  return out.replace(/<head>/i,'<head>'+csp);
}

async function cleanResponse(response,request){
  const type=response.headers.get('content-type')||'';
  if(!type.includes('text/html'))return response;
  const path=new URL(request.url).pathname;
  const isAdmin=/^\/admin(?:[-_][^/]+)?(?:\.html)?$/i.test(path)||path.startsWith('/admin/');
  let out=await response.text();
  out=isAdmin?adminHtml(out):publicHtml(out);
  const h=new Headers(response.headers);
  h.delete('content-length');
  h.delete('content-encoding');
  h.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');
  h.set('Pragma','no-cache');
  return new Response(out,{status:response.status,statusText:response.statusText,headers:h});
}

export default{async fetch(request,env,ctx){return cleanResponse(await app.fetch(request,env,ctx),request)}};
