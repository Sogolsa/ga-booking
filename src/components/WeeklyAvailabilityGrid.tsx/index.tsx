"use client";

import { useState, JSX, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabaseClient";
import { PostgrestError } from "@supabase/supabase-js";

import {
  getDateForDayInWeek,
  getCurrentWeekRange,
  formatWeekRange,
  daysOfWeek,
} from "@/lib/utils/dateUtils";

const startHour = 8;
const endHour = 20;
const interval = 30;

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

type Appointment = {
  slot: string;
  week_offset: number;
  student: {
    name: string;
  } | null;
};

type AvailabilityRow = {
  week_offset: number;
  slots: Record<string, boolean>;
};

export default function WeeklyAvailabilityGrid(): JSX.Element {
  const [selectedSlots, setSelectedSlots] = useState<
    Record<number, Record<string, boolean>>
  >({});
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<Record<string, string>>({});

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
        router.push("/book/by-ga");
        return;
      }

      const { data: availability, error: availabilityError } = await supabase
        .from("availability")
        .select("week_offset, slots")
        .eq("user_id", user.id);

      if (availabilityError) {
        console.error("Failed to load availability", availabilityError);
        return;
      }

      const grouped = (availability as AvailabilityRow[]).reduce(
        (acc: Record<number, Record<string, boolean>>, row) => {
          acc[row.week_offset] = row.slots;
          return acc;
        },
        {}
      );

      const response = await supabase
        .from("appointments")
        .select("week_offset, slot, student:users(name)")
        .eq("tutor_id", user.id);
      // .eq("week_offset", weekOffset);

      const appointments = response.data as Appointment[] | null;
      const appError: PostgrestError | null = response.error;

      if (appError) {
        console.error("Failed to fetch appointments", appError);
      } else {
        const booked: Record<string, string> = {};

        for (const appt of appointments ?? []) {
          const fullKey = `${appt.week_offset}-${appt.slot}`;
          booked[fullKey] = appt.student?.name ?? "Unknown";
        }

        setBookedSlots(booked);
      }

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

    const fullKey = `${weekOffset}-${key}`;
    if (bookedSlots[fullKey]) {
      toast.warning("You cannot remove availability for a booked slot.");
      return;
    }

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

    // Filter out slots that are booked
    const filteredSourceWeek: Record<string, boolean> = Object.fromEntries(
      Object.entries(sourceWeek).filter(([slotKey, isAvailable]) => isAvailable)
    );

    const updatedSlots = { ...selectedSlots };
    let hasError = false;

    for (let i = 1; i <= weeksAhead; i++) {
      const targetOffset = weekOffset + i;

      updatedSlots[targetOffset] = { ...filteredSourceWeek };

      const { error } = await supabase.from("availability").upsert(
        {
          user_id: userId,
          week_offset: targetOffset,
          slots: filteredSourceWeek,
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
          className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition cursor-pointer"
        >
          ⟵ Previous
        </button>

        <div className="text-lg font-semibold text-gray-700">{weekRange}</div>

        <button
          onClick={() => setWeekOffset((prev) => prev + 1)}
          className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition cursor-pointer"
        >
          Next ⟶
        </button>
      </div>
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={() => copyAvailabilityToFutureWeeks(1)}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition cursor-pointer"
        >
          Copy to Next Week
        </button>

        <button
          onClick={() => copyAvailabilityToFutureWeeks(3)}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition cursor-pointer"
        >
          Copy to Next 3 Weeks
        </button>
      </div>

      <table className="min-w-full border-collapse table-fixed text-sm">
        <thead>
          <tr>
            <th className="w-24 p-2 border text-left bg-gray-100">Time</th>

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
