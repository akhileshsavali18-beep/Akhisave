export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const url = String(body.url || "").trim();

    if (!url) {
      return Response.json(
        { success: false, error: "Instagram URL is required." },
        { status: 400 }
      );
    }

    if (!/^https?:\/\/(www\.)?instagram\.com\//i.test(url)) {
      return Response.json(
        { success: false, error: "Please enter a valid Instagram URL." },
        { status: 400 }
      );
    }

    if (!context.env.SOCLIP_API_KEY) {
      return Response.json(
        { success: false, error: "Downloader API is not configured yet." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.soclip.dev/v1/media", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${context.env.SOCLIP_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    return Response.json(data, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store"
      }
    });

  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Unable to process the request."
      },
      { status: 500 }
    );
  }
}
