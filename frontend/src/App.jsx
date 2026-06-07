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
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EmployeeDetails from "./pages/EmployeeDetails";
import EditEmployee from "./pages/EditEmployee";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Employee Management */}
        {/* Employee Management */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={["HR", "Manager"]}>
              <Employees />
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path="/add-employee"
          element={
            <ProtectedRoute allowedRoles={["HR"]}>
              <AddEmployee />
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path="/edit-employee/:id"
          element={
            <ProtectedRoute allowedRoles={["HR"]}>
              <EditEmployee />
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path="/employee-details/:id"
          element={
            <ProtectedRoute allowedRoles={["HR", "Manager"]}>
              <EmployeeDetails />
            </ProtectedRoute>
          }
        />{" "}
        {/* Department & Skills */}
        <Route
          path="/departments"
          element={
            <ProtectedRoute allowedRoles={["HR"]}>
              <Departments />
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path="/skills"
          element={
            <ProtectedRoute allowedRoles={["HR"]}>
              <Skills />
            </ProtectedRoute>
          }
        />{" "}
        {/* Leave Management */}
        <Route path="/leave-application" element={<LeaveApplication />} />
        <Route
          path="/leave-requests"
          element={
            <ProtectedRoute allowedRoles={["HR", "Manager"]}>
              <LeaveRequests />
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path="/approval-history"
          element={
            <ProtectedRoute allowedRoles={["HR", "Manager"]}>
              <ApprovalHistory />
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["Employee"]}>
              <Profile />
            </ProtectedRoute>
          }
        />{" "}
      </Routes>

      <ToastContainer position="top-right" autoClose={2000} />
    </BrowserRouter>
  );
}

export default App;
