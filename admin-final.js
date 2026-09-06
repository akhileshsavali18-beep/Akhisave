import suite from "./admin-suite.js";
import worker from "./worker.js";

const LIGHT_ADMIN = `<style id="akhisave-admin-light-final">
:root{--bg:#fff;--panel:#fff;--panel2:#fff;--line:#e4eaf2;--text:#0a1628;--muted:#68778b;--purple:#1677ff;--pink:#16c9e8}
html,body{background:#fff!important;color:#0a1628!important}
.topbar{background:rgba(255,255,255,.98)!important;border-bottom:1px solid #e4eaf2!important}
.card,.statcard,.section,.feature,.aks-card{background:#fff!important;color:#0a1628!important;border-color:#e4eaf2!important;box-shadow:0 10px 30px rgba(18,38,68,.06)!important}
.label,.muted,.hero p,.section>p{color:#68778b!important}.stat,.hero h1,.section h2{color:#0a1628!important}
.iconbtn,.logout,.btn,.mini{background:#fff!important;color:#0a1628!important;border-color:#d8e1ec!important}.btn.primary{background:linear-gradient(135deg,#1677ff,#16c9e8)!important;color:#fff!important;border:0!important}.btn.secondary{background:#f7faff!important;color:#43536a!important}
.field input,.field textarea,.field select,.loginbox input{background:#fff!important;color:#0a1628!important;border-color:#d8e1ec!important}.field input::placeholder,.field textarea::placeholder,.loginbox input::placeholder{color:#8a93a3!important}
.row,.toolrow,.aks-row{border-bottom-color:#e4eaf2!important}.statusbox,.custom-editor,.empty,.atm-tool,.atm-stat,.atm-empty{background:#f7faff!important;color:#0a1628!important;border-color:#e4eaf2!important}.toolicon,.atm-icon{background:#edf5ff!important;border-color:#d8e8fb!important}
.drawer{background:#fff!important;border-right-color:#e4eaf2!important}.drawer-head{border-bottom-color:#e4eaf2!important}.drawer a{color:#68778b!important}.drawer a.active,.drawer a:hover{background:#edf5ff!important;color:#1677ff!important}.bottom{background:#fff!important;border-top-color:#e4eaf2!important}.bottom button{color:#68778b!important}.bottom button.active{color:#1677ff!important}
.login-page{background:#fff!important}.loginbox{background:#fff!important;color:#0a1628!important;border-color:#e4eaf2!important;box-shadow:0 20px 60px rgba(18,38,68,.08)!important}.loginbox p{color:#68778b!important}.toast{background:#fff!important;color:#0a1628!important;border-color:#d8e1ec!important}
</style>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/admin/login") {
      return worker.fetch(request, env, ctx);
    }

    const response = await suite.fetch(request, env, ctx);
    if (request.method !== "GET" || (url.pathname !== "/admin.html" && url.pathname !== "/admin")) return response;

    const type = response.headers.get("content-type") || "";
    if (!type.includes("text/html")) return response;
    let html = await response.text();

    html = html
      .replaceAll("/307a3722-6c83-4b6b-a3fa-a5a840bf5d4b.png", "/LogoName.png")
      .replaceAll("/4dc6e410-9139-4401-a2f8-84e67a0a29b2.png", "/LogoName.png")
      .replaceAll("/38364009-f822-430a-9f51-694b12b8d9ef.png", "/Logo.png")
      .replaceAll("/eb358ee7-8d58-460f-87fa-feb2edd6cd3d.png", "/Name.png");
    html = html.replace("</head>", LIGHT_ADMIN + "</head>");
    html = html.replace("</body>", '<script src="/admin-login-fix.js?v=2"></script></body>');

    const headers = new Headers(response.headers);
    headers.delete("content-length");
    headers.set("Cache-Control", "no-store");
    return new Response(html, {status:response.status, headers});
  }
};
