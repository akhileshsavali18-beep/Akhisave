import app from "./ad-layout-fix.js";

function injectBlogCss(html){
  const tag='<link rel="stylesheet" href="/blog-polish.css?v=1">';
  if(html.includes('/blog-polish.css')) return html;
  return /<\/head>/i.test(html) ? html.replace(/<\/head>/i,tag+'</head>') : html.replace(/<body([^>]*)>/i,'<body$1>'+tag);
}

export default {
  async fetch(request, env, ctx){
    const response=await app.fetch(request,env,ctx);
    const path=new URL(request.url).pathname;
    if(request.method!=='GET'||!(path==='/blog'||path==='/blog/'||path.startsWith('/blog/'))) return response;
    const type=response.headers.get('content-type')||'';
    if(!type.includes('text/html')) return response;
    const html=injectBlogCss(await response.text());
    const headers=new Headers(response.headers);
    headers.delete('content-length');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};
