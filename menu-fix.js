import base from "./brand-final.js";

function tokenClass(block, token){
  const m=block.match(/\bclass=["']([^"']*)["']/i);
  return !!(m && new RegExp("(?:^|\\s)"+token+"(?:\\s|$)","i").test(m[1]));
}

async function fixMenu(response){
  const type=response.headers.get("content-type")||"";
  if(!type.includes("text/html")) return response;
  let html=await response.text();
  if(/<title>AkhiSave Admin<\/title>/i.test(html)) return response;

  html=html.replace(/<script\b[^>]*id=["'](?:akhisave-mobile-menu|akhisave-premium-menu-links)["'][^>]*>[\s\S]*?<\/script>/gi,"");
  html=html.replace(/<style\b[^>]*id=["'](?:akhisave-mobile-menu-css|akhisave-premium-menu-css)["'][^>]*>[\s\S]*?<\/style>/gi,"");
  html=html.replace(/<button\b[^>]*>[\s\S]*?<\/button>/gi,(block)=>{
    if(tokenClass(block,"akhisave-menu-btn")||tokenClass(block,"menu")||tokenClass(block,"menuBtn")) return "";
    return block;
  });
  html=html.replace(/<div\b[^>]*id=["']akhisaveMenuPanel["'][^>]*>[\s\S]*?<\/div>/gi,"");

  const header=/<header\b/i.test(html);
  if(!header) return new Response(html,{status:response.status,statusText:response.statusText,headers:response.headers});

  const markup=`<button class="akhisave-menu-btn" id="akhisaveMenuBtn" type="button" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button><div id="akhisaveMenuPanel" aria-hidden="true"></div>`;
  const navinOpen=/<div\b[^>]*class=["'][^"']*(?:^|\s)navin(?:\s|$)[^"']*["'][^>]*>/i;
  if(navinOpen.test(html)) html=html.replace(navinOpen,(m)=>m+markup);
  else html=html.replace(/<\/header>/i,markup+"</header>");

  const css=`<style id="akhisave-menu-fix-css">.akhisave-menu-btn{display:flex!important;width:48px;height:48px;flex:0 0 48px;border:1px solid #d8e1ec;background:linear-gradient(180deg,#fff,#f8fbff);border-radius:14px;align-items:center;justify-content:center;flex-direction:column;gap:5px;cursor:pointer;padding:0;box-shadow:0 7px 20px rgba(18,38,68,.09);position:absolute!important;right:0!important;top:50%!important;transform:translateY(-50%)!important;z-index:100001}.akhisave-menu-btn:active{transform:translateY(-50%) scale(.96)!important}.akhisave-menu-btn span{display:block;width:22px;height:2.5px;background:#122033;border-radius:4px;transition:transform .18s ease,opacity .18s ease}.akhisave-menu-btn[aria-expanded="true"] span:nth-child(2){opacity:0}.akhisave-menu-btn[aria-expanded="true"] span:first-child{transform:translateY(7.5px) rotate(45deg)}.akhisave-menu-btn[aria-expanded="true"] span:last-child{transform:translateY(-7.5px) rotate(-45deg)}.navin{position:relative!important}.navlinks{display:none!important}#akhisaveMenuPanel{display:none!important;position:absolute!important;right:0!important;top:62px!important;width:238px!important;padding:8px!important;background:rgba(255,255,255,.99)!important;border:1px solid #dfe7f0!important;border-radius:16px!important;box-shadow:0 22px 55px rgba(18,38,68,.16)!important;z-index:100000!important}#akhisaveMenuPanel.open{display:flex!important;flex-direction:column!important}#akhisaveMenuPanel a{padding:12px 13px!important;text-decoration:none!important;color:#263249!important;font-size:12px!important;font-weight:800!important;border-radius:10px!important}#akhisaveMenuPanel a:hover{background:#eef5ff!important;color:#0068fc!important}@media(max-width:760px){.navin{min-height:74px!important;padding:0 13px!important}.brand-logo-full{max-width:calc(100% - 62px)!important}#akhisaveMenuPanel{right:0!important;top:61px!important}}@media(min-width:761px){.akhisave-menu-btn{display:flex!important}}</style>`;
  html=html.replace(/<\/head>/i,css+"</head>");

  const script=`<script id="akhisave-menu-fix-script">(function(){function init(){var b=document.getElementById('akhisaveMenuBtn'),p=document.getElementById('akhisaveMenuPanel');if(!b||!p||b.dataset.bound==='1')return;b.dataset.bound='1';var path=location.pathname.toLowerCase();var instagram=path.indexOf('instagram')!==-1;var mastodon=path.indexOf('mastodon')!==-1;var links=mastodon?'<a href="/">Home</a><a href="/mastodon-downloader.html">Mastodon Downloader</a><a href="/contact.html">Contact</a>':instagram?'<a href="/">Home</a><a href="/instagram-downloader.html">Instagram Downloader</a><a href="/instagram-photo-downloader.html">Photo Downloader</a><a href="/instagram-reels-downloader.html">Reels Downloader</a><a href="/instagram-profile-viewer.html">Profile Viewer</a><a href="/contact.html">Contact</a>':'<a href="/#tools">Tools</a><a href="/#how">How it works</a><a href="/faq.html">FAQ</a><a href="/contact.html">Contact</a>';p.innerHTML=links;b.addEventListener('click',function(e){e.stopPropagation();var open=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',String(!open));p.setAttribute('aria-hidden',String(open));p.classList.toggle('open',!open)});p.addEventListener('click',function(e){if(e.target.tagName==='A'){b.setAttribute('aria-expanded','false');p.setAttribute('aria-hidden','true');p.classList.remove('open')}});document.addEventListener('click',function(e){if(!p.contains(e.target)&&!b.contains(e.target)){b.setAttribute('aria-expanded','false');p.setAttribute('aria-hidden','true');p.classList.remove('open')}})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()})();</script>`;
  html=html.replace(/<\/body>/i,script+"</body>");

  const headers=new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}

export default {async fetch(request,env,ctx){return fixMenu(await base.fetch(request,env,ctx));}};
