import app from "./worker-wrapper.js";

const json=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}});

function parseStatusUrl(raw){
  try{
    const u=new URL(String(raw||"").trim());
    if(u.protocol!=="https:") return null;
    const host=u.hostname.toLowerCase();
    if(!host||host==="localhost"||host.endsWith(".localhost")||/^127\./.test(host)||/^10\./.test(host)||/^192\.168\./.test(host)||/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return null;
    const parts=u.pathname.split("/").filter(Boolean);
    let id="";
    for(let i=parts.length-1;i>=0;i--){if(/^\d{4,}$/.test(parts[i])){id=parts[i];break}}
    if(!id) return null;
    return {origin:u.origin,host,id};
  }catch{return null}
}

async function statusProxy(request){
  let body;
  try{body=await request.json()}catch{return json({success:false,error:"Invalid request body."},400)}
  const parsed=parseStatusUrl(body?.url);
  if(!parsed)return json({success:false,error:"Please enter a valid public Mastodon post URL."},400);
  try{
    const r=await fetch(`${parsed.origin}/api/v1/statuses/${encodeURIComponent(parsed.id)}`,{headers:{Accept:"application/json","User-Agent":"AkhiSave/1.0"}});
    const data=await r.json().catch(()=>null);
    if(!r.ok||!data)return json({success:false,error:r.status===401?"This Mastodon server requires authentication for this post.":r.status===404?"Post not found or it is private.":"Mastodon could not return this post."},r.status===401||r.status===404?r.status:502);
    if(data.visibility!=="public"&&data.visibility!=="unlisted")return json({success:false,error:"Only public Mastodon posts are supported."},403);
    const media=Array.isArray(data.media_attachments)?data.media_attachments.map((m,i)=>({index:i,id:m.id||String(i),type:m.type||"unknown",url:m.url||"",previewUrl:m.preview_url||m.url||"",description:m.description||"",width:m.meta?.original?.width||m.meta?.small?.width||null,height:m.meta?.original?.height||m.meta?.small?.height||null})).filter(m=>m.url):[];
    return json({success:true,data:{instance:parsed.host,id:data.id,url:data.url||String(body.url||""),visibility:data.visibility,account:{displayName:data.account?.display_name||data.account?.username||"",username:data.account?.acct||data.account?.username||"",avatar:data.account?.avatar||""},createdAt:data.created_at||"",content:data.content||"",sensitive:!!data.sensitive,media}});
  }catch(e){return json({success:false,error:e instanceof Error?e.message:"Mastodon request failed."},502)}
}

async function mediaProxy(request){
  const u=new URL(request.url),raw=u.searchParams.get("url")||"",host=(u.searchParams.get("host")||"").toLowerCase();
  let target;
  try{target=new URL(raw)}catch{return json({success:false,error:"Invalid media URL."},400)}
  if(target.protocol!=="https:"||!host||!(target.hostname===host||target.hostname.endsWith("."+host)))return json({success:false,error:"Media source is not allowed."},403);
  try{
    const r=await fetch(target.toString(),{headers:{"User-Agent":"AkhiSave/1.0"}});
    if(!r.ok)return json({success:false,error:"Media could not be fetched. Try the original link instead."},502);
    const h=new Headers(r.headers);
    h.set("Content-Disposition","attachment; filename=akhisave-mastodon-media");
    h.set("Cache-Control","no-store");
    return new Response(r.body,{status:200,headers:h});
  }catch{return json({success:false,error:"Media download failed."},502)}
}

export default {async fetch(request,env,ctx){const u=new URL(request.url);if(u.pathname==="/api/mastodon"&&request.method==="POST")return statusProxy(request);if(u.pathname==="/api/mastodon-file"&&request.method==="GET")return mediaProxy(request);return app.fetch(request,env,ctx);}};
