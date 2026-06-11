import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function Attendance() {
  const role = localStorage.getItem("role");
  const currentUserId = localStorage.getItem("id");

  const [todayStatus, setTodayStatus] = useState({
    clockedIn: false,
    clockedOut: false,
    attendance: null,
  });

  const [history, setHistory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [clockTime, setClockTime] = useState(new Date().toLocaleTimeString());
  const [stopwatch, setStopwatch] = useState("00:00:00");
  const [loading, setLoading] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    employee_id: "",
    status: "",
    date: "",
  });

  useEffect(() => {
    fetchTodayStatus();
    fetchHistory();
    if (role !== "Employee") {
      fetchEmployeesList();
    }
  }, [role]);

  // Real-time ticking clock & active shift stopwatch
  useEffect(() => {
    const timer = setInterval(() => {
      setClockTime(new Date().toLocaleTimeString());

      if (todayStatus.clockedIn && !todayStatus.clockedOut && todayStatus.attendance?.clock_in) {
        const start = new Date(todayStatus.attendance.clock_in).getTime();
        const diff = Date.now() - start;
        if (diff > 0) {
          const hours = Math.floor(diff / 3600000);
          const minutes = Math.floor((diff % 3600000) / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          
          const pad = (num) => String(num).padStart(2, "0");
          setStopwatch(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
        }
      } else {
        setStopwatch("00:00:00");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [todayStatus]);

  const fetchTodayStatus = async () => {
    try {
      const res = await API.get("/attendance/today");
      setTodayStatus(res.data);
    } catch (error) {
      console.error("Error loading today's punch status:", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const params = {};
      if (role !== "Employee") {
        if (filters.employee_id) params.employee_id = filters.employee_id;
      }
      if (filters.status) params.status = filters.status;
      if (filters.date) params.date = filters.date;

      const res = await API.get("/attendance/history", { params });
      setHistory(res.data);
    } catch (error) {
      toast.error("Failed to load historical punch records");
    }
  };

  const fetchEmployeesList = async () => {
    try {
      const res = await API.get("/employees");
      // Since API returns { employees: [...] }
      setEmployees(res.data.employees || []);
    } catch (error) {
      console.error("Error loading employee directory lists:", error);
    }
  };

  const handleClockIn = async () => {
    setLoading(true);
    try {
      const res = await API.post("/attendance/clock-in");
      toast.success(res.data.message || "Clocked in successfully ✅");
      fetchTodayStatus();
      fetchHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to clock in");
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    const confirmPunch = window.confirm("Are you sure you want to clock out for today?");
    if (!confirmPunch) return;

    setLoading(true);
    try {
      const res = await API.post("/attendance/clock-out");
      toast.success(res.data.message || "Clocked out successfully ✅");
      fetchTodayStatus();
      fetchHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to clock out");
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      employee_id: "",
      status: "",
      date: "",
    });
  };

  // Trigger search on filter adjustments
  useEffect(() => {
    fetchHistory();
  }, [filters]);

  const formatTime = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <Topbar />

        {/* Real-time Punch Control Center */}
        <div className="card p-4 shadow-sm mb-4 bg-light border-0">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              <h2 className="fw-bold mb-1">Time Tracking Center</h2>
              <p className="text-muted mb-0">Record daily shifts and track working schedules</p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <h3 className="fw-bold text-primary mb-1">{clockTime}</h3>
              <p className="small text-muted mb-0">Local Current Time</p>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          {/* Action Card Panel */}
          <div className="col-lg-5">
            <div className="card shadow-sm p-4 h-100 text-center d-flex flex-column justify-content-between">
              <div>
                <h5 className="fw-bold mb-3 text-secondary">Punch Workspace</h5>
                
                {/* Active States badge */}
                {!todayStatus.clockedIn ? (
                  <span className="badge bg-secondary p-2 mb-4">Not Clocked In Today</span>
                ) : !todayStatus.clockedOut ? (
                  <span className="badge bg-success p-2 mb-4">Shift Active</span>
                ) : (
                  <span className="badge bg-danger p-2 mb-4">Shift Completed</span>
                )}

                {/* Digital stopwatch for elapsed shift time */}
                {todayStatus.clockedIn && !todayStatus.clockedOut && (
                  <div className="my-4">
                    <span className="text-muted d-block small">SHIFT ELAPSED TIMER</span>
                    <h2 className="font-monospace fw-bold text-success display-6">{stopwatch}</h2>
                  </div>
                )}
              </div>

              <div className="d-grid gap-3 mt-4">
                <button
                  className="btn btn-primary btn-lg py-3"
                  onClick={handleClockIn}
                  disabled={todayStatus.clockedIn || loading}
                >
                  ⏱️ Clock In
                </button>
                <button
                  className="btn btn-warning btn-lg py-3"
                  onClick={handleClockOut}
                  disabled={!todayStatus.clockedIn || todayStatus.clockedOut || loading}
                >
                  🚪 Clock Out
                </button>
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="col-lg-7">
            <div className="card shadow-sm p-4 h-100">
              <h5 className="fw-bold mb-4 text-secondary">Punch Specifications & Shift Guidelines</h5>
              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="p-3 border rounded">
                    <h6 className="text-primary mb-2">Shift Start Bound</h6>
                    <p className="mb-0"><strong>09:00 AM</strong></p>
                    <small className="text-muted">Punches after 09:00 AM mark automatically as 'Late'</small>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="p-3 border rounded">
                    <h6 className="text-success mb-2">Minimum Threshold</h6>
                    <p className="mb-0"><strong>8.00 Hours</strong></p>
                    <small className="text-muted">Required shift hours for complete daily status</small>
                  </div>
                </div>
                <div className="col-sm-12">
                  <div className="p-3 bg-light rounded">
                    <h6 className="fw-bold">Security & Audit Compliance</h6>
                    <small className="text-muted d-block mb-1">
                      One punch lifecycle is mapped per employee per day. All changes and log actions write entries directly to the system audit compliance database.
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Query Filters Panel (Admins/Managers/HR Only) */}
        {role !== "Employee" && (
          <div className="card shadow-sm p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 text-secondary">Historical Query Filters</h5>
              <button className="btn btn-outline-secondary btn-sm" onClick={handleResetFilters}>
                Reset Filters
              </button>
            </div>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small text-muted">Employee Directory</label>
                <select
                  className="form-select"
                  value={filters.employee_id}
                  onChange={(e) => setFilters({ ...filters, employee_id: e.target.value })}
                >
                  <option value="">All Employees</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.user_id}>
                      {emp.name} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label small text-muted">Status</label>
                <select
                  className="form-select"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label small text-muted">Punch Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* History Log Table */}
        <div className="card shadow-sm p-4">
          <h5 className="fw-bold mb-4 text-secondary">Attendance Logs Registry</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  {role !== "Employee" && <th>Employee Name</th>}
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Status</th>
                  <th>Shift Hours</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((record) => (
                    <tr key={record.id}>
                      <td><strong>{formatDate(record.date)}</strong></td>
                      {role !== "Employee" && <td>{record.employee_name || "N/A"}</td>}
                      <td>{formatTime(record.clock_in)}</td>
                      <td>{formatTime(record.clock_out)}</td>
                      <td>
                        <span
                          className={`badge ${
                            record.status === "Present"
                              ? "bg-success"
                              : record.status === "Late"
                                ? "bg-warning text-dark"
                                : "bg-danger"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td>
                        <strong>{record.total_hours || "0.00"} Hrs</strong>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={role === "Employee" ? 5 : 6} className="text-center py-4 text-muted">
                      No attendance logs recorded matching your search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default Attendance;
