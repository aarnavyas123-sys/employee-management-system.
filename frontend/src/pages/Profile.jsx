import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { toast } from "react-toastify";

function Profile() {
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const employeeName = localStorage.getItem("name");

      const res = await API.get(
        `/employees/profile/${encodeURIComponent(employeeName)}`,
      );

      setEmployee(res.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to Load Profile");
    }
  };
  if (!employee) {
    return (
      <>
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <div className="card p-4">
            <h4>Loading Profile...</h4>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="card shadow-sm border-0 p-4">
          <div className="text-center mb-4">
            <img
              src={`https://ui-avatars.com/api/?name=${employee.name}&background=1677ff&color=fff&size=180`}
              alt="Profile"
              className="rounded-circle shadow"
              style={{
                width: "140px",
                height: "140px",
                objectFit: "cover",
              }}
            />

            <h2 className="mt-3 fw-bold">{employee.name}</h2>

            <p className="text-muted mb-2">
              {employee.designation || "Employee"}
            </p>

            <span className="badge bg-primary fs-6 px-3 py-2">
              {employee.department_name || "Department"}
            </span>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-muted">📞 Phone Number</h6>
                  <h5>{employee.phone || "Not Available"}</h5>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-muted">💰 Salary</h6>
                  <h5>₹ {employee.salary || "0"}</h5>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-muted">🏢 Department</h6>
                  <h5>{employee.department_name || "N/A"}</h5>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-muted">💼 Designation</h6>
                  <h5>{employee.designation || "N/A"}</h5>
                </div>
              </div>
            </div>

            <div className="col-md-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="text-muted">📍 Address</h6>
                  <h5>{employee.address || "Not Available"}</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
