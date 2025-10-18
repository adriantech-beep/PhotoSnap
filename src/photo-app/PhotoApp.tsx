import { Link } from "react-router-dom";

export default function PhotoApp() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-pink-100">
      <h1 className="text-2xl font-bold text-pink-700 mb-4">
        🎀 Touchless Photo Booth MVP
      </h1>
      <p className="text-gray-700 mb-6">
        Simulated Scan-to-Pay system using QR codes.
      </p>
      <Link
        to="/booth"
        className="bg-pink-600 text-white px-6 py-3 rounded-full hover:bg-pink-700"
      >
        Open Booth Screen
      </Link>
    </div>
  );
}
