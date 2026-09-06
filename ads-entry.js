import site from "./admin-entry.js";

const DEFAULT_ADS = {
  enabled: true,
  adsterra: { enabled: false, code: "", placement: "body-end", pages: "all" },
  monetag: { enabled: true, zone: "11717101", code: "", placement: "head", pages: "all" }
};

function clean(v, max=20000) {
  return String(v ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").slice(0, max);
}
function sanitizeAds(input) {
  const a = input && typeof input === "object" ? input : {};
  const norm = (x, fallback) => ({
    enabled: x?.enabled !== false,
    zone: clean(x?.zone || fallback.zone || "", 30),
    code: clean(x?.code || "", 30000),
    placement: ["head","body-start","content-top","body-end"].includes(x?.placement) ? x.placement : fallback.placement,
    pages: ["all","home","tools","result"].includes(x?.pages) ? x.pages : "all"
  });
  return {
    enabled: a.enabled !== false,
    adsterra: norm(a.adsterra, DEFAULT_ADS.adsterra),
    monetag: norm(a.monetag, DEFAULT_ADS.monetag)
  };
}

async function getAds(env) {
  if (!env.AKHISAVE_SETTINGS) return structuredClone(DEFAULT_ADS);
  try {
    const raw = await env.AKHISAVE_SETTINGS.get("ad_settings");
    return raw ? sanitizeAds(JSON.parse(raw)) : structuredClone(DEFAULT_ADS);
  } catch { return structuredClone(DEFAULT_ADS); }
}

function pageType(path) {
  if (path === "/" || path === "/index.html") return "home";
  if (/result\.html$/.test(path)) return "result";
  return "tools";
}
function allowedFor(ad, type) { return ad.enabled && (ad.pages === "all" || ad.pages === type); }
function wrap(code, label) {
  if (!code) return "";
  return `<div class="akhisave-ad akhisave-ad-${label}" data-ad-network="${label}">${code}</div>`;
}
function injectAds(html, ads, path) {
  html = html.replace(/<script[^>]*(?:nap5k\.com|monetag|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165)[^>]*>[\s\S]*?<\/script>/gi, "");
  if (!ads.enabled) return html;
  const type = pageType(path);
  const parts = { head: "", start: "", content: "", end: "" };
  for (const [name, ad] of [["adsterra", ads.adsterra], ["monetag", ads.monetag]]) {
    if (!allowedFor(ad, type)) continue;
    const code = ad.code || (name === "monetag" && ad.zone ? `<script>(function(s){s.dataset.zone='${ad.zone}';s.src='https://nap5k.com/tag.min.js'})(document.documentElement.appendChild(document.createElement('script')))</script>` : "");
    const chunk = wrap(code, name);
    if (!chunk) continue;
    if (ad.placement === "head") parts.head += chunk;
    else if (ad.placement === "body-start") parts.start += chunk;
    else if (ad.placement === "content-top") parts.content += chunk;
    else parts.end += chunk;
  }
  if (parts.head) html = html.replace(/<\/head>/i, `${parts.head}</head>`);
  if (parts.start) html = html.replace(/<body([^>]*)>/i, `<body$1>${parts.start}`);
  if (parts.content) html = html.replace(/<main([^>]*)>/i, `<main$1>${parts.content}`);
  if (parts.end) html = html.replace(/<\/body>/i, `${parts.end}</body>`);
  return html;
}

function injectAdminPanel(html) {
  const panel = `
<section class="card section" id="akhisaveAdsPanel" style="margin-top:12px">
  <h2>Ads Control</h2>
  <p>Control Adsterra and Monetag separately. Changes apply to public pages only.</p>
  <div class="row"><div><b>Ads System</b><div class="muted small">Master switch for both ad networks.</div></div><input id="akAdsEnabled" class="switch" type="checkbox"></div>
  <div class="grid2">
    <div class="statusbox"><b>Adsterra</b><div class="field"><label>Enabled</label><input id="akAdsterraEnabled" class="switch" type="checkbox"></div><div class="field"><label>Ad Code / Script</label><textarea id="akAdsterraCode" placeholder="Paste the Adsterra code from your publisher dashboard"></textarea></div><div class="field"><label>Placement</label><select id="akAdsterraPlacement"><option value="body-end">Before &lt;/body&gt;</option><option value="body-start">After &lt;body&gt;</option><option value="content-top">Top of main content</option><option value="head">&lt;head&gt;</option></select></div><div class="field"><label>Pages</label><select id="akAdsterraPages"><option value="all">All public pages</option><option value="home">Homepage only</option><option value="tools">Tool pages</option><option value="result">Result pages</option></select></div></div>
    <div class="statusbox"><b>Monetag</b><div class="field"><label>Enabled</label><input id="akMonetagEnabled" class="switch" type="checkbox"></div><div class="field"><label>Zone ID</label><input id="akMonetagZone" inputmode="numeric" maxlength="30" placeholder="11717101"></div><div class="field"><label>Full Ad Code (optional)</label><textarea id="akMonetagCode" placeholder="Paste the Monetag tag here if you want to use the exact code from Monetag"></textarea></div><div class="field"><label>Placement</label><select id="akMonetagPlacement"><option value="head">&lt;head&gt;</option><option value="body-end">Before &lt;/body&gt;</option><option value="body-start">After &lt;body&gt;</option><option value="content-top">Top of main content</option></select></div><div class="field"><label>Pages</label><select id="akMonetagPages"><option value="all">All public pages</option><option value="home">Homepage only</option><option value="tools">Tool pages</option><option value="result">Result pages</option></select></div></div>
  </div>
  <div class="actions"><button id="akAdsSave" class="btn primary">Save Ads Settings</button><button id="akAdsReset" class="btn secondary">Reset Ads</button></div><div id="akAdsMsg" class="muted small" style="margin-top:9px"></div>
</section>`;
  const script = `<script>
(function(){
const A=id=>document.getElementById(id);
async function apiAds(path,opt={}){const r=await fetch(path,{...opt,headers:{"Content-Type":"application/json",...(opt.headers||{})}});const d=await r.json().catch(()=>({}));return{ok:r.ok,data:d}}
function setA(id,v){const e=A(id);if(!e)return;e.type==='checkbox'?e.checked=!!v:e.value=v??''}
async function loadA(){const r=await apiAds('/api/admin/settings');if(!r.ok)return;const a=r.data.settings?.ads||{};setA('akAdsEnabled',a.enabled!==false);const x=a.adsterra||{};setA('akAdsterraEnabled',x.enabled!==false);setA('akAdsterraCode',x.code||'');setA('akAdsterraPlacement',x.placement||'body-end');setA('akAdsterraPages',x.pages||'all');const m=a.monetag||{};setA('akMonetagEnabled',m.enabled!==false);setA('akMonetagZone',m.zone||'11717101');setA('akMonetagCode',m.code||'');setA('akMonetagPlacement',m.placement||'head');setA('akMonetagPages',m.pages||'all')}
async function saveA(){const r=await apiAds('/api/admin/settings',{method:'PUT',body:JSON.stringify({ads:{enabled:A('akAdsEnabled').checked,adsterra:{enabled:A('akAdsterraEnabled').checked,code:A('akAdsterraCode').value,placement:A('akAdsterraPlacement').value,pages:A('akAdsterraPages').value},monetag:{enabled:A('akMonetagEnabled').checked,zone:A('akMonetagZone').value,code:A('akMonetagCode').value,placement:A('akMonetagPlacement').value,pages:A('akMonetagPages').value}}})});A('akAdsMsg').textContent=r.ok?'Ads settings saved.':(r.data.error||'Could not save ads settings.');if(r.ok&&typeof toast==='function')toast('Ads settings saved')}
A('akAdsSave').onclick=saveA;A('akAdsReset').onclick=()=>{if(!confirm('Reset ads settings?'))return;setA('akAdsEnabled',true);setA('akAdsterraEnabled',false);setA('akAdsterraCode','');setA('akAdsterraPlacement','body-end');setA('akAdsterraPages','all');setA('akMonetagEnabled',true);setA('akMonetagZone','11717101');setA('akMonetagCode','');setA('akMonetagPlacement','head');setA('akMonetagPages','all');A('akAdsMsg').textContent='Defaults loaded — save to apply'};loadA();
})();
</script>`;
  return html.replace(/<section class="card section"><h2>SEO<\/h2>/i, panel + `<section class="card section"><h2>SEO</h2>`).replace(/<\/body>/i, `${script}</body>`);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const isAdminPage = request.method === "GET" && (url.pathname === "/admin.html" || url.pathname === "/admin");

    if (url.pathname === "/api/admin/settings" && request.method === "GET") {
      const response = await site.fetch(request, env, ctx);
      if (response.status === 401 || response.status === 403) return response;
      try {
        const data = await response.json();
        data.settings = data.settings || {};
        data.settings.ads = await getAds(env);
        return new Response(JSON.stringify(data), {status:response.status, headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
      } catch { return response; }
    }

    if (url.pathname === "/api/admin/settings" && request.method === "PUT") {
      let body;
      try { body = await request.json(); } catch { return new Response(JSON.stringify({success:false,error:"Invalid request."}),{status:400,headers:{"Content-Type":"application/json"}}); }
      const ads = sanitizeAds(body.ads);
      const rest = {...body}; delete rest.ads;
      const cleanRequest = new Request(request, {body:JSON.stringify(rest)});
      const response = await site.fetch(cleanRequest, env, ctx);
      if (!response.ok) return response;
      await env.AKHISAVE_SETTINGS?.put("ad_settings", JSON.stringify(ads));
      const data = await response.json().catch(()=>({success:true}));
      data.settings = data.settings || rest;
      data.settings.ads = ads;
      return new Response(JSON.stringify(data),{status:response.status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
    }

    if (isAdminPage) {
      const response = await env.ASSETS.fetch(request);
      if (!response.ok) return response;
      let html = await response.text();
      html = injectAdminPanel(html);
      return new Response(html,{status:response.status,headers:response.headers});
    }

    const response = await site.fetch(request, env, ctx);
    const ct = response.headers.get("content-type") || "";
    if (request.method !== "GET" || !ct.includes("text/html") || url.pathname.startsWith("/api/")) return response;
    if (/^\/admin(?:\.html)?\/?$/.test(url.pathname)) return response;
    try {
      const ads = await getAds(env);
      let html = await response.text();
      html = injectAds(html, ads, url.pathname);
      const headers = new Headers(response.headers);
      headers.set("Cache-Control","no-store");
      return new Response(html,{status:response.status,headers});
    } catch { return response; }
  }
};
