import app from "./worker-wrapper.js";

const LOGO_ONLY="/Logo.png";
const WORDMARK="/Name.png";
const COMBINED_LOGO="/LogoName.png";
const OLD_LOGO="/38364009-f822-430a-9f51-694b12b8d9ef.png";
const OLD_WORDMARK="/eb358ee7-8d58-460f-87fa-feb2edd6cd3d.png";
const OLD_COMBINED="/4dc6e410-9139-4401-a2f8-84e67a0a29b2.png";
const BAD_AD=/(monetag|monetag\.com|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|profitableratecpmnetwork|highrevenueformat|adsterra|googlesyndication|doubleclick|popunder|push-notification|tag\.min\.js|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165)/i;

function cleanHtml(html){
  let out=html;
  out=out.replace(/<script\b[^>]*(?:monetag|monetag\.com|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|profitableratecpmnetwork|highrevenueformat|adsterra|googlesyndication|doubleclick|popunder|push-notification|tag\.min\.js|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165)[^>]*>[\s\S]*?<\/script>/gi,"");
  out=out.replace(/<script\b[^>]*>[\s\S]*?(?:dataset\.zone|tag\.min\.js|nap5k|monetag)[\s\S]*?<\/script>/gi,"");
  out=out.replace(/<iframe\b[^>]*(?:monetag|profitableratecpmnetwork|highrevenueformat|adsterra)[^>]*>[\s\S]*?<\/iframe>/gi,"");
  out=out.replace(/<div\b[^>]*(?:class|id)=["'][^"']*(?:ad-banner|ad-slot|advertisement|social-bar|akhisave-ad|monetag|adsterra)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,"");
  out=out.replace(/<div\s+class=["']ad["'][^>]*>[\s\S]*?<\/div>/gi,"");
  out=out.replaceAll(OLD_LOGO,LOGO_ONLY).replaceAll(OLD_WORDMARK,WORDMARK).replaceAll(OLD_COMBINED,COMBINED_LOGO).replaceAll("/akhisave-mark.svg",LOGO_ONLY);
  const isWebsite=/<header[^>]+class=["']nav["']/i.test(out);
  const themeCss=`
:root{--akh-blue:#0068fc;--akh-cyan:#00bffc;--akh-navy:#071426;--akh-text:#122033;--akh-muted:#667386;--akh-line:#e4eaf2;--akh-soft:#f5f8fc}
html,body{background:#fff!important;color:var(--akh-text)!important}
body{background-image:none!important;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
body:before,body:after{display:none!important}
.nav,header.nav{background:rgba(255,255,255,.96)!important;border-bottom:1px solid var(--akh-line)!important;box-shadow:0 1px 8px rgba(15,35,65,.04)!important;backdrop-filter:blur(12px)!important}
.navin{max-width:1180px!important;min-height:72px!important}
.navlinks a{color:#435168!important}
.navlinks a:hover{color:var(--akh-blue)!important}
.brand{color:var(--akh-navy)!important}
.hero{background:transparent!important;box-shadow:none!important;border:0!important}
.hero h1,.hero h2,.heading h2,.section-title{color:var(--akh-navy)!important;letter-spacing:-.035em!important}
.hero p,.heading p,.muted,.sub,.description{color:var(--akh-muted)!important}
.eyebrow{color:var(--akh-blue)!important;background:#eef5ff!important;border-color:#d8e8ff!important}
.toolbar,.tool-tabs,.tabs{background:#f5f8fc!important;border:1px solid var(--akh-line)!important;box-shadow:none!important}
.tab,.tool-tab{color:#526177!important;background:transparent!important;border-color:transparent!important}
.tab:hover,.tool-tab:hover{color:var(--akh-blue)!important;background:#fff!important}
.tab.active,.tool-tab.active{color:#fff!important;background:linear-gradient(135deg,var(--akh-blue),var(--akh-cyan))!important;border-color:transparent!important;box-shadow:0 8px 18px rgba(0,104,252,.18)!important}
.searchbox,.search-wrap,.input-wrap{background:#fff!important;border:1px solid #d8e1ec!important;box-shadow:0 8px 28px rgba(20,45,80,.07)!important}
.searchbox:focus-within,.search-wrap:focus-within,.input-wrap:focus-within{border-color:#9bc3ff!important;box-shadow:0 0 0 4px rgba(0,104,252,.08),0 8px 28px rgba(20,45,80,.07)!important}
.searchbox input,.search-wrap input,.input-wrap input{color:var(--akh-text)!important;background:#fff!important}
.searchbox input::placeholder,.search-wrap input::placeholder,.input-wrap input::placeholder{color:#98a4b4!important}
.searchbox button,.search-wrap button,.input-wrap button,.download-btn,.btn-primary{background:linear-gradient(135deg,var(--akh-blue),var(--akh-cyan))!important;color:#fff!important;border:0!important;box-shadow:0 9px 20px rgba(0,104,252,.2)!important}
.toolcard,.card,.feature,.step,.faq,.seo,.result-card{background:#fff!important;color:var(--akh-text)!important;border:1px solid var(--akh-line)!important;box-shadow:0 10px 30px rgba(18,38,68,.06)!important}
.toolcard:hover,.card:hover{border-color:#c7daf5!important;box-shadow:0 14px 34px rgba(18,38,68,.09)!important;transform:translateY(-2px)}
.toolcard.active{border-color:#b7d3ff!important;box-shadow:0 12px 34px rgba(0,104,252,.1)!important}
.ico,.icon{background:#eef5ff!important;color:var(--akh-blue)!important}
.badge,.pill{background:#eef5ff!important;color:var(--akh-blue)!important;border-color:#d8e8ff!important}
.footer,footer{background:#f7f9fc!important;border-top:1px solid var(--akh-line)!important;color:#667386!important}
.footer a,footer a{color:#526177!important}
.footer a:hover,footer a:hover{color:var(--akh-blue)!important}
.seo h2,.seo h3,.faq h3,.feature h3,.step h3{color:var(--akh-navy)!important}
.seo p,.faq p,.feature p,.step p{color:#667386!important}
hr{border-color:var(--akh-line)!important}
::selection{background:#cfe3ff!important;color:var(--akh-navy)!important}
.ad,.akhisave-ad-slot,.akhisave-ad-banner,.akhisave-ad-placeholder,.ad-banner,.ad-slot,.social-bar,[id*="ad-"]{display:none!important}
@media(max-width:760px){.navin{min-height:68px!important}.hero{padding-top:28px!important}.searchbox,.search-wrap,.input-wrap{border-radius:14px!important}.searchbox button,.search-wrap button,.input-wrap button{min-height:46px!important}}
`;
  if(isWebsite){
    out=out.replace(/(<a\s+class=["']brand["'][^>]*>)[\s\S]*?(<\/a>)/i,'$1<img class="brand-logo-mark" src="'+LOGO_ONLY+'" alt="AkhiSave logo"><img class="brand-logo-wordmark" src="'+WORDMARK+'" alt="AkhiSave">$2');
    out=out.replace(/<\/head>/i,`<style id="akhisave-final-ui">${themeCss}.brand{display:flex!important;align-items:center!important;gap:9px!important}.brand-logo-mark{width:52px!important;height:52px!important;object-fit:contain!important;border-radius:0!important}.brand-logo-wordmark{width:136px!important;height:38px!important;object-fit:contain!important;border-radius:0!important}.brand strong,.brand b{display:none!important}</style></head>`);
    if(!out.includes('id="akhisaveMenuBtn"')){
      out=out.replace(/(<\/nav>)/i,'$1<button class="akhisave-menu-btn" id="akhisaveMenuBtn" type="button" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>');
      const menuScript=`<script id="akhisave-mobile-menu">(function(){function init(){var b=document.getElementById('akhisaveMenuBtn'),nav=document.querySelector('.nav');if(!b||!nav)return;var p=document.getElementById('akhisaveMenuPanel');if(!p){p=document.createElement('div');p.id='akhisaveMenuPanel';p.innerHTML='<a href="#tools">Tools</a><a href="#how">How it works</a><a href="/faq.html">FAQ</a>';nav.appendChild(p)}b.addEventListener('click',function(){var o=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',String(!o));p.classList.toggle('open',!o)});p.addEventListener('click',function(e){if(e.target.tagName==='A'){b.setAttribute('aria-expanded','false');p.classList.remove('open')}})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()})()</script>`;
      out=out.replace(/<\/body>/i,menuScript+'</body>');
      out=out.replace(/<\/head>/i,`<style id="akhisave-mobile-menu-css">.akhisave-menu-btn{display:none;width:42px;height:42px;border:1px solid #dce3ed;background:#fff;border-radius:11px;align-items:center;justify-content:center;flex-direction:column;gap:5px;cursor:pointer;padding:0}.akhisave-menu-btn span{display:block;width:19px;height:2px;background:#172033;border-radius:3px}.akhisave-menu-btn[aria-expanded="true"] span:nth-child(2){opacity:0}.akhisave-menu-btn[aria-expanded="true"] span:first-child{transform:translateY(7px) rotate(45deg)}.akhisave-menu-btn[aria-expanded="true"] span:last-child{transform:translateY(-7px) rotate(-45deg)}#akhisaveMenuPanel{display:none}.navin{position:relative}@media(max-width:760px){.navlinks{display:none!important}.akhisave-menu-btn{display:flex!important}#akhisaveMenuPanel{position:absolute;right:12px;top:68px;width:190px;padding:8px;background:#fff;border:1px solid #dfe5ee;border-radius:14px;box-shadow:0 18px 45px rgba(20,30,50,.14);z-index:9999}#akhisaveMenuPanel.open{display:flex;flex-direction:column}#akhisaveMenuPanel a{padding:12px 13px;text-decoration:none;color:#263249;font-size:13px;font-weight:800;border-radius:9px}}</style></head>`);
    }
  } else {
    out=out.replace(/<\/head>/i,`<style id="akhisave-global-ui">${themeCss}</style></head>`);
  }
  const guard=`<script id="akhisave-zero-ads">(function(){const bad=${BAD_AD.toString()};function clean(){document.querySelectorAll('script,iframe,object,embed').forEach(function(e){const s=(e.src||'')+' '+(e.data||'')+' '+(e.textContent||'')+' '+(e.outerHTML||'');if(bad.test(s))e.remove()});document.querySelectorAll('[id],[class]').forEach(function(e){const s=String((e.id||'')+' '+(e.className||''));if(/(?:monetag|social[-_ ]?bar|ad[-_ ]?(?:banner|slot|container)|advertisement|adsterra|akhisave-ad)/i.test(s))e.remove()})}clean();new MutationObserver(clean).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','data','id','class']})})()</script>`;
  out=out.replace(/<\/body>/i,guard+'</body>');
  return out;
}

async function cleanResponse(response){
  const type=response.headers.get("content-type")||"";
  if(!type.includes("text/html"))return response;
  const out=cleanHtml(await response.text());
  const headers=new Headers(response.headers);
  headers.delete("content-length");headers.delete("content-encoding");
  headers.set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0");
  headers.set("Pragma","no-cache");
  headers.set("Content-Security-Policy","default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https://api.socialkit.dev; media-src 'self' blob: https:; frame-src 'none'; object-src 'none'; child-src 'none'; base-uri 'self'");
  headers.set("Permissions-Policy","notifications=(), camera=(), microphone=(), geolocation=()");
  headers.set("X-Content-Type-Options","nosniff");
  return new Response(out,{status:response.status,statusText:response.statusText,headers});
}
export default{async fetch(request,env,ctx){return cleanResponse(await app.fetch(request,env,ctx))}};
