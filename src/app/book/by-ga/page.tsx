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
        console.error(" Error fetching tutors:", error.message);
      }
      console.log(" GAs returned:", data);

      if (data) setGAs(data);
    };

    loadGAs();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Choose a GA</h1>
      <ul className="space-y-4">
        {gas.map((ga) => (
          <li key={ga.id}>
            <Link
              href={`/book/ga/${ga.id}`}
              className="text-blue-600 underline hover:text-blue-800"
            >
              {ga.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
