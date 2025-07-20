"use client";

import { useParams } from "next/navigation";
import TutorBookingGrid from "@/components/TutorBookingGrid";

export default function BookWithGA() {
  const params = useParams();
  const tutorId = params?.id as string;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Book an Appointment</h1>
      <TutorBookingGrid tutorId={tutorId} />
    </main>
  );
}
