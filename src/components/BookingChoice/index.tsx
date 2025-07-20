"use client";

import { useRouter } from "next/navigation";

export default function BookingChoice() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 items-center mt-12">
      <h1 className="text-2xl font-bold">How would you like to book?</h1>

      <button
        onClick={() => router.push("/book/by-ga")}
        className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
      >
        Choose by GA
      </button>

      <button
        onClick={() => router.push("/book/by-time")}
        className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600"
      >
        Choose by Time
      </button>
    </div>
  );
}
