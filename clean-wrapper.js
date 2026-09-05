import app from "./worker-wrapper.js";

const LOGO_ONLY="/akhisave-icon.svg";
const COMBINED_LOGO="/akhisave-logo.svg";
const WORDMARK="/akhisave-logo.svg";
const OLD_LOGO="/38364009-f822-430a-9f51-694b12b8d9ef.png";
const MISSING_LOGO="/307a3722-6c83-4b6b-a3fa-a5a840bf5d4b.png";
const MISSING_WORDMARK="/eb358ee7-8d58-460f-87fa-feb2edd6cd3d.png";
const MISSING_COMBINED="/4dc6e410-9139-4401-a2f8-84e67a0a29b2.png";
const BAD_AD=/(monetag|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|profitableratecpmnetwork|highrevenueformat|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165)/i;

function cleanHtml(html){
  let out=html;

  // Remove every known ad-network script/iframe/container from the HTML.
  out=out.replace(/<script\b[^>]*(?:monetag|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|profitableratecpmnetwork|highrevenueformat|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165)[^>]*>[\s\S]*?<\/script>/gi,"");
  out=out.replace(/<iframe\b[^>]*(?:profitableratecpmnetwork|highrevenueformat|monetag|nap5k\.com)[^>]*>[\s\S]*?<\/iframe>/gi,"");
  out=out.replace(/<div\b[^>]*(?:class|id)=["'][^"']*(?:ad-banner|ad-slot|advertisement|social-bar|monetag|adsterra)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,"");
  out=out.replace(/<div\s+class=["']ad["'][^>]*>[\s\S]*?<\/div>/gi,"");

  // All legacy/missing logo references now point to assets that are actually in the repo.
  out=out.replaceAll(OLD_LOGO,COMBINED_LOGO);
  out=out.replaceAll(MISSING_COMBINED,COMBINED_LOGO);
  out=out.replaceAll(MISSING_LOGO,LOGO_ONLY);
  out=out.replaceAll(MISSING_WORDMARK,WORDMARK);
  out=out.replaceAll("/akhisave-mark.svg",LOGO_ONLY);

  // Website top bar: one combined logo + name, matching the earlier stable layout.
  out=out.replace(/(<a\s+class=["']brand["'][^>]*>)[\s\S]*?<\/a>/gi,
    '$1<img class="brand-combined" src="'+COMBINED_LOGO+'" alt="AkhiSave"> </a>');

  const css=`<style id="akhisave-stable-brand-and-no-ads">
.brand{display:flex!important;align-items:center!important;text-decoration:none!important;min-width:0!important}
.brand .brand-combined{width:170px!important;height:58px!important;object-fit:contain!important;display:block!important;border-radius:0!important}
.brand strong,.brand b,.brand-logo-only,.brand-wordmark{display:none!important}
.loginbox .logo,#loginView .logo{content:url('${LOGO_ONLY}')!important;width:72px!important;height:72px!important;object-fit:contain!important;border-radius:0!important}
.footer-brand{content:url('${WORDMARK}')!important;width:110px!important;height:28px!important;object-fit:contain!important;border-radius:0!important}
.akhisave-ad-banner,.akhisave-ad-slot,.ad,.ad-banner,.ad-slot,.social-bar,[id*="ad-"]{display:none!important}
@media(max-width:650px){.brand .brand-combined{width:145px!important;height:52px!important}}
</style>`;
  out=out.replace(/<\/head>/i,css+"</head>");

  // Browser-side guard: even dynamically injected ad code cannot display.
  const guard=`<script id="akhisave-ad-cleaner">(function(){const bad=${BAD_AD.toString()};function clean(){document.querySelectorAll('script,iframe,object,embed').forEach(function(e){const s=(e.src||'')+' '+(e.data||'')+' '+(e.textContent||'')+' '+(e.outerHTML||'');if(bad.test(s))e.remove()});document.querySelectorAll('[id],[class]').forEach(function(e){const s=String((e.id||'')+' '+(e.className||''));if(/(?:monetag|social[-_ ]?bar|ad[-_ ]?(?:banner|slot|container))/i.test(s))e.remove()})}clean();new MutationObserver(clean).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','id','class']})})()</script>`;
  out=out.replace(/<\/body>/i,guard+"</body>");
  return out;
}

async function cleanResponse(response){
  const type=response.headers.get("content-type")||"";
  if(!type.includes("text/html"))return response;
  const out=cleanHtml(await response.text());
  const headers=new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");
  headers.set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0");
  headers.set("Pragma","no-cache");
  headers.set("Content-Security-Policy","default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' blob: https:; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'");
  return new Response(out,{status:response.status,statusText:response.statusText,headers});
}

export default{async fetch(request,env,ctx){return cleanResponse(await app.fetch(request,env,ctx))}};
