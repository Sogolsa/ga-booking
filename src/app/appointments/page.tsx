import TutorAppointments from "@/components/TutorAppointments";
import Navbar from "@/components/Navbar";

export default function AppointmentsPage() {
  return (
    <main>
      <Navbar />
      <div className="max-w-2xl mx-auto p-6 mt-10">
        <TutorAppointments />
      </div>
    </main>
  );
}
