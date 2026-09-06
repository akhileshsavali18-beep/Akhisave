import site from "./menu-fix.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Serve the admin HTML directly as a static asset. This keeps the private
    // admin UI isolated from the public branding/menu HTML transformation.
    if (request.method === "GET" && (url.pathname === "/admin.html" || url.pathname === "/admin")) {
      return env.ASSETS.fetch(request);
    }

    return site.fetch(request, env, ctx);
  }
};
