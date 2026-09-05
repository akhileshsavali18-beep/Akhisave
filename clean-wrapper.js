import app from "./worker-wrapper.js";

const ICON="/307a3722-6c83-4b6b-a3fa-a5a840bf5d4b.png";
const WORDMARK="/eb358ee7-8d58-460f-87fa-feb2edd6cd3d.png";
const COMBINED="/4dc6e410-9139-4401-a2f8-84e67a0a29b2.png";
const OLD="/38364009-f822-430a-9f51-694b12b8d9ef.png";
const AD_HOSTS=/(monetag|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com)/i;
const AD_IDS=/(11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165)/i;
const ADSTERra=`<div class="ak-adsterra"><script>atOptions={'key':'b5f10b469c2566d06ff288ac7dc9b5b2','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highrevenueformat.com/b5f10b469c2566d06ff288ac7dc9b5b2/invoke.js"></script></div>`;

function cleanHtml(html,path){
  let out=html;
  out=out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,(tag)=>AD_HOSTS.test(tag)||AD_IDS.test(tag)?"":tag);
  out=out.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi,(tag)=>AD_HOSTS.test(tag)||AD_IDS.test(tag)?"":tag);
  out=out.replace(/<iframe\b[^>]*\/?\s*>/gi,(tag)=>AD_HOSTS.test(tag)||AD_IDS.test(tag)?"":tag);
  out=out.replace(/<(?:object|embed)\b[^>]*>[\s\S]*?<\/(?:object|embed)>/gi,"");
  out=out.replace(/<div\b[^>]*(?:class|id)=["'][^"']*(?:monetag|social[-_ ]?bar|adsterra|ad[-_ ]?(?:banner|slot|container)|advertisement)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,(tag)=>/ak-adsterra/i.test(tag)?tag:"");
  out=out.replace(/<div\b[^>]*id=["']container-70d4c0990517d13f426b27f0fcfc6836["'][^>]*>[\s\S]*?<\/div>/gi,"");

  out=out.replaceAll(OLD,COMBINED).replaceAll("/akhisave-mark.svg",ICON);
  out=out.replace(/(<a\s+class=["']brand["'][^>]*>)[\s\S]*?<\/a>/gi,
    `$1<img class="ak-brand-icon" src="${ICON}" alt="AkhiSave logo"><img class="ak-brand-word" src="${WORDMARK}" alt="AkhiSave"></a>`);
  out=out.replace(/(<header\b[^>]*>\s*)<a\b[^>]*href=["'][^"']*(?:akhisave\.online|\/)["'][^>]*>[\s\S]*?<\/a>/i,
    `$1<a class="ak-page-brand" href="/" aria-label="AkhiSave home"><img class="ak-brand-icon" src="${ICON}" alt="AkhiSave logo"><img class="ak-brand-word" src="${WORDMARK}" alt="AkhiSave"></a>`);
  out=out.replace(/Public content only/gi,"");

  const css=`<style id="akhisave-clean-brand-ads">
html,body{background:#070812!important;color:#f7f8fc!important}
body{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
.brand{display:flex!important;align-items:center!important;gap:10px!important;text-decoration:none!important;min-width:0!important}
.brand .ak-brand-icon,.ak-brand-icon{width:48px!important;height:48px!important;object-fit:contain!important;display:block!important;border-radius:0!important;flex:0 0 auto!important}
.brand .ak-brand-word,.ak-brand-word{width:112px!important;height:34px!important;object-fit:contain!important;display:block!important;border-radius:0!important;flex:0 0 auto!important}
header.nav{background:#070812ee!important;border-bottom:1px solid #ffffff0b!important;backdrop-filter:blur(20px)!important}
.ak-page-brand{display:flex!important;align-items:center!important;gap:10px!important;text-decoration:none!important;justify-content:flex-end!important}
.ak-page-brand .ak-brand-icon{width:48px!important;height:48px!important}.ak-page-brand .ak-brand-word{width:112px!important;height:34px!important}
main,.card,.content,.panel,.container,section{background:transparent!important;color:#f7f8fc!important}
.card{border-color:#ffffff12!important;box-shadow:0 20px 70px #0006!important}
p,li{color:#929caf!important}h1,h2,h3,h4{color:#f7f8fc!important}.notice{background:#12182a!important;color:#aab5c8!important;border:1px solid #ffffff0d!important}.back,a{color:#c5b8ff!important}
footer{background:#070812!important;color:#667287!important;border-top:1px solid #ffffff0b!important}
.akhisave-ad-banner,.akhisave-ad-slot,.ak-ad,.ak-ad-banner,.ak-ad-native,.ad,.ad-banner,.ad-slot,.social-bar,[id*="ad-"]{display:none!important;width:0!important;height:0!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important}
.ak-adsterra{width:300px;min-height:250px;margin:18px auto;display:flex;align-items:center;justify-content:center;overflow:hidden}
.akhisave-menu{display:none;position:relative;width:42px;height:42px;border:1px solid #ffffff18;background:#111827;color:#fff;border-radius:12px;font-size:22px;line-height:1;flex:0 0 auto}
.akhisave-menu-lines,.akhisave-menu-lines:before,.akhisave-menu-lines:after{display:block;width:18px;height:2px;background:currentColor;position:absolute;left:11px;top:19px;content:""}.akhisave-menu-lines:before{left:0;top:-6px}.akhisave-menu-lines:after{left:0;top:6px}
.akhisave-drawer{display:none;position:fixed;top:76px;right:12px;z-index:9999;width:210px;padding:10px;background:#0f1422;border:1px solid #ffffff16;border-radius:16px;box-shadow:0 20px 60px #0009}.akhisave-drawer.open{display:block}.akhisave-drawer a{display:block;padding:11px 12px;color:#d8deea!important;text-decoration:none;font-size:12px;font-weight:800;border-radius:10px}.akhisave-drawer a:hover{background:#ffffff08}
@media(max-width:650px){.brand{gap:8px!important}.brand .ak-brand-icon,.ak-page-brand .ak-brand-icon{width:42px!important;height:42px!important}.brand .ak-brand-word,.ak-page-brand .ak-brand-word{width:96px!important;height:30px!important}.ak-page-brand{gap:8px!important}.akhisave-menu{display:block}.navlinks{display:none!important}.akhisave-drawer{top:60px}}
</style>`;
  out=out.replace(/<\/head>/i,css+"</head>");

  // Exactly three Adsterra banner placements: top, middle and bottom.
  out=out.replace(/<header([^>]*)>/i,`<header$1>${ADSTERra}`);
  out=out.replace(/(<\/section>)/i,`$1${ADSTERra}`);
  out=out.replace(/<\/footer>/i,`${ADSTERra}</footer>`);

  // Hamburger on the right side of the public top bar.
  out=out.replace(/(<div class="navin"[^>]*>)([\s\S]*?)(<\/div>\s*<\/header>)/i,'$1$2<button class="akhisave-menu" type="button" aria-label="Menu" onclick="document.getElementById(\'akhisaveDrawer\').classList.toggle(\'open\')"><span class="akhisave-menu-lines"></span></button>$3');
  out=out.replace(/<\/body>/i,`<div id="akhisaveDrawer" class="akhisave-drawer"><a href="/">Home</a><a href="/#tools">Tools</a><a href="/#how">How it works</a><a href="/faq.html">FAQ</a><a href="/contact.html">Contact</a><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="/dmca.html">DMCA</a></div></body>`);
  return out;
}

async function cleanResponse(response,request){
  const type=response.headers.get("content-type")||"";
  if(!type.includes("text/html"))return response;
  const path=new URL(request.url).pathname;
  const out=cleanHtml(await response.text(),path);
  const headers=new Headers(response.headers);
  headers.delete("content-length");headers.delete("content-encoding");
  headers.set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0");
  headers.set("Pragma","no-cache");
  headers.set("Content-Security-Policy","default-src 'self'; script-src 'self' 'unsafe-inline' https://www.highrevenueformat.com; style-src 'self' 'unsafe-inline' https:; img-src 'self' https: data: blob:; media-src 'self' https: data: blob:; connect-src 'self' https://api.socialkit.dev; frame-src https://*.highrevenueformat.com https://www.highrevenueformat.com; object-src 'none'; base-uri 'self'; form-action 'self'");
  return new Response(out,{status:response.status,statusText:response.statusText,headers});
}

export default{async fetch(request,env,ctx){const u=new URL(request.url);if(u.pathname.startsWith('/admin'))return app.fetch(request,env,ctx);return cleanResponse(await app.fetch(request,env,ctx),request)}};
