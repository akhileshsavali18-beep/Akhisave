import suite from "./admin-suite.js";
import tools from "./tools-entry.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Login must reach the underlying authentication endpoint before an
    // admin session exists. admin-suite protects the other admin APIs.
    if (request.method === "POST" && url.pathname === "/api/admin/login") {
      return tools.fetch(request, env, ctx);
    }

    return suite.fetch(request, env, ctx);
  }
};
