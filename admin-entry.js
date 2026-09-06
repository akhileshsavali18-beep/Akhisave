import site from "./menu-fix.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Keep the private admin UI isolated from the public branding/menu transform,
    // while still using the current AkhiSave logo assets.
    if (request.method === "GET" && (url.pathname === "/admin.html" || url.pathname === "/admin")) {
      const response = await env.ASSETS.fetch(request);
      const type = response.headers.get("content-type") || "";
      if (!type.includes("text/html")) return response;

      let html = await response.text();
      html = html
        .replaceAll("/307a3722-6c83-4b6b-a3fa-a5a840bf5d4b.png", "/Logo.png")
        .replaceAll("/4dc6e410-9139-4401-a2f8-84e67a0a29b2.png", "/LogoName.png")
        .replaceAll("/38364009-f822-430a-9f51-694b12b8d9ef.png", "/Logo.png")
        .replaceAll("/eb358ee7-8d58-460f-87fa-feb2edd6cd3d.png", "/Name.png");

      // Admin uses the same visual language as the public AkhiSave website:
      // white surfaces, dark text, and only the website's blue/cyan accent colors.
      const lightTheme = `<style id="akhisave-admin-light-theme">
:root{--bg:#fff;--panel:#fff;--panel2:#fff;--line:#e4eaf2;--text:#0a1628;--muted:#68778b;--blue:#1677ff;--cyan:#16c9e8;--soft:#edf5ff;--purple:#1677ff;--pink:#16c9e8;--orange:#f59e0b;--green:#059669;--red:#dc2626}
html,body{background:#fff!important;color:#0a1628!important}
.topbar{background:rgba(255,255,255,.97)!important;border-bottom:1px solid #e4eaf2!important;backdrop-filter:blur(12px)}
.iconbtn{background:#fff!important;color:#0a1628!important;border-color:#dce4ee!important;box-shadow:0 6px 20px rgba(18,38,68,.07)!important}
.logout{background:#fff!important;color:#0a1628!important;border-color:#dce4ee!important}
.card,.statcard{background:#fff!important;border-color:#e4eaf2!important;box-shadow:0 8px 24px rgba(18,38,68,.06)!important}
.label{color:#68778b!important}.stat{color:#0a1628!important}.muted{color:#68778b!important}
.row{border-bottom-color:#e4eaf2!important}
.btn{background:#fff!important;color:#0a1628!important;border-color:#d8e1ec!important}.btn.primary{background:linear-gradient(135deg,#1677ff,#16c9e8)!important;color:#fff!important;box-shadow:0 8px 22px rgba(22,119,255,.18)!important}.btn.secondary{background:#f7faff!important;color:#0a1628!important}
.switch{background:#dbe3ee!important}.switch:checked{background:linear-gradient(90deg,#1677ff,#16c9e8)!important}
.field input,.field textarea,.field select{background:#fff!important;color:#0a1628!important;border-color:#d8e1ec!important}.field input::placeholder,.field textarea::placeholder{color:#8a96a6!important}
.statusbox{background:#f7faff!important;border-color:#e4eaf2!important}.toolrow{border-bottom-color:#e4eaf2!important}.toolicon{background:#edf5ff!important;border-color:#d9e9fb!important}.toolmeta{color:#68778b!important}.mini{background:#f7faff!important;color:#526176!important;border-color:#d8e1ec!important}
.notice{background:#fffaf0!important;border-color:#f3dfb5!important;color:#68778b!important}.custom-editor{background:#f7faff!important;border-color:#e4eaf2!important}.empty{background:#f7faff!important;border-color:#e4eaf2!important;color:#68778b!important}
.drawer-overlay{background:rgba(10,22,40,.22)!important}.drawer{background:#fff!important;border-right-color:#e4eaf2!important;box-shadow:15px 0 50px rgba(18,38,68,.12)!important}.drawer-head{border-bottom-color:#e4eaf2!important}.drawer a{color:#68778b!important}.drawer a.active,.drawer a:hover{background:#edf5ff!important;color:#1677ff!important}
.bottom{background:#fff!important;border-top-color:#e4eaf2!important}.bottom button{color:#68778b!important}.bottom button.active{color:#1677ff!important}
.login-page{background:#fff!important}.loginbox{background:#fff!important;border-color:#e4eaf2!important;box-shadow:0 20px 60px rgba(18,38,68,.08)!important}.loginbox p{color:#68778b!important}.loginbox input{background:#fff!important;color:#0a1628!important;border-color:#d8e1ec!important}.loginbox input::placeholder{color:#8a96a6!important}.toast{background:#fff!important;color:#0a1628!important;border-color:#d8e1ec!important;box-shadow:0 15px 45px rgba(18,38,68,.12)!important}
.status{border-color:#b9d3f7!important;background:#edf5ff!important;color:#1677ff!important}
.bar{background:linear-gradient(180deg,#1677ff,#16c9e8)!important}
</style>`;
      html = html.replace('</head>', lightTheme + '</head>');

      return new Response(html, {
        status: response.status,
        headers: response.headers
      });
    }

    return site.fetch(request, env, ctx);
  }
};
