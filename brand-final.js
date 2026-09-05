import base from "./clean-wrapper.js";

async function polish(response){
  const type=response.headers.get("content-type")||"";
  if(!type.includes("text/html")) return response;
  let html=await response.text();
  html=html.replace(/\s*[·•]\s*Public content only/gi,"");
  const css=`
<style id="akhisave-final-polish">
.seo{background:transparent!important;border:0!important;box-shadow:none!important;border-radius:0!important;padding:30px 0 65px!important;max-width:900px!important}
.seo h2{margin-top:0!important}
.footer .foot>div:first-child{color:var(--akh-muted)!important}
.footer .foot>div:first-child b{color:var(--akh-navy)!important}
@media(max-width:650px){.seo{padding:24px 0 45px!important}.seo h2{font-size:23px!important}.seo h3{font-size:15px!important}.seo p{font-size:12px!important;line-height:1.75!important}}
</style>`;
  html=html.replace(/<\/head>/i,css+"</head>");
  const headers=new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}

export default{async fetch(request,env,ctx){return polish(await base.fetch(request,env,ctx))}};
