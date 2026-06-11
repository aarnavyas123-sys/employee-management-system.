import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatsCard from "../components/StatsCard";
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

  // Basic stats tracking state
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    totalSkills: 0,
    totalAssets: 0,
    allocatedAssets: 0,
    availableAssets: 0,
  });

  // 📑 Task 5: Admin Enterprise-Level Dashboard Analytics States
  const [adminAnalytics, setAdminAnalytics] = useState({
    total_users: 0,
    active_users: 0,
    hr_count: 0,
    manager_count: 0,
    employee_count: 0,
  });

  const [recentEmployees, setRecentEmployees] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [leaveChartData, setLeaveChartData] = useState([]);
  const [assetChartData, setAssetChartData] = useState([]);

  useEffect(() => {
    fetchData();
    if (role === "Admin") {
      fetchAdminAnalytics();
    }
  }, [role]);

  const fetchData = async () => {
    try {
      const statsRes = await API.get("/dashboard-stats");
      setStats(statsRes.data);

      const chartRes = await API.get("/dashboard-stats/department-chart");
      setChartData(chartRes.data);

      const leaveRes = await API.get("/dashboard-stats/leave-chart");
      setLeaveChartData(leaveRes.data);

      const employeeRes = await API.get("/employees");
      setRecentEmployees(employeeRes.data.employees.slice(0, 5));

      const assetRes = await API.get("/dashboard-stats/asset-chart");
      setAssetChartData(assetRes.data);
    } catch (error) {
      console.error("Dashboard core fetch error:", error);
    }
  };

  // 📑 Task 5: Fetch Admin-Exclusive Dynamic Aggregated Counts
  const fetchAdminAnalytics = async () => {
    try {
      const res = await API.get("/auth/admin/analytics");
      setAdminAnalytics(res.data);
    } catch (error) {
      console.error("Failed to load admin matrix aggregates:", error);
    }
  };

  const COLORS = ["#4e73df", "#1cc88a", "#f6c23e", "#e74a3b"];

  // ==============================================================
  // 🧭 CONDITIONAL RENDERING BRANCHES BY SECURITY ROLE
  // ==============================================================
  const renderDashboardContent = () => {
    // 1. EMPLOYEE DASHBOARD INTERFACE VIEW
    if (role === "Employee") {
      return (
        <>
          <h3 className="mb-4">Employee Dashboard</h3>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="dashboard-card bg-primary">
                <h6>Daily Tasks</h6>
                <h1>8</h1>
                <p className="card-footer-text">Assigned Today</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="dashboard-card bg-success">
                <h6>Completed Tasks</h6>
                <h1>5</h1>
                <p className="card-footer-text">Finished Today</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="dashboard-card bg-warning">
                <h6>Pending Tasks</h6>
                <h1>3</h1>
                <p className="card-footer-text">Remaining</p>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-7">
              <div className="card p-4 shadow-sm">
                <h5>Weekly Productivity</h5>
                <ResponsiveContainer width="100%" height={300}>
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
                    <Bar dataKey="tasks" fill="#1677ff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="col-md-5">
              <div className="card p-4 shadow-sm">
                <h5>Task Status</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Completed", value: 5 },
                        { name: "Pending", value: 3 },
                      ]}
                      dataKey="value"
                      outerRadius={90}
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

    // 2. MANAGER DASHBOARD INTERFACE VIEW
    if (role === "Manager") {
      return (
        <>
          <h3 className="mb-4">Manager Dashboard</h3>
          <div className="row g-3">
            <div className="col-md-3">
              <StatsCard
                title="Monthly Target"
                value="85%"
                color="bg-primary"
              />
            </div>
            <div className="col-md-3">
              <StatsCard title="Team Members" value="12" color="bg-success" />
            </div>
            <div className="col-md-3">
              <StatsCard
                title="Completed Tasks"
                value="45"
                color="bg-warning"
              />
            </div>
            <div className="col-md-3">
              <StatsCard title="Pending Tasks" value="8" color="bg-secondary" />
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-md-8">
              <div className="card p-3 shadow-sm">
                <h5>Team Productivity</h5>
                <ResponsiveContainer width="100%" height={300}>
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
                    <Bar dataKey="tasks" fill="#1677ff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card p-3 shadow-sm">
                <h5>Task Distribution</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Completed", value: 60 },
                        { name: "In Progress", value: 25 },
                        { name: "Pending", value: 15 },
                      ]}
                      dataKey="value"
                      outerRadius={90}
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

          <div className="card p-4 shadow-sm mt-4">
            <h5>Manager Actions</h5>
            <button
              className="btn btn-success me-2"
              onClick={() => navigate("/leave-requests")}
            >
              Approve Leaves
            </button>
            <button
              className="btn btn-primary me-2"
              onClick={() => navigate("/employees")}
            >
              View Team
            </button>
          </div>
        </>
      );
    }

    // 3. ADMIN DASHBOARD INTERFACE VIEW
    if (role === "Admin") {
      return (
        <>
          <h3 className="mb-4">Admin Dashboard</h3>
          <div className="row g-3 mb-4">
            <div className="col-md-4 col-lg-2">
              <StatsCard
                title="Total Users"
                value={adminAnalytics.total_users}
                color="bg-primary"
              />
            </div>
            <div className="col-md-4 col-lg-2">
              <StatsCard
                title="Active Users"
                value={adminAnalytics.active_users}
                color="bg-success"
              />
            </div>
            <div className="col-md-4 col-lg-2">
              <StatsCard
                title="HR Officers"
                value={adminAnalytics.hr_count}
                color="bg-warning text-dark"
              />
            </div>
            <div className="col-md-6 col-lg-3">
              <StatsCard
                title="Team Managers"
                value={adminAnalytics.manager_count}
                color="bg-info"
              />
            </div>
            <div className="col-md-6 col-lg-3">
              <StatsCard
                title="Staff Employees"
                value={adminAnalytics.employee_count}
                color="bg-dark"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              <div className="card p-3 shadow-sm mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Recent Employees</h5>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate("/employees")}
                  >
                    View All
                  </button>
                </div>
                <table className="table table-hover mt-3">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEmployees.map((emp) => (
                      <tr key={emp.id}>
                        <td>{emp.name}</td>
                        <td>{emp.department_name}</td>
                        <td>{emp.designation}</td>
                        <td>₹ {emp.salary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      );
    }

    // 4. HR DASHBOARD INTERFACE VIEW
    if (role === "HR") {
      return (
        <>
          <h3 className="mb-4">HR Dashboard</h3>
          
          {/* Logistics & Employee Infrastructure Metrics */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <StatsCard
                title="Total Employees"
                value={stats.totalEmployees}
                color="bg-primary"
              />
            </div>
            <div className="col-md-4">
              <StatsCard
                title="Departments"
                value={stats.totalDepartments}
                color="bg-success"
              />
            </div>
            <div className="col-md-4">
              <StatsCard
                title="Total Skills"
                value={stats.totalSkills}
                color="bg-warning text-dark"
              />
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <StatsCard
                title="Total Assets"
                value={stats.totalAssets}
                color="bg-info"
              />
            </div>
            <div className="col-md-4">
              <StatsCard
                title="Allocated Assets"
                value={stats.allocatedAssets}
                color="bg-danger"
              />
            </div>
            <div className="col-md-4">
              <StatsCard
                title="Available Assets"
                value={stats.availableAssets}
                color="bg-dark"
              />
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-md-8">
              <div className="card p-3 shadow-sm mb-4">
                <h5>Employees Per Department</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="department_name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#1677ff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card p-3 shadow-sm mb-4">
                <h5>Asset Status</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={assetChartData}
                      dataKey="total"
                      nameKey="status"
                      outerRadius={80}
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
        </>
      );
    }

    // Default Fallback
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
            <h2>Welcome Back, {localStorage.getItem("name")} 👋</h2>
            <p>Employee Management System Dashboard</p>
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
