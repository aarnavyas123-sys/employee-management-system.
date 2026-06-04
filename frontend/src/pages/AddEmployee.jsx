import { useState, useEffect } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { toast } from "react-toastify";

function AddEmployee() {
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
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await API.get("/departments");
      setDepartments(res.data);
    } catch (error) {
      console.log(error);
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
      await API.post("/employees", form);

      toast.success("Employee Added Successfully ✅");

      setForm({
        name: "",
        department_id: "",
        phone: "",
        address: "",
        designation: "",
        salary: "",
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to Add Employee");
    }
  };

  return (
    <>
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="card p-4 shadow-sm">
          <h2 className="mb-4">Add Employee</h2>

          <form onSubmit={handleSubmit}>
            <input
              className="form-control mb-3"
              name="name"
              placeholder="Employee Name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <select
              className="form-control mb-3"
              name="department_id"
              value={form.department_id}
              onChange={handleChange}
              required
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
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
            />

            <input
              className="form-control mb-3"
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
            />

            <input
              className="form-control mb-3"
              name="designation"
              placeholder="Designation"
              value={form.designation}
              onChange={handleChange}
            />

            <input
              className="form-control mb-4"
              name="salary"
              placeholder="Salary"
              value={form.salary}
              onChange={handleChange}
            />

            <button type="submit" className="btn btn-success">
              Save Employee
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddEmployee;
