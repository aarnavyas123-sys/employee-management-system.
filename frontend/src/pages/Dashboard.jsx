import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatsCard from "../components/StatsCard";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const currentUserName = localStorage.getItem("name");

  // Core loading state
  const [isLoading, setIsLoading] = useState(true);

  // Basic stats tracking state (HR & Manager)
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    totalSkills: 0,
    totalAssets: 0,
    allocatedAssets: 0,
    availableAssets: 0,
  });

  // Admin exclusive states
  const [adminAnalytics, setAdminAnalytics] = useState({
    total_users: 0,
    active_users: 0,
    hr_count: 0,
    manager_count: 0,
    employee_count: 0,
  });

  // Shared stats
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [assetChartData, setAssetChartData] = useState([]);

  // Employee Specific States
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState({
    clockedIn: false,
    clockedOut: false,
    attendance: null,
  });
  const [myRecentLeaves, setMyRecentLeaves] = useState([]);
  const [isPunching, setIsPunching] = useState(false);
  const [stopwatch, setStopwatch] = useState("00:00:00");

  // Manager & HR Specific States
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [hrPendingLeaves, setHrPendingLeaves] = useState([]);
  const [todayAttendanceRollCall, setTodayAttendanceRollCall] = useState([]);

  // Admin Specific States
  const [systemUsers, setSystemUsers] = useState([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState([]);

  const COLORS = ["#4e73df", "#1cc88a", "#f6c23e", "#e74a3b"];

  // Fetch all dashboard data depending on User Role
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      if (role === "Employee") {
        // Fetch current employee profile
        const profileRes = await API.get(`/employees/profile/${encodeURIComponent(currentUserName)}`);
        setEmployeeProfile(profileRes.data);

        // Fetch today's attendance
        const attendanceRes = await API.get("/attendance/today");
        setTodayAttendance(attendanceRes.data);

        // Fetch user leaves
        const leavesRes = await API.get("/leaves");
        const myLeaves = leavesRes.data.filter((l) => l.name === currentUserName);
        setMyRecentLeaves(myLeaves.slice(0, 5));
      } 
      
      else if (role === "Manager") {
        // Fetch core dashboard metrics
        const statsRes = await API.get("/dashboard-stats");
        setStats(statsRes.data);

        const chartRes = await API.get("/dashboard-stats/department-chart");
        setChartData(chartRes.data);

        // Fetch manager-relevant leave queue
        const leavesRes = await API.get("/leaves");
        setPendingLeaves(leavesRes.data.filter((l) => l.status === "Pending"));

        // Fetch today's roll call attendance status
        const todayStr = new Date().toISOString().split("T")[0];
        const attendanceHistoryRes = await API.get("/attendance/history", {
          params: { date: todayStr },
        });
        setTodayAttendanceRollCall(attendanceHistoryRes.data);
      } 
      
      else if (role === "HR") {
        // Fetch logistics stats
        const statsRes = await API.get("/dashboard-stats");
        setStats(statsRes.data);

        const chartRes = await API.get("/dashboard-stats/department-chart");
        setChartData(chartRes.data);

        const assetRes = await API.get("/dashboard-stats/asset-chart");
        setAssetChartData(assetRes.data);

        // Fetch employees
        const employeeRes = await API.get("/employees");
        setRecentEmployees(employeeRes.data.employees || []);

        // Fetch leave requests for HR final approvals
        const leavesRes = await API.get("/leaves");
        setHrPendingLeaves(leavesRes.data.filter((l) => l.status === "Manager Approved"));

        // Fetch today's attendance roll call
        const todayStr = new Date().toISOString().split("T")[0];
        const attendanceHistoryRes = await API.get("/attendance/history", {
          params: { date: todayStr },
        });
        setTodayAttendanceRollCall(attendanceHistoryRes.data);
      } 
      
      else if (role === "Admin") {
        // Fetch Admin analytics
        const analyticsRes = await API.get("/auth/admin/analytics");
        setAdminAnalytics(analyticsRes.data);

        // Fetch recent employees
        const employeeRes = await API.get("/employees");
        setRecentEmployees((employeeRes.data.employees || []).slice(0, 5));

        // Fetch users to display warnings (Inactive, Suspended)
        const usersRes = await API.get("/auth/users");
        setSystemUsers(usersRes.data);

        // Fetch recent security audit logs
        const auditRes = await API.get("/audit-logs");
        setRecentAuditLogs(auditRes.data.slice(0, 5));
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [role]);

  // Real-time Stopwatch ticking timer for Employee
  useEffect(() => {
    let timer;
    if (
      role === "Employee" &&
      todayAttendance.clockedIn &&
      !todayAttendance.clockedOut &&
      todayAttendance.attendance?.clock_in
    ) {
      timer = setInterval(() => {
        const start = new Date(todayAttendance.attendance.clock_in).getTime();
        const diff = Date.now() - start;
        if (diff > 0) {
          const hours = Math.floor(diff / 3600000);
          const minutes = Math.floor((diff % 3600000) / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          const pad = (num) => String(num).padStart(2, "0");
          setStopwatch(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
        }
      }, 1000);
    } else {
      setStopwatch("00:00:00");
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [todayAttendance, role]);

  // Attendance Punch Workflows
  const handleClockIn = async () => {
    setIsPunching(true);
    try {
      const res = await API.post("/attendance/clock-in");
      toast.success(res.data.message || "Clocked In Successfully ✅");
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to clock in");
    } finally {
      setIsPunching(false);
    }
  };

  const handleClockOut = async () => {
    const confirmPunch = window.confirm("Are you sure you want to clock out for today?");
    if (!confirmPunch) return;

    setIsPunching(true);
    try {
      const res = await API.post("/attendance/clock-out");
      toast.success(res.data.message || "Clocked Out Successfully ✅");
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to clock out");
    } finally {
      setIsPunching(false);
    }
  };

  // Leave approval actions (Manager Level)
  const handleManagerLeaveAction = async (leaveId, action) => {
    try {
      if (action === "approve") {
        await API.put(`/leaves/approve/${leaveId}`);
        toast.success("Leave approved by Manager ✅");
      } else {
        await API.put(`/leaves/reject/${leaveId}`);
        toast.warn("Leave rejected by Manager ❌");
      }
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  // Leave approval actions (HR Level)
  const handleHRLeaveAction = async (leaveId, action) => {
    try {
      if (action === "approve") {
        await API.put(`/leaves/hr-approve/${leaveId}`);
        toast.success("Leave finalized and balance deducted! ✅");
      } else {
        await API.put(`/leaves/hr-reject/${leaveId}`);
        toast.warn("Leave rejected by HR ❌");
      }
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  // Render content conditionally depending on role
  const renderDashboardContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading Dashboard...</span>
          </div>
          <p className="mt-2 text-muted">Aggregating workspace analytics...</p>
        </div>
      );
    }

    // ==============================================================
    // 1. EMPLOYEE DASHBOARD INTERFACE VIEW
    // ==============================================================
    if (role === "Employee") {
      return (
        <>
          <h4 className="mb-4 text-dark fw-bold">Employee Workspace</h4>
          
          <div className="row g-4 mb-4">
            {/* Action Cards */}
            <div className="col-md-3">
              <div className="dashboard-card bg-primary">
                <h6>Daily Tasks</h6>
                <h1>8</h1>
                <p className="card-footer-text">Assigned Today</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="dashboard-card bg-success">
                <h6>Completed Tasks</h6>
                <h1>5</h1>
                <p className="card-footer-text">Finished Today</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="dashboard-card bg-warning">
                <h6>Pending Tasks</h6>
                <h1>3</h1>
                <p className="card-footer-text">Remaining</p>
              </div>
            </div>
            {/* Today's Shift Card */}
            <div className="col-md-3">
              <div className="card shadow-sm p-3 h-100 text-center d-flex flex-column justify-content-between border-0 bg-white">
                <div>
                  <h6 className="fw-bold mb-2 text-secondary text-uppercase small">Today's Shift</h6>
                  {!todayAttendance.clockedIn ? (
                    <span className="badge bg-secondary p-2">Not Clocked In</span>
                  ) : !todayAttendance.clockedOut ? (
                    <span className="badge bg-success p-2">Shift Active</span>
                  ) : (
                    <span className="badge bg-danger p-2">Shift Ended</span>
                  )}
                  {todayAttendance.clockedIn && !todayAttendance.clockedOut && (
                    <h4 className="font-monospace fw-bold text-success mt-2 mb-0">{stopwatch}</h4>
                  )}
                </div>
                <div className="mt-3 d-flex gap-2 justify-content-center">
                  <button
                    className="btn btn-primary btn-sm flex-fill fw-bold"
                    onClick={handleClockIn}
                    disabled={todayAttendance.clockedIn || isPunching}
                  >
                    Clock In
                  </button>
                  <button
                    className="btn btn-warning btn-sm flex-fill fw-bold text-dark"
                    onClick={handleClockOut}
                    disabled={!todayAttendance.clockedIn || todayAttendance.clockedOut || isPunching}
                  >
                    Clock Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            {/* Profile Snapshot */}
            <div className="col-md-4">
              <div className="card p-4 shadow-sm border-0 h-100 bg-white">
                <h5 className="fw-bold mb-3 text-secondary border-bottom pb-2">👤 Profile Snapshot</h5>
                {employeeProfile ? (
                  <div className="text-center">
                    <img
                      src={`https://ui-avatars.com/api/?name=${employeeProfile.name}&background=1677ff&color=fff&size=80`}
                      alt="Avatar"
                      className="rounded-circle mb-3 shadow"
                      width="80"
                      height="80"
                    />
                    <h5 className="fw-bold mb-1">{employeeProfile.name}</h5>
                    <p className="text-muted small mb-2">{employeeProfile.designation || "Employee"}</p>
                    <span className="badge bg-light text-primary border border-primary px-3 py-2 small mb-3">
                      {employeeProfile.department_name || "Department Not Set"}
                    </span>
                    <div className="text-start mt-3 border-top pt-3">
                      <p className="mb-2 small"><strong>Phone:</strong> {employeeProfile.phone || "Not Available"}</p>
                      <p className="mb-0 small"><strong>Location:</strong> {employeeProfile.address || "Not Available"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted mb-0 small">No employee profile matched.</p>
                    <button className="btn btn-outline-primary btn-sm mt-3" onClick={() => navigate("/profile")}>
                      View Profile Details
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="col-md-4">
              <div className="card p-4 shadow-sm border-0 h-100 bg-white">
                <h5 className="fw-bold mb-3 text-secondary border-bottom pb-2">⚡ Quick Shortcuts</h5>
                <div className="d-grid gap-3 pt-2">
                  <button className="btn btn-outline-primary text-start py-3 px-3 shadow-none border-dashed" onClick={() => navigate("/leave-application")}>
                    📅 Apply for Leave Requests
                  </button>
                  <button className="btn btn-outline-success text-start py-3 px-3 shadow-none border-dashed" onClick={() => navigate("/attendance")}>
                    ⏱️ Punch Cards & Work History
                  </button>
                  <button className="btn btn-outline-info text-start py-3 px-3 shadow-none border-dashed" onClick={() => navigate("/notifications")}>
                    🔔 Read System Notifications
                  </button>
                </div>
              </div>
            </div>

            {/* Leave History List */}
            <div className="col-md-4">
              <div className="card p-4 shadow-sm border-0 h-100 bg-white">
                <h5 className="fw-bold mb-3 text-secondary border-bottom pb-2">📅 Recent Leave Requests</h5>
                <div className="table-responsive">
                  <table className="table table-sm table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th className="small text-muted">Type</th>
                        <th className="small text-muted">Days</th>
                        <th className="small text-muted">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myRecentLeaves.length > 0 ? (
                        myRecentLeaves.map((l) => (
                          <tr key={l.id}>
                            <td className="small">{l.leave_name}</td>
                            <td className="small"><strong>{l.total_days}</strong></td>
                            <td>
                              <span className={`badge small ${
                                l.status === "HR Approved" ? "bg-success" : 
                                l.status === "Pending" ? "bg-warning text-dark" : "bg-danger"
                              }`}>
                                {l.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center py-4 text-muted small">
                            No leave applications submitted yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-md-8">
              <div className="card p-4 shadow-sm border-0 bg-white">
                <h5 className="fw-bold mb-4 text-secondary">Weekly Productivity</h5>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={[
                      { day: "Mon", tasks: 4 },
                      { day: "Tue", tasks: 6 },
                      { day: "Wed", tasks: 5 },
                      { day: "Thu", tasks: 7 },
                      { day: "Fri", tasks: 8 },
                    ]}
                  >
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="tasks" fill="#1677ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card p-4 shadow-sm border-0 bg-white">
                <h5 className="fw-bold mb-4 text-secondary">Task Distribution</h5>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Completed", value: 5 },
                        { name: "Pending", value: 3 },
                      ]}
                      dataKey="value"
                      outerRadius={75}
                      label
                    >
                      <Cell fill="#1cc88a" />
                      <Cell fill="#f6c23e" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      );
    }

    // ==============================================================
    // 2. MANAGER DASHBOARD INTERFACE VIEW
    // ==============================================================
    if (role === "Manager") {
      return (
        <>
          <h4 className="mb-4 text-dark fw-bold">Manager Workspace</h4>
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <StatsCard title="Monthly Target" value="85%" color="bg-primary" />
            </div>
            <div className="col-md-3">
              <StatsCard title="Team Members" value="12" color="bg-success" />
            </div>
            <div className="col-md-3">
              <StatsCard title="Completed Tasks" value="45" color="bg-warning" />
            </div>
            <div className="col-md-3">
              <StatsCard title="Pending Tasks" value="8" color="bg-secondary" />
            </div>
          </div>

          <div className="row g-4 mb-4">
            {/* Team Productivity Charts */}
            <div className="col-md-8">
              <div className="card p-4 shadow-sm border-0 h-100 bg-white">
                <h5 className="fw-bold mb-4 text-secondary">Team Productivity (Weekly)</h5>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={[
                      { day: "Mon", tasks: 15 },
                      { day: "Tue", tasks: 18 },
                      { day: "Wed", tasks: 20 },
                      { day: "Thu", tasks: 22 },
                      { day: "Fri", tasks: 25 },
                    ]}
                  >
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="tasks" fill="#1677ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card p-4 shadow-sm border-0 h-100 bg-white">
                <h5 className="fw-bold mb-4 text-secondary">Task Status Distribution</h5>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Completed", value: 60 },
                        { name: "In Progress", value: 25 },
                        { name: "Pending", value: 15 },
                      ]}
                      dataKey="value"
                      outerRadius={75}
                      label
                    >
                      <Cell fill="#1cc88a" />
                      <Cell fill="#1677ff" />
                      <Cell fill="#f6c23e" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Leave Approvals Action Center */}
            <div className="col-md-6">
              <div className="card p-4 shadow-sm border-0 h-100 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                  <h5 className="fw-bold mb-0 text-secondary">📅 Pending Team Leaves</h5>
                  <span className="badge bg-warning text-dark">{pendingLeaves.length} Requests</span>
                </div>
                <div className="table-responsive">
                  <table className="table table-sm table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Days</th>
                        <th>Type</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingLeaves.length > 0 ? (
                        pendingLeaves.slice(0, 5).map((leave) => (
                          <tr key={leave.id}>
                            <td>
                              <div className="fw-bold text-dark">{leave.name}</div>
                              <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: "150px" }}>
                                {leave.reason}
                              </small>
                            </td>
                            <td><strong>{leave.total_days}</strong></td>
                            <td>{leave.leave_name}</td>
                            <td className="text-end">
                              <button
                                className="btn btn-success btn-sm px-3 py-1 me-2"
                                onClick={() => handleManagerLeaveAction(leave.id, "approve")}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm px-2 py-1"
                                onClick={() => handleManagerLeaveAction(leave.id, "reject")}
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center py-4 text-muted small">
                            No pending leave requests found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Today's Attendance Roll Call */}
            <div className="col-md-6">
              <div className="card p-4 shadow-sm border-0 h-100 bg-white">
                <h5 className="fw-bold mb-3 text-secondary border-bottom pb-2">⏱️ Today's Shift Logs Roll Call</h5>
                <div className="table-responsive">
                  <table className="table table-sm table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Clock In</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayAttendanceRollCall.length > 0 ? (
                        todayAttendanceRollCall.slice(0, 5).map((log) => (
                          <tr key={log.id}>
                            <td>{log.employee_name}</td>
                            <td>{new Date(log.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                            <td>
                              <span className={`badge ${
                                log.status === "Present" ? "bg-success" : "bg-warning text-dark"
                              }`}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center py-4 text-muted small">
                            No employees clocked in today yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    // ==============================================================
    // 3. HR DASHBOARD INTERFACE VIEW
    // ==============================================================
    if (role === "HR") {
      return (
        <>
          <h4 className="mb-4 text-dark fw-bold">HR Workspace</h4>
          
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <StatsCard title="Total Employees" value={stats.totalEmployees} color="bg-primary" />
            </div>
            <div className="col-md-4">
              <StatsCard title="Departments" value={stats.totalDepartments} color="bg-success" />
            </div>
            <div className="col-md-4">
              <StatsCard title="Total Skills" value={stats.totalSkills} color="bg-warning text-dark" />
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <StatsCard title="Total Assets" value={stats.totalAssets} color="bg-info" />
            </div>
            <div className="col-md-4">
              <StatsCard title="Allocated Assets" value={stats.allocatedAssets} color="bg-danger" />
            </div>
            <div className="col-md-4">
              <StatsCard title="Available Assets" value={stats.availableAssets} color="bg-dark" />
            </div>
          </div>

          <div className="row g-4 mb-4">
            {/* Charts */}
            <div className="col-md-8">
              <div className="card p-4 shadow-sm border-0 h-100 bg-white">
                <h5 className="fw-bold mb-4 text-secondary">Employees Per Department</h5>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="department_name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#1677ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card p-4 shadow-sm border-0 h-100 bg-white">
                <h5 className="fw-bold mb-4 text-secondary">Asset Allocation status</h5>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={assetChartData}
                      dataKey="total"
                      nameKey="status"
                      outerRadius={75}
                      label
                    >
                      {assetChartData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Final HR approval leave workflow queue */}
            <div className="col-md-6">
              <div className="card p-4 shadow-sm border-0 h-100 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                  <h5 className="fw-bold mb-0 text-secondary">📅 HR Final Approvals (Leaves)</h5>
                  <span className="badge bg-primary">{hrPendingLeaves.length} Active</span>
                </div>
                <div className="table-responsive">
                  <table className="table table-sm table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Days</th>
                        <th>Type</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hrPendingLeaves.length > 0 ? (
                        hrPendingLeaves.slice(0, 5).map((leave) => (
                          <tr key={leave.id}>
                            <td>
                              <div className="fw-bold text-dark">{leave.name}</div>
                              <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: "150px" }}>
                                {leave.reason}
                              </small>
                            </td>
                            <td><strong>{leave.total_days}</strong></td>
                            <td>{leave.leave_name}</td>
                            <td className="text-end">
                              <button
                                className="btn btn-success btn-sm px-3 py-1 me-2"
                                onClick={() => handleHRLeaveAction(leave.id, "approve")}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm px-2 py-1"
                                onClick={() => handleHRLeaveAction(leave.id, "reject")}
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center py-4 text-muted small">
                            No Manager-approved leaves waiting final HR review.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Today's Attendance Roll Call */}
            <div className="col-md-6">
              <div className="card p-4 shadow-sm border-0 h-100 bg-white">
                <h5 className="fw-bold mb-3 text-secondary border-bottom pb-2">⏱️ Today's Shift Logs Roll Call</h5>
                <div className="table-responsive">
                  <table className="table table-sm table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Clock In</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayAttendanceRollCall.length > 0 ? (
                        todayAttendanceRollCall.slice(0, 5).map((log) => (
                          <tr key={log.id}>
                            <td>{log.employee_name}</td>
                            <td>{new Date(log.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                            <td>
                              <span className={`badge ${
                                log.status === "Present" ? "bg-success" : "bg-warning text-dark"
                              }`}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center py-4 text-muted small">
                            No employees clocked in today yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    // ==============================================================
    // 4. ADMIN DASHBOARD INTERFACE VIEW
    // ==============================================================
    if (role === "Admin") {
      return (
        <>
          <h4 className="mb-4 text-dark fw-bold">Admin Workspace</h4>
          
          <div className="row g-3 mb-4">
            <div className="col-md-4 col-lg-2">
              <StatsCard title="Total Users" value={adminAnalytics.total_users} color="bg-primary" />
            </div>
            <div className="col-md-4 col-lg-2">
              <StatsCard title="Active Users" value={adminAnalytics.active_users} color="bg-success" />
            </div>
            <div className="col-md-4 col-lg-2">
              <StatsCard title="HR Officers" value={adminAnalytics.hr_count} color="bg-warning text-dark" />
            </div>
            <div className="col-md-6 col-lg-3">
              <StatsCard title="Team Managers" value={adminAnalytics.manager_count} color="bg-info" />
            </div>
            <div className="col-md-6 col-lg-3">
              <StatsCard title="Staff Employees" value={adminAnalytics.employee_count} color="bg-dark" />
            </div>
          </div>

          <div className="row g-4 mb-4">
            {/* Quick Actions Shortcuts */}
            <div className="col-md-4">
              <div className="card p-4 shadow-sm border-0 h-100 bg-white">
                <h5 className="fw-bold mb-3 text-secondary border-bottom pb-2">🛠️ System Control Center</h5>
                <div className="d-grid gap-3 pt-2">
                  <button className="btn btn-outline-primary text-start py-3 px-3 shadow-none border-dashed" onClick={() => navigate("/users")}>
                    👤 User Roles & Account Statuses
                  </button>
                  <button className="btn btn-outline-secondary text-start py-3 px-3 shadow-none border-dashed" onClick={() => navigate("/audit-logs")}>
                    📋 System Security Audit Logs
                  </button>
                  <button className="btn btn-outline-dark text-start py-3 px-3 shadow-none border-dashed" onClick={() => navigate("/employees")}>
                    👥 Employee Directory Database
                  </button>
                </div>
              </div>
            </div>

            {/* Inactive & Suspended Users Widget */}
            <div className="col-md-4">
              <div className="card p-4 shadow-sm border-0 h-100 bg-white">
                <h5 className="fw-bold mb-3 text-secondary border-bottom pb-2">⚠️ Attention Needed</h5>
                <div className="table-responsive">
                  <table className="table table-sm table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {systemUsers.filter((u) => u.status !== "Active").length > 0 ? (
                        systemUsers
                          .filter((u) => u.status !== "Active")
                          .slice(0, 5)
                          .map((u) => (
                            <tr key={u.id}>
                              <td className="small fw-bold text-dark">{u.name}</td>
                              <td className="small">{u.role}</td>
                              <td>
                                <span className={`badge small ${u.status === "Suspended" ? "bg-danger" : "bg-secondary"}`}>
                                  {u.status}
                                </span>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center py-4 text-muted small">
                            All user profiles are Active!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent Employees Summary */}
            <div className="col-md-4">
              <div className="card p-4 shadow-sm border-0 h-100 bg-white">
                <h5 className="fw-bold mb-3 text-secondary border-bottom pb-2">👥 Recent Employees</h5>
                <div className="table-responsive">
                  <table className="table table-sm table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEmployees.length > 0 ? (
                        recentEmployees.slice(0, 5).map((emp) => (
                          <tr key={emp.id}>
                            <td className="small">{emp.name}</td>
                            <td className="small text-muted">{emp.department_name || "Not Allocated"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" className="text-center py-4 text-muted small">
                            No employee records created yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Logs activities */}
          <div className="row g-4">
            <div className="col-md-12">
              <div className="card p-4 shadow-sm border-0 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-secondary mb-0">📋 System Security Audit Log Trail</h5>
                  <button className="btn btn-primary btn-sm px-3" onClick={() => navigate("/audit-logs")}>
                    View All Logs
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 small">
                    <thead className="table-light">
                      <tr>
                        <th>Timestamp</th>
                        <th>User</th>
                        <th>Action</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAuditLogs.length > 0 ? (
                        recentAuditLogs.map((log) => (
                          <tr key={log.id}>
                            <td className="text-muted font-monospace">{new Date(log.created_at).toLocaleString()}</td>
                            <td><strong>{log.operator_name || "System Operations"}</strong></td>
                            <td>
                              <span className="badge bg-secondary">{log.action}</span>
                            </td>
                            <td className="text-dark">{log.details}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center py-4 text-muted">
                            No system operations logged.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div>
      <Sidebar />
      <div className="main-content">
        <Topbar />

        {/* Global Dynamic Banner Wrapper */}
        <div className="welcome-banner">
          <div>
            <h2>Welcome Back, {currentUserName} 👋</h2>
            <p className="mb-0">Employee Management System Dashboard</p>
          </div>
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="profile summary context snapshot graphic"
            className="welcome-avatar"
          />
        </div>

        {/* Safe Render Dispatcher Block */}
        {renderDashboardContent()}
      </div>
    </div>
  );
}

export default Dashboard;
