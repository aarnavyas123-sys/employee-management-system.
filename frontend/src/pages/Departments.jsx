import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../services/api";
import { toast } from "react-toastify";

function Departments() {
  const [departmentName, setDepartmentName] = useState("");
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole || "");
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await API.get("/departments");
      setDepartments(res.data);
    } catch (error) {
      toast.error("Failed to Fetch Departments");
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      await API.post("/departments", {
        department_name: departmentName,
      });
      toast.success("Department Added Successfully ✅");
      setDepartmentName("");
      fetchDepartments();
    } catch {
      toast.error("Failed to Add Department ❌");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete Department?")) return;
    try {
      await API.delete(`/departments/${id}`);
      toast.success("Department Deleted Successfully ✅");
      fetchDepartments();
    } catch {
      toast.error("Cannot delete department. Employees may still be assigned.");
    }
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.department_name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <Topbar />

        {/* Header */}
        <div className="card p-4 shadow-sm mb-4">
          <h2 className="fw-bold">Department Management</h2>
          <p className="text-muted mb-0">
            Create and manage company departments.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card p-3 shadow-sm text-center">
              <h6>Total Departments</h6>
              <h2>{departments.length}</h2>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card p-3 shadow-sm text-center">
              <h6>Search Results</h6>
              <h2>{filteredDepartments.length}</h2>
            </div>
          </div>
        </div>

        {(role === "HR" || role === "Admin") && (
          <div className="card p-4 shadow-sm mb-4">
            <h4 className="mb-3">Add New Department</h4>
            <form onSubmit={handleAddDepartment}>
              <div className="row">
                <div className="col-md-9">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Department Name"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <button type="submit" className="btn btn-success w-100">
                    + Add Department
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Department List */}
        <div className="card p-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Department Directory</h4>
            <input
              type="text"
              className="form-control"
              style={{ width: "280px" }}
              placeholder="🔍 Search Department"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Department</th>
                  <th width="150">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredDepartments.length > 0 ? (
                  filteredDepartments.map((dept) => (
                    <tr key={dept.id}>
                      <td>#{dept.id}</td>
                      <td>
                        <span className="badge bg-primary fs-6">
                          {dept.department_name}
                        </span>
                      </td>
                      <td>
                        {role === "HR" || role === "Admin" ? (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(dept.id)}
                          >
                            🗑 Delete
                          </button>
                        ) : (
                          <span className="badge bg-secondary">View Only</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">
                      No Departments Found
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

// 📑 YAHAN PE PAHLE GALTI SE 'Dashboard' EXPORT HO RAHA THA, ISS KO 'Departments' KAR DIYA HAI
export default Departments;
