export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // =====================================================
    // INSTAGRAM MEDIA DOWNLOADER - SOCLIP
    // =====================================================
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


    // =====================================================
    // INSTAGRAM PUBLIC PROFILE
    // GET /api/profile?handle=username
    // =====================================================
    if (url.pathname === "/api/profile") {
      return instagramAPI(
        env,
        "/profile",
        url.searchParams
      );
    }


    // =====================================================
    // INSTAGRAM PROFILE POSTS
    // GET /api/profile/posts?handle=username
    // =====================================================
    if (url.pathname === "/api/profile/posts") {
      return instagramAPI(
        env,
        "/profile/posts",
        url.searchParams
      );
    }


    // =====================================================
    // INSTAGRAM PROFILE REELS
    // GET /api/profile/reels?handle=username
    // =====================================================
    if (url.pathname === "/api/profile/reels") {
      return instagramAPI(
        env,
        "/profile/reels",
        url.searchParams
      );
    }


    // =====================================================
    // INSTAGRAM PROFILE STORIES
    // GET /api/profile/stories?handle=username
    // =====================================================
    if (url.pathname === "/api/profile/stories") {
      return instagramAPI(
        env,
        "/profile/stories",
        url.searchParams
      );
    }


    // =====================================================
    // INSTAGRAM PROFILE HIGHLIGHTS
    // GET /api/profile/highlights?handle=username
    // =====================================================
    if (url.pathname === "/api/profile/highlights") {
      return instagramAPI(
        env,
        "/profile/highlights",
        url.searchParams
      );
    }


    // =====================================================
    // INSTAGRAM PROFILE ABOUT
    // GET /api/profile/about?handle=username
    // =====================================================
    if (url.pathname === "/api/profile/about") {
      return instagramAPI(
        env,
        "/profile/about",
        url.searchParams
      );
    }


    // =====================================================
    // INSTAGRAM POST / REEL DETAILS
    // GET /api/post?url=instagram-url
    // =====================================================
    if (url.pathname === "/api/post") {
      return instagramAPI(
        env,
        "/post",
        url.searchParams,
        "url"
      );
    }


    // =====================================================
    // INSTAGRAM USER SEARCH
    // GET /api/search/users?q=username
    // =====================================================
    if (url.pathname === "/api/search/users") {
      return instagramAPI(
        env,
        "/search/users",
        url.searchParams,
        "q"
      );
    }


    // =====================================================
    // SERVE AKHISAVE WEBSITE
    // =====================================================
    return env.ASSETS.fetch(request);
  }
};


// =========================================================
// INSTAGRAM API HELPER
// =========================================================
async function instagramAPI(env, endpoint, params, requiredParam = "handle") {

  if (!env.INSTAGRAM_API_KEY) {
    return Response.json(
      {
        success: false,
        error: "Instagram API is not configured yet."
      },
      { status: 503 }
    );
  }

  const value = params.get(requiredParam);

  if (!value) {
    return Response.json(
      {
        success: false,
        error: `${requiredParam} is required.`
      },
      { status: 400 }
    );
  }

  try {

    const apiUrl = new URL(
      `https://api.instagramapi.dev/v1${endpoint}`
    );

    // Copy allowed query parameters
    for (const [key, val] of params.entries()) {
      apiUrl.searchParams.set(key, val);
    }

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${env.INSTAGRAM_API_KEY}`,
        "Accept": "application/json"
      }
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
        error: "Instagram API request failed."
      },
      { status: 500 }
    );
  }
  }
