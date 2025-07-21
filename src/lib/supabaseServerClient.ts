import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { headers, cookies } from "next/headers";

export const supabaseServerClient = () =>
  createServerComponentClient({
    cookies: () => cookies(),
  });
