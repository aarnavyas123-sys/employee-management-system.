import { FaBell, FaSearch } from "react-icons/fa";

function Topbar() {
  const userName = localStorage.getItem("name");
  const userRole = localStorage.getItem("role");

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="topbar">
      {" "}
      <div className="topbar-left">
        {" "}
        <h4 className="mb-0">Welcome Back, {userName} 👋 </h4>
        ```
        <small className="text-muted">{today}</small>
      </div>
      <div className="topbar-right">
        <div className="search-box">
          <FaSearch />
          <input type="text" placeholder="Search employees..." />
        </div>

        <div className="notification-wrapper">
          <FaBell className="notification-icon" />

          <span className="notification-badge">3</span>
        </div>

        <div className="user-box">
          <img
            src={`https://ui-avatars.com/api/?name=${userName}&background=1677ff&color=fff`}
            alt="User"
          />

          <div>
            <h6>{userName || "User"}</h6>

            <small>{userRole || "Employee"}</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Topbar;
