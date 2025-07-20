"use client";

import { useState, JSX, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabaseClient";

const startHour = 8;
const endHour = 20;
const interval = 30;

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function getDateForDayInWeek(day: string, weekOffset: number): string {
  const dayMap: Record<string, number> = {
    Sunday: 6,
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
  };

  const baseDate = new Date();
  const currentDay = baseDate.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
  const diffToMonday = (currentDay + 6) % 7;

  const startOfWeek = new Date(baseDate);
  startOfWeek.setDate(baseDate.getDate() - diffToMonday + weekOffset * 7);
  startOfWeek.setHours(0, 0, 0, 0);

  const targetDate = new Date(startOfWeek);
  targetDate.setDate(startOfWeek.getDate() + dayMap[day]);

  return targetDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getCurrentWeekRange(offset = 0): { start: Date; end: Date } {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diffToMonday = (dayOfWeek + 6) % 7;

  const monday = new Date(today);
  monday.setDate(today.getDate() - diffToMonday + offset * 7);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
}

function formatWeekRange(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  const startStr = start.toLocaleDateString(undefined, options);
  const endStr = end.toLocaleDateString(undefined, {
    ...options,
    year: "numeric",
  });

  return `${startStr} – ${endStr}`;
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    if (h !== endHour) {
      slots.push(`${String(h).padStart(2, "0")}:30`);
    }
  }
  return slots;
}

const timeSlots = generateTimeSlots();

export default function WeeklyAvailabilityGrid(): JSX.Element {
  const [selectedSlots, setSelectedSlots] = useState<
    Record<number, Record<string, boolean>>
  >({});
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const [weekOffset, setWeekOffset] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user?.id) return;

      const role = user.user_metadata?.role;
      setUserId(user.id);
      setRole(role);

      if (role !== "tutor") {
        router.push("/book");
        return;
      }

      const { data: availability, error } = await supabase
        .from("availability")
        .select("week_offset, slots")
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to load availability", error);
        return;
      }

      const grouped = availability.reduce((acc: any, row: any) => {
        acc[row.week_offset] = row.slots;
        return acc;
      }, {});

      setSelectedSlots(grouped);
    };

    fetchUserAndData();
  }, []);

  const weekRange = useMemo(() => {
    const { start, end } = getCurrentWeekRange(weekOffset);
    return formatWeekRange(start, end);
  }, [weekOffset]);

  const weekSlots = selectedSlots[weekOffset] || {};

  const handleToggle = async (day: string, time: string): Promise<void> => {
    if (!userId) return;

    const key = `${day}-${time}`;
    const currentWeekSlots = selectedSlots[weekOffset] || {};
    const toggledValue = !currentWeekSlots?.[key];

    // Fetch current saved slots from DB
    const { data: existing } = await supabase
      .from("availability")
      .select("slots")
      .eq("user_id", userId)
      .eq("week_offset", weekOffset)
      .maybeSingle();

    const mergedSlots = {
      ...(existing?.slots ?? {}),
      ...currentWeekSlots,
      [key]: toggledValue,
    };

    const updatedAll = {
      ...selectedSlots,
      [weekOffset]: mergedSlots,
    };

    setSelectedSlots(updatedAll);

    const { error } = await supabase.from("availability").upsert(
      {
        user_id: userId,
        week_offset: weekOffset,
        slots: mergedSlots,
      },
      { onConflict: "user_id,week_offset" }
    );

    if (error) {
      console.error("Failed to save availability", error);
      toast.error("Failed to save availability");
    } else {
      toast.success("Availability saved!");
    }
  };

  const copyAvailabilityToFutureWeeks = async (
    weeksAhead: number
  ): Promise<void> => {
    if (!userId) return;

    const sourceWeek = selectedSlots[weekOffset];
    if (!sourceWeek) {
      toast.error("No availability set for this week to copy.");
      return;
    }

    const updatedSlots = { ...selectedSlots };
    let hasError = false;

    for (let i = 1; i <= weeksAhead; i++) {
      const targetOffset = weekOffset + i;

      updatedSlots[targetOffset] = { ...sourceWeek };

      const { error } = await supabase.from("availability").upsert(
        {
          user_id: userId,
          week_offset: targetOffset,
          slots: sourceWeek,
        },
        { onConflict: "user_id,week_offset" }
      );

      if (error) {
        console.error(`Failed to copy to week ${targetOffset}:`, error);
        hasError = true;
      }
    }

    setSelectedSlots(updatedSlots);

    if (hasError) {
      toast.error("Some weeks failed to save.");
    } else {
      toast.success(
        `Copied this week’s availability to next ${weeksAhead} week${
          weeksAhead > 1 ? "s" : ""
        }`
      );
    }
  };

  return (
    <div className="overflow-auto border rounded-md">
      <div className="flex items-center justify-center gap-4 mb-4 mt-4">
        <button
          onClick={() => setWeekOffset((prev) => prev - 1)}
          className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
        >
          ⟵ Previous
        </button>

        <div className="text-lg font-semibold text-gray-700">{weekRange}</div>

        <button
          onClick={() => setWeekOffset((prev) => prev + 1)}
          className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
        >
          Next ⟶
        </button>
      </div>
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={() => copyAvailabilityToFutureWeeks(1)}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
        >
          Copy to Next Week
        </button>

        <button
          onClick={() => copyAvailabilityToFutureWeeks(3)}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
        >
          Copy to Next 3 Weeks
        </button>
      </div>

      <table className="min-w-full border-collapse table-fixed text-sm">
        <thead>
          <tr>
            <th className="w-24 p-2 border text-left bg-gray-100">Time</th>
            {/* {daysOfWeek.map((day) => (
              <th key={day} className="p-2 border bg-gray-100 text-center">
                {day}
              </th>
            ))} */}
            {daysOfWeek.map((day) => (
              <th key={day} className="p-2 border bg-gray-100 text-center">
                {day}
                <br />
                <span className="text-xs text-gray-500">
                  {getDateForDayInWeek(day, weekOffset)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((time) => (
            <tr key={time}>
              <td className="border px-2 py-1 text-right font-mono bg-gray-50">
                {time}
              </td>
              {daysOfWeek.map((day) => {
                const key = `${day}-${time}`;
                const isSelected = weekSlots[key];
                return (
                  <td
                    key={key}
                    className={`border px-2 py-2 text-center cursor-pointer transition ${
                      isSelected ? "bg-yellow-300" : "hover:bg-gray-200"
                    }`}
                    onClick={() => handleToggle(day, time)}
                  >
                    {isSelected ? "✓" : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
