import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function EmployeeDetails() {
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    fetchEmployee();
  }, []);

  const fetchEmployee = async () => {
    try {
      const res = await API.get(`/employees/${id}`);
      setEmployee(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  if (!employee) {
    return <h3>Loading...</h3>;
  }

  return (
    <>
      {" "}
      <Sidebar />
      <div className="main-content">
        <Topbar />

        <div className="card p-4 shadow-sm">
          <h2 className="mb-4">Employee Details</h2>

          <div className="row">
            <div className="col-md-6 mb-3">
              <strong>Name:</strong>
              <p>{employee.name}</p>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Department:</strong>
              <p>{employee.department_name}</p>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Designation:</strong>
              <p>{employee.designation}</p>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Salary:</strong>
              <p>₹ {employee.salary}</p>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Phone:</strong>
              <p>{employee.phone}</p>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Address:</strong>
              <p>{employee.address}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EmployeeDetails;
