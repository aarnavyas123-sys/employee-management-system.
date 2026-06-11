import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function Users() {
  const [users, setUsers] = useState([]);

  const currentUserId = localStorage.getItem("id");

  useEffect(() => {
    fetchUsers();
  }, []);

  // Jahaan data load karte hain:
  const fetchUsers = async () => {
    try {
      const res = await API.get("/auth/users"); // 📑 Added /auth prefix explicitly
      setUsers(res.data);
    } catch (error) {
      toast.error("Failed to fetch enterprise directory profiles");
    }
  };

  // Jahaan user create hota hai:
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/create-user", formData); // 📑 Added /auth prefix explicitly
      toast.success("Identity Profile Account Created Successfully ✅");
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "Employee",
        status: "Active",
      });
      fetchUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to finalize account parameters",
      );
    }
  };

  // 🛠️ ROLE UPDATE HANDLER (Fix applied)
  // 1. handleRoleChange function ko change karo:
  const handleRoleChange = async (id, targetRole) => {
    try {
      // 🚀 RESTRICTION REMOVED: Ab koi self-blocking error/alert nahi aayega
      await API.put(`/auth/users/${id}/role`, { role: targetRole });
      toast.success("Operational user authorization role adjusted ✅");
      fetchUsers(); // Table reload trigger
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update user role",
      );
    }
  };


  // STATUS UPDATE HANDLER
  const handleStatusChange = async (id, targetStatus) => {
    try {
      await API.put(`/auth/users/${id}/status`, { status: targetStatus }); // 📑 Added /auth prefix explicitly
      toast.success(
        `User access matrix updated to ${targetStatus} successfully 🎉`,
      );
      fetchUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to transform account status",
      );
    }
  };

  return (
    <>
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="card shadow-sm p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>User Management</h2>
              <p className="text-muted">
                Admin can assign roles and manage system users
              </p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>Assign Role</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>

                    <td>{user.name}</td>

                    <td>{user.email}</td>

                    <td>
                      <span
                        className={`badge ${
                          user.role === "Admin"
                            ? "bg-danger"
                            : user.role === "HR"
                              ? "bg-success"
                              : user.role === "Manager"
                                ? "bg-warning text-dark"
                                : "bg-primary"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <select
                        className="form-select"
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                      >
                        <option value="Employee">Employee</option>
                        <option value="HR">HR</option>
                        <option value="Manager">Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <h5>Role Permissions</h5>

            <ul>
              <li>
                <strong>Admin:</strong> User Management, Audit Logs, Reports,
                Employees, Departments, Assets
              </li>

              <li>
                <strong>HR:</strong> Employees, Departments, Skills, Leave
                Requests, Assets, Reports
              </li>

              <li>
                <strong>Manager:</strong> Employees, Leave Requests, Approval
                History
              </li>

              <li>
                <strong>Employee:</strong> Profile, Apply Leave, Notifications
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Users;
