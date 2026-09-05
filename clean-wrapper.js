import app from "./worker-wrapper.js";

// Branding assets: verified against the current live layout roles.
const LOGO_ONLY="/eb358ee7-8d58-460f-87fa-feb2edd6cd3d.png";
const COMBINED_LOGO="/4dc6e410-9139-4401-a2f8-84e67a0a29b2.png";
const WORDMARK="/307a3722-6c83-4b6b-a3fa-a5a840bf5d4b.png";
const OLD_LOGO="/38364009-f822-430a-9f51-694b12b8d9ef.png";
const BAD_AD=/(monetag|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|profitableratecpmnetwork|highrevenueformat|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165)/i;

function cleanHtml(html){
  let out=html;
  out=out.replace(/<script\b[^>]*(?:monetag|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|profitableratecpmnetwork|highrevenueformat|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165)[^>]*>[\s\S]*?<\/script>/gi,"");
  out=out.replace(/<iframe\b[^>]*(?:profitableratecpmnetwork|highrevenueformat|monetag|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com)[^>]*>[\s\S]*?<\/iframe>/gi,"");
  out=out.replace(/<div\b[^>]*(?:class|id)=["'][^"']*(?:ad-banner|ad-slot|advertisement|social-bar|monetag|adsterra)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,"");
  out=out.replace(/<div\s+class=["']ad["'][^>]*>[\s\S]*?<\/div>/gi,"");

  out=out.replaceAll(OLD_LOGO,COMBINED_LOGO);
  out=out.replaceAll("/akhisave-mark.svg",LOGO_ONLY);

  // Website top bar: logo-only first, name-only second.
  out=out.replace(/(<a\s+class=["']brand["'][^>]*>\s*)<img\b[^>]*>\s*<strong>[\s\S]*?<\/strong>(\s*<\/a>)/i,
    '$1<img class="brand-logo-only" src="'+LOGO_ONLY+'" alt="AkhiSave logo"><img class="brand-wordmark" src="'+WORDMARK+'" alt="AkhiSave">$2');

  const css=`<style id="akhisave-brand-and-no-ads">
.brand{display:flex!important;align-items:center!important;gap:10px!important;min-width:0!important}
.brand .brand-logo-only{content:url('${LOGO_ONLY}')!important;width:48px!important;height:48px!important;object-fit:contain!important;display:block!important;border-radius:0!important;flex:0 0 auto!important}
.brand .brand-wordmark{content:url('${WORDMARK}')!important;width:112px!important;height:34px!important;object-fit:contain!important;display:block!important;border-radius:0!important;flex:0 0 auto!important}
.topbar .brand img,.drawerbox .brand img{content:url('${COMBINED_LOGO}')!important}
.loginbox .logo,#loginView .logo{content:url('${LOGO_ONLY}')!important;width:72px!important;height:72px!important;object-fit:contain!important;border-radius:0!important}
.footer-brand{content:url('${WORDMARK}')!important;width:110px!important;height:28px!important;object-fit:contain!important;border-radius:0!important}
.akhisave-ad-banner,.akhisave-ad-slot,.ad,.ad-banner,.ad-slot,.social-bar,[id*="ad-"]{display:none!important}
@media(max-width:650px){.brand{gap:8px!important}.brand .brand-logo-only{width:42px!important;height:42px!important}.brand .brand-wordmark{width:96px!important;height:30px!important}.navlinks a{font-size:10px!important;padding:8px 7px!important}}
</style>`;
  out=out.replace(/<\/head>/i,css+"</head>");

  const guard=`<script id="akhisave-ad-cleaner">(function(){const bad=${BAD_AD.toString()};function clean(){document.querySelectorAll('script,iframe').forEach(function(e){const s=(e.src||'')+' '+(e.textContent||'')+' '+(e.outerHTML||'');if(bad.test(s))e.remove()});document.querySelectorAll('[id],[class]').forEach(function(e){const s=String((e.id||'')+' '+(e.className||''));if(/(?:monetag|social[-_ ]?bar|ad[-_ ]?(?:banner|slot|container))/i.test(s))e.remove()})}clean();new MutationObserver(clean).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','id','class']})})()</script>`;
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
  headers.set("Content-Security-Policy","default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https://api.socialkit.dev; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'");
  return new Response(out,{status:response.status,statusText:response.statusText,headers});
}

export default{async fetch(request,env,ctx){return cleanResponse(await app.fetch(request,env,ctx))}};
