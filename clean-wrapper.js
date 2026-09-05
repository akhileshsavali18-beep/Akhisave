import app from "./worker-wrapper.js";

const LOGO_ONLY="/307a3722-6c83-4b6b-a3fa-a5a840bf5d4b.png";
const COMBINED_LOGO="/4dc6e410-9139-4401-a2f8-84e67a0a29b2.png";
const WORDMARK="/eb358ee7-8d58-460f-87fa-feb2edd6cd3d.png";
const OLD_LOGO="/38364009-f822-430a-9f51-694b12b8d9ef.png";

// Only the requested classic banner is allowed. Notification/push/popunder formats are blocked.
const BAD_AD=/(monetag|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|profitableratecpmnetwork|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165|social[-_ ]?bar|in[-_ ]?page[-_ ]?push|popunder|vignette)/i;

const BANNER=`<script>atOptions={'key':'b5f10b469c2566d06ff288ac7dc9b5b2','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highrevenueformat.com/b5f10b469c2566d06ff288ac7dc9b5b2/invoke.js"></script>`;
const AD_TOP=`<div class="ak-ad-place ak-ad-top">${BANNER}</div>`;
const AD_MIDDLE=`<div class="ak-ad-place ak-ad-middle">${BANNER}</div>`;
const AD_BOTTOM=`<div class="ak-ad-place ak-ad-bottom">${BANNER}</div>`;

function cleanHtml(html){
  let out=html;
  out=out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,(block)=>BAD_AD.test(block)?"":block);
  out=out.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi,(block)=>BAD_AD.test(block)?"":block);
  out=out.replace(/<(?:div|section|aside|ins)\b[^>]*(?:class|id|data-[^=]+)=["'][^"']*(?:social-bar|monetag|adsterra|adsbygoogle|container-70d4c0990517d13f426b27f0fcfc6836)[^"']*["'][^>]*>[\s\S]*?<\/(?:div|section|aside|ins)>/gi,"");
  out=out.replace(/<div\s+class=["']ad["'][^>]*>[\s\S]*?<\/div>/gi,"");
  out=out.replace(/\bADVERTISEMENT\b/gi,"");

  // Keep the existing branding exactly as-is.
  out=out.replaceAll(OLD_LOGO,COMBINED_LOGO);
  out=out.replaceAll("/akhisave-mark.svg",LOGO_ONLY);
  out=out.replace(/(<a\s+class=["']brand["'][^>]*>)[\s\S]*?(<\/a>)/i,
    '$1<img class="brand-combined" src="'+COMBINED_LOGO+'" alt="AkhiSave">$2');

  const css=`<style id="akhisave-final-brand-ads">
.brand{display:flex!important;align-items:center!important;min-width:0!important;text-decoration:none!important}
.brand .brand-combined{content:url('${COMBINED_LOGO}')!important;width:170px!important;height:58px!important;object-fit:contain!important;display:block!important;border-radius:0!important}
.loginbox .logo,#loginView .logo{content:url('${LOGO_ONLY}')!important;width:72px!important;height:72px!important;object-fit:contain!important;border-radius:0!important}
.footer-brand{content:url('${WORDMARK}')!important;width:110px!important;height:28px!important;object-fit:contain!important;border-radius:0!important}
.ak-ad-place{width:100%;min-height:250px;margin:22px auto;display:flex;align-items:center;justify-content:center;overflow:hidden;text-align:center}
.ak-ad-place iframe{max-width:100%;border:0}
.ak-ad-top{margin-top:14px;margin-bottom:26px}
.ak-ad-middle{margin-top:28px;margin-bottom:28px}
.ak-ad-bottom{margin-top:28px;margin-bottom:18px}
@media(max-width:600px){.brand .brand-combined{width:150px!important;height:52px!important}.ak-ad-place{min-height:250px;margin:16px auto}}
</style>`;
  out=out.replace(/<\/head>/i,css+"</head>");

  // Exactly three banner placements: top, middle after the complete hero section, and bottom.
  out=out.replace(/<\/header>/i,"</header>"+AD_TOP);
  const heroStart=out.search(/<section\b[^>]*(?:class|id)=["'][^"']*\bhero\b[^"']*["'][^>]*>/i);
  if(heroStart>=0){
    const heroEnd=out.indexOf("</section>",heroStart);
    if(heroEnd>=0)out=out.slice(0,heroEnd+10)+AD_MIDDLE+out.slice(heroEnd+10);
    else out=out.replace(/<main([^>]*)>/i,"<main$1>"+AD_MIDDLE);
  }else if(/<section[^>]+id=["']tools["']/i.test(out))out=out.replace(/<section([^>]+id=["']tools["'][^>]*)>/i,middle=>AD_MIDDLE+middle);
  else out=out.replace(/<main([^>]*)>/i,"<main$1>"+AD_MIDDLE);
  if(/<footer\b/i.test(out))out=out.replace(/<footer\b/i,AD_BOTTOM+"<footer");
  else out=out.replace(/<\/main>/i,AD_BOTTOM+"</main>");

  // Block only unwanted notification-style ads added later; keep our three banner placements.
  const guard=`<script id="akhisave-ad-cleaner">(function(){const bad=${BAD_AD.toString()};function clean(){document.querySelectorAll('script,iframe').forEach(function(e){const s=(e.src||'')+' '+(e.textContent||'')+' '+(e.outerHTML||'');if(bad.test(s)&&!e.closest('.ak-ad-place'))e.remove()});document.querySelectorAll('[id],[class]').forEach(function(e){const s=String((e.id||'')+' '+(e.className||''));if(/(?:monetag|social[-_ ]?bar|profitableratecpmnetwork|adsterra|ad[-_ ]?(?:banner|slot|container)|in[-_ ]?page[-_ ]?push|popunder|vignette)/i.test(s)&&!e.closest('.ak-ad-place'))e.remove()})}clean();new MutationObserver(clean).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','id','class']})})()</script>`;
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
  return new Response(out,{status:response.status,statusText:response.statusText,headers});
}

export default{async fetch(request,env,ctx){return cleanResponse(await app.fetch(request,env,ctx))}};
