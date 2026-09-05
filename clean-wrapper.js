import app from "./worker-wrapper.js";

const COMBINED_LOGO="/4dc6e410-9139-4401-a2f8-84e67a0a29b2.png";
const ICON="/307a3722-6c83-4b6b-a3fa-a5a840bf5d4b.png";
const WORDMARK="/eb358ee7-8d58-460f-87fa-feb2edd6cd3d.png";
const OLD_LOGO="/38364009-f822-430a-9f51-694b12b8d9ef.png";

// Only the requested Adsterra 300x250 banner and native unit are inserted.
const BANNER=`<div class="ak-ad ak-ad-banner" aria-label="Advertisement"><script>atOptions={'key':'b5f10b469c2566d06ff288ac7dc9b5b2','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highrevenueformat.com/b5f10b469c2566d06ff288ac7dc9b5b2/invoke.js"></script></div>`;
const NATIVE=`<div class="ak-ad ak-ad-native" aria-label="Advertisement"><script async="async" data-cfasync="false" src="https://pl31187879.profitableratecpmnetwork.com/70d4c0990517d13f426b27f0fcfc6836/invoke.js"></script><div id="container-70d4c0990517d13f426b27f0fcfc6836"></div></div>`;

const BAD_MONETAG=/(monetag|nap5k\.com|n6wxm\.com|quge5\.com|al5sm\.com|5gvci\.com|omg10\.com|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165)/i;
const ADSTERRA=/(highrevenueformat\.com|profitableratecpmnetwork\.com|70d4c0990517d13f426b27f0fcfc6836|b5f10b469c2566d06ff288ac7dc9b5b2)/i;

function cleanHtml(html){
  let out=html;

  // Remove every old ad implementation first: Monetag and old Adsterra placements.
  out=out.replace(/<script\b[^>]*>?[\s\S]*?<\/script>/gi,(tag)=>BAD_MONETAG.test(tag)||ADSTERRA.test(tag)?"":tag);
  out=out.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi,(tag)=>BAD_MONETAG.test(tag)?"":tag);
  out=out.replace(/<div\b[^>]*(?:class|id)=["'][^"']*(?:monetag|social-bar|adsterra|ad-banner|ad-slot|advertisement)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,"");
  out=out.replace(/<div\s+class=["']ad["'][^>]*>[\s\S]*?<\/div>/gi,"");
  out=out.replace(/<div\s+id=["']container-70d4c0990517d13f426b27f0fcfc6836["'][^>]*><\/div>/gi,"");

  // Use the new combined logo everywhere a header/brand needs both logo + name.
  out=out.replaceAll(OLD_LOGO,COMBINED_LOGO).replaceAll("/akhisave-mark.svg",ICON);
  out=out.replace(/(<a\s+class=["']brand["'][^>]*>)[\s\S]*?<\/a>/gi,(m,start)=>start+`<img class="ak-unified-logo" src="${COMBINED_LOGO}" alt="AkhiSave">`+`</a>`);
  // Simple public pages (Privacy/Terms/DMCA/Contact) use a plain header link; make it the same logo.
  out=out.replace(/(<header\b[^>]*>\s*)<a\b[^>]*href=["'][^"']*akhisave\.online\/?["'][^>]*>[\s\S]*?<\/a>/i,(m,start)=>start+`<a class="ak-page-brand" href="/" aria-label="AkhiSave home"><img src="${COMBINED_LOGO}" alt="AkhiSave"></a>`);

  // Homepage header: hamburger on the left, same combined logo beside it.
  if(/<header[^>]*class=["']nav["']/i.test(out)){
    out=out.replace(/(<header\b[^>]*class=["'][^"']*nav[^"']*["'][^>]*>\s*<div\s+class=["']navin["'][^>]*>)/i,"$1<button class=\"ak-menu-btn\" id=\"akMenuBtn\" aria-label=\"Open menu\" aria-expanded=\"false\"><span></span><span></span><span></span></button>");
  }

  const menu=`<div class="ak-menu-backdrop" id="akMenuBackdrop"></div><aside class="ak-menu" id="akMenu"><div class="ak-menu-head"><img src="${ICON}" alt="AkhiSave"><b>AkhiSave</b><button id="akMenuClose" aria-label="Close menu">×</button></div><a href="/#tools">Tools</a><a href="/#how">How it works</a><a href="/faq.html">FAQ</a></aside><script>(function(){var b=document.getElementById('akMenuBtn'),m=document.getElementById('akMenu'),x=document.getElementById('akMenuClose'),o=document.getElementById('akMenuBackdrop');if(!b)return;function set(v){document.body.classList.toggle('ak-menu-open',v);b.setAttribute('aria-expanded',String(v))}b.onclick=function(){set(true)};if(x)x.onclick=function(){set(false)};if(o)o.onclick=function(){set(false)};if(m)m.querySelectorAll('a').forEach(function(a){a.onclick=function(){set(false)}})})();</script>`;
  if(/id="akMenuBtn"/.test(out))out=out.replace(/<\/body>/i,menu+"</body>");

  // Exactly three normal-flow Adsterra placements: top, middle, bottom.
  out=out.replace(/<\/header>/i,"</header>"+BANNER);
  const heroEnd=out.indexOf('</section>',out.indexOf('class="hero"'));
  if(heroEnd>=0)out=out.slice(0,heroEnd+10)+NATIVE+out.slice(heroEnd+10);
  out=out.replace(/(<footer\b[^>]*>)/i,BANNER+"$1");

  const css=`<style id="akhisave-final-fixes">
html{background:#070812!important;scroll-behavior:smooth}body{background:#070812!important;color:#f7f8fc!important}
header.nav{position:sticky!important;top:0!important;z-index:1000!important;background:#070812ee!important;border-bottom:1px solid #ffffff0b!important;backdrop-filter:blur(20px)!important}
header.nav .navin{position:relative!important;min-height:66px!important;padding:0 64px 0 58px!important;display:flex!important;align-items:center!important}
.brand{display:flex!important;align-items:center!important;text-decoration:none!important;min-width:0!important}.brand strong,.brand b{display:none!important}.brand .ak-unified-logo,.brand img{content:url('${COMBINED_LOGO}')!important;width:170px!important;height:58px!important;object-fit:contain!important;border-radius:0!important;display:block!important}
.ak-menu-btn{position:absolute!important;left:10px!important;top:50%!important;transform:translateY(-50%)!important;width:40px!important;height:40px!important;border:1px solid #ffffff16!important;border-radius:11px!important;background:#0e1422!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:5px!important;z-index:1100!important}.ak-menu-btn span{width:19px!important;height:2px!important;border-radius:2px!important;background:#fff!important;display:block!important}
.navlinks{display:none!important}.ak-menu-backdrop{position:fixed!important;inset:0!important;background:#0009!important;opacity:0!important;pointer-events:none!important;z-index:2000!important;transition:.2s!important}.ak-menu{position:fixed!important;left:10px!important;top:76px!important;width:min(300px,calc(100vw - 20px))!important;padding:12px!important;border:1px solid #ffffff16!important;border-radius:18px!important;background:#0b101d!important;box-shadow:0 25px 80px #000b!important;transform:translateY(-12px)!important;opacity:0!important;pointer-events:none!important;z-index:2100!important;transition:.2s!important}.ak-menu-open .ak-menu-backdrop{opacity:1!important;pointer-events:auto!important}.ak-menu-open .ak-menu{transform:none!important;opacity:1!important;pointer-events:auto!important}.ak-menu-head{display:flex;align-items:center;gap:9px;padding:5px 5px 11px;border-bottom:1px solid #ffffff0d}.ak-menu-head img{width:38px;height:38px;object-fit:contain}.ak-menu-head b{flex:1}.ak-menu-head button{border:0;background:transparent;color:#fff;font-size:27px}.ak-menu>a{display:block;padding:13px 10px;margin-top:4px;border-radius:10px;color:#aab5c8;text-decoration:none;font-size:13px;font-weight:800}
.ak-page-brand{display:inline-flex!important;align-items:center!important;text-decoration:none!important}.ak-page-brand img{width:170px!important;height:58px!important;object-fit:contain!important;display:block!important}.ak-page-brand+*{box-sizing:border-box}
.ak-ad{width:100%;display:flex;justify-content:center;align-items:center;overflow:hidden;margin:20px auto;position:relative!important;z-index:1!important}.ak-ad-banner{width:300px!important;min-height:250px!important;max-width:300px!important}.ak-ad-native{width:100%!important;max-width:720px!important;min-height:250px!important}.ak-ad-native>div{width:100%!important}
@media(max-width:650px){header.nav .navin{min-height:66px!important;padding:0 52px 0 54px!important}.brand .ak-unified-logo,.brand img{width:150px!important;height:52px!important}.ak-menu-btn{left:9px!important}.ak-page-brand img{width:150px!important;height:52px!important}.ak-ad{margin:16px auto}.ak-ad-banner{width:300px!important;height:250px!important}.ak-ad-native{min-height:250px!important}}
</style>`;
  out=out.replace(/<\/head>/i,css+"</head>");

  // Block Monetag if an old/dynamic script is injected after initial HTML.
  const guard=`<script id="akhisave-no-monetag">(function(){var bad=${BAD_MONETAG.toString()};function blocked(e){var s=(e&&((e.src||'')+' '+(e.textContent||'')+' '+(e.outerHTML||'')))||'';return bad.test(s)}function clean(){document.querySelectorAll('script,iframe').forEach(function(e){if(blocked(e))e.remove()});document.querySelectorAll('[id],[class]').forEach(function(e){if(bad.test(String((e.id||'')+' '+(e.className||''))))e.remove()})}var ap=Node.prototype.appendChild,ib=Node.prototype.insertBefore;Node.prototype.appendChild=function(n){if(blocked(n))return n;return ap.call(this,n)};Node.prototype.insertBefore=function(n,r){if(blocked(n))return n;return ib.call(this,n,r)};clean();new MutationObserver(clean).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','id','class']})})();</script>`;
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
  return new Response(out,{status:response.status,statusText:response.statusText,headers});
}

export default{async fetch(request,env,ctx){const u=new URL(request.url);if(u.pathname.startsWith('/admin'))return app.fetch(request,env,ctx);return cleanResponse(await app.fetch(request,env,ctx))}};
