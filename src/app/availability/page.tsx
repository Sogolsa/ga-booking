"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import WeeklyAvailabilityGrid from "@/components/WeeklyAvailabilityGrid.tsx";
import Navbar from "@/components/Navbar";

export default function AccountPage() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) setUserId(data.user.id);
    });
  }, [supabase]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen p-6">
        <h1 className=" flex justify-center text-2xl font-bold mb-6">
          Set Weekly Availability
        </h1>
        {userId ? <WeeklyAvailabilityGrid /> : <p>Loading user...</p>}
      </main>
    </>
  );
}
