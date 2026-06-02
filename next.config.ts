import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Newsletter is deferred for v1 — the signup/confirm/unsubscribe flow is
      // built but unreachable. Send any direct hit on these routes to home.
      // `permanent: false` (307) is intentional: the newsletter will return, so
      // we don't want browsers/search engines to cache this as permanent.
      { source: "/subscribe", destination: "/", permanent: false },
      { source: "/subscribe/:path*", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
