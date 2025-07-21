import { redirect } from "next/navigation";
import { supabaseServerClient } from "@/lib/supabaseServerClient";

export async function redirectIfAuthenticated() {
  const supabase = supabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const role = user.user_metadata?.role;
    if (role === "tutor") redirect("/availability");
    if (role === "student") redirect("/book");
    redirect("/dashboard");
  }
}
