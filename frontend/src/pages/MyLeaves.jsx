import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../services/api";

function MyLeaves() {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await API.get("/leaves");

      const employeeName = localStorage.getItem("name");

      const myLeaves = res.data.filter((leave) => leave.name === employeeName);

      setLeaves(myLeaves);
    } catch (error) {
      // Failed to load leaves silently or handle
    }
  };

  return (
    <>
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="card p-4 shadow-sm">
          <h2 className="mb-4">My Leave Status</h2>

          <table className="table table-hover">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id}>
                  <td>{leave.leave_name}</td>
                  <td>{leave.from_date?.slice(0, 10)}</td>
                  <td>{leave.to_date?.slice(0, 10)}</td>
                  <td>{leave.total_days}</td>

                  <td>
                    <span
                      className={`badge ${
                        leave.status === "HR Approved"
                          ? "bg-success"
                          : leave.status.includes("Rejected")
                            ? "bg-danger"
                            : "bg-warning"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default MyLeaves;
