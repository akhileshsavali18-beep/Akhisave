import app from "./worker-wrapper.js";

const LOGO_ONLY="/307a3722-6c83-4b6b-a3fa-a5a840bf5d4b.png";
const COMBINED_LOGO="/4dc6e410-9139-4401-a2f8-84e67a0a29b2.png";
const WORDMARK="/eb358ee7-8d58-460f-87fa-feb2edd6cd3d.png";
const OLD_LOGO="/38364009-f822-430a-9f51-694b12b8d9ef.png";

// Block the old notification/push/popunder/native ad systems.
// Classic Adsterra banner is intentionally NOT blocked because we inject only that format below.
const BAD_AD=/(monetag|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|profitableratecpmnetwork|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165|adsbygoogle|social[-_ ]?bar|in[-_ ]?page[-_ ]?push|popunder)/i;
const OLD_AD_SOURCE=/(monetag|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|profitableratecpmnetwork|highrevenueformat|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165|adsbygoogle|social[-_ ]?bar|in[-_ ]?page[-_ ]?push|popunder)/i;

function cleanHtml(html){
  let out=html;

  // Remove every old advertising script/iframe before the browser receives HTML.
  out=out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,(block)=>OLD_AD_SOURCE.test(block)?"":block);
  out=out.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi,(block)=>OLD_AD_SOURCE.test(block)?"":block);

  // Remove old ad containers/placeholders, but leave our future injected banner slots alone.
  out=out.replace(/<(?:div|section|aside|ins)\b[^>]*(?:class|id|data-[^=]+)=["'][^"']*(?:ad-banner|ad-slot|advertisement|social-bar|monetag|adsterra|adsbygoogle|container-70d4c0990517d13f426b27f0fcfc6836)[^"']*["'][^>]*>[\s\S]*?<\/(?:div|section|aside|ins)>/gi,"");
  out=out.replace(/<div\s+class=["']ad["'][^>]*>[\s\S]*?<\/div>/gi,"");
  out=out.replace(/\bADVERTISEMENT\b/gi,"");

  // Never use the obsolete uploaded combined PNG as the actual brand source.
  out=out.replaceAll(OLD_LOGO,COMBINED_LOGO);
  out=out.replaceAll("/akhisave-mark.svg",LOGO_ONLY);

  // Keep the website header clean with the combined AkhiSave branding.
  out=out.replace(/(<a\s+class=["']brand["'][^>]*>)[\s\S]*?(<\/a>)/i,
    '$1<img class="brand-combined" src="'+COMBINED_LOGO+'" alt="AkhiSave">$2');

  const css=`<style id="akhisave-final-layout">
.brand{display:flex!important;align-items:center!important;min-width:0!important;text-decoration:none!important}
.brand .brand-combined{content:url('${COMBINED_LOGO}')!important;width:170px!important;height:58px!important;object-fit:contain!important;display:block!important;border-radius:0!important}
.loginbox .logo,#loginView .logo{content:url('${LOGO_ONLY}')!important;width:72px!important;height:72px!important;object-fit:contain!important;border-radius:0!important}
.footer-brand{content:url('${WORDMARK}')!important;width:110px!important;height:28px!important;object-fit:contain!important;border-radius:0!important}
.akhisave-ad-slot{width:300px;max-width:calc(100vw - 28px);height:250px;margin:18px auto;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:8px}
.akhisave-ad-label{font-size:8px;letter-spacing:1.5px;opacity:.3;text-align:center;margin:4px auto -10px}
.akhisave-ad-slot iframe{max-width:100%!important}
@media(max-width:650px){.brand .brand-combined{width:150px!important;height:52px!important}.akhisave-ad-slot{width:300px;height:250px;margin:14px auto}}
</style>`;
  out=out.replace(/<\/head>/i,css+"</head>");

  // Two clean 300x250 rectangular banners: one below the header and one before the footer.
  // No Social Bar, IPP, Push, OnClick/Popunder or Vignette is enabled here.
  const banner=(id)=>`<div class="akhisave-ad-label">ADVERTISEMENT</div><div class="akhisave-ad-slot" id="${id}"><script>var atOptions={'key':'b5f10b469c2566d06ff288ac7dc9b5b2','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highrevenueformat.com/b5f10b469c2566d06ff288ac7dc9b5b2/invoke.js"></script></div>`;
  out=out.replace(/(<\/header>)/i,`$1${banner("akhisave-top-ad")}`);
  out=out.replace(/(<\/main>)/i,`${banner("akhisave-middle-ad")}$1`);

  // Runtime guard removes any late-loaded notification/push/popunder/native ad code.
  // It does NOT remove our classic highrevenueformat banner.
  const guard=`<script id="akhisave-ad-cleaner">(function(){const bad=${BAD_AD.toString()};function clean(){document.querySelectorAll('script,iframe').forEach(function(e){const s=(e.src||'')+' '+(e.textContent||'')+' '+(e.outerHTML||'');if(bad.test(s))e.remove()});document.querySelectorAll('[id],[class]').forEach(function(e){const s=String((e.id||'')+' '+(e.className||''));if(/(?:monetag|social[-_ ]?bar|in[-_ ]?page[-_ ]?push|popunder|profitableratecpmnetwork)/i.test(s))e.remove()})}clean();new MutationObserver(clean).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','id','class']});document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('.akhisave-ad-slot'))return;})})()</script>`;
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
  headers.set("Expires","0");
  // Allow only our normal site scripts plus the classic banner provider.
  headers.set("Content-Security-Policy","default-src 'self'; script-src 'self' 'unsafe-inline' https://www.highrevenueformat.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https://api.socialkit.dev; frame-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self'");
  return new Response(out,{status:response.status,statusText:response.statusText,headers});
}

export default{async fetch(request,env,ctx){return cleanResponse(await app.fetch(request,env,ctx))}};
