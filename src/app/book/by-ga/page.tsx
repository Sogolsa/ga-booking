"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";

type User = {
  id: string;
  name: string;
};

export default function BookByGA() {
  const supabase = createClient();
  const [gas, setGAs] = useState<User[]>([]);

  useEffect(() => {
    const loadGAs = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, name")
        .eq("role", "tutor");

      if (error) {
        console.error("Error fetching tutors:", error.message);
      }

      if (data) setGAs(data);
    };

    loadGAs();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Choose a Graduate Assistant
      </h1>

      <div className="flex flex-col gap-4">
        {gas.map((ga) => (
          <Link key={ga.id} href={`/book/ga/${ga.id}`} className="block">
            <div className="w-full bg-white border rounded-lg p-6 shadow hover:shadow-md transition duration-200 hover:border-blue-500">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {ga.name}
              </h2>
              <p className="text-sm text-gray-500">
                Click to view availability
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
