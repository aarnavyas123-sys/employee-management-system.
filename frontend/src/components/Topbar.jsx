import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaSearch } from "react-icons/fa";
import API from "../services/api"; // Axios connection mapping module imports

function Topbar() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("name") || "User";
  const userRole = localStorage.getItem("role") || "Employee";

  // Dynamic live notification parameters tracking states
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotificationCount();

    // Polling interval cycle definition: Sync alerts count every 30 seconds automatically
    const alertSyncInterval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(alertSyncInterval);
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const res = await API.get("/notifications");
      // Calculate exactly how many entries have 'is_read === false' inside state matrix
      const unreadAlerts = res.data.filter(
        (item) => item.is_read === false || item.is_read === 0,
      );
      setUnreadCount(unreadAlerts.length);
    } catch (error) {
      console.error(
        "Failed to dynamically resolve live notifications count stream context",
        error,
      );
    }
  };

  const handleNotificationClick = async () => {
    try {
      if (unreadCount > 0) {
        // Clear counts via bulk mutation API update query call execution pass
        await API.put("/notifications/mark-read");
        setUnreadCount(0);
      }
      // Route user straight onto their alerts center ledger timeline details page views
      navigate("/notifications");
    } catch (error) {
      console.error(
        "Failed to commit notification status mutations transaction flags",
        error,
      );
    }
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h4 className="mb-0">Welcome Back, {userName} 👋 </h4>
        <small className="text-muted">{today}</small>
      </div>

      <div className="topbar-right">
        <div className="search-box">
          <FaSearch />
          <input type="text" placeholder="Search employees..." />
        </div>

        {/* 🛠️ LIVE DYNAMIC NOTIFICATION DISPATCHER COMPONENT LAYER */}
        <div
          className="notification-wrapper"
          onClick={handleNotificationClick}
          style={{ cursor: "pointer", position: "relative" }}
          title="View Notifications"
        >
          <FaBell className="notification-icon" />

          {/* Badge renders contextually only if unread rows quantity is higher than zero bounds */}
          {unreadCount > 0 && (
            <span className="notification-badge bg-danger text-white position-absolute">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="user-box">
          <img
            src={`https://ui-avatars.com/api/?name=${userName}&background=1677ff&color=fff`}
            alt="User Identity Snapshot Graphic"
          />
          <div>
            <h6>{userName}</h6>
            <small>{userRole}</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Topbar;
