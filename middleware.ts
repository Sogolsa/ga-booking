// import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export async function middleware(req: NextRequest) {
//   const res = NextResponse.next();
//   const supabase = createMiddlewareClient({ req, res });

//   await supabase.auth.getSession();
//   console.log("🧠 middleware running");
//   return res;
// }
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const protectedRoutes = [
    "/availability",
    "/appointments",
    "/book",
    "/book/ga/[id]",
  ];

  const { pathname } = req.nextUrl;
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isProtected && !session) {
    console.log("🔒 User not logged in → redirecting");
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
