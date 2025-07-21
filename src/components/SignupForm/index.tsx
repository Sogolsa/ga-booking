"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validateSignup } from "@/lib/validateSignup";

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");

  const handleSignup = async () => {
    setError(null);

    const validationError = validateSignup({
      name,
      email,
      password,
      role,
      department,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    const metadata: { role: string; name?: string; department?: string } = {
      role,
      name,
      department,
    };
    if (name && name.trim() !== "") {
      metadata.name = name;
    }
    if (role === "tutor" && department && department.trim() !== "") {
      metadata.department = department;
    }

    // const res = await fetch("/api/user", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ email }),
    // });

    // const { exists } = await res.json();

    // if (exists) {
    //   setError("An account with this email already exists. Please log in.");
    //   return;
    // }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    console.log("Supabase signup result:", { data, error });

    if (error) {
      setError(error.message);
    } else if (!data.user) {
      setError("Something went wrong. You may already have an account.");
    } else {
      alert("Please confirm your email!");
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
          className="w-full mb-4 p-2 border rounded cursor-pointer"
          value={role}
          onChange={(e) => {
            const selectedRole = e.target.value;
            setRole(selectedRole);
            if (selectedRole !== "tutor") {
              setDepartment(""); // Reset department when not a tutor
            }
          }}
        >
          <option value="student">I am a Student</option>
          <option value="tutor">I am a GA / Tutor</option>
        </select>
        {role === "tutor" && (
          <select
            className="w-full mb-4 p-2 border rounded cursor-pointer"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">Select your department</option>
            <option value="Math">Math</option>
            <option value="Math/Statistics">Math/Statistics</option>
            <option value="Computer Science">Computer Science</option>
          </select>
        )}
        <div className="flex flex-col gap-2">
          <button
            className="w-full bg-orange-600 text-white p-2 rounded hover:bg-orange-700 transition cursor-pointer"
            onClick={handleSignup}
          >
            Sign Up
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
    </div>
  );
}
