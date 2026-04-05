import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the request is for a dashboard route
  if (pathname == "/" || pathname.startsWith("/dashboard")) {
    const sessionToken = request.cookies.get("session_token")?.value;

    // If no session token, redirect to login
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Decode and verify the session token
      const decoded = JSON.parse(
        Buffer.from(sessionToken, "base64").toString(),
      );

      // Check if token is expired
      if (decoded.exp < Date.now()) {
        // Clear the expired cookie and redirect to login
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("session_token");
        return response;
      }

      // Token is valid, allow the request to proceed
      return NextResponse.next();
    } catch {
      // Invalid token format, redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("session_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
