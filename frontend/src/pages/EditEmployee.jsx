import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { toast } from "react-toastify";

function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState({
    name: "",
    department_id: "",
    phone: "",
    address: "",
    designation: "",
    salary: "",
  });

  useEffect(() => {
    fetchDepartments();
    fetchEmployee();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await API.get("/departments");
      setDepartments(res.data);
    } catch (error) {
      // Failed to load departments
    }
  };

  const fetchEmployee = async () => {
    try {
      const res = await API.get(`/employees/${id}`);

      setForm({
        name: res.data.name || "",
        department_id: res.data.department_id || "",
        phone: res.data.phone || "",
        address: res.data.address || "",
        designation: res.data.designation || "",
        salary: res.data.salary || "",
      });
    } catch (error) {
      toast.error("Failed to Load Employee");
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.put(`/employees/${id}`, form);

      toast.success("Employee Updated Successfully ✅");

      navigate("/employees");
    } catch (error) {
      toast.error("Failed to Update Employee");
    }
  };

  return (
    <>
      {" "}
      <Sidebar />
      <div className="main-content">
        <Topbar />

        <div className="card p-4 shadow-sm">
          <h2 className="mb-4">Edit Employee</h2>

          <form onSubmit={handleSubmit}>
            <input
              className="form-control mb-3"
              name="name"
              placeholder="Employee Name"
              value={form.name}
              onChange={handleChange}
            />

            <select
              className="form-control mb-3"
              name="department_id"
              value={form.department_id}
              onChange={handleChange}
            >
              <option value="">Select Department</option>

              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.department_name}
                </option>
              ))}
            </select>

            <input
              className="form-control mb-3"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />

            <input
              className="form-control mb-3"
              name="address"
              value={form.address}
              onChange={handleChange}
            />

            <input
              className="form-control mb-3"
              name="designation"
              value={form.designation}
              onChange={handleChange}
            />

            <input
              className="form-control mb-3"
              name="salary"
              value={form.salary}
              onChange={handleChange}
            />

            <button type="submit" className="btn btn-warning">
              Update Employee
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditEmployee;
