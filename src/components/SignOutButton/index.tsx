import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const supabase = createClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const router = useRouter();

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
        router.push("/");
      }}
      className="bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
    >
      Sign Out
    </button>
  );
}
