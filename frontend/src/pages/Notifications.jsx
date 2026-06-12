import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data);
    } catch (error) {
      // Failed to load notifications silently or handle
    }
  };

  return (
    <div>
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <h2 className="mb-4">Notifications</h2>

        {notifications.map((item) => (
          <div key={item.id} className="card p-3 shadow-sm mb-3">
            <h5>{item.title}</h5>

            <p>{item.message}</p>

            <small>{new Date(item.created_at).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notifications;
