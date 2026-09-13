import app from "./ad-layout-fix.js";

function injectCss(html, href){
  const tag=`<link rel="stylesheet" href="${href}">`;
  if(html.includes(href.split('?')[0])) return html;
  return /<\/head>/i.test(html) ? html.replace(/<\/head>/i,tag+'</head>') : html.replace(/<body([^>]*)>/i,'<body$1>'+tag);
}

export default {
  async fetch(request, env, ctx){
    const response=await app.fetch(request,env,ctx);
    const path=new URL(request.url).pathname;
    if(request.method!=='GET') return response;
    const type=response.headers.get('content-type')||'';
    if(!type.includes('text/html')) return response;
    const isBlog=path==='/blog'||path==='/blog/'||path.startsWith('/blog/');
    const isAdmin=path==='/admin.html'||path==='/admin.html/';
    if(!isBlog&&!isAdmin) return response;
    let html=await response.text();
    if(isBlog) html=injectCss(html,'/blog-polish.css?v=2');
    if(isAdmin) html=injectCss(html,'/admin-blog-polish.css?v=2');
    const headers=new Headers(response.headers);
    headers.delete('content-length');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};
