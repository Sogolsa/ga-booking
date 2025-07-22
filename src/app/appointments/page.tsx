import TutorAppointments from "@/components/TutorAppointments";

export default function AppointmentsPage() {
  return (
    <main>
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex justify-end ">
          <a
            href="/availability"
            className="px-4 py-2 mr-2  bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <button type="button" className="cursor-pointer">
              Availability
            </button>
          </a>
        </div>
        <TutorAppointments />
      </div>
    </main>
  );
}
