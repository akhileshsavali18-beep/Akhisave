import app from "./worker-wrapper.js";

const LOGO_ONLY="/Logo.png";
const COMBINED_LOGO="/LogoName.png";
const WORDMARK="/Name.png";
const OLD_LOGO="/38364009-f822-430a-9f51-694b12b8d9ef.png";
const BAD_AD=/(monetag|monetag\.com|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|profitableratecpmnetwork|highrevenueformat|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165|tag\.min\.js)/i;

function cleanHtml(html){
  let out=html;

  // Remove every known ad-network script/iframe/container before the browser sees it.
  out=out.replace(/<script\b[^>]*(?:monetag|monetag\.com|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|profitableratecpmnetwork|highrevenueformat|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165|tag\.min\.js)[^>]*>[\s\S]*?<\/script>/gi,"");
  out=out.replace(/<script\b[^>]*>[^<]*(?:dataset\.zone|tag\.min\.js|nap5k)[^<]*[\s\S]*?<\/script>/gi,"");
  out=out.replace(/<iframe\b[^>]*(?:profitableratecpmnetwork|highrevenueformat|monetag|nap5k)[^>]*>[\s\S]*?<\/iframe>/gi,"");
  out=out.replace(/<div\b[^>]*(?:class|id)=["'][^"']*(?:ad-banner|ad-slot|advertisement|social-bar|monetag|adsterra|container-70d4c0990517d13f426b27f0fcfc6836)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,"");
  out=out.replace(/<div\s+class=["']ad["'][^>]*>[\s\S]*?<\/div>/gi,"");

  // Use only the three PNG branding assets stored in GitHub.
  out=out.replaceAll(OLD_LOGO,COMBINED_LOGO);
  out=out.replaceAll("/akhisave-mark.svg",LOGO_ONLY);
  out=out.replaceAll("/akhisave-logo.svg",COMBINED_LOGO);
  out=out.replaceAll("/akhisave-icon.svg",LOGO_ONLY);

  // Website top bar: separate logo + name, with clean spacing like the reference screenshot.
  out=out.replace(/(<a\s+class=["']brand["'][^>]*>\s*)<img\b[^>]*>\s*(?:<strong>[\s\S]*?<\/strong>)?(\s*<\/a>)/i,
    '$1<img class="brand-logo-only" src="'+LOGO_ONLY+'" alt="AkhiSave logo"><img class="brand-wordmark" src="'+WORDMARK+'" alt="AkhiSave">$2');

  const css=`<style id="akhisave-brand-and-no-ads">
.brand{display:flex!important;align-items:center!important;gap:10px!important;min-width:0!important;text-decoration:none!important}
.brand .brand-logo-only{content:url('${LOGO_ONLY}')!important;width:48px!important;height:48px!important;object-fit:contain!important;display:block!important;border-radius:0!important;flex:0 0 auto!important}
.brand .brand-wordmark{content:url('${WORDMARK}')!important;width:112px!important;height:34px!important;object-fit:contain!important;display:block!important;border-radius:0!important;flex:0 0 auto!important}
.brand strong,.brand b{display:none!important}
.loginbox .logo,#loginView .logo{content:url('${LOGO_ONLY}')!important;width:72px!important;height:72px!important;object-fit:contain!important;border-radius:0!important}
.footer-brand{content:url('${WORDMARK}')!important;width:110px!important;height:28px!important;object-fit:contain!important;border-radius:0!important}
.akhisave-ad-banner,.akhisave-ad-slot,.ad,.ad-banner,.ad-slot,.social-bar,[id*="ad-"]{display:none!important}
@media(max-width:650px){.brand{gap:8px!important}.brand .brand-logo-only{width:42px!important;height:42px!important}.brand .brand-wordmark{width:96px!important;height:30px!important}}
</style>`;
  out=out.replace(/<\/head>/i,css+"</head>");

  // Runtime guard: remove dynamically inserted ad scripts/frames/elements too.
  const guard=`<script id="akhisave-ad-cleaner">(function(){const bad=${BAD_AD.toString()};function clean(){document.querySelectorAll('script,iframe,object,embed').forEach(function(e){const s=(e.src||'')+' '+(e.data||'')+' '+(e.textContent||'')+' '+(e.outerHTML||'');if(bad.test(s))e.remove()});document.querySelectorAll('[id],[class]').forEach(function(e){const s=String((e.id||'')+' '+(e.className||''));if(/(?:monetag|social[-_ ]?bar|ad[-_ ]?(?:banner|slot|container)|advertisement)/i.test(s))e.remove()})}clean();new MutationObserver(clean).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','data','id','class']})})()</script>`;
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
  // Strong browser-level block against third-party ad frames/scripts.
  headers.set("Content-Security-Policy","default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https://api.socialkit.dev; media-src 'self' blob: https:; frame-src 'none'; object-src 'none'; child-src 'none'; base-uri 'self'");
  return new Response(out,{status:response.status,statusText:response.statusText,headers});
}

export default{async fetch(request,env,ctx){return cleanResponse(await app.fetch(request,env,ctx))}};
