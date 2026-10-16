import {
  resolveHostedAppAsset,
  runtimeSecurityHeaders,
} from "./lib/apps-runtime";

interface AppsRuntimeEnv {
  APPS_BUCKET: R2Bucket;
}

function plainResponse(message: string, status: number) {
  return new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

const appsWorker = {
  async fetch(request: Request, env: AppsRuntimeEnv) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return plainResponse("Method not allowed", 405);
    }

    const url = new URL(request.url);
    if (url.pathname === "/robots.txt") {
      return new Response(request.method === "HEAD" ? null : "User-agent: *\nDisallow: /\n", {
        headers: {
          "Cache-Control": "public, max-age=3600",
          "Content-Type": "text/plain; charset=utf-8",
          "X-Content-Type-Options": "nosniff",
          "X-Robots-Tag": "noindex, nofollow",
        },
      });
    }
    const resolution = resolveHostedAppAsset(url.pathname);

    if (resolution.kind === "redirect") {
      url.pathname = resolution.location;
      return Response.redirect(url.toString(), 308);
    }

    if (resolution.kind === "not-found") {
      return plainResponse("App not found", 404);
    }

    const object = await env.APPS_BUCKET.get(resolution.asset.key);
    if (!object) return plainResponse("App asset not found", 404);

    const etag = object.httpEtag;
    if (request.headers.get("If-None-Match") === etag) {
      return new Response(null, {
        status: 304,
        headers: {
          ETag: etag,
          ...runtimeSecurityHeaders(resolution.asset.file),
        },
      });
    }

    return new Response(request.method === "HEAD" ? null : object.body, {
      headers: {
        ETag: etag,
        ...runtimeSecurityHeaders(resolution.asset.file),
      },
    });
  },
};

export default appsWorker;
