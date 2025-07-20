import TutorAppointments from "@/components/TutorAppointments";

export default function AppointmentsPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Appointments</h1>
      <TutorAppointments />
    </div>
  );
}
