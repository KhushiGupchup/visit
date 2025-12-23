import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import api from "../utils/api.js";

export default function PasswordModal({ user, isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(user?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/send-otp", { email });
      toast.success(data.message);
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/verify-otp", { email, otp });
      toast.success(data.message);
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const payload = { email, newPassword, confirmPassword };
      if (user.role === "employee") payload.empId = user.empId;

      const { data } = await api.post("/employee/change-password", payload);
      toast.success(data.msg);

      setStep(1);
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
      onSuccess(); // redirect to login
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" containerStyle={{ zIndex: 9999 }} />

      {/* Overlay */}
      <div
        className="fixed inset-0  bg-black/30 z-40 w-[100vw] h-[100vh]"
        onClick={onClose}
      ></div>

      {/* Centered Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>

          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Password Management
          </h2>

          {/* Step Progress */}
          <div className="flex justify-between mb-6">
            <div className={`w-1/3 h-1 rounded-full ${step >= 1 ? "bg-teal-500" : "bg-gray-300"}`}></div>
            <div className={`w-1/3 h-1 rounded-full ${step >= 2 ? "bg-teal-500" : "bg-gray-300"}`}></div>
            <div className={`w-1/3 h-1 rounded-full ${step >= 3 ? "bg-teal-500" : "bg-gray-300"}`}></div>
          </div>

          {/* Step Forms */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
                required
              />
              <button
                type="submit"
                className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="OTP"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
                required
              />
              <button
                type="submit"
                className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
                required
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
                required
              />
              <button
                type="submit"
                className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition"
                disabled={loading}
              >
                {loading ? "Updating..." : "Change Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
