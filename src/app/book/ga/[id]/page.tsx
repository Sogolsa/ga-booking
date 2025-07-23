"use client";

import { useParams } from "next/navigation";
import TutorBookingGrid from "@/components/TutorBookingGrid";
import Navbar from "@/components/Navbar";

export default function BookWithGA() {
  const params = useParams();
  const tutorId = params?.id as string;

  return (
    <>
      <Navbar />
      <main className="p-6">
        <h1 className="flex justify-center text-2xl font-bold mb-4">
          Book an Appointment
        </h1>
        <TutorBookingGrid tutorId={tutorId} />
      </main>
    </>
  );
}
