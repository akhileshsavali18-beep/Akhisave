import app from "./worker-wrapper.js";

const LOGO_ONLY="/Logo.png";
const COMBINED_LOGO="/LogoName.png";
const WORDMARK="/Name.png";
const OLD_LOGO="/38364009-f822-430a-9f51-694b12b8d9ef.png";
const BAD_AD=/(monetag|monetag\.com|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|profitableratecpmnetwork|highrevenueformat|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165|tag\.min\.js)/i;

function cleanHtml(html){
  let out=html;
  const isWebsite=/<header[^>]+class=["']nav["']/i.test(out);

  out=out.replace(/<script\b[^>]*(?:monetag|monetag\.com|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|profitableratecpmnetwork|highrevenueformat|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165|tag\.min\.js)[^>]*>[\s\S]*?<\/script>/gi,"");
  out=out.replace(/<script\b[^>]*>[^<]*(?:dataset\.zone|tag\.min\.js|nap5k)[^<]*[\s\S]*?<\/script>/gi,"");
  out=out.replace(/<iframe\b[^>]*(?:profitableratecpmnetwork|highrevenueformat|monetag|nap5k)[^>]*>[\s\S]*?<\/iframe>/gi,"");
  out=out.replace(/<script\b[^>]*(?:adsterra|adservice|doubleclick|googlesyndication|popunder|push-notification)[^>]*>[\s\S]*?<\/script>/gi,"");
  out=out.replace(/<div\b[^>]*(?:class|id)=["'][^"']*(?:ad-banner|ad-slot|advertisement|social-bar|monetag|adsterra|container-70d4c0990517d13f426b27f0fcfc6836)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,"");
  out=out.replace(/<div\s+class=["']ad["'][^>]*>[\s\S]*?<\/div>/gi,"");

  out=out.replaceAll(OLD_LOGO,COMBINED_LOGO);
  out=out.replaceAll("/akhisave-mark.svg",LOGO_ONLY);
  out=out.replaceAll("/akhisave-logo.svg",COMBINED_LOGO);
  out=out.replaceAll("/akhisave-icon.svg",LOGO_ONLY);

  if(isWebsite){
    out=out.replace(/(<a\s+class=["']brand["'][^>]*>)[\s\S]*?(<\/a>)/i,
      '$1<img class="brand-combined-logo" src="'+COMBINED_LOGO+'" alt="AkhiSave">$2');
    out=out.replace(/(<\/nav>)/i,'$1<button class="akhisave-menu-btn" id="akhisaveMenuBtn" type="button" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>');
    const menuScript=`<script id="akhisave-mobile-menu">(function(){function init(){var b=document.getElementById('akhisaveMenuBtn');var nav=document.querySelector('.nav');if(!b||!nav)return;var panel=document.getElementById('akhisaveMenuPanel');if(!panel){panel=document.createElement('div');panel.id='akhisaveMenuPanel';panel.innerHTML='<a href="#tools">Tools</a><a href="#how">How it works</a><a href="/faq.html">FAQ</a>';nav.appendChild(panel)}b.addEventListener('click',function(){var open=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',String(!open));panel.classList.toggle('open',!open)});panel.addEventListener('click',function(e){if(e.target.tagName==='A'){b.setAttribute('aria-expanded','false');panel.classList.remove('open')}})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()})()</script>`;
    out=out.replace(/<\/body>/i,menuScript+"</body>");
  }

  const css=`<style id="akhisave-brand-and-no-ads">
.brand-combined-logo{display:block!important;width:170px!important;height:58px!important;object-fit:contain!important;border-radius:0!important}.brand .brand-combined-logo{flex:0 0 auto!important}.brand strong,.brand b{display:none!important}
.loginbox .logo,#loginView .logo{content:url('${LOGO_ONLY}')!important;width:72px!important;height:72px!important;object-fit:contain!important;border-radius:0!important}.footer-brand{content:url('${WORDMARK}')!important;width:110px!important;height:28px!important;object-fit:contain!important;border-radius:0!important}
.akhisave-ad-banner,.akhisave-ad-slot,.ad,.ad-banner,.ad-slot,.social-bar,[id*="ad-"]{display:none!important}
${isWebsite?`body{background:#fff!important;color:#172033!important}.nav{background:#fff!important;border-bottom:1px solid #e7eaf0!important;backdrop-filter:blur(18px)!important;box-shadow:0 2px 14px rgba(20,30,50,.05)!important}.navlinks a{color:#566176!important}.navlinks a:hover{background:#f3f6fb!important;color:#172033!important}.eyebrow{background:#fff!important;border-color:#dfe5ee!important;color:#4b5870!important;box-shadow:0 8px 30px rgba(30,50,80,.08)!important}h1{color:#172033!important}h1 span{background:linear-gradient(100deg,#087ff5,#1266ff,#25a7ff)!important;-webkit-background-clip:text!important;color:transparent!important}.hero>p,.heading p,.step p,.feature p,.faq p,.seo p,.seo li{color:#68758a!important}.tab{background:#fff!important;border-color:#dce3ed!important;color:#5e6b80!important;box-shadow:0 5px 18px rgba(30,50,80,.06)!important}.tab.active{background:#eef6ff!important;border-color:#1786ff!important;color:#075fc0!important}.searchbox{background:#fff!important;border-color:#dce3ed!important;box-shadow:0 20px 60px rgba(30,50,80,.10)!important}.searchbox input{color:#172033!important}.searchbox input::placeholder{color:#8b96a8!important}.searchbox button{background:linear-gradient(135deg,#087ff5,#1266ff,#25a7ff)!important;box-shadow:0 10px 25px rgba(18,102,255,.20)!important}.toolcard,.step,.feature,.faq{background:#fff!important;border-color:#e0e5ec!important;box-shadow:0 12px 35px rgba(30,50,80,.07)!important}.toolcard:hover{border-color:#b9d9ff!important;box-shadow:0 18px 45px rgba(30,50,80,.11)!important}.toolcard b,.step h3,.feature h3,.heading h2,.seo h2,.seo h3{color:#172033!important}.toolcard small{color:#7b879a!important}.ico{background:#eef6ff!important;border-color:#d8eaff!important}.footer{border-top-color:#e2e6ed!important;color:#748095!important}.foot b{color:#172033!important}.foot a{color:#68758a!important}.akhisave-menu-btn{display:none!important}.akhisave-menu-btn{width:42px;height:42px;border:1px solid #dce3ed;background:#fff;border-radius:11px;align-items:center;justify-content:center;flex-direction:column;gap:5px;cursor:pointer;padding:0}.akhisave-menu-btn span{display:block;width:19px;height:2px;background:#172033;border-radius:3px}.akhisave-menu-btn[aria-expanded="true"]{background:#eef6ff;border-color:#b9d9ff}.akhisave-menu-btn[aria-expanded="true"] span:nth-child(2){opacity:0}.akhisave-menu-btn[aria-expanded="true"] span:first-child{transform:translateY(7px) rotate(45deg)}.akhisave-menu-btn[aria-expanded="true"] span:last-child{transform:translateY(-7px) rotate(-45deg)}#akhisaveMenuPanel{display:none}.navin{position:relative}@media(max-width:760px){.navlinks{display:none!important}.akhisave-menu-btn{display:flex!important}#akhisaveMenuPanel{position:absolute;right:12px;top:62px;width:190px;padding:8px;background:#fff;border:1px solid #dfe5ee;border-radius:14px;box-shadow:0 18px 45px rgba(20,30,50,.14);z-index:9999}#akhisaveMenuPanel.open{display:flex;flex-direction:column}#akhisaveMenuPanel a{padding:12px 13px;text-decoration:none;color:#263249;font-size:13px;font-weight:800;border-radius:9px}#akhisaveMenuPanel a:hover{background:#f2f6fb}}@media(max-width:650px){.brand-combined-logo{width:150px!important;height:52px!important}}`:''}
</style>`;
  out=out.replace(/<\/head>/i,css+"</head>");

  const guard=`<script id="akhisave-ad-cleaner">(function(){const bad=${BAD_AD.toString()};function clean(){document.querySelectorAll('script,iframe,object,embed').forEach(function(e){const s=(e.src||'')+' '+(e.data||'')+' '+(e.textContent||'')+' '+(e.outerHTML||'');if(bad.test(s)||/(?:adsterra|profitableratecpmnetwork|highrevenueformat|googlesyndication|doubleclick|popunder|push-notification)/i.test(s))e.remove()});document.querySelectorAll('[id],[class]').forEach(function(e){const s=String((e.id||'')+' '+(e.className||''));if(/(?:monetag|social[-_ ]?bar|ad[-_ ]?(?:banner|slot|container)|advertisement|adsterra)/i.test(s))e.remove()})}clean();new MutationObserver(clean).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','data','id','class']})})()</script>`;
  out=out.replace(/<\/body>/i,guard+"</body>");
  return out;
}

async function cleanResponse(response){
  const type=response.headers.get("content-type")||"";
  if(!type.includes("text/html"))return response;
  const out=cleanHtml(await response.text());
  const headers=new Headers(response.headers);
  headers.delete("content-length");headers.delete("content-encoding");
  headers.set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0");headers.set("Pragma","no-cache");
  headers.set("Content-Security-Policy","default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https://api.socialkit.dev; media-src 'self' blob: https:; frame-src 'none'; object-src 'none'; child-src 'none'; base-uri 'self'");
  headers.set("Permissions-Policy","notifications=(), camera=(), microphone=(), geolocation=()");
  headers.set("X-Content-Type-Options","nosniff");
  return new Response(out,{status:response.status,statusText:response.statusText,headers});
}

export default{async fetch(request,env,ctx){return cleanResponse(await app.fetch(request,env,ctx))}};
