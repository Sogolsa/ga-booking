"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");

  const handleSignup = async () => {
    setError(null);

    const metadata: { role: string; name?: string } = { role };
    if (name && name.trim() !== "") {
      metadata.name = name;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // data: {
        //   role,
        //   name,
        // },

        data: metadata,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      alert("Signup complete! You can now log in.");
      router.push("/login");
    }
  };

  return (
    <div className="flex justify-center items-center pt-20">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-lg p-10">
        <h1 className="text-xl font-bold mb-4 text-center">Sign Up</h1>

        <input
          className="w-full mb-2 p-2 border rounded"
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          className="w-full mb-4 p-2 border rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="student">I am a Student</option>
          <option value="tutor">I am a GA / Tutor</option>
        </select>

        <button
          className="w-full bg-orange-600 text-white p-2 rounded hover:bg-orange-700 transition"
          onClick={handleSignup}
        >
          Sign Up
        </button>

        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
    </div>
  );
}
