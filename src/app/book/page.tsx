"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";
import SignOutButton from "@/components/SignOutButton";
import Navbar from "@/components/Navbar";

type User = {
  id: string;
  name: string;
  department?: string;
  email?: string;
};

export default function BookByGA() {
  const supabase = createClient();
  const [gas, setGAs] = useState<User[]>([]);

  useEffect(() => {
    const loadGAs = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, department, email")
        .eq("role", "tutor");

      if (error) {
        console.error("Error fetching tutors:", error.message);
      }

      if (data) setGAs(data);
    };

    loadGAs();
  }, []);

  return gas.length === 0 ? (
    <div className="min-h-screen flex justify-center items-center text-gray-600">
      No Graduate Assistants are available at the moment.
    </div>
  ) : (
    <>
      <Navbar />
      <div className=" min-h-screen p-6 max-w-4xl mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Choose a Graduate Assistant
        </h1>

        <div className="flex flex-col gap-4">
          {gas.map((ga) => (
            <Link key={ga.id} href={`/book/ga/${ga.id}`} className="block">
              <div className="w-full not-first: bg-white border rounded-lg p-6 shadow hover:shadow-md transition duration-200 hover:border-blue-500">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {ga.name}
                  </h2>
                  <p className="text-sm gap-2 text-gray-500">{ga.department}</p>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm text-gray-500">
                    Click to view availability
                  </p>
                  <p className="text-sm text-gray-600">{ga.email}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
