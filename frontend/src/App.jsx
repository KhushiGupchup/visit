import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import VisitorRegister from "./pages/VisitorRegister";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AddEmployee from "./pages/admin/AddEmployee";
import VisitorList from "./pages/admin/VisitorList";

import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import ScheduleVisitor from "./pages/employee/ScheduleVisitor";
import ChangePassword from "./pages/employee/ChangePassword";
import MyVisitors from "./pages/employee/MyVisitors";


import SecurityDashboard from "./pages/security/SecurityDashboard";
import ScanQR from "./pages/security/ScanQR";

import ProtectedRoute from "./utils/ProtectedRoute";
import EmployeeList from "./pages/admin/EmployeeList";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/visitor-register" element={<VisitorRegister />} />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowed={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/add-employee"
        element={
          <ProtectedRoute allowed={["admin"]}>
            <AddEmployee />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/visitors"
        element={
          <ProtectedRoute allowed={["admin"]}>
            <VisitorList />
          </ProtectedRoute>
        }
      />
      <Route path="/admin/employees"  element={
          <ProtectedRoute allowed={["admin"]}>
           <EmployeeList />
          </ProtectedRoute>
        }  />


      {/* Employee */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute allowed={["employee"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/schedule-visitor"
        element={
          <ProtectedRoute allowed={["employee"]}>
            <ScheduleVisitor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/change-password"
        element={
          <ProtectedRoute allowed={["employee"]}>
            <ChangePassword />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/my-visitors"
        element={
          <ProtectedRoute allowed={["employee"]}>
            <MyVisitors />
          </ProtectedRoute>
        }
      />

      {/* Security */}
      <Route
        path="/security/dashboard"
        element={
          <ProtectedRoute allowed={["security"]}>
            <SecurityDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/security/scan"
        element={
          <ProtectedRoute allowed={["security"]}>
            <ScanQR />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
