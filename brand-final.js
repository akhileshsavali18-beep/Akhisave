import base from "./clean-wrapper.js";

async function polish(response){
  const type=response.headers.get("content-type")||"";
  if(!type.includes("text/html")) return response;
  let html=await response.text();
  html=html.replace(/\s*[·•]\s*Public content only/gi,"");
  html=html.replace(/<button\b[^>]*class=["'][^"']*\bmenu\b[^"']*["'][^>]*>[\s\S]*?<\/button>/gi,"");
  html=html.replace(/<button\b[^>]*class=["'][^"']*\bmenuBtn\b[^"']*["'][^>]*>[\s\S]*?<\/button>/gi,"");
  html=html.replace(/<div\b[^>]*class=["'][^"']*\bmenu\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,"");
  html=html.replace(/(<button\b[^>]*class=["'][^"']*akhisave-menu-btn[^"']*["'][^>]*>[\s\S]*?<\/button>)[\s\S]*?(<button\b[^>]*class=["'][^"']*akhisave-menu-btn[^"']*["'][^>]*>[\s\S]*?<\/button>)/i,"$1");
  const isResult=/<div class=["']crumb["'][^>]*id=["']crumb["']/i.test(html);
  let resultCss="";
  if(isResult){
    resultCss=`
body{background:#fff!important;color:#0d1b2e!important}
.nav{height:72px!important;background:#fff!important;backdrop-filter:none!important;border-bottom:1px solid #e7edf4!important}
.navin{max-width:1120px!important}
.brand{gap:9px!important;color:#071426!important}
.brand img{width:43px!important;height:43px!important;border-radius:0!important}
.brand b{font-size:20px!important;color:#071426!important}
.brand b span{background:none!important;-webkit-background-clip:initial!important;color:#071426!important}
.back{border:1px solid #e7edf4!important;background:#fff!important;color:#536175!important}
.wrap{max-width:1000px!important;padding:30px 18px 70px!important}
.crumb{color:#7b8797!important}
h1{font-size:44px!important;line-height:1.08!important;letter-spacing:-2px!important;color:#0d1b2e!important}
.sub{color:#667386!important}
.card{background:#fff!important;border:1px solid #e7edf4!important;border-radius:20px!important;box-shadow:0 18px 55px rgba(19,55,89,.09)!important;color:#0d1b2e!important}
.loading{color:#667386!important}
.spinner{border-color:#e7edf4!important;border-top-color:#1597ff!important}
.username{color:#0d1b2e!important}
.fullname{color:#0d1b2e!important}
.bio{color:#667386!important}
.stats span{color:#7b8797!important}
.stats b{color:#0d1b2e!important}
.btn{border:1px solid #dce4ed!important;background:#fff!important;color:#33445a!important}
.primary{border:0!important;background:linear-gradient(135deg,#1597ff,#16c9e8)!important;color:#fff!important}
.media{border:1px solid #e7edf4!important;background:#f6f9fc!important}
.media-info{color:#667386!important}
.media-actions a{color:#33445a!important}
.media-actions .primary{color:#fff!important}
.preview{border:1px solid #e7edf4!important;background:#f6f9fc!important}
.meta{border:1px solid #e7edf4!important;background:#f6f9fc!important;color:#667386!important}
.meta b{color:#0d1b2e!important}
.empty,.error{color:#667386!important}
.error b{color:#0d1b2e!important}
.related a{border:1px solid #e7edf4!important;background:#fff!important;color:#087dcc!important}
.footer{color:#7c8898!important;border-top:0!important}
.footer a{color:#536175!important}
@media(max-width:700px){.nav{height:64px!important}.navin{padding:0 13px!important}.brand img{width:39px!important;height:39px!important}.brand b{font-size:18px!important}.wrap{padding:23px 13px 50px!important}h1{font-size:32px!important;letter-spacing:-1.4px!important}.card{padding:15px!important;border-radius:18px!important}}`;
  }
  const css=`
<style id="akhisave-final-polish">
.seo{background:transparent!important;border:0!important;box-shadow:none!important;border-radius:0!important;padding:30px 0 65px!important;max-width:900px!important}
.seo h2{margin-top:0!important}
.footer .foot>div:first-child{color:var(--akh-muted)!important}
.footer .foot>div:first-child b{color:var(--akh-navy)!important}
${resultCss}
</style>`;
  html=html.replace(/<\/head>/i,css+"</head>");
  const menuEnhance=`<style id="akhisave-premium-menu-css">.akhisave-menu-btn{display:none;width:48px;height:48px;border:1px solid #d8e1ec;background:linear-gradient(180deg,#fff,#f8fbff);border-radius:14px;align-items:center;justify-content:center;flex-direction:column;gap:5px;cursor:pointer;padding:0;box-shadow:0 7px 20px rgba(18,38,68,.09);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}.akhisave-menu-btn:hover{border-color:#bcd3ee;box-shadow:0 10px 25px rgba(18,38,68,.13)}.akhisave-menu-btn:active{transform:scale(.96)}.akhisave-menu-btn span{display:block;width:22px;height:2.5px;background:#122033;border-radius:4px;transition:transform .18s ease,opacity .18s ease}.akhisave-menu-btn[aria-expanded="true"] span:nth-child(2){opacity:0}.akhisave-menu-btn[aria-expanded="true"] span:first-child{transform:translateY(7.5px) rotate(45deg)}.akhisave-menu-btn[aria-expanded="true"] span:last-child{transform:translateY(-7.5px) rotate(-45deg)}#akhisaveMenuPanel{display:none!important;position:absolute!important;right:0!important;top:58px!important;width:238px!important;padding:8px!important;background:rgba(255,255,255,.98)!important;border:1px solid #dfe7f0!important;border-radius:16px!important;box-shadow:0 22px 55px rgba(18,38,68,.16)!important;z-index:99999!important;backdrop-filter:blur(14px)!important}#akhisaveMenuPanel.open{display:flex!important;flex-direction:column!important}#akhisaveMenuPanel a{padding:12px 13px!important;text-decoration:none!important;color:#263249!important;font-size:12px!important;font-weight:800!important;border-radius:10px!important}#akhisaveMenuPanel a:hover{background:#eef5ff!important;color:#0068fc!important}@media(max-width:760px){.akhisave-menu-btn{display:flex!important}.navin{position:relative!important}.brand-logo-full{max-width:calc(100% - 62px)!important}#akhisaveMenuPanel{right:0!important;top:57px!important}}@media(min-width:761px){#akhisaveMenuPanel{display:none!important}}</style>`;
  html=html.replace(/<\/head>/i,menuEnhance+"</head>");
  const menuScript=`<script id="akhisave-premium-menu-links">(function(){function setup(){var p=document.getElementById('akhisaveMenuPanel');if(!p)return;var path=location.pathname.toLowerCase();var instagram=path.indexOf('instagram')!==-1;var home='<a href="/">Home</a><a href="/instagram-downloader.html">Instagram Downloader</a><a href="/instagram-photo-downloader.html">Photo Downloader</a><a href="/instagram-reels-downloader.html">Reels Downloader</a><a href="/instagram-profile-viewer.html">Profile Viewer</a><a href="/contact.html">Contact</a>';var general='<a href="/#tools">Tools</a><a href="/#how">How it works</a><a href="/faq.html">FAQ</a><a href="/contact.html">Contact</a>';p.innerHTML=instagram?home:general}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup()})();</script>`;
  html=html.replace(/<\/body>/i,menuScript+"</body>");
  const headers=new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}

export default{async fetch(request,env,ctx){return polish(await base.fetch(request,env,ctx))}};
