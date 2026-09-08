import app from "./admin-final.js";
import worker from "./worker.js";
import { track, analyticsResponse } from "./analytics-core.js";

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}})}
function derivedCategory(t){const id=String(t?.id||'').toLowerCase(),e=String(t?.engine||t?.type||'').toLowerCase(),p=String(t?.platform||'').toLowerCase();if(['image-resizer','image-crop','image-compress'].includes(id)||['image-resizer','image-crop','image-compress'].includes(e))return'cat-image';if(id==='image-pdf'||e==='image-pdf')return'cat-pdf';if(['instagram','youtube','tiktok','facebook','twitter'].includes(p))return'cat-social';if(p==='utility')return'cat-utility';return'cat-other'}
async function toolCategories(env){try{return JSON.parse(await env.AKHISAVE_SETTINGS.get('tool_category_map')||'{}')}catch{return{}}}

export default {async fetch(request,env,ctx){
  const url=new URL(request.url);
  if(url.pathname==='/api/track')return track(request,env);
  if(url.pathname==='/api/admin/tools'){
    const auth=await worker.fetch(new Request(new URL('/api/admin/status',request.url),{headers:request.headers}),env,ctx);
    if(!auth.ok)return auth;
    if(request.method==='GET'){
      const r=await app.fetch(request,env,ctx),d=await r.json().catch(()=>({}));
      if(!r.ok||d.success===false)return new Response(JSON.stringify(d),{status:r.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
      const map=await toolCategories(env);let changed=false;const tools=(d.tools||[]).map(t=>{let c=Object.prototype.hasOwnProperty.call(map,t.id)?map[t.id]:(t.categoryId||derivedCategory(t));if(!Object.prototype.hasOwnProperty.call(map,t.id)){map[t.id]=c;changed=true}return{...t,categoryId:c||null}});if(changed&&env.AKHISAVE_SETTINGS)await env.AKHISAVE_SETTINGS.put('tool_category_map',JSON.stringify(map));return json({...d,tools});
    }
    if(request.method==='PUT'){
      const body=await request.json().catch(()=>({})),incoming=Array.isArray(body.tools)?body.tools:[],map=await toolCategories(env);for(const t of incoming){if(t?.id&&Object.prototype.hasOwnProperty.call(t,'categoryId'))map[String(t.id)]=t.categoryId||null;else if(t?.id&&!Object.prototype.hasOwnProperty.call(map,String(t.id)))map[String(t.id)]=derivedCategory(t)}if(env.AKHISAVE_SETTINGS)await env.AKHISAVE_SETTINGS.put('tool_category_map',JSON.stringify(map));const forwarded=new Request(request.url,{method:'PUT',headers:request.headers,body:JSON.stringify({tools:incoming})});const r=await app.fetch(forwarded,env,ctx),d=await r.json().catch(()=>({}));if(!r.ok||d.success===false)return json(d,r.status);const tools=(d.tools||[]).map(t=>({...t,categoryId:Object.prototype.hasOwnProperty.call(map,t.id)?map[t.id]:(t.categoryId||derivedCategory(t))||null}));return json({...d,tools});
    }
  }
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