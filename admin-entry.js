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

      // Match the public AkhiSave website's light/white visual style without
      // changing any admin functionality or API behavior.
      const lightTheme = `<style id="akhisave-admin-light-theme">
:root{--bg:#ffffff;--panel:#ffffff;--panel2:#ffffff;--line:#e8eaf0;--text:#171923;--muted:#687083;--purple:#765cff;--pink:#ff3d91;--orange:#f59e0b;--green:#059669;--red:#e11d48}
body{background:#ffffff;color:var(--text)}
.topbar{background:#ffffffee;border-bottom:1px solid #e8eaf0;backdrop-filter:blur(20px)}
.iconbtn{background:#ffffff;color:#252936;border-color:#e4e7ee;box-shadow:0 6px 20px #1b21400d}
.logout{background:#ffffff;color:#252936;border-color:#e4e7ee}
.card,.statcard{background:#ffffff;border-color:#e7e9ef;box-shadow:0 10px 30px #1b21400b}
.label{color:#7a8497}.stat{color:#171923}.muted{color:#687083}
.row{border-bottom-color:#edf0f4}.btn{background:#ffffff;color:#252936;border-color:#e1e4eb}.btn.secondary{background:#f6f7fa;color:#4b5567}
.field input,.field textarea,.field select{background:#ffffff;color:#171923;border-color:#e1e4eb}.field input::placeholder,.field textarea::placeholder{color:#8a93a3}
.statusbox{background:#f8f9fb;border-color:#e7e9ef}.toolrow{border-bottom-color:#edf0f4}.toolicon{background:#f5f1ff;border-color:#e8e1ff}.toolmeta{color:#758096}.mini{background:#f7f8fa;color:#566074;border-color:#e1e4eb}
.notice{background:#fffaf0;border-color:#f5dfb5;color:#687083}.custom-editor{background:#f8f9fb;border-color:#e7e9ef}.empty{background:#f8f9fb;border-color:#e7e9ef;color:#687083}
.drawer-overlay{background:#0005}.drawer{background:#ffffff;border-right-color:#e7e9ef;box-shadow:15px 0 50px #1b214026}.drawer-head{border-bottom-color:#e7e9ef}.drawer a{color:#667085}.drawer a.active,.drawer a:hover{background:#f1edff;color:#684cff}
.bottom{background:#ffffff;border-top-color:#e7e9ef}.bottom button{color:#7a8497}.bottom button.active{color:#684cff}
.login-page{background:#ffffff}.loginbox{background:#ffffff;border-color:#e7e9ef;box-shadow:0 20px 60px #1b214012}.loginbox p{color:#687083}.loginbox input{background:#ffffff;color:#171923;border-color:#e1e4eb}.loginbox input::placeholder{color:#8a93a3}.toast{background:#ffffff;color:#171923;border-color:#e1e4eb;box-shadow:0 15px 45px #1b214020}
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
