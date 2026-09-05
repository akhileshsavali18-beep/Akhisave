import app from "./worker-wrapper.js";

function cleanAds(response) {
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;
  return response.text().then(html => {
    // Hard safety layer: remove every legacy notification / push / popunder / Monetag tag.
    let out = html
      .replace(/<script[^>]*(?:nap5k\.com|monetag|11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165)[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<script[^>]*src=["'][^"']*(?:nap5k\.com|monetag|profitableratecpmnetwork)[^"']*["'][^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<script[^>]*data-zone=["'](?:11717101|11727474|11727460|11727457|11727451|11727445|11727441|11727440|11727439|11727438|11727165)["'][^>]*>[\s\S]*?<\/script>/gi, "");
    // Remove any accidental Social Bar container/script left by an older deployment.
    out = out.replace(/<script[^>]*src=["'][^"']*profitableratecpmnetwork[^"']*["'][^>]*>[\s\S]*?<\/script>/gi, "");
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    headers.delete("content-encoding");
    return new Response(out, { status: response.status, statusText: response.statusText, headers });
  });
}

export default {
  async fetch(request, env, ctx) {
    return cleanAds(await app.fetch(request, env, ctx));
  }
};
