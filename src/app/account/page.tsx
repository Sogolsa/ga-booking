"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import AvailabilityForm from "@/components/AvailabilityForm";

export default function AccountPage() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) {
        setUserId(data.user.id);
      }
    });
  }, [supabase]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      {userId ? <AvailabilityForm userId={userId} /> : <p>Loading...</p>}
    </main>
  );
}
