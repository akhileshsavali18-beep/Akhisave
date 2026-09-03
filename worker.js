export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // -----------------------------------------------------
    // Admin authentication
    // -----------------------------------------------------
    if (url.pathname === "/api/admin/login") {
      if (request.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);
      if (!env.ADMIN_PASSWORD) return json({ success: false, error: "Admin login is not configured yet." }, 503);

      try {
        const body = await request.json();
        const password = String(body.password || "");
        if (!password || password !== env.ADMIN_PASSWORD) {
          return json({ success: false, error: "Incorrect password." }, 401);
        }

        const expires = Date.now() + 24 * 60 * 60 * 1000;
        const token = await createAdminToken(String(expires), env.ADMIN_PASSWORD);
        const headers = new Headers({ "Cache-Control": "no-store" });
        headers.append("Set-Cookie", `akhisave_admin=${token}; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Strict`);
        return new Response(JSON.stringify({ success: true }), { status: 200, headers });
      } catch {
        return json({ success: false, error: "Invalid request." }, 400);
      }
    }

    if (url.pathname === "/api/admin/status") {
      if (!(await isAdmin(request, env))) return json({ success: false, error: "Unauthorized" }, 401);
      return json({
        success: true,
        downloader: Boolean(env.SOCLIP_API_KEY),
        instagram: Boolean(env.INSTAGRAM_API_KEY)
      });
    }

    if (url.pathname === "/api/admin/logout") {
      if (request.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);
      const headers = new Headers({ "Cache-Control": "no-store" });
      headers.append("Set-Cookie", "akhisave_admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict");
      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    }

    // -----------------------------------------------------
    // SoClip media resolver
    // -----------------------------------------------------
    if (url.pathname === "/api/download") {
      if (request.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);

      try {
        const body = await request.json();
        const instagramUrl = String(body.url || "").trim();
        if (!isInstagramUrl(instagramUrl)) {
          return json({ success: false, error: "Please enter a valid Instagram URL." }, 400);
        }
        if (!env.SOCLIP_API_KEY) {
          return json({ success: false, error: "Downloader is not configured yet." }, 503);
        }

        const r = await fetch("https://api.soclip.dev/v1/media", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.SOCLIP_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ url: instagramUrl })
        });
        const data = await safeJson(r);
        return json(data, r.status);
      } catch (e) {
        return json({ success: false, error: "Something went wrong. Please try again." }, 500);
      }
    }

    // -----------------------------------------------------
    // Download a resolved media file through AkhiSave.
    // This avoids relying on the browser's cross-origin download behavior.
    // -----------------------------------------------------
    if (url.pathname === "/api/download-file") {
      if (request.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);

      try {
        const body = await request.json();
        const instagramUrl = String(body.url || "").trim();
        const mediaIndex = Math.max(0, Number(body.index || 0));

        if (!isInstagramUrl(instagramUrl)) {
          return json({ success: false, error: "Please enter a valid Instagram URL." }, 400);
        }
        if (!env.SOCLIP_API_KEY) {
          return json({ success: false, error: "Downloader is not configured yet." }, 503);
        }

        const r = await fetch("https://api.soclip.dev/v1/media", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.SOCLIP_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ url: instagramUrl })
        });
        const data = await safeJson(r);
        if (!r.ok) return json(data, r.status);

        const medias = data?.data?.medias || data?.medias || [];
        const media = medias[mediaIndex] || medias[0];
        if (!media?.url) return json({ success: false, error: "No downloadable media was returned." }, 404);

        const fileResponse = await fetch(media.url, {
          headers: { "User-Agent": "Mozilla/5.0" }
        });
        if (!fileResponse.ok) {
          return json({ success: false, error: "The media server could not provide the file." }, 502);
        }

        const headers = new Headers(fileResponse.headers);
        headers.set("Content-Disposition", `attachment; filename="akhisave-${safeFilename(media.ext || "mp4")}"`);
        headers.set("Cache-Control", "no-store");
        headers.set("X-Content-Type-Options", "nosniff");
        return new Response(fileResponse.body, { status: 200, headers });
      } catch (e) {
        return json({ success: false, error: "Download failed. Please try again." }, 500);
      }
    }

    // -----------------------------------------------------
    // Instagram public API proxy
    // -----------------------------------------------------
    const apiRoutes = [
      ["/api/profile", "/profile"],
      ["/api/profile/about", "/profile/about"],
      ["/api/profile/posts", "/profile/posts"],
      ["/api/profile/reels", "/profile/reels"],
      ["/api/profile/stories", "/profile/stories"],
      ["/api/profile/highlights", "/profile/highlights"],
      ["/api/profile/followers", "/profile/followers"],
      ["/api/profile/following", "/profile/following"],
      ["/api/post", "/post"],
      ["/api/post/comments", "/post/comments"],
      ["/api/post/likers", "/post/likers"],
      ["/api/search/users", "/search/users"],
      ["/api/search/hashtags", "/search/hashtags"],
      ["/api/search/locations", "/search/locations"],
      ["/api/hashtag/top", "/hashtag/top"],
      ["/api/hashtag/recent", "/hashtag/recent"],
      ["/api/location", "/location"],
      ["/api/location/posts", "/location/posts"],
      ["/api/credits", "/credits"]
    ];

    for (const [localPath, remotePath] of apiRoutes) {
      if (url.pathname === localPath) {
        return instagramAPI(env, remotePath, url.searchParams);
      }
    }

    // -----------------------------------------------------
    // Proxy temporary Instagram media URLs for previews/downloads.
    // Only known Instagram/Facebook CDN hosts are accepted.
    // -----------------------------------------------------
    if (url.pathname === "/api/proxy-media") {
      const target = url.searchParams.get("url");
      if (!target) return json({ success: false, error: "Media URL is required." }, 400);

      try {
        const targetUrl = new URL(target);
        if (!isAllowedMediaHost(targetUrl.hostname)) {
          return json({ success: false, error: "Media host is not allowed." }, 400);
        }

        const r = await fetch(targetUrl.toString(), {
          headers: { "User-Agent": "Mozilla/5.0" }
        });
        if (!r.ok) return json({ success: false, error: "Media could not be loaded." }, 502);

        const headers = new Headers(r.headers);
        headers.set("Cache-Control", "public, max-age=300");
        headers.set("Access-Control-Allow-Origin", "*");
        return new Response(r.body, { status: 200, headers });
      } catch (e) {
        return json({ success: false, error: "Invalid media URL." }, 400);
      }
    }

    return env.ASSETS.fetch(request);
  }
};

async function isAdmin(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/(?:^|;\s*)akhisave_admin=([^;]+)/);
  if (!match) return false;

  try {
    const [expires, signature] = atob(match[1].replace(/-/g, "+").replace(/_/g, "/")).split(".");
    if (!expires || !signature || Number(expires) < Date.now()) return false;
    const expected = await signAdminToken(expires, env.ADMIN_PASSWORD);
    return signature === expected;
  } catch {
    return false;
  }
}

async function createAdminToken(expires, password) {
  const signature = await signAdminToken(expires, password);
  return btoa(`${expires}.${signature}`).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signAdminToken(value, password) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return [...new Uint8Array(signature)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function instagramAPI(env, endpoint, params) {
  if (!env.INSTAGRAM_API_KEY) {
    return json({ success: false, error: "Instagram API is not configured yet." }, 503);
  }

  const apiUrl = new URL(`https://api.instagramapi.dev/v1${endpoint}`);
  for (const [key, value] of params.entries()) apiUrl.searchParams.set(key, value);

  try {
    const r = await fetch(apiUrl.toString(), {
      headers: {
        Authorization: `Bearer ${env.INSTAGRAM_API_KEY}`,
        Accept: "application/json"
      }
    });
    const data = await safeJson(r);
    return json(data, r.status);
  } catch (e) {
    return json({ success: false, error: "Instagram API request failed." }, 502);
  }
}

function isInstagramUrl(value) {
  try {
    const u = new URL(value);
    return /^https?:$/.test(u.protocol) && /(^|\.)instagram\.com$/i.test(u.hostname);
  } catch {
    return false;
  }
}

function isAllowedMediaHost(hostname) {
  const h = hostname.toLowerCase();
  return (
    h === "instagram.com" ||
    h.endsWith(".instagram.com") ||
    h.endsWith(".cdninstagram.com") ||
    h === "cdninstagram.com" ||
    h === "fbcdn.net" ||
    h.endsWith(".fbcdn.net")
  );
}

function safeFilename(ext) {
  const clean = String(ext).replace(/[^a-z0-9]/gi, "").toLowerCase();
  return clean ? `media.${clean}` : "media.mp4";
}

async function safeJson(response) {
  const text = await response.text();
  try { return JSON.parse(text); }
  catch { return { success: false, error: text || "Upstream API returned an invalid response." }; }
}

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
