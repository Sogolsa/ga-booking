"use client";

import Link from "next/link";
import { useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const supabase = createClient();

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      const role = data?.user?.user_metadata?.role;

      if (role === "student") {
        router.replace("/book");
      } else if (role === "tutor") {
        router.replace("/availability");
      }
    };

    checkUser();
  }, [router]);
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-10 text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome to the GA Appointment System
        </h1>
        <p className="text-gray-600 text-lg">
          Schedule time with your Graduate Assistant or update your
          availability.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/login"
            className="bg-orange-600 text-white rounded-lg px-6 py-3 font-semibold hover:bg-orange-500 transition"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="bg-gray-800 text-white rounded-lg px-6 py-3 font-semibold hover:bg-gray-600 transition"
          >
            Sign Up
          </Link>
        </div>

        <footer className="text-sm text-gray-400 pt-4 border-t">
          Made with ❤️ using Next.js + Supabase
        </footer>
      </div>
    </div>
  );
}
