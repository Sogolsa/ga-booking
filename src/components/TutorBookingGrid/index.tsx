"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { toast } from "sonner";

type Props = {
  tutorId: string;
};

type Slot = {
  week_offset: number;
  slot: string;
};

function getDateFromSlot(slotLabel: string, weekOffset: number): string {
  const dayName = slotLabel.split("-")[0]; // e.g., "Tuesday"
  const dayMap: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const dayOffset = dayMap[dayName] ?? 0;

  const now = new Date();
  const today = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - today);
  startOfWeek.setHours(0, 0, 0, 0);

  const finalDate = new Date(startOfWeek);
  finalDate.setDate(startOfWeek.getDate() + weekOffset * 7 + dayOffset);

  return finalDate.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TutorBookingGrid({ tutorId }: Props) {
  const supabase = createClient();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) setStudentId(data.user.id);
    });
  }, []);

  useEffect(() => {
    const load = async () => {
      console.log("TUTOR ID:", tutorId);

      const { data: availability, error: availabilityError } = await supabase
        .from("availability")
        .select("week_offset, slots")
        .eq("user_id", tutorId);

      if (availabilityError) {
        console.error("Availability fetch error:", availabilityError);
        return;
      }

      console.log("availability", availability);

      const { data: appointments, error: appError } = await supabase
        .from("appointments")
        .select("week_offset, slot")
        .eq("tutor_id", tutorId);

      if (appError) {
        console.error("Appointments fetch error:", appError);
        return;
      }

      console.log("TUTOR ID:", tutorId);
      console.log("appointments", appointments);

      const booked = new Set(
        (appointments ?? []).map((a) => `${a.week_offset}-${a.slot}`)
      );

      const results: Slot[] = [];

      for (const row of availability ?? []) {
        const slots =
          typeof row.slots === "string"
            ? JSON.parse(row.slots)
            : row.slots ?? {};
        const week_offset = row.week_offset;

        console.log("Parsed slots for week", week_offset, slots);
        for (const time in slots) {
          if (Boolean(slots[time]) && !booked.has(`${week_offset}-${time}`)) {
            results.push({ week_offset, slot: time });
          }
        }
      }
      console.log("Available slots:", results);

      setAvailableSlots(results);
    };

    load();
  }, [tutorId]);

  const handleBook = async (week_offset: number, slot: string) => {
    if (!studentId) return;

    const { error } = await supabase.from("appointments").insert({
      tutor_id: tutorId,
      student_id: studentId,
      week_offset,
      slot,
    });

    if (error) {
      toast.error("Failed to book appointment");
    } else {
      toast.success("Appointment booked!");
      setAvailableSlots((prev) =>
        prev.filter((s) => !(s.week_offset === week_offset && s.slot === slot))
      );
    }
  };

  return (
    <div className="space-y-4">
      {availableSlots.length === 0 ? (
        <p>No available slots</p>
      ) : (
        availableSlots.map((slot, idx) => (
          <div
            key={idx}
            className="border p-4 rounded flex justify-between items-center"
          >
            <div>
              <strong>{slot.slot}</strong> (<strong>{slot.slot}</strong> (
              {getDateFromSlot(slot.slot, slot.week_offset)})
            </div>

            <button
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              onClick={() => handleBook(slot.week_offset, slot.slot)}
            >
              Book
            </button>
          </div>
        ))
      )}
    </div>
  );
}
