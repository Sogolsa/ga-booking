import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

export default function SignOutButton() {
  const supabase = createClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data?.user);
    });
  }, []);

  if (!isLoggedIn) return null;

  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
      }}
      className="bg-red-600 text-white px-4 py-2 rounded"
    >
      Sign Out
    </button>
  );
}
