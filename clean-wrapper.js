import app from "./worker-wrapper.js";

const COMBINED_LOGO="/38364009-f822-430a-9f51-694b12b8d9ef.png";
const BAD_AD=/(monetag|monetag\.com|nap5k\.com|profitableratecpmnetwork|highrevenueformat|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165)/i;

function cleanHtml(html){
  let out=html;

  // Remove every known ad-network script, iframe and ad container from the HTML response.
  out=out.replace(/<script\b[^>]*(?:monetag|nap5k\.com|profitableratecpmnetwork|highrevenueformat|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165)[^>]*>[\s\S]*?<\/script>/gi,"");
  out=out.replace(/<iframe\b[^>]*(?:profitableratecpmnetwork|highrevenueformat|monetag|nap5k\.com)[^>]*>[\s\S]*?<\/iframe>/gi,"");
  out=out.replace(/<div\b[^>]*(?:class|id)=["'][^"']*(?:ad-banner|ad-slot|advertisement|social-bar|monetag|adsterra)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,"");
  out=out.replace(/<div\s+class=["']ad["'][^>]*>[\s\S]*?<\/div>/gi,"");
  out=out.replace(/<div\b[^>]*id=["']container-[^"']+["'][^>]*>[\s\S]*?<\/div>/gi,"");

  // Use the existing uploaded combined logo everywhere. The newer UUID assets are not in the repo,
  // so referencing them causes the broken-image icon seen on mobile.
  out=out.replaceAll("/4dc6e410-9139-4401-a2f8-84e67a0a29b2.png",COMBINED_LOGO);
  out=out.replaceAll("/307a3722-6c83-4b6b-a3fa-a5a840bf5d4b.png",COMBINED_LOGO);
  out=out.replaceAll("/eb358ee7-8d58-460f-87fa-feb2edd6cd3d.png",COMBINED_LOGO);
  out=out.replaceAll("/akhisave-mark.svg",COMBINED_LOGO);

  // Website top bar: keep the previous single combined logo+name layout and add a mobile hamburger.
  out=out.replace(/(<div\s+class=["']navin["'][^>]*>)(<a\s+class=["']brand["'][^>]*>)/i,
    '$1<button class="akhisave-menu" id="akhisaveMenu" aria-label="Open menu">☰</button>$2');

  // Fix broken placeholder image references in metadata too.
  out=out.replaceAll("https://akhisave.online/4dc6e410-9139-4401-a2f8-84e67a0a29b2.png","https://akhisave.online/38364009-f822-430a-9f51-694b12b8d9ef.png");
  out=out.replaceAll("https://akhisave.online/307a3722-6c83-4b6b-a3fa-a5a840bf5d4b.png","https://akhisave.online/38364009-f822-430a-9f51-694b12b8d9ef.png");
  out=out.replaceAll("https://akhisave.online/eb358ee7-8d58-460f-87fa-feb2edd6cd3d.png","https://akhisave.online/38364009-f822-430a-9f51-694b12b8d9ef.png");

  const css=`<style id="akhisave-final-ui">
/* Complete clean white theme */
html,body{background:#fff!important;color:#172033!important}
body{background:#fff!important}
.nav,.topbar{background:rgba(255,255,255,.97)!important;border-bottom:1px solid #e7ebf2!important;backdrop-filter:blur(14px)!important}
.navin,.topin{background:transparent!important}
.navlinks a{color:#58657a!important}.navlinks a:hover{background:#f2f5f9!important;color:#172033!important}
.hero h1,h1,.heading h2,.section h2,.seo h2,.seo h3,.toolcard b,.feature h3,.step h3,.faq summary{color:#172033!important}
.hero>p,.heading p,.step p,.feature p,.faq p,.seo p,.seo li,.msg,.muted{color:#718096!important}
.eyebrow{background:#fff!important;border-color:#e3e8f0!important;color:#526074!important;box-shadow:0 8px 24px #1720330d!important}
.searchbox,.toolcard,.step,.feature,.faq,.section,.card,.statcard,.statusbox{background:#fff!important;border-color:#dfe5ee!important;color:#172033!important;box-shadow:0 10px 30px #1720330b!important}
.searchbox input{color:#172033!important}.searchbox input::placeholder{color:#8793a5!important}
.tab{background:#f7f9fc!important;border-color:#dfe5ee!important;color:#657287!important}.tab.active{background:#eef2ff!important;color:#245bb5!important;border-color:#7a8fe8!important}
.toolcard small{color:#7a879a!important}.toolcard:hover{box-shadow:0 14px 35px #17203312!important}
.ico{background:#f2f5ff!important;border-color:#e0e6f0!important}.badge{background:#fff7ea!important;border-color:#f2d8a8!important;color:#9b6a17!important}
.footer{background:#fff!important;border-top:1px solid #e7ebf2!important;color:#718096!important}.footer b{color:#172033!important}.footer a{color:#526074!important}
/* Previous combined logo+name */
.brand{display:flex!important;align-items:center!important;text-decoration:none!important;min-width:0!important}
.brand img{content:url('${COMBINED_LOGO}')!important;width:170px!important;height:58px!important;object-fit:contain!important;border-radius:0!important;display:block!important}
.brand strong{display:none!important}
/* Mobile hamburger */
.akhisave-menu{display:none;width:40px;height:40px;border:1px solid #dfe5ee;border-radius:11px;background:#fff;color:#172033;font-size:20px;align-items:center;justify-content:center;box-shadow:0 5px 18px #17203312}
/* Remove any ad placeholders visually as well */
.ad,.akhisave-ad-banner,.akhisave-ad-slot,.ad-banner,.ad-slot,.social-bar,[id*="ad-"]{display:none!important}
@media(max-width:650px){
 .nav{height:66px!important}.navin{padding:0 12px!important;gap:9px!important}
 .akhisave-menu{display:flex!important;flex:0 0 auto!important}
 .brand img{width:145px!important;height:50px!important}
 .navlinks{display:none!important;position:absolute!important;left:10px!important;right:10px!important;top:70px!important;background:#fff!important;border:1px solid #dfe5ee!important;border-radius:14px!important;padding:7px!important;box-shadow:0 15px 35px #17203318!important;flex-direction:column!important;z-index:9999!important}
 .navlinks.open{display:flex!important}.navlinks a{font-size:12px!important;padding:11px!important}
 .wrap{padding:0 13px!important}.hero{padding:40px 0 18px!important}
}
/* Sub-pages */
main,article,.content,.page,.legal,.contact,.faq-page{background:#fff!important;color:#172033!important}
.card,.panel,.box,.content-card,.legal-card,.contact-card{background:#fff!important;color:#172033!important;border-color:#dfe5ee!important}
</style>`;
  out=out.replace(/<\/head>/i,css+"</head>");

  const script=`<script id="akhisave-final-guard">(function(){
    function cleanAds(){
      document.querySelectorAll('script,iframe').forEach(function(e){
        var s=(e.src||'')+' '+(e.textContent||'')+' '+(e.outerHTML||'');
        if(${BAD_AD.toString()}.test(s)) e.remove();
      });
      document.querySelectorAll('[id],[class]').forEach(function(e){
        var s=String((e.id||'')+' '+(e.className||''));
        if(/(?:monetag|social[-_ ]?bar|ad[-_ ]?(?:banner|slot|container)|advertisement)/i.test(s)) e.remove();
      });
    }
    function menu(){var b=document.getElementById('akhisaveMenu'),n=document.querySelector('.navlinks');if(b&&n&&!b.dataset.ready){b.dataset.ready='1';b.addEventListener('click',function(){n.classList.toggle('open')});n.addEventListener('click',function(e){if(e.target.closest('a'))n.classList.remove('open')});}}
    cleanAds();menu();new MutationObserver(function(){cleanAds();menu()}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','id','class']});
  })()</script>`;
  out=out.replace(/<\/body>/i,script+"</body>");
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
  return new Response(out,{status:response.status,statusText:response.statusText,headers});
}

export default{async fetch(request,env,ctx){return cleanResponse(await app.fetch(request,env,ctx))}};
