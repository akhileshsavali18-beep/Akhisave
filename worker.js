export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/admin/login") {
      if (request.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);
      if (!env.ADMIN_PASSWORD) return json({ success: false, error: "Admin login is not configured yet." }, 503);
      try {
        const body = await request.json();
        const password = String(body.password || "");
        if (!password || password !== env.ADMIN_PASSWORD) return json({ success: false, error: "Incorrect password." }, 401);
        const expires = Date.now() + 24 * 60 * 60 * 1000;
        const token = await createAdminToken(String(expires), env.ADMIN_PASSWORD);
        const headers = new Headers({ "Cache-Control": "no-store" });
        headers.append("Set-Cookie", `akhisave_admin=${token}; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Strict`);
        return new Response(JSON.stringify({ success: true }), { status: 200, headers });
      } catch { return json({ success: false, error: "Invalid request." }, 400); }
    }

    if (url.pathname === "/api/admin/status") {
      if (!(await isAdmin(request, env))) return json({ success: false, error: "Unauthorized" }, 401);
      return json({ success: true, downloader: Boolean(env.SOCLIP_API_KEY), instagram: false, storage: Boolean(env.AKHISAVE_SETTINGS) });
    }

    if (url.pathname === "/api/admin/settings") {
      if (!(await isAdmin(request, env))) return json({ success: false, error: "Unauthorized" }, 401);
      if (!env.AKHISAVE_SETTINGS) return json({ success: false, error: "Settings storage is not connected yet." }, 503);
      if (request.method === "GET") return json({ success: true, settings: await getSettings(env) });
      if (request.method === "PUT") {
        try {
          const body = await request.json();
          const settings = sanitizeSettings(body);
          await env.AKHISAVE_SETTINGS.put("site_settings", JSON.stringify(settings));
          return json({ success: true, settings });
        } catch { return json({ success: false, error: "Could not save settings." }, 400); }
      }
      return json({ success: false, error: "Method not allowed" }, 405);
    }

    if (url.pathname === "/api/site-config") return json({ success: true, settings: await getSettings(env) });

    if (url.pathname === "/api/admin/logout") {
      if (request.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);
      const headers = new Headers({ "Cache-Control": "no-store" });
      headers.append("Set-Cookie", "akhisave_admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict");
      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    }

    if (url.pathname === "/api/download") {
      if (request.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);
      try {
        const body = await request.json();
        const instagramUrl = String(body.url || "").trim();
        if (!isInstagramUrl(instagramUrl)) return json({ success: false, error: "Please enter a valid Instagram URL." }, 400);
        if (!env.SOCLIP_API_KEY) return json({ success: false, error: "Downloader is not configured yet." }, 503);
        const r = await fetch("https://api.soclip.dev/v1/media", { method: "POST", headers: { Authorization: `Bearer ${normalizeApiKey(env.SOCLIP_API_KEY)}`, "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify({ url: instagramUrl }) });
        return json(await safeJson(r), r.status);
      } catch { return json({ success: false, error: "Something went wrong. Please try again." }, 500); }
    }

    if (url.pathname === "/api/download-file") {
      if (request.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);
      try {
        const body = await request.json();
        const instagramUrl = String(body.url || "").trim();
        const mediaIndex = Math.max(0, Number(body.index || 0));
        if (!isInstagramUrl(instagramUrl)) return json({ success: false, error: "Please enter a valid Instagram URL." }, 400);
        if (!env.SOCLIP_API_KEY) return json({ success: false, error: "Downloader is not configured yet." }, 503);
        const r = await fetch("https://api.soclip.dev/v1/media", { method: "POST", headers: { Authorization: `Bearer ${normalizeApiKey(env.SOCLIP_API_KEY)}`, "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify({ url: instagramUrl }) });
        const data = await safeJson(r);
        if (!r.ok) return json(data, r.status);
        const medias = data?.data?.medias || data?.medias || [];
        const media = medias[mediaIndex] || medias[0];
        if (!media?.url) return json({ success: false, error: "No downloadable media was returned." }, 404);
        const fileResponse = await fetch(media.url, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (!fileResponse.ok) return json({ success: false, error: "The media server could not provide the file." }, 502);
        const headers = new Headers(fileResponse.headers);
        headers.set("Content-Disposition", `attachment; filename="akhisave-${safeFilename(media.ext || "mp4")}"`);
        headers.set("Cache-Control", "no-store");
        headers.set("X-Content-Type-Options", "nosniff");
        return new Response(fileResponse.body, { status: 200, headers });
      } catch { return json({ success: false, error: "Download failed. Please try again." }, 500); }
    }

    if (url.pathname === "/api/proxy-media") {
      const target = url.searchParams.get("url");
      if (!target) return json({ success: false, error: "Media URL is required." }, 400);
      try {
        const targetUrl = new URL(target);
        if (!isAllowedMediaHost(targetUrl.hostname)) return json({ success: false, error: "Media host is not allowed." }, 400);
        const r = await fetch(targetUrl.toString(), { headers: { "User-Agent": "Mozilla/5.0" } });
        if (!r.ok) return json({ success: false, error: "Media could not be loaded." }, 502);
        const headers = new Headers(r.headers);
        headers.set("Cache-Control", "public, max-age=300");
        headers.set("Access-Control-Allow-Origin", "*");
        return new Response(r.body, { status: 200, headers });
      } catch { return json({ success: false, error: "Invalid media URL." }, 400); }
    }

    if (request.method === "GET" && url.pathname === "/") {
      const settings = await getSettings(env);
      if (settings.maintenance) return new Response(maintenancePage(settings), { status: 503, headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "no-store", "Retry-After": "3600" } });
      const assetResponse = await env.ASSETS.fetch(request);
      if (!assetResponse.ok) return assetResponse;
      return applyRuntimeSettings(assetResponse, settings);
    }
    return env.ASSETS.fetch(request);
  }
};

const DEFAULT_SETTINGS = {
  maintenance: false,
  announcement: "",
  tools: { photo: true, reels: true, video: true, story: true, profile: true, youtube: false, facebook: false, tiktok: false },
  ads: { monetag: true, zone: "11717101" },
  seo: { title: "Instagram Downloader - Photos, Reels, Videos & Stories | AkhiSave", description: "AkhiSave is a fast Instagram downloader to download public Instagram photos, reels, videos and stories by URL. No password required." }
};

async function getSettings(env) {
  if (!env.AKHISAVE_SETTINGS) return structuredClone(DEFAULT_SETTINGS);
  try {
    const raw = await env.AKHISAVE_SETTINGS.get("site_settings");
    if (!raw) return structuredClone(DEFAULT_SETTINGS);
    return sanitizeSettings(JSON.parse(raw));
  } catch { return structuredClone(DEFAULT_SETTINGS); }
}

function sanitizeSettings(input) {
  const s = input && typeof input === "object" ? input : {};
  const tools = s.tools && typeof s.tools === "object" ? s.tools : {};
  const ads = s.ads && typeof s.ads === "object" ? s.ads : {};
  const seo = s.seo && typeof s.seo === "object" ? s.seo : {};
  return {
    maintenance: Boolean(s.maintenance),
    announcement: cleanText(s.announcement, 180),
    tools: { photo: tools.photo !== false, reels: tools.reels !== false, video: tools.video !== false, story: tools.story !== false, profile: true, youtube: Boolean(tools.youtube), facebook: Boolean(tools.facebook), tiktok: Boolean(tools.tiktok) },
    ads: { monetag: ads.monetag !== false, zone: cleanText(ads.zone || DEFAULT_SETTINGS.ads.zone, 30).replace(/[^0-9]/g, "").slice(0, 20) || DEFAULT_SETTINGS.ads.zone },
    seo: { title: cleanText(seo.title || DEFAULT_SETTINGS.seo.title, 140), description: cleanText(seo.description || DEFAULT_SETTINGS.seo.description, 220) }
  };
}

function cleanText(value, max) { return String(value ?? "").replace(/[<>]/g, "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max); }

async function applyRuntimeSettings(response, settings) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;
  let html = await response.text();
  const title = escapeHtml(settings.seo.title);
  const description = escapeHtml(settings.seo.description);
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${escapeAttr(description)}">`);

  if (settings.announcement) {
    const announcement = escapeHtml(settings.announcement);
    const banner = `<div id="akhisave-announcement" style="position:fixed;top:0;left:0;right:0;z-index:99999;width:100%;box-sizing:border-box;background:#172033;color:#fff;font:600 14px system-ui,sans-serif;line-height:1.4;overflow:hidden"><div id="akhisave-marquee" style="width:100%;overflow:hidden;white-space:nowrap;padding:10px 0;box-sizing:border-box"><div style="display:inline-flex;width:max-content;min-width:100%;animation:akhisave-marquee 14s linear infinite;will-change:transform"><span style="display:inline-block;padding-left:100vw;padding-right:80px">${announcement}</span><span aria-hidden="true" style="display:inline-block;padding-right:80px">${announcement}</span></div></div></div>`;
    const style = `<style>@keyframes akhisave-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}@media (prefers-reduced-motion:reduce){#akhisave-marquee>div{animation:none!important;transform:none!important;display:block;text-align:center;white-space:normal;padding:10px 14px;box-sizing:border-box}}</style>`;
    html = html.replace(/<body([^>]*)>/i, `<body$1>${banner}`);
    html = html.replace(/<\/head>/i, `${style}</head>`);
  }

  const configScript = `<script>window.AKHISAVE_CONFIG=${JSON.stringify(settings)};</script>`;
  const controlScript = `<script>(function(){const c=window.AKHISAVE_CONFIG||{};const t=c.tools||{};const map={photo:'photo',reels:'reels',video:'video',story:'story',profile:'profile'};function apply(){Object.keys(map).forEach(k=>{if(t[k]===false){document.querySelectorAll('[data-type="'+map[k]+'"], [data-tab="'+map[k]+'"]').forEach(e=>e.style.display='none')}});if(c.announcement){const b=document.getElementById('akhisave-announcement');if(b){document.body.style.paddingTop=b.offsetHeight+'px';window.addEventListener('resize',()=>{document.body.style.paddingTop=b.offsetHeight+'px'})}}if(c.ads&&c.ads.monetag===false){document.querySelectorAll('script[src*="nap5k.com/tag.min.js"]').forEach(e=>e.remove())}}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply()})();</script>`;
  html = html.replace(/<\/head>/i, `${configScript}${controlScript}</head>`);
  if (settings.ads.monetag === false) html = html.replace(/<script>\(function\(s\)\{s\.dataset\.zone='11717101',s\.src='https:\/\/nap5k\.com\/tag\.min\.js'\}\)\([^<]*?<\/script>/gi, "");

  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  return new Response(html, { status: response.status, headers });
}

function maintenancePage(settings) {
  const message = settings.announcement || "AkhiSave is temporarily under maintenance. Please try again soon.";
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Maintenance | AkhiSave</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f5f7fb;color:#172033;font-family:system-ui;text-align:center;padding:20px}.box{max-width:520px;background:#fff;border:1px solid #e6eaf0;border-radius:18px;padding:32px;box-shadow:0 10px 35px rgba(20,30,50,.08)}h1{margin-top:0}</style></head><body><div class="box"><h1>AkhiSave</h1><p>${escapeHtml(message)}</p><p>Please check back shortly.</p></div></body></html>`;
}

function escapeHtml(value) { return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;"); }
function escapeAttr(value) { return escapeHtml(value); }

async function isAdmin(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/(?:^|;\s*)akhisave_admin=([^;]+)/);
  if (!match) return false;
  try {
    const padded = match[1].replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(match[1].length / 4) * 4, "=");
    const [expires, signature] = atob(padded).split(".");
    if (!expires || !signature || Number(expires) < Date.now()) return false;
    const expected = await signAdminToken(expires, env.ADMIN_PASSWORD);
    return signature === expected;
  } catch { return false; }
}

async function createAdminToken(expires, password) { const signature = await signAdminToken(expires, password); return btoa(`${expires}.${signature}`).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
async function signAdminToken(value, password) { const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]); const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)); return [...new Uint8Array(signature)].map(b => b.toString(16).padStart(2, "0")).join(""); }

function normalizeApiKey(value) {
  return String(value || "").trim().replace(/^Bearer\s+/i, "").replace(/^['\"]|['\"]$/g, "").trim();
}

function isInstagramUrl(value) { try { const u = new URL(value); return /^https?:$/.test(u.protocol) && /(^|\.)instagram\.com$/i.test(u.hostname); } catch { return false; } }
function isAllowedMediaHost(hostname) { const h = hostname.toLowerCase(); return h === "instagram.com" || h.endsWith(".instagram.com") || h.endsWith(".cdninstagram.com") || h === "cdninstagram.com" || h === "fbcdn.net" || h.endsWith(".fbcdn.net"); }
function safeFilename(ext) { const clean = String(ext).replace(/[^a-z0-9]/gi, "").toLowerCase(); return clean ? `media.${clean}` : "media.mp4"; }
async function safeJson(response) { const text = await response.text(); try { return JSON.parse(text); } catch { return { success: false, error: text || "Upstream API returned an invalid response." }; } }
function json(data, status = 200) { return Response.json(data, { status, headers: { "Cache-Control": "no-store" } }); }
