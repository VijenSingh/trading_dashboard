import { NextResponse } from "next/server";

// Gates every page and API route behind HTTP Basic Auth. This is a personal,
// single-user dashboard with no other auth layer, so this is the minimum
// needed to stop the trade data (and write endpoints) being open to anyone
// with the URL.
export function middleware(req) {
  const authHeader = req.headers.get("authorization");

  if (authHeader?.startsWith("Basic ")) {
    const decoded = atob(authHeader.slice(6));
    const separatorIndex = decoded.indexOf(":");
    const user = decoded.slice(0, separatorIndex);
    const pass = decoded.slice(separatorIndex + 1);

    if (user === process.env.DASHBOARD_USER && pass === process.env.DASHBOARD_PASSWORD) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Trading Dashboard"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
