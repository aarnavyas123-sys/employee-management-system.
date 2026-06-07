import { useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaTools,
  FaCalendarAlt,
  FaClipboardList,
  FaHistory,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const isActive = (path) => (location.pathname === path ? "active-menu" : "");

  return (
    <div className="sidebar">
      {/* Logo */}{" "}
      <div className="sidebar-logo">
        {" "}
        <h3>EMS</h3>
        ```
        <span>Employee Management System</span>
        <div className="role-badge mt-3">{role}</div>
      </div>
      {/* User */}
      <div className="sidebar-user">
        <img
          src={`https://ui-avatars.com/api/?name=${name}&background=1677ff&color=fff`}
          alt="User"
        />

        <div>
          <h6>{name}</h6>
          <small>{role}</small>
        </div>
      </div>
      <ul className="sidebar-menu">
        {/* Dashboard */}
        <li
          className={isActive("/dashboard")}
          onClick={() => navigate("/dashboard")}
        >
          <FaTachometerAlt />
          Dashboard
        </li>

        {/* HR */}
        {role === "HR" && (
          <>
            <li
              className={isActive("/employees")}
              onClick={() => navigate("/employees")}
            >
              <FaUsers />
              Employees
            </li>

            <li
              className={isActive("/departments")}
              onClick={() => navigate("/departments")}
            >
              <FaBuilding />
              Departments
            </li>

            <li
              className={isActive("/skills")}
              onClick={() => navigate("/skills")}
            >
              <FaTools />
              Skills
            </li>

            <li
              className={isActive("/leave-requests")}
              onClick={() => navigate("/leave-requests")}
            >
              <FaClipboardList />
              Leave Requests
            </li>

            <li
              className={isActive("/approval-history")}
              onClick={() => navigate("/approval-history")}
            >
              <FaHistory />
              Approval History
            </li>
          </>
        )}

        {/* Manager */}
        {role === "Manager" && (
          <>
            <li
              className={isActive("/employees")}
              onClick={() => navigate("/employees")}
            >
              <FaUsers />
              Employees
            </li>

            <li
              className={isActive("/leave-requests")}
              onClick={() => navigate("/leave-requests")}
            >
              <FaClipboardList />
              Leave Requests
            </li>

            <li
              className={isActive("/approval-history")}
              onClick={() => navigate("/approval-history")}
            >
              <FaHistory />
              Approval History
            </li>
          </>
        )}

        {/* Employee */}
        {role === "Employee" && (
          <>
            <li
              className={isActive("/profile")}
              onClick={() => navigate("/profile")}
            >
              <FaUser />
              My Profile
            </li>

            <li
              className={isActive("/leave-application")}
              onClick={() => navigate("/leave-application")}
            >
              <FaCalendarAlt />
              Apply Leave
            </li>
          </>
        )}

        {/* Logout */}
        <li className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt />
          Logout
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
