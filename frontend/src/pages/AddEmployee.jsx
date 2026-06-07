import { useState, useEffect } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { toast } from "react-toastify";

function AddEmployee() {
  const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
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
      const employeeData = {
        name: `${form.firstName} ${form.lastName}`,
        department_id: form.department_id,
        phone: form.phone,
        address: form.address,
        designation: form.designation,
        salary: form.salary,
      };

      await API.post("/employees", employeeData);

      toast.success("Employee Added Successfully ✅");

      setForm({
        firstName: "",
        lastName: "",
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

        <div className="employee-form-card">
          <div className="employee-form-header">
            <h2>Register New Employee</h2>
            <p>Add employee information, assign department and designation.</p>
          </div>

          <form onSubmit={handleSubmit} className="employee-form">
            <div className="row">
              <div className="col-md-6 mb-4">
                <label>First Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-4">
                <label>Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-4">
                <label>Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-4">
                <label>Salary</label>
                <input
                  type="number"
                  className="form-control"
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-4">
                <label>Department</label>

                <select
                  className="form-select"
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
              </div>

              <div className="col-md-8 mb-4">
                <label>Designation</label>

                <input
                  type="text"
                  className="form-control"
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-4">
              <label>Residential Address</label>

              <textarea
                rows="4"
                className="form-control"
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            <div className="text-end">
              <button type="submit" className="employee-save-btn">
                Save Employee
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddEmployee;
