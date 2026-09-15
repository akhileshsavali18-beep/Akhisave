import app from "./blog-polish-worker.js";

export default {
  async fetch(request,env,ctx){
    const u=new URL(request.url);
    if(request.method==="GET"&&(u.pathname==="/"||u.pathname==="/index.html")){
      // The legacy worker chain also intercepts `/` and renders the old homepage.
      // Serve the current repository index.html directly from Cloudflare Assets instead.
      // For /index.html use the root asset request so Cloudflare cannot canonicalize
      // /index.html back into this Worker route and create a redirect loop.
      const assetUrl=new URL(request.url);
      assetUrl.pathname="/";
      const assetRequest=new Request(assetUrl.toString(),request);
      const response=await env.ASSETS.fetch(assetRequest);
      const headers=new Headers(response.headers);
      headers.delete("content-length");
      headers.set("Cache-Control","no-store, no-cache, must-revalidate");
      headers.set("Pragma","no-cache");
      headers.set("Expires","0");
      return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
    }
    return app.fetch(request,env,ctx);
  }
};
