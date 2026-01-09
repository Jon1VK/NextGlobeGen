import nextGlobeGenProxy from "next-globe-gen/proxy";
import { NextRequest } from "next/server";

/**
 * Custom proxy demonstrating all available options.
 * This wraps the NextGlobeGen proxy to show how to add custom logic.
 */
export function proxy(request: NextRequest) {
  // Call the NextGlobeGen proxy with custom options
  const response = nextGlobeGenProxy(request, {
    /**
     * Skip the alternate link header for specific paths (optional)
     */
    // skipAlternateLinkHeader: request.nextUrl.pathname.startsWith("/api"),
    /**
     * Customize locale negotiation behavior (optional)
     * "default" - normal behavior (negotiate on first visit)
     * "force" - always negotiate locale (useful for testing)
     * "skip" - never negotiate (use URL locale only)
     */
    // localeNegotiation: "default",
    /**
     * Customize locale cookie name (optional)
     */
    // localeCookieName: "MY_APP_LOCALE",
    /**
     * Customize locale cookie options (optional)
     */
    // localeCookieOpts: {
    //   maxAge: 60 * 60 * 24 * 365, // 1 year
    //   sameSite: "lax",
    // },
  });

  /**
   * You can modify the response here if needed
   * For example, add custom headers:
   */
  // response.headers.set("X-Custom-Header", "value");

  return response;
}

export const config = {
  // Matcher ignoring next internals and static assets
  matcher: ["/((?!_next|.*\\.).*)"],
};
