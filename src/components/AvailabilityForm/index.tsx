"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

// const TIME_OPTIONS = [
//   "09:00",
//   "10:00",
//   "11:00",
//   "13:00",
//   "14:00",
//   "15:00",
//   "16:00",
//   "17:00",
// ];
const TIME_OPTIONS = Array.from({ length: 25 }, (_, i) => {
  const totalMinutes = 8 * 60 + i * 30; // start at 08:00
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
});

export default function AvailabilityForm({ userId }: { userId: string }) {
  const supabase = createClient();
  const router = useRouter();

  const [date, setDate] = useState("");
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const toggleTime = (time: string) => {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const handleSubmit = async () => {
    setMessage(null);

    const { error } = await supabase.from("availability").insert({
      user_id: userId,
      date,
      time_slots: selectedTimes,
    });

    if (error) {
      setMessage("Error saving availability");
    } else {
      setMessage("Availability saved!");
      setDate("");
      setSelectedTimes([]);
    }
  };

  return (
    <div className="space-y-4 max-w-md">
      <h2 className="text-xl font-bold">Set Your Availability</h2>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <div className="grid grid-cols-3 gap-2">
        {TIME_OPTIONS.map((time) => (
          <button
            key={time}
            onClick={() => toggleTime(time)}
            className={`px-4 py-2 border rounded ${
              selectedTimes.includes(time)
                ? "bg-blue-600 text-white"
                : "bg-gray-100"
            }`}
          >
            {time}
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Save Availability
      </button>

      {message && (
        <p className="text-sm text-center text-gray-700">{message}</p>
      )}
    </div>
  );
}
