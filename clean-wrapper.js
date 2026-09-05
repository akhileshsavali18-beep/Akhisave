import app from "./worker-wrapper.js";

const LOGO_ONLY="/307a3722-6c83-4b6b-a3fa-a5a840bf5d4b.png";
const COMBINED_LOGO="/4dc6e410-9139-4401-a2f8-84e67a0a29b2.png";
const WORDMARK="/eb358ee7-8d58-460f-87fa-feb2edd6cd3d.png";
const OLD_LOGO="/38364009-f822-430a-9f51-694b12b8d9ef.png";
const MONETAG=/(monetag|monetag\.com|nap5k\.com|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165)/i;

const AD_TOP=`<div class="akhisave-ad-slot akhisave-ad-top" aria-label="Advertisement"><script>atOptions={'key':'b5f10b469c2566d06ff288ac7dc9b5b2','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highrevenueformat.com/b5f10b469c2566d06ff288ac7dc9b5b2/invoke.js"></script></div>`;
const AD_MIDDLE=`<div class="akhisave-ad-slot akhisave-ad-middle" aria-label="Advertisement"><script async="async" data-cfasync="false" src="https://pl31187879.profitableratecpmnetwork.com/70d4c0990517d13f426b27f0fcfc6836/invoke.js"></script><div id="container-70d4c0990517d13f426b27f0fcfc6836"></div></div>`;

function cleanHtml(html){
  let out=html;
  out=out.replace(/<script\b[^>]*(?:monetag|nap5k\.com|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165)[^>]*>[\s\S]*?<\/script>/gi,"");
  out=out.replace(/<iframe\b[^>]*(?:monetag|nap5k\.com)[^>]*>[\s\S]*?<\/iframe>/gi,"");
  out=out.replace(/<div\b[^>]*(?:class|id)=["'][^"']*(?:monetag|social-bar)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,"");

  out=out.replaceAll(OLD_LOGO,COMBINED_LOGO);
  out=out.replaceAll("/akhisave-mark.svg",LOGO_ONLY);

  out=out.replace(/(<a\s+class=["']brand["'][^>]*>\s*)<img\b[^>]*>\s*<strong>[\s\S]*?<\/strong>(\s*<\/a>)/i,
    '$1<img class="brand-logo-only" src="'+LOGO_ONLY+'" alt="AkhiSave logo"><img class="brand-wordmark" src="'+WORDMARK+'" alt="AkhiSave">$2');

  const css=`<style id="akhisave-final-ui">
html,body{background:#fff!important;color:#172033!important}body{background:#fff!important}
.nav,.topbar{background:rgba(255,255,255,.97)!important;border-bottom:1px solid #e7ebf2!important;backdrop-filter:blur(14px)!important}
.navlinks a{color:#58657a!important}.navlinks a:hover{background:#f2f5f9!important;color:#172033!important}
.hero h1,h1,.heading h2,.section h2,.seo h2,.seo h3,.toolcard b,.feature h3,.step h3,.faq summary{color:#172033!important}
.hero>p,.heading p,.step p,.feature p,.faq p,.seo p,.seo li,.msg,.muted{color:#718096!important}
.eyebrow{background:#fff!important;border-color:#e3e8f0!important;color:#526074!important;box-shadow:0 8px 24px #1720330d!important}
.searchbox,.toolcard,.step,.feature,.faq,.section,.card,.statcard,.statusbox,.panel,.box,.content-card,.legal-card,.contact-card{background:#fff!important;border-color:#dfe5ee!important;color:#172033!important;box-shadow:0 10px 30px #1720330b!important}
.searchbox input{color:#172033!important}.searchbox input::placeholder{color:#8793a5!important}
.tab{background:#f7f9fc!important;border-color:#dfe5ee!important;color:#657287!important}.tab.active{background:#eef2ff!important;color:#245bb5!important;border-color:#7a8fe8!important}
.toolcard small{color:#7a879a!important}.ico{background:#f2f5ff!important;border-color:#e0e6f0!important}.badge{background:#fff7ea!important;border-color:#f2d8a8!important;color:#9b6a17!important}
.footer{background:#fff!important;border-top:1px solid #e7ebf2!important;color:#718096!important}.footer b{color:#172033!important}.footer a{color:#526074!important}
.brand{display:flex!important;align-items:center!important;text-decoration:none!important;min-width:0!important;gap:10px!important}.brand img{width:170px!important;height:58px!important;object-fit:contain!important;border-radius:0!important;display:block!important}.brand strong{display:none!important}
.brand .brand-logo-only{content:url('${LOGO_ONLY}')!important;width:46px!important;height:46px!important;object-fit:contain!important;display:block!important;border-radius:0!important;flex:0 0 auto!important}
.brand .brand-wordmark{content:url('${WORDMARK}')!important;width:112px!important;height:34px!important;object-fit:contain!important;display:block!important;border-radius:0!important;flex:0 0 auto!important}
.loginbox .logo,#loginView .logo{content:url('${LOGO_ONLY}')!important;width:72px!important;height:72px!important;object-fit:contain!important}
.footer-brand{content:url('${WORDMARK}')!important;width:110px!important;height:28px!important;object-fit:contain!important}
.akhisave-menu{display:none;width:40px;height:40px;border:1px solid #dfe5ee;border-radius:11px;background:#fff;color:#172033;font-size:20px;align-items:center;justify-content:center;box-shadow:0 5px 18px #17203312}
main,article,.content,.page,.legal,.contact,.faq-page,header,section,footer,aside{color:#172033!important}
body *{border-color:#dfe5ee}
.akhisave-ad-slot{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;max-width:728px!important;margin:18px auto!important;overflow:hidden!important;min-height:0!important;background:#fff!important;border:0!important;box-shadow:none!important}.akhisave-ad-top{min-height:250px!important}.akhisave-ad-middle{min-height:90px!important}.akhisave-ad-slot script{display:block!important}
#adminView,.app,#loginView{background:#fff!important;color:#172033!important}.topbar{color:#172033!important}.topbar .iconbtn{background:#fff!important;color:#172033!important;border-color:#dfe5ee!important}.logout{background:#fff!important;color:#344054!important;border-color:#dfe5ee!important}
#adminView .hero h1,#adminView .section h2,#adminView .label,#adminView .stat,#adminView .row b,#adminView .toolmain b{color:#172033!important}
#adminView .hero p,#adminView .muted,#adminView .small,#adminView .toolmeta,#adminView .section>p{color:#718096!important}
#adminView .card,#adminView .statcard,#adminView .section,#adminView .statusbox,#adminView .feature{background:#fff!important;border-color:#dfe5ee!important;box-shadow:0 10px 30px #1720330b!important}
#adminView .bottom{background:#fff!important;border-top:1px solid #dfe5ee!important}#adminView .bottom button{color:#718096!important}#adminView .bottom button.active{color:#2463c5!important}
#adminView .drawer{background:#fff!important;color:#172033!important;border-right-color:#dfe5ee!important;box-shadow:15px 0 50px #17203318!important}#adminView .drawer a{color:#58657a!important}#adminView .drawer a.active,#adminView .drawer a:hover{background:#eef2ff!important;color:#245bb5!important}
#adminView .field input,#adminView .field textarea,#adminView .field select{background:#fff!important;color:#172033!important;border-color:#dfe5ee!important}
#loginView .loginbox{background:#fff!important;color:#172033!important;border-color:#dfe5ee!important;box-shadow:0 20px 60px #17203312!important}#loginView h1{color:#172033!important}#loginView p{color:#718096!important}#loginView input{background:#fff!important;color:#172033!important;border-color:#dfe5ee!important}
@media(max-width:650px){.nav{height:66px!important}.navin{padding:0 12px!important;gap:9px!important;position:relative!important}.akhisave-menu{display:flex!important;position:absolute!important;right:12px!important;top:13px!important;z-index:1000!important}.brand{gap:8px!important;padding-right:52px!important}.brand .brand-logo-only{width:42px!important;height:42px!important}.brand .brand-wordmark{width:98px!important;height:30px!important}.navlinks{display:none!important;position:absolute!important;left:10px!important;right:10px!important;top:70px!important;background:#fff!important;border:1px solid #dfe5ee!important;border-radius:14px!important;padding:7px!important;box-shadow:0 15px 35px #17203318!important;flex-direction:column!important;z-index:9999!important}.navlinks.open{display:flex!important}.navlinks a{font-size:12px!important;padding:11px!important}.akhisave-ad-top{min-height:250px!important}.akhisave-ad-middle{min-height:90px!important}}
</style>`;
  out=out.replace(/<\/head>/i,css+"</head>");

  const guard=`<script id="akhisave-final-guard">(function(){
    function cleanMonetag(){
      document.querySelectorAll('script,iframe').forEach(function(e){var s=(e.src||'')+' '+(e.textContent||'')+' '+(e.outerHTML||'');if(${MONETAG.toString()}.test(s))e.remove()});
      document.querySelectorAll('[id],[class]').forEach(function(e){var s=String((e.id||'')+' '+(e.className||''));if(/(?:monetag|social[-_ ]?bar)/i.test(s))e.remove()});
    }
    function removeOldServiceWorkers(){
      if(!('serviceWorker' in navigator))return;
      navigator.serviceWorker.getRegistrations().then(function(rs){Promise.all(rs.map(function(r){return r.unregister()})).catch(function(){});}).catch(function(){});
      if('caches' in window)caches.keys().then(function(keys){keys.forEach(function(k){caches.delete(k)})}).catch(function(){});
    }
    function menu(){var b=document.getElementById('akhisaveMenu'),n=document.querySelector('.navlinks');if(b&&n&&!b.dataset.ready){b.dataset.ready='1';b.addEventListener('click',function(){n.classList.toggle('open')});n.addEventListener('click',function(e){if(e.target.closest('a'))n.classList.remove('open')})}}
    cleanMonetag();removeOldServiceWorkers();menu();
    new MutationObserver(function(){cleanMonetag();menu()}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','id','class']});
  })()</script>`;
  out=out.replace(/<\/body>/i,guard+"</body>");

  // Put Adsterra only into the two designated slots. No Monetag formats are injected.
  out=out.replace(/<div class=["']ad["'][^>]*>[\s\S]*?<\/div>/i,AD_TOP);
  if(/<div[^>]+id=["']ad-top["'][^>]*><\/div>/i.test(out))out=out.replace(/<div[^>]+id=["']ad-top["'][^>]*><\/div>/i,AD_TOP);
  if(/<div[^>]+id=["']ad-middle["'][^>]*><\/div>/i.test(out))out=out.replace(/<div[^>]+id=["']ad-middle["'][^>]*><\/div>/i,AD_MIDDLE);
  else out=out.replace(/<\/main>/i,AD_MIDDLE+"</main>");
  if(!out.includes('akhisave-ad-top'))out=out.replace(/<header([^>]*)>/i,`<header$1>${AD_TOP}`);
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
