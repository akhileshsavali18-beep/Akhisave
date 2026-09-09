import app from "./entry-fix.js";

function cleanLegacyAdText(html){
  let out=html;
  out=out.replace(/scriptatOptions\s*=\s*\{[\s\S]*?\}\s*;\s*\/script/gi,"");
  out=out.replace(/src=["']https?:\/\/[^"']*highrevenueformat\.com[^"']*["']\s*\/script/gi,"");
  return out;
}

export default {async fetch(request,env,ctx){
  const url=new URL(request.url);
  const r=await app.fetch(request,env,ctx);
  if(request.method!=="GET"||url.pathname.startsWith("/api/")||/^\/admin(?:\.html)?\/?$/i.test(url.pathname))return r;
  const ct=r.headers.get("content-type")||"";
  if(!ct.includes("text/html"))return r;
  const html=cleanLegacyAdText(await r.text());
  const h=new Headers(r.headers);h.set("Cache-Control","no-store");h.delete("content-length");
  return new Response(html,{status:r.status,headers:h});
}};
