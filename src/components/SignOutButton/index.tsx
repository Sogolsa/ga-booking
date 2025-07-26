import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const supabase = createClient();

export default function SignOutButton() {
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
      className=" text-white cursor-pointer"
    >
      Sign Out
    </button>
  );
}
