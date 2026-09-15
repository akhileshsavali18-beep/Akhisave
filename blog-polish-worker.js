import app from "./ad-layout-fix.js";

function injectCss(html, href){
  const tag=`<link rel="stylesheet" href="${href}">`;
  if(html.includes(href.split('?')[0])) return html;
  return /<\/head>/i.test(html) ? html.replace(/<\/head>/i,tag+'</head>') : html.replace(/<body([^>]*)>/i,'<body$1>'+tag);
}

const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const attr=v=>esc(v).replace(/`/g,'&#96;');

function injectBlogSeo(html,path,posts){
  if(!path.startsWith('/blog')) return html;
  const isArticle=/^\/blog\/[^/]+\/?$/i.test(path);
  const canonical=isArticle
    ? `https://akhisave.online/blog/${encodeURIComponent(decodeURIComponent(path.replace(/^\/blog\//,'').replace(/\/$/,'')))}`
    : 'https://akhisave.online/blog';
  const currentSlug=isArticle?decodeURIComponent(path.replace(/^\/blog\//,'').replace(/\/$/,'')):'';
  const post=(Array.isArray(posts)?posts:[]).find(p=>p&&p.slug===currentSlug&&p.published!==false);
  const title=post?.seoTitle||post?.title||'AkhiSave Blog – Practical Guides & Tips';
  const description=post?.seoDescription||post?.excerpt||'Practical guides, tips and useful information from AkhiSave.';
  let out=html;
  out=out.replace(/<link[^>]+rel=["']canonical["'][^>]*>/gi,'');
  out=out.replace(/<meta[^>]+name=["']description["'][^>]*>/gi,'');
  out=out.replace(/<meta[^>]+property=["']og:title["'][^>]*>/gi,'');
  out=out.replace(/<meta[^>]+property=["']og:description["'][^>]*>/gi,'');
  out=out.replace(/<meta[^>]+property=["']og:url["'][^>]*>/gi,'');
  out=out.replace(/<meta[^>]+property=["']og:type["'][^>]*>/gi,'');
  const meta=`<link rel="canonical" href="${attr(canonical)}"><meta name="description" content="${attr(description)}"><meta property="og:title" content="${attr(title)}"><meta property="og:description" content="${attr(description)}"><meta property="og:url" content="${attr(canonical)}"><meta property="og:type" content="${isArticle?'article':'website'}">`;
  const schema=isArticle&&post?`<script type="application/ld+json" id="ak-blog-posting-schema">${JSON.stringify({"@context":"https://schema.org","@type":"BlogPosting","headline":String(post.title||title),"description":String(description),"url":canonical,"datePublished":String(post.date||''),"dateModified":String(post.date||''),"author":{"@type":"Person","name":String(post.author||'AkhiSave')},"publisher":{"@type":"Organization","name":"AkhiSave","url":"https://akhisave.online"},"mainEntityOfPage":{"@type":"WebPage","@id":canonical}})}</script>`:'';
  out=out.replace(/<script[^>]+id=["']ak-blog-posting-schema["'][\s\S]*?<\/script>/gi,'');
  return /<\/head>/i.test(out)?out.replace(/<\/head>/i,meta+schema+'</head>'):out;
}

function injectBlogInternalLinks(html,path,posts){
  if(!path.startsWith('/blog')) return html;
  const published=(Array.isArray(posts)?posts:[]).filter(p=>p&&p.published!==false&&p.slug);
  const isArticle=/^\/blog\/[^/]+\/?$/i.test(path);
  if(isArticle){
    const current=decodeURIComponent(path.replace(/^\/blog\//,'').replace(/\/$/,''));
    const related=published.filter(p=>p.slug!==current).slice(0,2);
    const cards=related.map(p=>`<a href="/blog/${encodeURIComponent(p.slug)}" class="ak-blog-link-card"><span>${esc(p.category||'Guide')}</span><b>${esc(p.title||'Read more')}</b></a>`).join('');
    const section=`<section class="ak-blog-links" aria-label="Explore more on AkhiSave"><div class="ak-blog-links-inner"><div><small>CONTINUE EXPLORING</small><h2>More useful resources</h2><p>Explore AkhiSave tools and practical guides for everyday digital tasks.</p></div><div class="ak-blog-link-actions"><a class="ak-blog-tool-link" href="/image-resizer.html"><span>Image Resizer</span><b>Resize JPG, PNG & WebP images online →</b></a>${cards}</div></div></section>`;
    if(/<footer\b/i.test(html)) return html.replace(/<footer\b/i,section+'<footer');
    return html.replace(/<\/body>/i,section+'</body>');
  }
  const section=`<section class="ak-blog-index-cta" aria-label="AkhiSave tools"><div><small>AKHISAVE TOOLS</small><h2>Need a quick image resize?</h2><p>Resize JPG, PNG and WebP images with the free AkhiSave Image Resizer.</p></div><a href="/image-resizer.html">Open Image Resizer →</a></section>`;
  if(/<footer\b/i.test(html)) return html.replace(/<footer\b/i,section+'<footer');
  return html.replace(/<\/body>/i,section+'</body>');
}

function injectBlogSeoStyles(html){
  const css=`<style id="ak-blog-seo-links">.ak-blog-links{border-top:1px solid #e4eaf2;background:#f8fbff;padding:42px 18px}.ak-blog-links-inner{max-width:850px;margin:auto}.ak-blog-links small,.ak-blog-index-cta small{font-size:9px;font-weight:900;letter-spacing:.08em;color:#1677ff}.ak-blog-links h2,.ak-blog-index-cta h2{margin:7px 0 6px;font-size:24px;letter-spacing:-.8px;color:#0a1628}.ak-blog-links p,.ak-blog-index-cta p{margin:0;color:#68778b;font-size:12px;line-height:1.7}.ak-blog-link-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:18px}.ak-blog-tool-link,.ak-blog-link-card{display:block;text-decoration:none;border:1px solid #dfe7f0;border-radius:14px;background:#fff;padding:15px;transition:.2s}.ak-blog-tool-link:hover,.ak-blog-link-card:hover{transform:translateY(-2px);border-color:#c9dcf2;box-shadow:0 10px 25px rgba(18,38,68,.07)}.ak-blog-tool-link span,.ak-blog-link-card span{display:block;color:#1677ff;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.05em}.ak-blog-tool-link b,.ak-blog-link-card b{display:block;margin-top:7px;color:#0a1628;font-size:11px;line-height:1.5}.ak-blog-index-cta{max-width:1040px;margin:0 auto 60px;padding:24px 18px;border:1px solid #dceaf8;border-radius:18px;background:linear-gradient(135deg,#eef6ff,#effcff);display:flex;align-items:center;justify-content:space-between;gap:18px}.ak-blog-index-cta a{display:inline-flex;align-items:center;justify-content:center;white-space:nowrap;text-decoration:none;background:#1677ff;color:#fff;border-radius:10px;padding:11px 15px;font-size:10px;font-weight:900}@media(max-width:700px){.ak-blog-link-actions{grid-template-columns:1fr}.ak-blog-index-cta{margin-left:18px;margin-right:18px;display:block}.ak-blog-index-cta a{margin-top:15px}}
</style>`;
  if(html.includes('ak-blog-seo-links')) return html;
  return /<\/head>/i.test(html)?html.replace(/<\/head>/i,css+'</head>'):html;
}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const path=new URL(request.url).pathname;
    if(request.method!=='GET') return response;
    const type=response.headers.get('content-type')||'';
    if(!type.includes('text/html')) return response;
    const isBlog=path==='/blog'||path==='/blog/'||path.startsWith('/blog/');
    const isAdmin=path==='/admin.html'||path==='/admin.html/';
    if(!isBlog&&!isAdmin) return response;
    let html=await response.text();
    if(isBlog){
      html=injectCss(html,'/blog-polish.css?v=2');
      let posts=[];
      try{if(env.AKHISAVE_SETTINGS){const raw=await env.AKHISAVE_SETTINGS.get('blog_posts');const data=raw?JSON.parse(raw):[];posts=Array.isArray(data)?data:[];}}catch{}
      html=injectBlogSeo(html,path,posts);
      html=injectBlogInternalLinks(html,path,posts);
      html=injectBlogSeoStyles(html);
    }
    if(isAdmin) html=injectCss(html,'/admin-blog-polish.css?v=2');
    const headers=new Headers(response.headers);
    headers.delete('content-length');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};
