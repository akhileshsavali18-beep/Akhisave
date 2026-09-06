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

      return new Response(html, {
        status: response.status,
        headers: response.headers
      });
    }

    return site.fetch(request, env, ctx);
  }
};
