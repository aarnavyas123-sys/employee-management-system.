import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../services/api";
import { toast } from "react-toastify";

function Departments() {
  const [departmentName, setDepartmentName] = useState("");
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await API.get("/departments");
      setDepartments(res.data);
    } catch (error) {
      console.log(error);
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
    } catch (error) {
      toast.error("Failed to Add Department ❌");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete Department?")) return;

    try {
      await API.delete(`/departments/${id}`);

      toast.success("Department Deleted Successfully ✅");

      fetchDepartments();
    } catch (error) {
      console.log(error);

      toast.error("Cannot delete department. Employees may still be assigned.");
    }
  };

  return (
    <>
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="card p-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>Department Management</h3>

            <span className="badge bg-primary fs-6">
              Total Departments: {departments.length}
            </span>
          </div>

          <form onSubmit={handleAddDepartment}>
            <input
              className="form-control mb-3"
              placeholder="Enter Department Name"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              required
            />

            <button type="submit" className="btn btn-success mb-4">
              Add Department
            </button>
          </form>

          <h4 className="mb-3">Department List</h4>

          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Department Name</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <tr key={dept.id}>
                    <td>{dept.id}</td>
                    <td>{dept.department_name}</td>

                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(dept.id)}
                      >
                        Delete
                      </button>
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
    </>
  );
}

export default Departments;
