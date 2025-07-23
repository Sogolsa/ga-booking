"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import SignOutButton from "../SignOutButton";

export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const role = data?.user?.user_metadata?.role ?? null;
      setRole(role);
    });
  }, []);

  return (
    <nav className="bg-gray-800 shadow px-4 py-3 flex justify-between items-center">
      <Link href="/" className="font-bold text-xl text-orange-600">
        Scheduler
      </Link>
      <div className="space-x-4">
        {role === "student" && (
          <>
            <Link href="/book" className="text-white">
              Book
            </Link>
            {/* <Link href="/my-bookings" className="text-white">
              My Appointments
            </Link> */}
          </>
        )}
        {role === "tutor" && (
          <>
            <Link href="/availability" className="text-white">
              Availability
            </Link>
            <Link href="/appointments" className="text-white">
              Appointments
            </Link>
          </>
        )}
        <SignOutButton />
      </div>
    </nav>
  );
}
