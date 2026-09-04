import app from "./worker.js";

const SK = "https://api.socialkit.dev";

export default {
  async fetch(request, env, ctx) {
    const u = new URL(request.url);

    if (u.pathname === "/api/admin/socialkit-check") return adminCheck(request, env, ctx);
    if (u.pathname === "/api/instagram/profile" && request.method === "POST") return profileProxy(request, env);
    if (u.pathname === "/api/instagram/posts" && request.method === "POST") return feedProxy(request, env, "/instagram/channel-posts");
    if (u.pathname === "/api/instagram/reels" && request.method === "POST") return feedProxy(request, env, "/instagram/channel-reels");
    if (u.pathname === "/api/download" && request.method === "POST") return download(request, env);
    if (u.pathname === "/api/download-file" && request.method === "POST") return downloadFile(request, env);

    if (request.method === "GET" && (u.pathname === "/admin" || u.pathname === "/admin.html")) {
      const r = await app.fetch(request, env, ctx);
      if (!r.ok || !(r.headers.get("content-type") || "").includes("text/html")) return r;
      const h = new Headers(r.headers); h.set("Cache-Control", "no-store");
      return new Response(injectDiagnostic(await r.text()), { status:r.status, headers:h });
    }
    return app.fetch(request, env, ctx);
  }
};

const key = env => String(env.SOCIALKIT_API_KEY || "").trim().replace(/^Bearer\s+/i, "").replace(/^["']|["']$/g, "");
const isIG = s => { try { const u=new URL(s); return /^https?:$/i.test(u.protocol) && /(^|\.)instagram\.com$/i.test(u.hostname); } catch { return false; } };
const json = (d,s=200) => new Response(JSON.stringify(d),{status:s,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}});
async function read(r){const t=await r.text();try{return JSON.parse(t)}catch{return{message:t.slice(0,500)}}}
function msg(d,f="SocialKit could not process this request."){return String(d?.message??d?.error??d?.detail??f).slice(0,1000)}
async function sk(endpoint, sourceUrl, env, extra={}){try{const r=await fetch(SK+endpoint,{method:"POST",headers:{"Content-Type":"application/json","x-access-key":key(env),Accept:"application/json"},body:JSON.stringify({access_key:key(env),url:sourceUrl,...extra})});return{ok:r.ok,status:r.status,data:await read(r)}}catch(e){return{ok:false,status:0,data:{message:e instanceof Error?e.message:"Upstream request failed."}}}}
function fail(r){return json({success:false,error:msg(r.data),code:"SOCIALKIT_UPSTREAM_ERROR"},r.status===401||r.status===403?503:(r.status||502))}

async function adminCheck(request,env,ctx){
  if(request.method!=="GET"&&request.method!=="POST")return json({success:false,error:"Method not allowed"},405);
  const auth=await app.fetch(new Request(new URL("/api/admin/status",request.url),{headers:request.headers}),env,ctx);if(!auth.ok)return json({success:false,error:"Unauthorized"},401);
  const out={success:true,configured:!!key(env),httpStatus:null,upstreamMessage:"",credits:null,checkedAt:new Date().toISOString(),status:key(env)?"Checking...":"API Key Not Configured"};
  if(key(env))try{const r=await fetch(SK+"/test",{headers:{"x-access-key":key(env),Accept:"application/json"}});const d=await read(r);out.httpStatus=r.status;out.upstreamMessage=msg(d,r.statusText);out.status=r.ok&&d?.success!==false?"SocialKit Access OK":"SocialKit API Error";try{const c=await fetch(SK+"/credits",{headers:{"x-access-key":key(env),Accept:"application/json"}});const cd=await read(c);if(c.ok&&cd?.success!==false)out.credits=cd.data||null}catch{}}catch(e){out.httpStatus=0;out.upstreamMessage=e instanceof Error?e.message:"Connection failed.";out.status="SocialKit Connection Error"}
  if(env.AKHISAVE_SETTINGS)try{await env.AKHISAVE_SETTINGS.put("socialkit_last_check",JSON.stringify(out))}catch{}
  return json(out);
}

async function profileProxy(request,env){let b;try{b=await request.json()}catch{return json({success:false,error:"Invalid request body."},400)}const url=String(b?.url||"").trim();if(!isIG(url))return json({success:false,error:"Please enter a valid public Instagram profile URL."},400);if(!key(env))return json({success:false,error:"Instagram tools are temporarily unavailable."},503);const r=await sk("/instagram/channel-stats",url,env);if(!r.ok||r.data?.success===false)return fail(r);const p=r.data?.data||r.data;return json({success:true,data:{...p,username:p.username||p.userName||p.handle||"",displayName:p.displayName||p.fullName||p.name||p.nickname||"",bio:p.bio||p.description||"",followers:p.followers??p.followerCount??p.followersCount,following:p.following??p.followingCount,posts:p.posts??p.postCount??p.postsCount,verified:p.verified??p.isVerified??false,avatar:p.avatar||p.profilePicture||p.profilePic||p.profilePhoto||p.profile_picture||p.avatarUrl||p.image||"",profileUrl:p.profileUrl||p.url||""}})}
async function feedProxy(request,env,endpoint){let b;try{b=await request.json()}catch{return json({success:false,error:"Invalid request body."},400)}const url=String(b?.url||"").trim();if(!isIG(url))return json({success:false,error:"Please enter a valid public Instagram profile URL."},400);if(!key(env))return json({success:false,error:"Instagram tools are temporarily unavailable."},503);const r=await sk(endpoint,url,env);if(!r.ok||r.data?.success===false)return fail(r);const d=r.data?.data||r.data;let items=[];for(const k of ["items","posts","reels","results"])if(Array.isArray(d?.[k])){items=d[k];break}if(!items.length&&Array.isArray(d))items=d;return json({success:true,data:{items,raw:d}})}

async function download(request,env){let b;try{b=await request.json()}catch{return json({success:false,error:"Invalid request body."},400)}const url=String(b?.url||"").trim();if(!isIG(url))return json({success:false,error:"Please enter a valid public Instagram URL."},400);if(!key(env))return json({success:false,error:"Instagram downloader is temporarily unavailable."},503);let first="";try{first=new URL(url).pathname.split("/").filter(Boolean)[0]?.toLowerCase()||""}catch{}if(first==="stories")return json({success:false,error:"Story Downloader is not enabled yet. It will be added when a reliable supported endpoint is available."},501);
  if(String(b?.tool||"")==="photo"||first==="p"){
    const r=await sk("/instagram/stats",url,env);if(!r.ok||r.data?.success===false)return fail(r);return json({success:true,data:stats(r.data?.data||r.data)});
  }
  const r=await sk("/instagram/download",url,env,{format:b?.format||"mp4",quality:b?.quality||"720p"});if(!r.ok||r.data?.success===false)return fail(r);const d=r.data?.data||r.data;return json({success:true,data:{...d,medias:[{url:d.downloadUrl||d.videoUrl||"",thumbnail:d.thumbnail||"",ext:d.format||"mp4",label:d.quality||d.format||"Download"}]}});
}
function stats(d){const medias=[];const add=(v,type="image",thumb=d?.thumbnail||"")=>{if(typeof v==="string"&&/^https?:\/\//i.test(v)&&!medias.some(x=>x.url===v))medias.push({url:v,type,thumbnail:thumb})};add(d?.videoUrl,"video");add(d?.video_url,"video");add(d?.mediaUrl,d?.isVideo?"video":"image");add(d?.imageUrl);add(d?.image_url);for(const k of ["images","videos","media","medias"])if(Array.isArray(d?.[k]))for(const x of d[k])typeof x==="string"?add(x,k==="videos"?"video":"image"):x&&add(x.url||x.mediaUrl||x.imageUrl||x.videoUrl||x.src,x.type|| (k==="videos"?"video":"image"),x.thumbnail||d?.thumbnail||"");return{...d,medias}}

async function downloadFile(request,env){let b;try{b=await request.json()}catch{return json({success:false,error:"Invalid request body."},400)}const url=String(b?.url||"").trim();if(!isIG(url))return json({success:false,error:"Please enter a valid public Instagram URL."},400);let d;if(String(b?.tool||"")==="photo"||url.includes("/p/")){const r=await sk("/instagram/stats",url,env);if(!r.ok||r.data?.success===false)return fail(r);d=stats(r.data?.data||r.data)}else{const r=await sk("/instagram/download",url,env,{format:"mp4",quality:"720p"});if(!r.ok||r.data?.success===false)return fail(r);d={medias:[{url:(r.data?.data||r.data)?.downloadUrl||""}]}}const media=d.medias?.[Number(b?.index||0)]?.url||d.medias?.[0]?.url;if(!media)return json({success:false,error:"No downloadable media URL was returned."},404);try{const r=await fetch(media);if(!r.ok)return json({success:false,error:"The temporary media link expired. Please try again."},502);const h=new Headers(r.headers);h.set("Content-Disposition",'attachment; filename="akhisave-media"');h.set("Cache-Control","no-store");return new Response(r.body,{status:200,headers:h})}catch{return json({success:false,error:"Media download failed."},502)}}

function injectDiagnostic(html){const panel=`<section style="margin:16px 0;padding:16px;border:1px solid #d9dee8;border-radius:16px;background:#fff"><b style="font-size:18px">SocialKit API Diagnostic</b><div style="font-size:13px;opacity:.7;margin:4px 0 12px">Admin-only. API key is never shown.</div><button id="ak-sk-test" style="border:0;border-radius:9px;padding:10px 14px;font-weight:700">Test SocialKit API</button><div id="ak-sk-out" style="margin-top:12px;font-size:14px">Press the button to check access.</div></section><script>(function(){const b=document.getElementById('ak-sk-test'),o=document.getElementById('ak-sk-out');if(!b||!o)return;b.onclick=async()=>{b.disabled=true;b.textContent='Checking...';try{const r=await fetch('/api/admin/socialkit-check',{cache:'no-store'}),d=await r.json();if(!r.ok)throw Error(d.error||'Diagnostic failed');o.innerHTML='<b>Status:</b> '+d.status+'<br><b>Key configured:</b> '+(d.configured?'Yes':'No')+'<br><b>HTTP:</b> '+(d.httpStatus??'—')+'<br><b>Credits:</b> '+(d.credits?.totalRemaining??'—')+'<br><b>Message:</b> '+(d.upstreamMessage||'—')}catch(e){o.textContent=e.message}finally{b.disabled=false;b.textContent='Test SocialKit API'}}})()</script>`;return html.replace(/<\/body>/i,panel+"</body>")}
