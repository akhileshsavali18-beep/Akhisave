import app from "./worker-wrapper.js";

const ICON="/307a3722-6c83-4b6b-a3fa-a5a840bf5d4b.png";
const WORDMARK="/eb358ee7-8d58-460f-87fa-feb2edd6cd3d.png";
const COMBINED="/4dc6e410-9139-4401-a2f8-84e67a0a29b2.png";
const OLD="/38364009-f822-430a-9f51-694b12b8d9ef.png";
const AD_HOSTS=/(monetag|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|profitableratecpmnetwork\.com|highrevenueformat\.com)/i;
const AD_IDS=/(11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165|70d4c0990517d13f426b27f0fcfc6836|b5f10b469c2566d06ff288ac7dc9b5b2)/i;

function cleanHtml(html,path){
  let out=html;
  // Remove every known ad-network script, iframe and container before the browser receives the page.
  out=out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,(tag)=>AD_HOSTS.test(tag)||AD_IDS.test(tag)?"":tag);
  out=out.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi,"");
  out=out.replace(/<iframe\b[^>]*\/?\s*>/gi,"");
  out=out.replace(/<(?:object|embed)\b[^>]*>[\s\S]*?<\/(?:object|embed)>/gi,"");
  out=out.replace(/<div\b[^>]*(?:class|id)=["'][^"']*(?:monetag|social[-_ ]?bar|adsterra|ad[-_ ]?(?:banner|slot|container)|advertisement)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,"");
  out=out.replace(/<div\b[^>]*id=["']container-70d4c0990517d13f426b27f0fcfc6836["'][^>]*>[\s\S]*?<\/div>/gi,"");

  // Branding: never use the old combined asset. Website top brand is icon + wordmark separately.
  out=out.replaceAll(OLD,COMBINED).replaceAll("/akhisave-mark.svg",ICON);
  out=out.replace(/(<a\s+class=["']brand["'][^>]*>)[\s\S]*?<\/a>/gi,
    `$1<img class="ak-brand-icon" src="${ICON}" alt="AkhiSave logo"><img class="ak-brand-word" src="${WORDMARK}" alt="AkhiSave"></a>`);
  // Inner/legal pages that have a simple header link get the same separate branding.
  out=out.replace(/(<header\b[^>]*>\s*)<a\b[^>]*href=["'][^"']*(?:akhisave\.online|\/)["'][^>]*>[\s\S]*?<\/a>/i,
    `$1<a class="ak-page-brand" href="/" aria-label="AkhiSave home"><img class="ak-brand-icon" src="${ICON}" alt="AkhiSave logo"><img class="ak-brand-word" src="${WORDMARK}" alt="AkhiSave"></a>`);
  out=out.replace(/Public content only/gi,"");

  const css=`<style id="akhisave-clean-brand-and-no-ads">
html,body{background:#070812!important;color:#f7f8fc!important}
body{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
.brand{display:flex!important;align-items:center!important;gap:10px!important;text-decoration:none!important;min-width:0!important}
.brand .ak-brand-icon,.ak-brand-icon{width:48px!important;height:48px!important;object-fit:contain!important;display:block!important;border-radius:0!important;flex:0 0 auto!important}
.brand .ak-brand-word,.ak-brand-word{width:112px!important;height:34px!important;object-fit:contain!important;display:block!important;border-radius:0!important;flex:0 0 auto!important}
header.nav{background:#070812ee!important;border-bottom:1px solid #ffffff0b!important;backdrop-filter:blur(20px)!important}
.ak-page-brand{display:flex!important;align-items:center!important;gap:10px!important;text-decoration:none!important;justify-content:flex-end!important}
.ak-page-brand .ak-brand-icon{width:48px!important;height:48px!important}.ak-page-brand .ak-brand-word{width:112px!important;height:34px!important}
/* Inner pages use the same dark visual language as the home page. */
main,.card,.content,.panel,.container,section{background:transparent!important;color:#f7f8fc!important}
.card{border-color:#ffffff12!important;box-shadow:0 20px 70px #0006!important}
p,li{color:#929caf!important}h1,h2,h3,h4{color:#f7f8fc!important}.notice{background:#12182a!important;color:#aab5c8!important;border:1px solid #ffffff0d!important}.back,a{color:#c5b8ff!important}
footer{background:#070812!important;color:#667287!important;border-top:1px solid #ffffff0b!important}
.navlinks{display:flex!important}
.akhisave-ad-banner,.akhisave-ad-slot,.ak-ad,.ak-ad-banner,.ak-ad-native,.ad,.ad-banner,.ad-slot,.social-bar,[id*="ad-"]{display:none!important;width:0!important;height:0!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important}
@media(max-width:650px){.brand{gap:8px!important}.brand .ak-brand-icon,.ak-page-brand .ak-brand-icon{width:42px!important;height:42px!important}.brand .ak-brand-word,.ak-page-brand .ak-brand-word{width:96px!important;height:30px!important}.ak-page-brand{gap:8px!important}}
</style>`;
  out=out.replace(/<\/head>/i,css+"</head>");

  // Runtime safety net: block known ad nodes/scripts even if a page script tries to add them later.
  const guard=`<script id="akhisave-ad-blocker">(function(){var host=${AD_HOSTS.toString()},ids=${AD_IDS.toString()};function bad(e){var s=e?((e.src||'')+' '+(e.textContent||'')+' '+(e.outerHTML||'')+' '+(e.id||'')+' '+(e.className||'')):'';return host.test(s)||ids.test(s)}function clean(){document.querySelectorAll('script,iframe,object,embed').forEach(function(e){if(bad(e))e.remove()});document.querySelectorAll('[id],[class]').forEach(function(e){if(bad(e))e.remove()})}var ap=Node.prototype.appendChild,ib=Node.prototype.insertBefore;Node.prototype.appendChild=function(n){if(bad(n))return n;return ap.call(this,n)};Node.prototype.insertBefore=function(n,r){if(bad(n))return n;return ib.call(this,n,r)};clean();new MutationObserver(clean).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','id','class']})})();</script>`;
  out=out.replace(/<\/body>/i,guard+"</body>");
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
  // No third-party frames/scripts: this is the final ad kill-switch. SocialKit API remains available through fetch.
  headers.set("Content-Security-Policy","default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https:; img-src 'self' https: data: blob:; media-src 'self' https: data: blob:; connect-src 'self' https://api.socialkit.dev; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'");
  return new Response(out,{status:response.status,statusText:response.statusText,headers});
}

export default{async fetch(request,env,ctx){const u=new URL(request.url);if(u.pathname.startsWith('/admin'))return app.fetch(request,env,ctx);return cleanResponse(await app.fetch(request,env,ctx),request)}};
