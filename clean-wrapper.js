import app from "./worker-wrapper.js";

const ICON="/307a3722-6c83-4b6b-a3fa-a5a840bf5d4b.png";
const WORD="/eb358ee7-8d58-460f-87fa-feb2edd6cd3d.png";
const COMBINED="/4dc6e410-9139-4401-a2f8-84e67a0a29b2.png";
const OLD="/38364009-f822-430a-9f51-694b12b8d9ef.png";
const BANNER=`<div class="akhisave-ad"><span>ADVERTISEMENT</span><script>atOptions={'key':'b5f10b469c2566d06ff288ac7dc9b5b2','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highrevenueformat.com/b5f10b469c2566d06ff288ac7dc9b5b2/invoke.js"></script></div>`;
const VIGNETTE=`<script>(function(){var s=document.createElement('script');s.dataset.zone='11727165';s.src='https://nap5k.com/tag.min.js';document.body.appendChild(s)})()</script>`;

function theme(html,isAdmin){
 let out=html.replaceAll(OLD,COMBINED).replaceAll('/akhisave-mark.svg',ICON);
 const css=`<style id="akhisave-white-brand-theme">
:root{--bg:#f7f9fc!important;--panel:#fff!important;--panel2:#fff!important;--line:#e1e6ee!important;--text:#172033!important;--muted:#718096!important;--purple:#377ff0!important;--pink:#377ff0!important;--green:#19a974!important;--red:#dc3545!important}
html,body{background:#f7f9fc!important;color:#172033!important}body{font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif!important}
.nav,.topbar{background:#fff!important;border-bottom:1px solid #e2e7ee!important;box-shadow:0 2px 14px rgba(24,45,70,.06)!important;backdrop-filter:none!important}
.navin,.topin{max-width:1180px!important}.brand{display:flex!important;align-items:center!important;gap:10px!important;text-decoration:none!important}.brand img{content:url('${COMBINED}')!important;width:170px!important;height:58px!important;object-fit:contain!important;border-radius:0!important}.brand strong{display:none!important}
.navlinks a{color:#697586!important}.navlinks a:hover{background:#eef4ff!important;color:#2d76e8!important}
h1,h2,h3,h4{color:#172033!important}p,li,.hero>p,.heading p,.toolcard small,.step p,.feature p,.faq p,.seo p,.seo li{color:#718096!important}.eyebrow{background:#fff!important;color:#526174!important;border:1px solid #dfe5ed!important;box-shadow:0 5px 18px rgba(24,45,70,.05)!important}.dot{background:#1bb47b!important;box-shadow:none!important}
h1 span{background:linear-gradient(90deg,#2878ec,#1e69d6)!important;-webkit-background-clip:text!important;color:transparent!important}.tab{background:#fff!important;color:#697586!important;border:1px solid #dfe5ed!important;box-shadow:0 3px 12px rgba(24,45,70,.04)!important}.tab.active{background:#edf4ff!important;color:#1e6ee1!important;border-color:#3b80ed!important;box-shadow:none!important}
.searchbox{background:#fff!important;border:1px solid #d9e1eb!important;box-shadow:0 12px 35px rgba(24,45,70,.09)!important}.searchbox input{color:#172033!important}.searchbox input::placeholder{color:#8a96a6!important}.searchbox button{background:#377ff0!important;box-shadow:0 8px 20px #377ff033!important}
.toolcard,.step,.feature,.faq{background:#fff!important;color:#172033!important;border:1px solid #dfe5ed!important;box-shadow:0 5px 20px rgba(24,45,70,.045)!important}.toolcard:hover{border-color:#b8d0f5!important;box-shadow:0 12px 30px rgba(24,45,70,.08)!important}.toolcard.active{border-color:#377ff0!important}.ico{background:#edf4ff!important;border-color:#d8e7fc!important}.badge{background:#fff5dc!important;color:#9a6800!important;border-color:#efd69a!important}
.section{background:transparent!important}.seo a,.heading a{color:#2e77e8!important}.footer{background:#fff!important;border-top:1px solid #e1e6ee!important;color:#738096!important}.foot b{color:#172033!important}.foot a{color:#607087!important}
.akhisave-ad{width:300px;min-height:250px;margin:22px auto;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;background:#fff;border:1px solid #e1e6ee;border-radius:8px;overflow:hidden;box-shadow:0 4px 16px rgba(24,45,70,.04)}.akhisave-ad>span{font-size:8px;letter-spacing:1.4px;color:#9aa4b2;padding:6px 0 4px}
${isAdmin?`.card,.statcard,.section,.statusbox,.feature,.custom-editor,.empty,.loginbox,.drawer{background:#fff!important;color:#172033!important;border-color:#dfe5ed!important;box-shadow:0 5px 20px rgba(24,45,70,.06)!important}.iconbtn,.logout,.btn,.mini{background:#fff!important;color:#334155!important;border-color:#d9e1eb!important;box-shadow:none!important}.btn.primary{background:#377ff0!important;color:#fff!important;border:0!important}.switch:checked{background:#377ff0!important}.field input,.field textarea,.field select,.loginbox input{background:#fff!important;color:#172033!important;border-color:#d7e0ea!important}.label,.toolmeta,.muted{color:#718096!important}.drawer{background:#fff!important}.drawer a{color:#627087!important}.drawer a.active,.drawer a:hover{background:#edf4ff!important;color:#226fe0!important}.bottom{background:#fff!important;border-top:1px solid #e0e5ec!important}.bottom button{color:#718096!important}.bottom button.active{color:#2877e8!important}.status{background:#eaf8f2!important;color:#13875a!important;border-color:#bce8d4!important}`:''}
@media(max-width:650px){.brand{gap:8px!important}.brand img{width:150px!important;height:52px!important}.nav{height:66px!important}.navlinks a{font-size:10px!important}.akhisave-ad{max-width:300px}}
</style>`;
 out=out.replace(/<\/head>/i,css+'</head>');
 if(!isAdmin){
   // Keep advertising enabled, but use clean rectangular banner placements instead of notification-style overlays.
   out=out.replace(/<div class="ad">ADVERTISEMENT<\/div>/i,BANNER);
   if(!/akhisave-ad/.test(out)) out=out.replace(/<header([^>]*)>/i,'<header$1>'+BANNER);
   out=out.replace(/<\/main>/i,BANNER+'</main>');
   out=out.replace(/<\/body>/i,VIGNETTE+'</body>');
 }
 return out;
}

async function htmlResponse(r,request){
 const type=r.headers.get('content-type')||'';if(!type.includes('text/html'))return r;
 const p=new URL(request.url).pathname;const isAdmin=/^\/admin(?:\.html)?\/?$/i.test(p);const body=theme(await r.text(),isAdmin);
 const h=new Headers(r.headers);h.delete('content-length');h.delete('content-encoding');h.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');h.set('Pragma','no-cache');
 return new Response(body,{status:r.status,statusText:r.statusText,headers:h});
}

export default{async fetch(request,env,ctx){return htmlResponse(await app.fetch(request,env,ctx),request)}};
