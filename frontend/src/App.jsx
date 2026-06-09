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

import ProtectedRoute from "./components/ProtectedRoute";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["HR", "Manager", "Employee"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Employee Management */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={["HR", "Manager"]}>
              <Employees />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-employee"
          element={
            <ProtectedRoute allowedRoles={["HR"]}>
              <AddEmployee />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-employee/:id"
          element={
            <ProtectedRoute allowedRoles={["HR"]}>
              <EditEmployee />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee-details/:id"
          element={
            <ProtectedRoute allowedRoles={["HR", "Manager"]}>
              <EmployeeDetails />
            </ProtectedRoute>
          }
        />

        {/* Departments */}
        <Route
          path="/departments"
          element={
            <ProtectedRoute allowedRoles={["HR"]}>
              <Departments />
            </ProtectedRoute>
          }
        />

        {/* Skills */}
        <Route
          path="/skills"
          element={
            <ProtectedRoute allowedRoles={["HR"]}>
              <Skills />
            </ProtectedRoute>
          }
        />

        {/* Leave Management */}
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

        {/* Employee Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["Employee"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Notifications */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={["HR", "Manager", "Employee"]}>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Assets - HR Only */}
        <Route
          path="/assets"
          element={
            <ProtectedRoute allowedRoles={["HR"]}>
              <Assets />
            </ProtectedRoute>
          }
        />

        {/* Reports - HR Only */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["HR"]}>
              <Reports />
            </ProtectedRoute>
          }
        />
      </Routes>

      <ToastContainer position="top-right" autoClose={2000} />
    </BrowserRouter>
  );
}

export default App;
