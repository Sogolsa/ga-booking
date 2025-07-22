import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/utils/supabase/updateSession";

export async function middleware(request: NextRequest) {
  console.log("MIDDLEWARE IS RUNNING ");

  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
