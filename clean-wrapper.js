import app from "./worker-wrapper.js";

const LOGO_ONLY="/307a3722-6c83-4b6b-a3fa-a5a840bf5d4b.png";
const COMBINED_LOGO="/4dc6e410-9139-4401-a2f8-84e67a0a29b2.png";
const WORDMARK="/eb358ee7-8d58-460f-87fa-feb2edd6cd3d.png";
const OLD_LOGO="/38364009-f822-430a-9f51-694b12b8d9ef.png";
const BAD_AD=/(monetag|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|profitableratecpmnetwork|highrevenueformat|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165|adsbygoogle|adsterra)/i;

function cleanHtml(html){
  let out=html;

  // Remove every known advertising script/iframe before the browser receives HTML.
  out=out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,(block)=>BAD_AD.test(block)?"":block);
  out=out.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi,(block)=>BAD_AD.test(block)?"":block);

  // Remove ad containers/placeholders from the old site.
  out=out.replace(/<(?:div|section|aside|ins)\b[^>]*(?:class|id|data-[^=]+)=["'][^"']*(?:ad-banner|ad-slot|advertisement|social-bar|monetag|adsterra|adsbygoogle|ad-top|ad-middle|container-70d4c0990517d13f426b27f0fcfc6836)[^"']*["'][^>]*>[\s\S]*?<\/(?:div|section|aside|ins)>/gi,"");
  out=out.replace(/<div\s+class=["']ad["'][^>]*>[\s\S]*?<\/div>/gi,"");
  out=out.replace(/\bADVERTISEMENT\b/gi,"");

  // Never use the obsolete combined PNG.
  out=out.replaceAll(OLD_LOGO,COMBINED_LOGO);
  out=out.replaceAll("/akhisave-mark.svg",LOGO_ONLY);

  // Toolzu-style public header: one combined AkhiSave logo on the left.
  out=out.replace(/(<a\s+class=["']brand["'][^>]*>)[\s\S]*?(<\/a>)/i,
    '$1<img class="brand-combined" src="'+COMBINED_LOGO+'" alt="AkhiSave">$2');

  // Mobile hamburger; existing nav links become its menu items.
  out=out.replace(/(<nav\s+class=["']navlinks["'][^>]*>[\s\S]*?<\/nav>)/i,
    '$1<button class="mobile-menu-btn" type="button" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>');

  const css=`<style id="akhisave-final-cleanup">
.brand{display:flex!important;align-items:center!important;min-width:0!important;text-decoration:none!important}
.brand .brand-combined{content:url('${COMBINED_LOGO}')!important;width:170px!important;height:58px!important;object-fit:contain!important;display:block!important;border-radius:0!important}
.mobile-menu-btn{display:none;width:42px;height:42px;padding:8px;border:0;border-radius:10px;background:transparent;flex:0 0 auto;align-items:center;justify-content:center;flex-direction:column;gap:5px}
.mobile-menu-btn span{display:block;width:24px;height:2px;border-radius:2px;background:#aeb6c4}
.mobile-menu-btn:hover{background:#ffffff08}
.mobile-menu-btn[aria-expanded="true"] span:nth-child(2){opacity:.35}
.loginbox .logo,#loginView .logo{content:url('${LOGO_ONLY}')!important;width:72px!important;height:72px!important;object-fit:contain!important;border-radius:0!important}
.footer-brand{content:url('${WORDMARK}')!important;width:110px!important;height:28px!important;object-fit:contain!important;border-radius:0!important}
/* No ads: remove both visible ad UI and ad-created layout space. */
.akhisave-ad-banner,.akhisave-ad-slot,.ad,.ad-banner,.ad-slot,.social-bar,.monetag,.adsterra,[id*="ad-"],[class*="ad-banner"],[class*="ad-slot"],[class*="advertisement"],[class*="social-bar"]{display:none!important}
@media(max-width:650px){
  .nav{height:66px;z-index:1000}
  .navin{padding:0 12px;position:relative}
  .brand .brand-combined{width:150px!important;height:52px!important}
  .mobile-menu-btn{display:flex;margin-left:auto}
  .navlinks{display:none!important;position:absolute;right:12px;top:58px;width:190px;padding:8px;flex-direction:column;gap:3px!important;background:#101522f7;border:1px solid #ffffff14;border-radius:14px;box-shadow:0 18px 45px #0008;backdrop-filter:blur(18px);z-index:1100}
  .navlinks.open{display:flex!important}
  .navlinks a{font-size:13px!important;padding:12px 13px!important;border-radius:9px;text-align:left;width:100%}
}
</style>`;
  out=out.replace(/<\/head>/i,css+"</head>");

  // Final runtime guard. Also blocks ad scripts that try to appear after page load.
  const guard=`<script id="akhisave-ad-cleaner">(function(){const bad=${BAD_AD.toString()};function clean(){document.querySelectorAll('script,iframe').forEach(function(e){const s=(e.src||'')+' '+(e.textContent||'')+' '+(e.outerHTML||'');if(bad.test(s))e.remove()});document.querySelectorAll('[id],[class]').forEach(function(e){const s=String((e.id||'')+' '+(e.className||''));if(/(?:monetag|social[-_ ]?bar|ad[-_ ]?(?:banner|slot|container)|adsterra|adsbygoogle)/i.test(s))e.remove()})}clean();new MutationObserver(clean).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','id','class']});document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.mobile-menu-btn');if(!b)return;var n=document.querySelector('.navlinks');if(!n)return;var open=n.classList.toggle('open');b.setAttribute('aria-expanded',open?'true':'false')});document.addEventListener('click',function(e){if(!e.target.closest('.navin')){var n=document.querySelector('.navlinks'),b=document.querySelector('.mobile-menu-btn');if(n)n.classList.remove('open');if(b)b.setAttribute('aria-expanded','false')}})})()</script>`;
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
  // Do not allow any third-party advertising JavaScript/frame to execute.
  headers.set("Content-Security-Policy","default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https://api.socialkit.dev; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'");
  return new Response(out,{status:response.status,statusText:response.statusText,headers});
}

export default{async fetch(request,env,ctx){return cleanResponse(await app.fetch(request,env,ctx))}};
