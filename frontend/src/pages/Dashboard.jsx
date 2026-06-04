import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatsCard from "../components/StatsCard";

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    totalSkills: 0,
    totalImages: 0,
  });

  const [recentEmployees, setRecentEmployees] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await API.get("/dashboard-stats");
      setStats(statsRes.data);

      const employeeRes = await API.get("/employees");
      setRecentEmployees(employeeRes.data.slice(0, 5));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="card p-4 mb-4 shadow-sm">
          <h2>Welcome, Aarna 👋</h2>
          <p className="text-muted">
            Manage employees, departments and skills from one dashboard.
          </p>
        </div>

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
              title="Total Images"
              value={stats.totalImages}
              color="bg-secondary"
            />
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-md-8">
            <div className="card p-3 shadow-sm">
              <h5>Recently Added Employees</h5>

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
                  {recentEmployees.length > 0 ? (
                    recentEmployees.map((emp) => (
                      <tr key={emp.id}>
                        <td>{emp.name}</td>
                        <td>{emp.department_name}</td>
                        <td>{emp.designation}</td>
                        <td>₹ {emp.salary}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No Employees Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-3 shadow-sm">
              <h5>Quick Actions</h5>

              <button
                className="btn btn-primary w-100 mb-2"
                onClick={() => navigate("/add-employee")}
              >
                Add Employee
              </button>

              <button
                className="btn btn-success w-100 mb-2"
                onClick={() => navigate("/departments")}
              >
                Create Department
              </button>

              <button
                className="btn btn-warning w-100"
                onClick={() => navigate("/skills")}
              >
                Add Skill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
