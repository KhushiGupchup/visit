import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthContext } from "../context/AuthContext.jsx";
import Topbar from "./Topbar.jsx";

import SidebarEmployee from "../components/EmployeeSidebar";

import PasswordModal from "./PasswordModal.jsx";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const renderSidebar = () => {
    if (user?.role === "admin") return <SidebarEmployee />;
    if (user?.role === "employee") return <SidebarEmployee />;
    if (user?.role === "visitor") return <SidebarEmployee />;
     if (user?.role === "security") return <SidebarEmployee />;
    return null;
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Toaster position="top-right" />

      {/* Sidebar */}
      {renderSidebar()}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Topbar />

        <div className="flex justify-center items-center flex-1 p-8">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 text-center">My Profile</h1>

            <div className="space-y-4">
              <div>
                <label className="text-gray-500 text-sm">Username</label>
                <input
                  value={user.email.split("@")[0]}
                  readOnly
                  className="w-full px-4 py-2 mt-1 border rounded-lg bg-gray-100"
                />
              </div>

              <div>
                <label className="text-gray-500 text-sm">Email</label>
                <input
                  value={user.email}
                  readOnly
                  className="w-full px-4 py-2 mt-1 border rounded-lg bg-gray-100"
                />
              </div>

              {user.role === "employee" && (
                <div>
                  <label className="text-gray-500 text-sm">Employee ID</label>
                  <input
                    value={user.empId}
                    readOnly
                    className="w-full px-4 py-2 mt-1 border rounded-lg bg-gray-100"
                  />
                </div>
              )}

              <div>
                <label className="text-gray-500 text-sm">Role</label>
                <input
                  value={user.role}
                  readOnly
                  className="w-full px-4 py-2 mt-1 border rounded-lg bg-gray-100"
                />
              </div>
            </div>

            {user.role === "employee" && (
              <button
                className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition mt-4"
                onClick={() => setModalOpen(true)}
              >
                Change Password
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {user.role === "employee" && (
        <PasswordModal
          user={user}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => navigate("/login")} // redirect after password change
        />
      )}
    </div>
  );
}
