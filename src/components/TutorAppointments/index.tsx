"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { PostgrestError } from "@supabase/supabase-js";

import { getDateFromSlot, getSlotDate } from "@/lib/utils/dateUtils";

type Appointment = {
  week_offset: number;
  slot: string;
  student: {
    name: string;
    email: string;
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
        .select("week_offset, slot, student:users(name, email)")
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

  const handleCancel = async (slot: string, week_offset: number) => {
    if (!tutorId) return;

    const { error } = await supabase
      .from("appointments")
      .delete()
      .match({ tutor_id: tutorId, slot, week_offset });

    if (error) {
      console.error("Error canceling appointment:", error);
    } else {
      setAppointments((prev) =>
        prev.filter(
          (appt) => !(appt.slot === slot && appt.week_offset === week_offset)
        )
      );
    }
  };

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
              <div>
                <strong>{appt.slot}</strong> (
                {getDateFromSlot(appt.slot, appt.week_offset)}) <br />
                <div className="flex justify-between mt-3">
                  <span>
                    <strong>Student:</strong> {appt.student?.name ?? "Unknown"}
                  </span>
                  <span>
                    <strong>Email:</strong> {appt.student?.email ?? "unknownn"}
                  </span>
                </div>
              </div>
              {/* <button
                onClick={() => handleCancel(appt.slot, appt.week_offset)}
                className="text-red-600 hover:underline"
              >
                Cancel
              </button> */}
            </div>
          ))
      )}
    </div>
  );
}
