"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { PostgrestError } from "@supabase/supabase-js";
import { getDateFromSlot } from "@/lib/utils/dateUtils";

type Props = {
  tutorId: string;
};

type Slot = {
  id?: number;

  week_offset: number;
  slot: string;
  studentName?: string | null;
  studentId?: string | null;
};

type AppointmentWithStudent = {
  id: number;
  week_offset: number;
  slot: string;
  student: {
    id: string;
    name: string;
  } | null;
};

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
      console.log("Running load function");

      const { data: availability, error: availabilityError } = await supabase
        .from("availability")
        .select("week_offset, slots")
        .eq("user_id", tutorId);

      if (availabilityError) {
        console.error("Availability fetch error:", availabilityError);
        return;
      }

      console.log("availability", availability);

      const response = await supabase
        .from("appointments")
        .select("id, week_offset, slot, student:users(id, name)")
        .eq("tutor_id", tutorId);

      const appointments = response.data as AppointmentWithStudent[] | null;
      const appError: PostgrestError | null = response.error;

      console.log("TUTOR ID:", tutorId);
      console.log("appointments", appointments);

      appointments?.forEach((a) =>
        console.log("Booked slot:", a.slot, "Student:", a.student?.name)
      );

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

        for (const [time, isAvailable] of Object.entries(slots)) {
          if (!isAvailable) continue;

          const appointment = appointments?.find(
            (a) => a.week_offset === week_offset && a.slot === time
          );

          results.push({
            id: appointment?.id,
            week_offset,
            slot: time,
            studentName: appointment?.student?.name ?? null,
            studentId: appointment?.student?.id ?? null,
          });
        }
      }
      console.log("Available slots:", results);
      console.log("RESULTS WITH NAMES", results);

      // setAvailableSlots(results);
      const sortedResults = results.sort((a, b) => {
        const dateA = new Date(getDateFromSlot(a.slot, a.week_offset));
        const dateB = new Date(getDateFromSlot(b.slot, b.week_offset));
        return dateA.getTime() - dateB.getTime();
      });

      setAvailableSlots(sortedResults);
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

  // let student cancel their app
  const handleCancel = async (appointmentId: number | undefined) => {
    if (!appointmentId) return;

    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", appointmentId);

    if (error) {
      console.error("Delete failed", error);
      toast.error("Failed to cancel appointment");
    } else {
      toast.success("Appointment canceled!");

      setAvailableSlots((prev) =>
        prev.map((s) =>
          s.id === appointmentId
            ? { ...s, studentId: null, studentName: null, id: undefined }
            : s
        )
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
              <strong>{slot.slot}</strong> (
              {getDateFromSlot(slot.slot, slot.week_offset)})
            </div>

            {slot.studentId ? (
              slot.studentId === studentId ? (
                <button
                  onClick={() => handleCancel(slot.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Cancel
                </button>
              ) : (
                <span className="text-yellow-600 text-sm">Booked</span>
              )
            ) : (
              <button
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                onClick={() => handleBook(slot.week_offset, slot.slot)}
              >
                Book
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
