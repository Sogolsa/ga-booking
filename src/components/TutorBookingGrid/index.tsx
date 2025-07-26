"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { toast } from "sonner";
// import { PostgrestError } from "@supabase/supabase-js";
import { getDateFromSlot } from "@/lib/utils/dateUtils";
import { getSlotDate } from "@/lib/utils/dateUtils";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type Props = {
  tutorId: string;
};

type Slot = {
  id?: number;
  week_offset: number;
  slot: string;
  availabilityType: "remote" | "onsite";
  studentName?: string | null;
  studentId?: string | null;
};

type AppointmentWithStudent = {
  id: number;
  week_offset: number;
  slot: string;
  availabilityType: "remote" | "onsite";
  student: {
    id: string;
    name: string;
  } | null;
};
const supabase = createClient();

export default function TutorBookingGrid({ tutorId }: Props) {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) {
        setStudentId(data.user.id);
        setRole(data.user.user_metadata?.role ?? null);
      }
    });
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data: availability, error: availabilityError } = await supabase
        .from("availability")
        .select("week_offset, slots")
        .eq("user_id", tutorId);

      if (availabilityError) {
        console.error("Availability fetch error:", availabilityError);
        return;
      }

      const response = await supabase
        .from("appointments")
        .select("id, week_offset, slot, student:users(id, name)")
        .eq("tutor_id", tutorId);

      const appointments = response.data as AppointmentWithStudent[] | null;
      // const _appError: PostgrestError | null = response.error;

      // appointments?.forEach((a) =>
      //   console.log("Booked slot:", a.slot, "Student:", a.student?.name)
      // );

      // const booked = new Set(
      //   (appointments ?? []).map((a) => `${a.week_offset}-${a.slot}`)
      // );

      const results: Slot[] = [];

      for (const row of availability ?? []) {
        const slots =
          typeof row.slots === "string"
            ? JSON.parse(row.slots)
            : row.slots ?? {};
        const week_offset = row.week_offset;

        console.log("Parsed slots for week", week_offset, slots);

        for (const [time, availabilityType] of Object.entries(slots)) {
          if (availabilityType !== "remote" && availabilityType !== "onsite")
            continue;

          const appointment = appointments?.find(
            (a) => a.week_offset === week_offset && a.slot === time
          );

          results.push({
            id: appointment?.id,
            week_offset,
            slot: time,
            availabilityType,
            studentName: appointment?.student?.name ?? null,
            studentId: appointment?.student?.id ?? null,
          });
        }
      }

      const now = new Date();

      // only load appointments after now hour
      const sortedResults = results
        .slice()
        .filter((slot) => {
          const date = getSlotDate(slot.slot, slot.week_offset);
          return date > now;
        })
        .sort((a, b) => {
          const dateA = new Date(getDateFromSlot(a.slot, a.week_offset));
          const dateB = new Date(getDateFromSlot(b.slot, b.week_offset));
          return dateA.getTime() - dateB.getTime();
        });

      setAvailableSlots(sortedResults);
    };

    load();
  }, [tutorId]);

  const handleBook = async (week_offset: number, slot: string) => {
    if (!studentId || role === "tutor") {
      toast.error("Tutors cannot book appointments.");
      return;
    }

    const actualDate = getDateFromSlot(slot, week_offset);
    const selectedSlot = availableSlots.find(
      (s) => s.week_offset === week_offset && s.slot === slot
    );

    const { data, error } = await supabase
      .from("appointments")
      .insert({
        tutor_id: tutorId,
        student_id: studentId,
        week_offset,
        slot,
        appt_date: actualDate,
        availabilityType: selectedSlot?.availabilityType ?? "onsite",
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to book appointment");
    } else {
      toast.success("Appointment booked!");
      setAvailableSlots((prev) =>
        prev.map((s) =>
          s.week_offset === week_offset && s.slot === slot
            ? {
                ...s,
                id: data.id,
                studentId,
                studentName: "You",
              }
            : s
        )
      );
    }
  };

  // let student cancel their app
  /**************************************************************** */
  // canceling more than 24 hours in advance
  // const appointmentDate = getSlotDate(slot, week_offset);
  // const now = new Date();

  // const hoursDifference =
  //   (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  // if (hoursDifference < 24) {
  //   toast.error(
  //     "You can only cancel appointments more than 24 hours in advance."
  //   );
  //   return;
  // }
  /************************************************************************* */
  const handleCancel = async (
    appointmentId: number | undefined
    // slot: string,
    // week_offset: number
  ) => {
    if (!appointmentId) return;

    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", appointmentId);

    if (error) {
      console.error("Delete failed", error);
      toast.error("Failed to cancel appointment");
    } else {
      toast.success("Please notify your GA by sending an email.", {
        description: "Appointment canceled!",
        duration: 8000,
      });

      setAvailableSlots((prev) =>
        prev.map((s) =>
          s.id === appointmentId
            ? { ...s, studentId: null, studentName: null, id: undefined }
            : s
        )
      );
    }
  };

  /**
   * Filters and sorts available booking slots based on the selected date.
   *
   * - If a date is selected (`selectedDate`), it filters `availableSlots` to include only those
   *   whose slot date matches the selected date.
   * - The filtered slots are then sorted in ascending order by their slot time.
   * - If no date is selected, returns an empty array.
   *
   * @remarks
   * Relies on `getSlotDate` and `getDateFromSlot` utility functions to extract and compare slot dates and times.
   *
   * @returns {Array} An array of slots available on the selected date, sorted by time.
   */
  const filteredSlots = selectedDate
    ? availableSlots
        .filter((slot) => {
          const slotDate = getSlotDate(slot.slot, slot.week_offset);
          return slotDate.toDateString() === selectedDate.toDateString();
        })
        .sort((a, b) => {
          const timeA = new Date(getDateFromSlot(a.slot, a.week_offset));
          const timeB = new Date(getDateFromSlot(b.slot, b.week_offset));
          return timeA.getTime() - timeB.getTime();
        })
    : [];

  return (
    <div className="min-h-screen space-y-4 max-w-3xl mx-auto mt-8 px-4">
      <h2 className="text-xl font-bold mb-5 text-center">Select a Date</h2>
      <div className="flex justify-center">
        <Calendar
          onChange={(date) => setSelectedDate(date as Date)}
          value={selectedDate}
          tileClassName={({ date }) => {
            const isToday = new Date().toDateString() === date.toDateString();
            return isToday ? "react-calendar__tile--now" : "";
          }}
          className="react-calendar "
        />
      </div>

      {filteredSlots.length === 0 ? (
        <p className="text-center text-gray-500">
          {selectedDate
            ? "No available slots for this date."
            : "Please select a date."}
        </p>
      ) : (
        filteredSlots.map((slot, idx) => (
          <div
            key={idx}
            className="bg-white border rounded-lg shadow p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center"
          >
            <div className="mb-2 sm:mb-0">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-10">
                {slot.slot}
                <span className="text-sm font-medium">
                  {slot.availabilityType === "remote" && (
                    <span className="text-purple-600 text-sm">Remote</span>
                  )}
                  {slot.availabilityType === "onsite" && (
                    <span className="text-green-600 text-sm">Onsite</span>
                  )}
                </span>
              </h3>

              <p className="text-sm text-gray-600">
                {getDateFromSlot(slot.slot, slot.week_offset)}
              </p>
            </div>

            {slot.studentId ? (
              slot.studentId === studentId ? (
                <button
                  onClick={() => handleCancel(slot.id)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer"
                >
                  Cancel
                </button>
              ) : (
                <span className="text-red-600 text-sm font-medium">Booked</span>
              )
            ) : (
              <button
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orage-200 cursor-pointer"
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
