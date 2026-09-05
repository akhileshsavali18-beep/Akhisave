import app from "./worker-wrapper.js";

const LOGO_ONLY="/Logo.png";
const COMBINED_LOGO="/LogoName.png";
const WORDMARK="/Name.png";
const OLD_LOGO="/38364009-f822-430a-9f51-694b12b8d9ef.png";
const BAD_AD=/(monetag|monetag\.com|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|profitableratecpmnetwork|highrevenueformat|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165|tag\.min\.js)/i;

function cleanHtml(html){
  let out=html;
  const isWebsite=/<header[^>]+class=["']nav["']/i.test(out);

  // Remove every known ad-network script/iframe/container before the browser sees it.
  out=out.replace(/<script\b[^>]*(?:monetag|monetag\.com|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|profitableratecpmnetwork|highrevenueformat|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165|tag\.min\.js)[^>]*>[\s\S]*?<\/script>/gi,"");
  out=out.replace(/<script\b[^>]*>[^<]*(?:dataset\.zone|tag\.min\.js|nap5k)[^<]*[\s\S]*?<\/script>/gi,"");
  out=out.replace(/<iframe\b[^>]*(?:profitableratecpmnetwork|highrevenueformat|monetag|nap5k)[^>]*>[\s\S]*?<\/iframe>/gi,"");
  out=out.replace(/<script\b[^>]*(?:adsterra|adservice|doubleclick|googlesyndication|popunder|push-notification)[^>]*>[\s\S]*?<\/script>/gi,"");
  out=out.replace(/<div\b[^>]*(?:class|id)=["'][^"']*(?:ad-banner|ad-slot|advertisement|social-bar|monetag|adsterra|container-70d4c0990517d13f426b27f0fcfc6836)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,"");
  out=out.replace(/<div\s+class=["']ad["'][^>]*>[\s\S]*?<\/div>/gi,"");

  // Use only the three PNG branding assets stored in GitHub.
  out=out.replaceAll(OLD_LOGO,COMBINED_LOGO);
  out=out.replaceAll("/akhisave-mark.svg",LOGO_ONLY);
  out=out.replaceAll("/akhisave-logo.svg",COMBINED_LOGO);
  out=out.replaceAll("/akhisave-icon.svg",LOGO_ONLY);

  // Website header: use the combined logo+name asset, not two separate images.
  if(isWebsite){
    out=out.replace(/(<a\s+class=["']brand["'][^>]*>)[\s\S]*?(<\/a>)/i,
      '$1<img class="brand-combined-logo" src="'+COMBINED_LOGO+'" alt="AkhiSave">$2');
  }

  const css=`<style id="akhisave-brand-and-no-ads">
.brand-combined-logo{display:block!important;width:170px!important;height:58px!important;object-fit:contain!important;border-radius:0!important}
.brand .brand-combined-logo{flex:0 0 auto!important}
.brand strong,.brand b{display:none!important}
.loginbox .logo,#loginView .logo{content:url('${LOGO_ONLY}')!important;width:72px!important;height:72px!important;object-fit:contain!important;border-radius:0!important}
.footer-brand{content:url('${WORDMARK}')!important;width:110px!important;height:28px!important;object-fit:contain!important;border-radius:0!important}
.akhisave-ad-banner,.akhisave-ad-slot,.ad,.ad-banner,.ad-slot,.social-bar,[id*="ad-"]{display:none!important}
${isWebsite?`body{background:linear-gradient(180deg,#f7f8fc 0%,#ffffff 52%,#f3efff 100%)!important;color:#202338!important}
.nav{background:rgba(255,255,255,.96)!important;border-bottom:1px solid #e4e6ee!important;backdrop-filter:blur(18px)!important}
.navlinks a{color:#5d6578!important}.navlinks a:hover{background:#f0eff7!important;color:#171a2a!important}
.eyebrow{background:#fff!important;border-color:#e0e3eb!important;color:#4c5368!important;box-shadow:0 8px 30px #26324a12!important}
h1{color:#171a2a!important}h1 span{background:linear-gradient(100deg,#6b4cff,#e53d98,#ff9f43)!important;-webkit-background-clip:text!important;color:transparent!important}
.hero>p,.heading p,.step p,.feature p,.faq p,.seo p,.seo li{color:#687187!important}
.tab{background:#fff!important;border-color:#dfe3eb!important;color:#687187!important;box-shadow:0 5px 18px #26324a0b!important}.tab.active{background:linear-gradient(135deg,#f0eaff,#ffeaf5)!important;border-color:#8b67ff!important;color:#2a214d!important}
.searchbox{background:#fff!important;border-color:#dfe2eb!important;box-shadow:0 20px 60px #26324a18!important}.searchbox input{color:#202338!important}.searchbox input::placeholder{color:#8a93a8!important}.searchbox button{box-shadow:0 10px 25px #765cff25!important}
.toolcard,.step,.feature,.faq{background:#fff!important;border-color:#e3e6ed!important;box-shadow:0 12px 35px #26324a0b!important}.toolcard:hover{border-color:#c9bfff!important;box-shadow:0 18px 45px #26324a14!important}.toolcard b,.step h3,.feature h3,.heading h2,.seo h2,.seo h3{color:#202338!important}.toolcard small{color:#7b8498!important}
.ico{background:linear-gradient(135deg,#eee9ff,#ffeaf4)!important;border-color:#e4defa!important}.footer{border-top-color:#e2e4eb!important;color:#747d91!important}.foot b{color:#202338!important}.foot a{color:#687187!important}
@media(max-width:650px){.brand-combined-logo{width:150px!important;height:52px!important}}
`:''}
</style>`;
  out=out.replace(/<\/head>/i,css+"</head>");

  // Runtime guard: remove dynamically inserted ad scripts/frames/elements too.
  const guard=`<script id="akhisave-ad-cleaner">(function(){const bad=${BAD_AD.toString()};function clean(){document.querySelectorAll('script,iframe,object,embed').forEach(function(e){const s=(e.src||'')+' '+(e.data||'')+' '+(e.textContent||'')+' '+(e.outerHTML||'');if(bad.test(s)||/(?:adsterra|profitableratecpmnetwork|highrevenueformat|googlesyndication|doubleclick|popunder|push-notification)/i.test(s))e.remove()});document.querySelectorAll('[id],[class]').forEach(function(e){const s=String((e.id||'')+' '+(e.className||''));if(/(?:monetag|social[-_ ]?bar|ad[-_ ]?(?:banner|slot|container)|advertisement|adsterra)/i.test(s))e.remove()})}clean();new MutationObserver(clean).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','data','id','class']})})()</script>`;
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
  // Browser-level CSP blocks third-party ad scripts/frames even if an old page tries to load them.
  headers.set("Content-Security-Policy","default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https://api.socialkit.dev; media-src 'self' blob: https:; frame-src 'none'; object-src 'none'; child-src 'none'; base-uri 'self'");
  return new Response(out,{status:response.status,statusText:response.statusText,headers});
}

export default{async fetch(request,env,ctx){return cleanResponse(await app.fetch(request,env,ctx))}};
