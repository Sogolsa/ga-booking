import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-10 text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome to the GA Appointment System
        </h1>
        <p className="text-gray-600 text-lg">
          Schedule time with your Graduate Assistant or update your
          availability.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/login"
            className="bg-blue-600 text-white rounded-lg px-6 py-3 font-semibold hover:bg-blue-700 transition"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="bg-green-600 text-white rounded-lg px-6 py-3 font-semibold hover:bg-green-700 transition"
          >
            Sign Up
          </Link>
          <Link
            href="/account"
            className="bg-gray-100 text-gray-800 border border-gray-300 rounded-lg px-6 py-3 font-semibold hover:bg-gray-200 transition"
          >
            Go to Account
          </Link>
        </div>

        <footer className="text-sm text-gray-400 pt-4 border-t">
          Made with ❤️ using Next.js + Supabase
        </footer>
      </div>
    </div>
  );
}
