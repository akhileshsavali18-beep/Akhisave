import app from "./blog-polish-worker.js";
import rootApp from "./ad-layout-fix.js";

async function forceHomepage(request,env,ctx){
  const u=new URL(request.url);
  const assetUrl=new URL("/index.html",u);
  const assetRequest=new Request(assetUrl.toString(),request);
  return rootApp.fetch(assetRequest,env,ctx);
}

export default {
  async fetch(request,env,ctx){
    const u=new URL(request.url);
    if(request.method==="GET"&&(u.pathname==="/"||u.pathname==="/index.html")){
      const response=await forceHomepage(request,env,ctx);
      const type=response.headers.get("content-type")||"";
      if(!type.includes("text/html"))return response;
      const html=await response.text();
      const headers=new Headers(response.headers);
      headers.delete("content-length");
      headers.set("Cache-Control","no-store");
      return new Response(html,{status:response.status,statusText:response.statusText,headers});
    }
    return app.fetch(request,env,ctx);
  }
};
