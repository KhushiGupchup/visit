// LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import NavbarComponent from "./Navbar_new";

import {
  FaQrcode,
  FaUserCheck,
  FaBell,
  FaClipboardList,
  FaIdBadge,
  FaChartBar,
  FaFacebook,
  FaInstagram,
  FaTwitter,
} from "react-icons/fa";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col text-white relative overflow-hidden pt-16 bg-white">

      {/* Navbar */}
      <NavbarComponent />

      {/* HERO SECTION */}
      <section className="flex flex-col items-center text-center rounded-3xl m-6  px-4 sm:px-10 py-48 relative z-10 
        bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-xl rounded-b-[3rem]"
      >
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold max-w-3xl leading-tight drop-shadow-xl">
          Welcome to <span className="text-teal-300">Visio</span>
        </h2>

        <p className="text-lg sm:text-xl md:text-2xl mt-6 max-w-2xl leading-relaxed drop-shadow-md">
          Register your visit in just a few clicks and get your digital visitor pass. 
          Seamless, fast, and secure check-in awaits you!
        </p>

        {/* Call-to-action buttons */}
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/visitor-register"
            className="bg-white text-teal-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition transform hover:scale-105 font-semibold shadow-md"
          >
            Get Your Pass
          </Link>

          <Link
            to="/login"
            className="border border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-teal-600 transition transform hover:scale-105 font-semibold shadow-md"
          >
            Already Registered? Login
          </Link>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="relative z-10 bg-white text-gray-800 py-24 px-6 sm:px-20">
        <h2 className="text-4xl sm:text-5xl font-bold text-center mb-14 text-gray-900 drop-shadow-sm">
          Why Choose <span className="text-teal-600">Visio?</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

          {/* CARD 1 */}
          <div className="bg-white/70 backdrop-blur-xl border border-teal-200 shadow-lg rounded-3xl p-8 hover:shadow-2xl hover:scale-[1.03] transition duration-300">
            <FaQrcode className="text-teal-600 text-5xl mb-5" />
            <h3 className="text-2xl font-semibold mb-3">Smart QR Check-In</h3>
            <p className="text-gray-600 leading-relaxed">
             Quick, secure entry with QR codes.
            </p>
          </div>

          {/* CARD 2 */}
          <div className="bg-white/70 backdrop-blur-xl border border-teal-200 shadow-lg rounded-3xl p-8 hover:shadow-2xl hover:scale-[1.03] transition duration-300">
            <FaUserCheck className="text-teal-600 text-5xl mb-5" />
            <h3 className="text-2xl font-semibold mb-3">Quick Visitor Onboarding</h3>
            <p className="text-gray-600 leading-relaxed">
              Add visitors effortlessly with all necessary details.
            </p>
          </div>

          {/* CARD 3 */}
          <div className="bg-white/70 backdrop-blur-xl border border-teal-200 shadow-lg rounded-3xl p-8 hover:shadow-2xl hover:scale-[1.03] transition duration-300">
            <FaBell className="text-teal-600 text-5xl mb-5" />
            <h3 className="text-2xl font-semibold mb-3">Real-Time Alerts</h3>
            <p className="text-gray-600 leading-relaxed">
              Get instant notifications for approvals and check-ins on email.
            </p>
          </div>

          {/* CARD 4 */}
          <div className="bg-white/70 backdrop-blur-xl border border-teal-200 shadow-lg rounded-3xl p-8 hover:shadow-2xl hover:scale-[1.03] transition duration-300">
            <FaClipboardList className="text-teal-600 text-5xl mb-5" />
            <h3 className="text-2xl font-semibold mb-3">Appointment Management</h3>
            <p className="text-gray-600 leading-relaxed">
              Easily schedule, approve, and manage visitor appointments.
            </p>
          </div>

          {/* CARD 5 */}
          <div className="bg-white/70 backdrop-blur-xl border border-teal-200 shadow-lg rounded-3xl p-8 hover:shadow-2xl hover:scale-[1.03] transition duration-300">
            <FaIdBadge className="text-teal-600 text-5xl mb-5" />
            <h3 className="text-2xl font-semibold mb-3">Digital Visitor Pass</h3>
            <p className="text-gray-600 leading-relaxed">
              Receive a ready-to-use digital pass with a QR code.
            </p>
          </div>

          {/* CARD 6 */}
          <div className="bg-white/70 backdrop-blur-xl border border-teal-200 shadow-lg rounded-3xl p-8 hover:shadow-2xl hover:scale-[1.03] transition duration-300">
            <FaChartBar className="text-teal-600 text-5xl mb-5" />
            <h3 className="text-2xl font-semibold mb-3">Interactive Analytics</h3>
            <p className="text-gray-600 leading-relaxed">
              Keep track of visitor trends and insights with ease.
            </p>
          </div>

        </div>
      </section>

     {/* FOOTER */}
<footer className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-14 px-6 sm:px-20  m-4 mt-20 rounded-3xl shadow-inner">

  <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">

    {/* LEFT */}
    <div>
      <h3 className="text-3xl font-extrabold tracking-wide">Visio</h3>
      <p className="text-gray-100 mt-3 leading-relaxed">
        Modern visitor management made simple, fast, and secure.
      </p>
    </div>

    {/* MIDDLE */}
    <div>
      <h4 className="text-xl font-semibold mb-3">Quick Links</h4>
      <ul className="space-y-2 text-gray-100">
        <li><Link to="/visitor-register" className="hover:text-yellow-300 transition">Get Your Pass</Link></li>
        <li><Link to="/login" className="hover:text-yellow-300 transition">Login</Link></li>
        <li><Link to="/" className="hover:text-yellow-300 transition">Home</Link></li>
      </ul>
    </div>

    {/* RIGHT */}
    <div>
      <h4 className="text-xl font-semibold mb-3">Follow Us</h4>
      <div className="flex gap-6 text-3xl">
        <FaFacebook className="hover:text-yellow-300 transition cursor-pointer" />
        <FaInstagram className="hover:text-yellow-300 transition cursor-pointer" />
        <FaTwitter className="hover:text-yellow-300 transition cursor-pointer" />
      </div>
    </div>

  </div>

  <p className="text-center text-gray-100 mt-10 text-sm">
    © {new Date().getFullYear()} Visio. All Rights Reserved.
  </p>
</footer>

    </div>
  );
};

export default LandingPage;

