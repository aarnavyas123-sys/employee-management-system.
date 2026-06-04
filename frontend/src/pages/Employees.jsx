import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await API.get("/employees");
      setEmployees(res.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to Fetch Employees");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?",
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/employees/${id}`);

      toast.success("Employee Deleted Successfully ✅");

      fetchEmployees();
    } catch (error) {
      console.log(error);
      toast.error("Failed to Delete Employee");
    }
  };

  return (
    <>
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="card p-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>Employee Management</h2>

            <Link to="/add-employee" className="btn btn-primary">
              Add Employee
            </Link>
          </div>

          <input
            type="text"
            className="form-control mb-3"
            placeholder="🔍 Search Employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Salary</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {employees
                .filter((emp) =>
                  emp.name?.toLowerCase().includes(search.toLowerCase()),
                )
                .map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.id}</td>
                    <td>{emp.name}</td>
                    <td>{emp.department_name}</td>
                    <td>{emp.designation}</td>
                    <td>₹ {emp.salary}</td>

                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(emp.id)}
                      >
                        Delete
                      </button>
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

export default Employees;
