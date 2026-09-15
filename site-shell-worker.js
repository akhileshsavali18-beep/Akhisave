import app from "./blog-polish-worker.js";
import rootApp from "./ad-layout-fix.js";

export default {
  async fetch(request,env,ctx){
    const u=new URL(request.url);
    if(request.method==="GET"&&(u.pathname==="/"||u.pathname==="/index.html")){
      // Keep the public homepage on the normal root request path.
      // Rewriting / to /index.html can trigger platform index canonicalization.
      const homepageRequest=new Request(request);
      const response=await rootApp.fetch(homepageRequest,env,ctx);
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
