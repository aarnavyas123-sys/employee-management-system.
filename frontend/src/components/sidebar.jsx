import { useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <h3 className="mb-4">EMS</h3>

      <button
        className="btn btn-primary w-100 mb-2"
        onClick={() => navigate("/dashboard")}
      >
        Dashboard
      </button>

      <button
        className="btn btn-success w-100 mb-2"
        onClick={() => navigate("/employees")}
      >
        Employees
      </button>

      <button
        className="btn btn-warning w-100 mb-2"
        onClick={() => navigate("/departments")}
      >
        Departments
      </button>

      <button
        className="btn btn-info w-100 mb-2"
        onClick={() => navigate("/skills")}
      >
        Skills
      </button>

      <button
        className="btn btn-danger w-100 mt-4"
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/");
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
