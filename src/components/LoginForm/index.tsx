"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import Link from "next/link";

export default function LoginForm() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (loginError) {
      setError(loginError.message);
      return;
    }
    //   const { data } = await supabase.auth.getUser();
    //   const role = data?.user?.user_metadata?.role;

    const { data, error: userError } = await supabase.auth.getUser();
    const user = data?.user;

    if (user) {
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existing) {
        const { error: insertError } = await supabase.from("users").insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name ?? "",
          role: user.user_metadata?.role ?? "",
          department: user.user_metadata?.department ?? null,
        });

        if (insertError) {
          console.error(" Insert to users failed:", insertError.message);
          setError("Database error saving new user: " + insertError.message);
          return;
        } else {
          console.log(" Inserted user into public.users");
        }
      }

      const role = user.user_metadata?.role;

      if (role === "student") {
        router.replace("/book");
      } else if (role === "tutor") {
        router.replace("/availability");
      } else {
        router.replace("/");
      }
    } else {
      setError("Could not fetch user after login.");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      <input
        className="w-full mb-2 p-2 border"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full mb-2 p-2 border"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="w-full gap-2 flex flex-col">
        <button
          className="w-full bg-orange-600 text-white p-2 cursor-pointer rounded"
          onClick={handleLogin}
        >
          Login
        </button>
        <Link
          href="/"
          className="w-full text-center bg-gray-800 text-white p-2 cursor-pointer rounded"
        >
          <div className="cursor-pointer">Home</div>
        </Link>
      </div>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
