"use client";

import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { createClient } from "@/lib/supabaseClient";

type AvailabilityRecord = {
  date: string;
  time_slots: string[];
};

type CalendarValue = Date | [Date, Date] | null;

export default function AvailabilityDashboard({ userId }: { userId: string }) {
  const supabase = createClient();
  const [selectedDate, setSelectedDate] = useState<CalendarValue>(null);
  const [availability, setAvailability] = useState<AvailabilityRecord[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);

  useEffect(() => {
    const loadAvailability = async () => {
      const { data, error } = await supabase
        .from("availability")
        .select("date, time_slots")
        .eq("user_id", userId);

      if (!error && data) {
        setAvailability(data);
      }
    };

    loadAvailability();
  }, [userId, supabase]);

  const handleDateChange = (value: Date | [Date, Date]) => {
    const pickedDate = Array.isArray(value) ? value[0] : value;

    setSelectedDate(pickedDate);

    const iso = pickedDate.toISOString().split("T")[0];
    const found = availability.find((a) => a.date === iso);
    setTimeSlots(found ? found.time_slots : []);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-center">Your Availability</h2>

      <Calendar
        onChange={(value) => handleDateChange(value as Date | [Date, Date])}
        value={selectedDate as Date}
        tileClassName={({ date }) => {
          const iso = date.toISOString().split("T")[0];
          return availability.some((a) => a.date === iso)
            ? "bg-green-100 border border-green-400 rounded"
            : null;
        }}
      />

      {selectedDate && !Array.isArray(selectedDate) && (
        <div>
          <h3 className="text-lg font-semibold mt-4">
            Availability for {selectedDate.toDateString()}:
          </h3>

          {timeSlots.length > 0 ? (
            <ul className="list-disc list-inside mt-2">
              {timeSlots.map((slot) => (
                <li key={slot}>{slot}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 mt-2">No time slots for this day.</p>
          )}
        </div>
      )}
    </div>
  );
}
