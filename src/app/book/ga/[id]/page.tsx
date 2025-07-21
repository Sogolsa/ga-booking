"use client";

import { useParams } from "next/navigation";
import TutorBookingGrid from "@/components/TutorBookingGrid";
import SignOutButton from "@/components/SignOutButton";

export default function BookWithGA() {
  const params = useParams();
  const tutorId = params?.id as string;

  return (
    <main className="p-6">
      <div className="flex justify-end mb-4">
        <SignOutButton />
      </div>

      <h1 className="flex justify-center text-2xl font-bold mb-4">
        Book an Appointment
      </h1>
      <TutorBookingGrid tutorId={tutorId} />
    </main>
  );
}
