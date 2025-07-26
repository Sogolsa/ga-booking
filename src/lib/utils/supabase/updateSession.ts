import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("Path:", request.nextUrl.pathname);
  console.log("User:", user);

  //   // Redirect logged-in users away from login/signup
  //   if (user && ["/login", "/signup"].includes(request.nextUrl.pathname)) {
  //     const role = user.user_metadata?.role;
  //     const redirectTo =
  //       role === "tutor" ? "/availability" : role === "student" ? "/book" : "/";

  //     const url = request.nextUrl.clone();
  //     url.pathname = redirectTo;
  //     return NextResponse.redirect(url);
  //   }

  //   // Redirect unauthenticated users away from private pages
  //   if (
  //     !user &&
  //     !request.nextUrl.pathname.startsWith("/login") &&
  //     !request.nextUrl.pathname.startsWith("/signup") &&
  //     !request.nextUrl.pathname.startsWith("/availability") &&
  //     !request.nextUrl.pathname.startsWith("/appointments") &&
  //     !request.nextUrl.pathname.startsWith("/book") &&
  //     !request.nextUrl.pathname.startsWith("/book/ga/[id]")
  //   ) {
  //     // no user, potentially respond by redirecting the user to the login page

  //     const url = request.nextUrl.clone();
  //     url.pathname = "/login";
  //     return NextResponse.redirect(url);
  //   }

  const path =
    request.nextUrl.pathname === "/"
      ? "/"
      : request.nextUrl.pathname.replace(/\/$/, "").toLowerCase();

  // Block students from accessing /availability and /appointments
  if (
    user?.user_metadata?.role === "student" &&
    ["/availability", "/appointments"].some((blockedPath) =>
      path.startsWith(blockedPath)
    )
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/book";
    return NextResponse.redirect(url);
  }

  // redirect tutors from accessing /book, /book/ga/[id]
  if (
    user?.user_metadata?.role === "tutor" &&
    ["/book", "/book/ga/[id]"].some((blockedPath) =>
      path.startsWith(blockedPath)
    )
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/availability";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from /login or /signup
  if (user && ["/login", "/signup"].includes(path)) {
    const role = user.user_metadata?.role;
    const url = request.nextUrl.clone();
    url.pathname = role === "tutor" ? "/availability" : "/book";
    return NextResponse.redirect(url);
  }

  //  ALLOW unauthenticated users to access public pages
  const publicPaths = ["/", "/login", "/signup"];
  if (!user && !publicPaths.includes(path)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
