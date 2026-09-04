import app from "./worker.js";

const SOCLIP_URL = "https://api.soclip.dev/v1/media";
const TEST_URL = "https://www.instagram.com/reel/Cx8pLh9sD4A/";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/admin/soclip-check") {
      if (request.method !== "GET" && request.method !== "POST") {
        return json({ success: false, error: "Method not allowed" }, 405);
      }

      const authCheck = await app.fetch(new Request(new URL("/api/admin/status", request.url), {
        method: "GET",
        headers: request.headers
      }), env, ctx);
      if (!authCheck.ok) return json({ success: false, error: "Unauthorized" }, 401);

      const checkedAt = new Date().toISOString();
      const configured = Boolean(env.SOCLIP_API_KEY);
      let result = {
        success: true,
        configured,
        httpStatus: null,
        upstreamMessage: "",
        checkedAt,
        status: configured ? "Checking..." : "API Key Not Configured"
      };

      if (configured) {
        try {
          const r = await fetch(SOCLIP_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${normalizeApiKey(env.SOCLIP_API_KEY)}`,
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            body: JSON.stringify({ url: TEST_URL })
          });
          const data = await safeJson(r);
          const message = extractMessage(data, r.statusText);
          result.httpStatus = r.status;
          result.upstreamMessage = message;
          result.status = r.ok
            ? "SoClip Access OK"
            : (r.status === 401 || r.status === 403)
              ? "Subscription Access Error"
              : "SoClip API Error";
        } catch (e) {
          result.httpStatus = 0;
          result.upstreamMessage = e instanceof Error ? e.message : "Network request failed.";
          result.status = "SoClip Connection Error";
        }
      }

      if (env.AKHISAVE_SETTINGS) {
        try { await env.AKHISAVE_SETTINGS.put("soclip_last_check", JSON.stringify(result)); } catch {}
      }
      return json(result, 200, { "Cache-Control": "no-store" });
    }

    if ((url.pathname === "/api/download" || url.pathname === "/api/download-file") && request.method === "POST") {
      const response = await app.fetch(request, env, ctx);
      if (response.status === 401 || response.status === 403) {
        let message = "SoClip API access is not active for this account.";
        try {
          const body = await response.clone().json();
          const raw = String(body?.message || body?.error || "");
          if (/not subscribed|subscription|subscribe/i.test(raw)) {
            message = "Downloader is temporarily unavailable because the SoClip API subscription/access is not active. Please try again after SoClip access is restored.";
          }
        } catch {}
        return json({ success: false, error: message, code: "SOCLIP_SUBSCRIPTION_ACCESS" }, 503, { "Cache-Control": "no-store" });
      }
      return response;
    }

    if (request.method === "GET" && (url.pathname === "/admin" || url.pathname === "/admin.html")) {
      const response = await app.fetch(request, env, ctx);
      if (!response.ok) return response;
      const type = response.headers.get("content-type") || "";
      if (!type.includes("text/html")) return response;
      const html = await response.text();
      const injected = injectDiagnostic(html);
      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "no-store");
      return new Response(injected, { status: response.status, headers });
    }

    return app.fetch(request, env, ctx);
  }
};

function normalizeApiKey(value) {
  return String(value || "").trim().replace(/^Bearer\s+/i, "").replace(/^['\"]|['\"]$/g, "").trim();
}

async function safeJson(response) {
  const text = await response.text();
  try { return JSON.parse(text); } catch { return { raw: text.slice(0, 1000) }; }
}

function extractMessage(data, fallback) {
  const value = data?.message ?? data?.error ?? data?.detail ?? data?.raw ?? fallback ?? "";
  return String(value).slice(0, 1000);
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=UTF-8", ...extra }
  });
}

function injectDiagnostic(html) {
  const panel = `<section id="akhisave-soclip-diagnostic" style="margin:16px 0;padding:16px;border:1px solid #d9dee8;border-radius:16px;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.06)">
  <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
    <div><strong style="font-size:18px">SoClip API Diagnostic</strong><div style="font-size:13px;opacity:.7;margin-top:3px">Admin-only access check. API key is never shown.</div></div>
    <button id="akhisave-soclip-test" type="button" style="border:0;border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer">Test SoClip API</button>
  </div>
  <div id="akhisave-soclip-result" style="margin-top:14px;display:grid;gap:8px;font-size:14px">Press “Test SoClip API” to check access.</div>
</section>
<script>
(function(){
  const btn=document.getElementById('akhisave-soclip-test');
  const out=document.getElementById('akhisave-soclip-result');
  if(!btn||!out)return;
  function esc(v){return String(v??'').replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})}
  async function check(){
    btn.disabled=true; btn.textContent='Checking...'; out.textContent='Checking SoClip API...';
    try{
      const r=await fetch('/api/admin/soclip-check',{cache:'no-store'});
      const d=await r.json();
      if(!r.ok) throw new Error(d.error||'Diagnostic request failed.');
      out.innerHTML='<div><b>Status:</b> '+esc(d.status)+'</div>'+
        '<div><b>API key configured:</b> '+(d.configured?'Yes':'No')+'</div>'+
        '<div><b>SoClip HTTP status:</b> '+esc(d.httpStatus??'Not checked')+'</div>'+
        '<div><b>Exact upstream message:</b> '+esc(d.upstreamMessage||'—')+'</div>'+
        '<div><b>Last check:</b> '+esc(d.checkedAt||'—')+'</div>';
    }catch(e){out.innerHTML='<div><b>Status:</b> Diagnostic Error</div><div>'+esc(e.message)+'</div>';}
    finally{btn.disabled=false;btn.textContent='Test SoClip API';}
  }
  btn.addEventListener('click',check);
})();
</script>`;
  return html.replace(/<\/body>/i, panel + "</body>");
}
