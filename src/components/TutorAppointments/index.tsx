"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { PostgrestError } from "@supabase/supabase-js";

type Appointment = {
  week_offset: number;
  slot: string;
  //   student_id: string;
  student: {
    name: string;
  } | null;
};

export default function TutorAppointments() {
  const supabase = createClient();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tutorId, setTutorId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) {
        setTutorId(data.user.id);
      }
    });
  }, []);

  useEffect(() => {
    if (!tutorId) return;

    const load = async () => {
      const response = await supabase
        .from("appointments")
        .select("week_offset, slot, student:users(name)")
        .eq("tutor_id", tutorId);

      const appointments = response.data as Appointment[] | null;
      const appError: PostgrestError | null = response.error;

      if (appError) {
        console.error("Failed to fetch appointments:", appError);
      } else {
        setAppointments(appointments ?? []);
      }
    };

    load();
  }, [tutorId]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Upcoming Appointments</h2>
      {appointments.length === 0 ? (
        <p>No appointments yet.</p>
      ) : (
        appointments
          .slice()
          .sort(
            (a, b) =>
              getSlotDate(a.slot, a.week_offset).getTime() -
              getSlotDate(b.slot, b.week_offset).getTime()
          )
          .map((appt, idx) => (
            <div key={idx} className="border p-3 rounded">
              <strong>{appt.slot}</strong> (
              {getDateFromSlot(appt.slot, appt.week_offset)}) <br />
              Student: {appt.student?.name ?? "Unknown"}
            </div>
          ))
      )}
    </div>
  );
}

// Reuse this from earlier
function getDateFromSlot(slotLabel: string, weekOffset: number): string {
  const dayName = slotLabel.split("-")[0];
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

function getSlotDate(slotLabel: string, weekOffset: number): Date {
  const dayName = slotLabel.split("-")[0];
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

  const slotDate = new Date(startOfWeek);
  slotDate.setDate(startOfWeek.getDate() + weekOffset * 7 + dayOffset);

  return slotDate;
}
