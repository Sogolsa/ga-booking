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
      return;
    }

    const identities = data?.user?.identities;

    // check if user exists/ no new identities
    if (Array.isArray(identities) && identities.length === 0) {
      setError("This email is already registered. Try logging in instead.");
      // router.push("/login");
      return;
    }

    // if new user
    if (Array.isArray(identities) && identities.length > 0) {
      alert("Please confirm your email!");
      router.push("/login");
      return;
    }

    // ✅ Fallback if user is null (just in case — should never hit)
    if (!data?.user) {
      setError("Something went wrong. Please try again.");
      return;
    }
  };

  return (
    <div className="flex justify-center items-center pt-20">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSignup();
        }}
        className="w-full max-w-md bg-white shadow-2xl rounded-lg p-10"
      >
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
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          type="password"
          placeholder="Password"
          autoComplete="password"
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
            <option value="Math/Statistics">Math/Elementary Stats/Lab</option>
            <option value="Computer Science">Computer Science</option>
          </select>
        )}
        <div className="flex flex-col gap-2">
          <button className="w-full bg-orange-600 text-white p-2 rounded hover:bg-orange-700 transition cursor-pointer">
            Sign Up
          </button>
          <Link
            href="/"
            className="w-full text-center bg-gray-800 text-white p-2 cursor-pointer rounded"
          >
            <div className="cursor-pointer">Home</div>
          </Link>

          {error && (
            <div className="text-red-600 mt-2">
              <p>{error}</p>
              {error.includes("already registered") && (
                <Link href="/login" className="underline text-sm text-blue-600">
                  Go to Login
                </Link>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
