export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Instagram downloader API
    if (url.pathname === "/api/download") {
      if (request.method !== "POST") {
        return Response.json(
          { success: false, error: "Method not allowed" },
          { status: 405 }
        );
      }

      try {
        const body = await request.json();
        const instagramUrl = String(body.url || "").trim();

        if (!instagramUrl) {
          return Response.json(
            { success: false, error: "Instagram URL is required." },
            { status: 400 }
          );
        }

        if (!/^https?:\/\/(www\.)?instagram\.com\//i.test(instagramUrl)) {
          return Response.json(
            { success: false, error: "Please enter a valid Instagram URL." },
            { status: 400 }
          );
        }

        if (!env.SOCLIP_API_KEY) {
          return Response.json(
            { success: false, error: "Downloader is not configured yet." },
            { status: 503 }
          );
        }

        const apiResponse = await fetch(
          "https://api.soclip.dev/v1/media",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.SOCLIP_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              url: instagramUrl
            })
          }
        );

        const data = await apiResponse.json();

        return Response.json(data, {
          status: apiResponse.status,
          headers: {
            "Cache-Control": "no-store"
          }
        });

      } catch (error) {
        return Response.json(
          {
            success: false,
            error: "Something went wrong. Please try again."
          },
          { status: 500 }
        );
      }
    }

    // Serve the AkhiSave website
    return env.ASSETS.fetch(request);
  }
};
