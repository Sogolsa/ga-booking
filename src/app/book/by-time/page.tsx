"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { toast } from "sonner";

type Slot = {
  tutor_id: string;
  tutor_name: string;
  week_offset: number;
  slot: string;
};

export default function BookByTime() {
  const supabase = createClient();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [openSlots, setOpenSlots] = useState<Slot[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) setStudentId(data.user.id);
    });
  }, []);

  useEffect(() => {
    if (!studentId) return;

    const load = async () => {
      // Get all availability
      const { data: allAvailability } = await supabase
        .from("availability")
        .select("user_id, week_offset, slots, users(name)")
        .neq("slots", null);

      // Get all booked appointments
      const { data: allAppointments } = await supabase
        .from("appointments")
        .select("tutor_id, week_offset, slot");

      const bookedSet = new Set(
        allAppointments?.map((a) => `${a.tutor_id}-${a.week_offset}-${a.slot}`)
      );

      const results: Slot[] = [];

      for (const row of allAvailability || []) {
        const slots = row.slots ?? {};
        const tutorId = row.user_id;
        const tutorName = row.users?.name ?? "Unknown";
        const weekOffset = row.week_offset;

        for (const slot in slots) {
          const key = `${tutorId}-${weekOffset}-${slot}`;
          if (slots[slot] && !bookedSet.has(key)) {
            results.push({
              tutor_id: tutorId,
              tutor_name: tutorName,
              week_offset: weekOffset,
              slot,
            });
          }
        }
      }

      setOpenSlots(results);
    };

    load();
  }, [studentId]);

  const bookSlot = async (slot: Slot) => {
    if (!studentId) return;

    const { error } = await supabase.from("appointments").insert({
      tutor_id: slot.tutor_id,
      student_id: studentId,
      week_offset: slot.week_offset,
      slot: slot.slot,
    });

    if (error) {
      toast.error("Failed to book appointment");
    } else {
      toast.success("Booked!");
      setOpenSlots((prev) =>
        prev.filter(
          (s) =>
            !(
              s.tutor_id === slot.tutor_id &&
              s.week_offset === slot.week_offset &&
              s.slot === slot.slot
            )
        )
      );
    }
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Book by Time</h1>
      {openSlots.length === 0 ? (
        <p>No available slots</p>
      ) : (
        <ul className="space-y-4">
          {openSlots.map((slot, index) => (
            <li
              key={`${slot.tutor_id}-${slot.slot}-${index}`}
              className="border p-4 rounded flex justify-between items-center"
            >
              <div>
                <div>
                  <strong>{slot.slot}</strong> (week offset: {slot.week_offset})
                </div>
                <div className="text-sm text-gray-600">
                  with {slot.tutor_name}
                </div>
              </div>
              <button
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                onClick={() => bookSlot(slot)}
              >
                Book
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
