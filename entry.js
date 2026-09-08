import app from "./admin-final.js";
import worker from "./worker.js";
import { track, analyticsResponse } from "./analytics-core.js";

export default {async fetch(request,env,ctx){
  const url=new URL(request.url);
  if(url.pathname==='/api/track')return track(request,env);
  if(url.pathname==='/api/admin/analytics'){
    const auth=await worker.fetch(new Request(new URL('/api/admin/status',request.url),{headers:request.headers}),env,ctx);
    if(!auth.ok)return auth;
    return analyticsResponse(env,url);
  }
  if(url.pathname==='/admin-dashboard-fix-v5.js'){
    const original=await env.ASSETS.fetch(request);
    if(!original.ok)return original;
    let js=await original.text();
    js=js.replace("const visitors=mode==='1'?num(a.today?.visitors):sum(rows,'visitors');\n   const newVisitors=mode==='1'?num(a.today?.newVisitors):sum(rows,'newVisitors');\n   const returning=mode==='1'?num(a.today?.returning):sum(rows,'returning');","const visitors=num(a.summary?.visitors);\n   const newVisitors=num(a.summary?.newVisitors);\n   const returning=num(a.summary?.returning);");
    const h=new Headers(original.headers);h.set('Cache-Control','no-store');return new Response(js,{status:original.status,headers:h});
  }
  return app.fetch(request,env,ctx);
}};