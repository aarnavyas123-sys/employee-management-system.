import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await API.get("/employees");

      setEmployees(res.data.employees);
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
      toast.error("Failed to Delete Employee");
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      {" "}
      <Sidebar />
      <div className="main-content">
        <Topbar />

        {/* Header */}
        <div className="card p-4 shadow-sm mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1">Employee Management</h2>
              <p className="text-muted mb-0">
                Manage all employees, departments and records
              </p>
            </div>

            {role === "HR" && (
              <Link to="/add-employee" className="btn btn-primary">
                + Add Employee
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card p-3 shadow-sm text-center">
              <h6>Total Employees</h6>
              <h2>{employees.length}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-3 shadow-sm text-center">
              <h6>Departments</h6>
              <h2>
                {[...new Set(employees.map((e) => e.department_name))].length}
              </h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-3 shadow-sm text-center">
              <h6>Search Results</h6>
              <h2>{filteredEmployees.length}</h2>
            </div>
          </div>
        </div>

        {/* Employee Table */}
        <div className="card p-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Employee Directory</h4>

            <input
              type="text"
              className="form-control"
              style={{ width: "300px" }}
              placeholder="🔍 Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-responsive">
            <table className="table align-middle table-hover">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Salary</th>
                  <th width="250">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id}>
                      <td>#{emp.id}</td>

                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={`https://ui-avatars.com/api/?name=${emp.name}&background=1677ff&color=fff`}
                            alt={emp.name}
                            width="40"
                            height="40"
                            className="rounded-circle"
                          />
                          <strong>{emp.name}</strong>
                        </div>
                      </td>

                      <td>
                        <span className="badge bg-info">
                          {emp.department_name}
                        </span>
                      </td>

                      <td>{emp.designation}</td>

                      <td>
                        <strong>₹ {emp.salary}</strong>
                      </td>

                      <td>
                        <Link
                          to={`/employee-details/${emp.id}`}
                          className="btn btn-info btn-sm me-2"
                        >
                          👁 View
                        </Link>

                        {role === "HR" && (
                          <>
                            <Link
                              to={`/edit-employee/${emp.id}`}
                              className="btn btn-warning btn-sm me-2"
                            >
                              ✏ Edit
                            </Link>

                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(emp.id)}
                            >
                              🗑 Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No Employees Found
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

export default Employees;
