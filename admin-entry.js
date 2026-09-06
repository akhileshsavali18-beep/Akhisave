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

      // Match the public AkhiSave website's light/white visual style.
      // Use the website's existing blue/cyan palette only; do not introduce
      // the old purple/pink admin palette.
      const lightTheme = `<style id="akhisave-admin-light-theme">
:root{--bg:#fff;--panel:#fff;--panel2:#fff;--line:#e4eaf2;--text:#0a1628;--muted:#68778b;--blue:#1677ff;--cyan:#16c9e8;--soft:#edf5ff;--purple:#1677ff;--pink:#16c9e8;--orange:#f59e0b;--green:#059669;--red:#e11d48}
html,body{background:#fff!important;color:#0a1628!important}
.topbar{background:rgba(255,255,255,.97)!important;border-bottom:1px solid #e4eaf2!important;backdrop-filter:blur(12px)}
.iconbtn,.logout{background:#fff!important;color:#0a1628!important;border-color:#d8e1ec!important;box-shadow:0 6px 20px rgba(18,38,68,.06)!important}
.card,.statcard,.section,.feature,#more .card,#more .section,#more .feature{background:#fff!important;color:#0a1628!important;border-color:#e4eaf2!important;box-shadow:0 10px 30px rgba(18,38,68,.06)!important}
.label{color:#68778b!important}.stat{color:#0a1628!important}.muted{color:#68778b!important}
.row,.toolrow{border-bottom-color:#e4eaf2!important}.btn,.mini{background:#fff!important;color:#0a1628!important;border-color:#d8e1ec!important}.btn.primary{background:linear-gradient(135deg,#1677ff,#16c9e8)!important;color:#fff!important;border:0!important}.btn.secondary{background:#f7faff!important;color:#43536a!important}
.field input,.field textarea,.field select{background:#fff!important;color:#0a1628!important;border-color:#d8e1ec!important}.field input::placeholder,.field textarea::placeholder{color:#8a93a3!important}
.statusbox,.custom-editor,.empty,#more .statusbox{background:#f7faff!important;color:#0a1628!important;border-color:#e4eaf2!important}.toolicon{background:#edf5ff!important;border-color:#d8e8fb!important}.toolmeta{color:#68778b!important}
.notice{background:#fffaf0!important;border-color:#f5dfb5!important;color:#68778b!important}.drawer-overlay{background:rgba(0,0,0,.25)!important}.drawer{background:#fff!important;border-right-color:#e4eaf2!important;box-shadow:15px 0 50px rgba(18,38,68,.12)!important}.drawer-head{border-bottom-color:#e4eaf2!important}.drawer a{color:#68778b!important}.drawer a.active,.drawer a:hover{background:#edf5ff!important;color:#1677ff!important}.bottom{background:#fff!important;border-top-color:#e4eaf2!important}.bottom button{color:#68778b!important}.bottom button.active{color:#1677ff!important}
.login-page{background:#fff!important}.loginbox{background:#fff!important;color:#0a1628!important;border-color:#e4eaf2!important;box-shadow:0 20px 60px rgba(18,38,68,.08)!important}.loginbox p{color:#68778b!important}.loginbox input{background:#fff!important;color:#0a1628!important;border-color:#d8e1ec!important}.loginbox input::placeholder{color:#8a93a3!important}.toast{background:#fff!important;color:#0a1628!important;border-color:#d8e1ec!important;box-shadow:0 15px 45px rgba(18,38,68,.12)!important}
#more,#more *{color:#0a1628}.more-grid{background:transparent!important}.more-grid .feature{background:#fff!important}.more-grid .feature p{color:#68778b!important}
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
