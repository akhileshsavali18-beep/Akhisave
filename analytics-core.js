const blank=()=>({visitors:0,newVisitors:0,returning:0,pageViews:0,attempts:0,downloads:0,failures:0,tools:{},pages:{},visitorIds:[],newVisitorIds:[]});
async function read(env,key){if(!env.AKHISAVE_SETTINGS)return blank();try{const raw=await env.AKHISAVE_SETTINGS.get(key);const a=raw?JSON.parse(raw):{};return{...blank(),...a,visitorIds:Array.isArray(a.visitorIds)?a.visitorIds:[],newVisitorIds:Array.isArray(a.newVisitorIds)?a.newVisitorIds:[],tools:{...(a.tools||{})},pages:{...(a.pages||{})}}}catch{return blank()}}
async function write(env,key,a){if(env.AKHISAVE_SETTINGS)await env.AKHISAVE_SETTINGS.put(key,JSON.stringify(a))}
const dayKey=d=>`analytics:${d.toISOString().slice(0,10)}`;const trackingStartKey='analytics:visitor-tracking-start';
function visitorCookie(request){const c=request.headers.get('Cookie')||'';const m=c.match(/(?:^|;\s*)akhisave_vid_v2=([^;]+)/);return m?m[1]:''}
export async function track(request,env){
 if(request.method!=='POST')return Response.json({success:false,error:'Method not allowed'},{status:405,headers:{'Cache-Control':'no-store'}});
 try{
  const body=await request.json(),event=String(body.event||''),tool=String(body.tool||'unknown').slice(0,50),page=String(body.page||'').trim().slice(0,120);
  if(!['page_view','download_attempt','download_success','download_failure'].includes(event))return Response.json({success:false,error:'Invalid event.'},{status:400});
  const now=new Date(),today=now.toISOString().slice(0,10),key=dayKey(now),a=await read(env,key),vid=visitorCookie(request);
  if(event==='page_view'){a.pageViews++;if(page)a.pages[page]=(a.pages[page]||0)+1}
  else if(event==='download_attempt')a.attempts++;else if(event==='download_success')a.downloads++;else a.failures++;
  if(tool&&tool!=='unknown'&&(event==='download_attempt'||event==='download_success'))a.tools[tool]=(a.tools[tool]||0)+1;
  let setCookie='';
  if(event==='page_view'){
   const id=vid||crypto.randomUUID();if(!a.visitorIds.includes(id))a.visitorIds.push(id);a.visitors=a.visitorIds.length;
   if(!vid&&!a.newVisitorIds.includes(id))a.newVisitorIds.push(id);a.newVisitors=a.newVisitorIds.length;a.returning=Math.max(0,a.visitors-a.newVisitors);
   if(!vid)setCookie=`akhisave_vid_v2=${id}; Path=/; Max-Age=31536000; Secure; SameSite=Lax`;
   if(env.AKHISAVE_SETTINGS){const existing=await env.AKHISAVE_SETTINGS.get(trackingStartKey);if(!existing)await env.AKHISAVE_SETTINGS.put(trackingStartKey,today)}
  }
  await write(env,key,a);const h=new Headers({'Content-Type':'application/json','Cache-Control':'no-store'});if(setCookie)h.append('Set-Cookie',setCookie);return new Response(JSON.stringify({success:true}),{status:200,headers:h});
 }catch{return Response.json({success:false,error:'Tracking failed.'},{status:400,headers:{'Cache-Control':'no-store'}})}
}
function validDate(s){return /^\d{4}-\d{2}-\d{2}$/.test(s||'')?s:''}
export async function range(env,days,start,end){
 let endDate=end?new Date(end+'T00:00:00Z'):new Date(),startDate=start?new Date(start+'T00:00:00Z'):new Date(endDate);if(!start)startDate.setUTCDate(endDate.getUTCDate()-(Math.max(1,Math.min(365,Number(days)||7))-1));if(startDate>endDate){const x=startDate;startDate=endDate;endDate=x}
 const max=Math.min(365,Math.max(1,Math.floor((endDate-startDate)/86400000)+1)),rows=[],vis=new Set(),newVis=new Set(),tools={},pages={};let pageViews=0,attempts=0,downloads=0,failures=0,trackingStart='';if(env.AKHISAVE_SETTINGS)trackingStart=await env.AKHISAVE_SETTINGS.get(trackingStartKey)||'';
 for(let i=0;i<max;i++){const d=new Date(startDate);d.setUTCDate(startDate.getUTCDate()+i);const a=await read(env,dayKey(d));a.visitorIds.forEach(x=>vis.add(x));a.newVisitorIds.forEach(x=>newVis.add(x));pageViews+=Number(a.pageViews)||0;attempts+=Number(a.attempts)||0;downloads+=Number(a.downloads)||0;failures+=Number(a.failures)||0;Object.entries(a.tools||{}).forEach(([k,v])=>tools[k]=(tools[k]||0)+(Number(v)||0));Object.entries(a.pages||{}).forEach(([k,v])=>pages[k]=(pages[k]||0)+(Number(v)||0));rows.push({date:d.toISOString().slice(0,10),visitors:a.visitors||a.visitorIds.length,pageViews:a.pageViews||0,attempts:a.attempts||0,downloads:a.downloads||0,failures:a.failures||0,newVisitors:a.newVisitors||a.newVisitorIds.length,returning:Math.max(0,(a.visitors||a.visitorIds.length)-(a.newVisitors||a.newVisitorIds.length))})}
 const rangeStart=startDate.toISOString().slice(0,10),ready=!!trackingStart&&trackingStart<=rangeStart;const summary=ready?{visitors:vis.size,newVisitors:newVis.size,returning:Math.max(0,vis.size-newVis.size),pageViews,attempts,downloads,failures}:{visitors:null,newVisitors:null,returning:null,pageViews,attempts,downloads,failures};return{success:true,today:rows[rows.length-1]||{date:'',visitors:0,newVisitors:0,returning:0,pageViews:0,attempts:0,downloads:0,failures:0},days:rows,summary,tracking:{ready,start:trackingStart||null},topTools:tools,pages};
}
export function analyticsResponse(env,url){const days=Math.min(365,Math.max(1,Number(url.searchParams.get('days')||7)));const start=validDate(url.searchParams.get('start')),end=validDate(url.searchParams.get('end'));return range(env,days,start,end).then(data=>Response.json(data,{headers:{'Cache-Control':'no-store'}}));}
