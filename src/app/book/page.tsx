"use client";
import BookingChoice from "@/components/BookingChoice";
import SignOutButton from "@/components/SignOutButton";

export default function BookingPage() {
  return (
    <main className="p-6">
      <div className="flex justify-end mb-4">
        <SignOutButton />
      </div>
      <BookingChoice />
    </main>
  );
}
