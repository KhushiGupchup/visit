import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="flex justify-between items-center p-5 shadow bg-white">
        <h1 className="text-2xl font-bold text-blue-600">
          Visitor Pass System
        </h1>

        <div>
          <Link
            to="/login"
            className="px-4 py-2 mr-2 bg-blue-600 text-white rounded"
          >
            Login
          </Link>
          <Link
            to="/visitor-register"
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Visitor Register
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col justify-center items-center text-center">
        <h2 className="text-4xl font-bold mb-4">Welcome to Visitor Management</h2>
        <p className="text-gray-700 text-lg">
          Secure & Smart Visitor Management System
        </p>
      </main>
    </div>
  );
}
