import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Skills from "./pages/Skills";
import Departments from "./pages/Departments";
import AddEmployee from "./pages/AddEmployee";
import LeaveApplication from "./pages/LeaveApplication";
import LeaveRequests from "./pages/LeaveRequests";
import ApprovalHistory from "./pages/ApprovalHistory";
import EmployeeDetails from "./pages/EmployeeDetails";
import EditEmployee from "./pages/EditEmployee";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Assets from "./pages/Assets";
import Reports from "./pages/Reports";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuditLogs from "./pages/AuditLogs";
import Users from "./pages/Users";
import Attendance from "./pages/Attendance";
import MyLeaves from "./pages/MyLeaves";

import ProtectedRoute from "./components/ProtectedRoute";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================== 1. PUBLIC AUTH ROUTES ==================== */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ==================== 2. SHARED WORKSPACE CORE ==================== */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["Admin", "HR", "Manager", "Employee"]}
            >
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ==================== 3. EMPLOYEE DATA DIRECTORY ==================== */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR", "Manager"]}>
              <Employees />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-employee"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR"]}>
              <AddEmployee />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-employee/:id"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR"]}>
              <EditEmployee />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee-details/:id"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR", "Manager"]}>
              <EmployeeDetails />
            </ProtectedRoute>
          }
        />

        {/* ==================== 4. CORPORATE INFRASTRUCTURE ==================== */}
        <Route
          path="/departments"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR"]}>
              <Departments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/skills"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR"]}>
              <Skills />
            </ProtectedRoute>
          }
        />

        {/* ==================== 5. LEAVE WORKFLOWS MANAGEMENT ==================== */}
        <Route
          path="/leave-application"
          element={
            <ProtectedRoute allowedRoles={["Employee"]}>
              <LeaveApplication />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leave-requests"
          element={
            <ProtectedRoute allowedRoles={["HR", "Manager"]}>
              <LeaveRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/approval-history"
          element={
            <ProtectedRoute allowedRoles={["HR", "Manager"]}>
              <ApprovalHistory />
            </ProtectedRoute>
          }
        />

        {/* ==================== 6. SELF OPERATION SERVICES ==================== */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["Employee"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-leaves"
          element={
            <ProtectedRoute allowedRoles={["Employee"]}>
              <MyLeaves />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute
              allowedRoles={["Admin", "HR", "Manager", "Employee"]}
            >
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* ==================== 7. LOGISTICS, REPORTING & TRACKING ==================== */}
        <Route
          path="/assets"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR"]}>
              <Assets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR"]}>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* ==================== 8. HIGH-SECURITY ADMIN PANELS ==================== */}
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AuditLogs />
            </ProtectedRoute>
          }
        />

        {/* 🛡️ Strict Route Guardrail Set to Admin Exclusive Authorization View */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Users />
            </ProtectedRoute>
          }
        />

        {/* ==================== 9. WORKFORCE ATTENDANCE MODULE ==================== */}
        <Route
          path="/attendance"
          element={
            <ProtectedRoute
              allowedRoles={["Admin", "HR", "Manager", "Employee"]}
            >
              <Attendance />
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastContainer position="top-right" autoClose={2000} />
    </BrowserRouter>
  );
}

export default App;
