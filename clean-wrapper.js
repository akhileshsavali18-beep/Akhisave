import app from "./worker-wrapper.js";

const AD_WORDS=/(monetag|nap5k\.com|profitableratecpmnetwork|highrevenueformat|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165)/i;
const LOGO="/38364009-f822-430a-9f51-694b12b8d9ef.png";

function cleanHtml(html){
  let out=html;
  // Remove every known ad-network script, including the old Monetag zone that was still present in index.html.
  out=out.replace(/<script\b[^>]*(?:monetag|nap5k\.com|profitableratecpmnetwork|highrevenueformat|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165)[^>]*>[\s\S]*?<\/script>/gi,"");
  // Remove ad iframes/containers left by older versions.
  out=out.replace(/<iframe\b[^>]*(?:profitableratecpmnetwork|highrevenueformat|monetag|nap5k\.com)[^>]*>[\s\S]*?<\/iframe>/gi,"");
  out=out.replace(/<div\b[^>]*(?:class|id)=["'][^"']*(?:ad-banner|ad-slot|advertisement|social-bar|monetag|adsterra)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,"");
  // Remove placeholder ad blocks from the current homepage.
  out=out.replace(/<div\s+class=["']ad["'][^>]*>[\s\S]*?<\/div>/gi,"");
  // Always use the exact original uploaded AkhiSave logo; do not guess the newer split assets.
  out=out.replace(/(<img\b[^>]*\bsrc=["'])[^"']+(["'][^>]*\balt=["']AkhiSave[^"']*["'][^>]*>)/gi,"$1"+LOGO+"$2");
  out=out.replace(/(<meta\b[^>]*property=["']og:image["'][^>]*content=["'])[^"']+/i,"$1https://akhisave.online"+LOGO);
  out=out.replace(/(<link\b[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*href=["'])[^"']+/gi,"$1"+LOGO);
  // If a legacy brand image has a different attribute order, normalize all known branding paths.
  out=out.replaceAll("/4dc6e410-9139-4401-a2f8-84e67a0a29b2.png",LOGO).replaceAll("/307a3722-6c83-4b6b-a3fa-a5a840bf5d4b.png",LOGO).replaceAll("/eb358ee7-8d58-460f-87fa-feb2edd6cd3d.png",LOGO);
  // Runtime guard: legacy ad scripts can otherwise create notification cards after page load.
  const guard=`<script id="akhisave-ad-guard">(function(){const bad=${AD_WORDS.toString()};function kill(){document.querySelectorAll('script,iframe').forEach(function(e){const s=(e.src||'')+' '+(e.textContent||'')+' '+(e.outerHTML||'');if(bad.test(s))e.remove()});document.querySelectorAll('[id],[class]').forEach(function(e){const s=((e.id||'')+' '+(e.className||'')).toString();if(/monetag|social[-_ ]?bar|ad[-_ ]?(banner|slot|container)/i.test(s))e.remove()});document.querySelectorAll('body *').forEach(function(e){const cs=getComputedStyle(e);if(cs.position==='fixed'&&Number(cs.zIndex||0)>10000&&e!==document.querySelector('.toast')){const r=e.getBoundingClientRect();if(r.width>180&&r.height>40)e.remove()}})}kill();new MutationObserver(kill).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','id','class']})})()</script>`;
  out=out.replace(/<\/body>/i,guard+"</body>");
  const css=`<style id="akhisave-final-clean">.ad,.ad-banner,.ad-slot,.akhisave-ad-slot,.akhisave-ad-banner,[id*="ad-"]{display:none!important}.brand img{content:url('${LOGO}')!important;width:170px!important;height:58px!important;object-fit:contain!important;border-radius:0!important}.footer-brand{content:url('${LOGO}')!important;width:170px!important;height:58px!important;object-fit:contain!important}@media(max-width:600px){.brand img{width:150px!important;height:52px!important}.footer-brand{width:150px!important;height:52px!important}}</style>`;
  out=out.replace(/<\/head>/i,css+"</head>");
  return out;
}

async function cleanResponse(response){
  const type=response.headers.get("content-type")||"";
  if(!type.includes("text/html"))return response;
  const out=cleanHtml(await response.text());
  const headers=new Headers(response.headers);headers.delete("content-length");headers.delete("content-encoding");headers.set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0");headers.set("Pragma","no-cache");
  return new Response(out,{status:response.status,statusText:response.statusText,headers});
}

export default{async fetch(request,env,ctx){return cleanResponse(await app.fetch(request,env,ctx))}};
