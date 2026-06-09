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

  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    totalSkills: 0,
    totalAssets: 0,
    allocatedAssets: 0,
    availableAssets: 0,
  });

  const [recentEmployees, setRecentEmployees] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [leaveChartData, setLeaveChartData] = useState([]);
  const [assetChartData, setAssetChartData] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await API.get("/dashboard-stats");
      setStats(statsRes.data);

      const chartRes = await API.get("/dashboard-stats/department-chart");
      setChartData(chartRes.data);

      const leaveRes = await API.get("/dashboard-stats/leave-chart");
      setLeaveChartData(leaveRes.data);

      const employeeRes = await API.get("/employees");
      setRecentEmployees(employeeRes.data.slice(0, 5));

      const assetRes = await API.get("/dashboard-stats/asset-chart");

      setAssetChartData(assetRes.data);
    } catch (error) {
      console.log(error);
    }
  };

  const COLORS = ["#4e73df", "#1cc88a", "#f6c23e", "#e74a3b"];

  return (
    <div>
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="welcome-banner">
          <div>
            <h2>Welcome Back, {localStorage.getItem("name")} 👋</h2>

            <p>Employee Management System Dashboard</p>
          </div>

          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="profile"
            className="welcome-avatar"
          />
        </div>

        {/* EMPLOYEE DASHBOARD */}
        {role === "Employee" ? (
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
        ) : role === "Manager" ? (
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
                <StatsCard
                  title="Pending Tasks"
                  value="8"
                  color="bg-secondary"
                />
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
        ) : (
          <>
            {/* HR / ADMIN / MANAGER DASHBOARD */}

            <h3 className="mb-4">Dashboard Overview</h3>

            <div className="row g-3">
              <div className="col-md-3">
                <StatsCard
                  title="Total Employees"
                  value={stats.totalEmployees}
                  color="bg-primary"
                />
              </div>

              <div className="col-md-3">
                <StatsCard
                  title="Departments"
                  value={stats.totalDepartments}
                  color="bg-success"
                />
              </div>

              <div className="col-md-3">
                <StatsCard
                  title="Total Skills"
                  value={stats.totalSkills}
                  color="bg-warning"
                />
              </div>

              <div className="col-md-3">
                <StatsCard
                  title="Leave Requests"
                  value={leaveChartData.reduce(
                    (sum, item) => sum + Number(item.total),
                    0,
                  )}
                  color="bg-secondary"
                />
              </div>
              <div className="col-md-3">
                <StatsCard
                  title="Total Assets"
                  value={stats.totalAssets}
                  color="bg-info"
                />
              </div>

              <div className="col-md-3">
                <StatsCard
                  title="Allocated Assets"
                  value={stats.allocatedAssets}
                  color="bg-danger"
                />
              </div>

              <div className="col-md-3">
                <StatsCard
                  title="Available Assets"
                  value={stats.availableAssets}
                  color="bg-dark"
                />
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-md-8">
                <div className="card p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
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

              <div className="col-md-4">
                <div className="card p-3 shadow-sm">
                  <h5>Leave Status</h5>

                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={leaveChartData}
                        dataKey="total"
                        nameKey="status"
                        outerRadius={90}
                        label
                      >
                        {leaveChartData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="card p-3 shadow-sm mt-3">
                  <h5>Asset Status</h5>

                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={assetChartData}
                        dataKey="total"
                        nameKey="status"
                        outerRadius={90}
                        label
                      >
                        {assetChartData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-md-12">
                <div className="card p-3 shadow-sm">
                  <h5>Employees Per Department</h5>

                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="department_name" />
                      <YAxis />
                      <Tooltip />

                      <Bar dataKey="total" fill="#1677ff" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
