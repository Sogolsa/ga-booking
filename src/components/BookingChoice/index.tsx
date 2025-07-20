"use client";

import { useRouter } from "next/navigation";

export default function BookingChoice() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 items-center mt-12">
      <h1 className="text-2xl font-bold">Choose a Graduate Assistant</h1>

      <button
        onClick={() => router.push("/book/by-ga")}
        className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 cursor-pointer"
      >
        Browse GAs
      </button>
    </div>
  );
}
