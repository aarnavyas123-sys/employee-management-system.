import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../services/api";
import { toast } from "react-toastify";

function LeaveApplication() {
  const role = localStorage.getItem("role");
  const currentUserName = localStorage.getItem("name");

  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(role === "Employee");
  const [profileError, setProfileError] = useState(null);

  const [form, setForm] = useState({
    employee_id: "",
    leave_type_id: "",
    from_date: "",
    to_date: "",
    total_days: "",
    reason: "",
  });

  useEffect(() => {
    fetchEmployeesAndProfile();
    fetchLeaveTypes();
  }, []);

  useEffect(() => {
    if (form.from_date && form.to_date) {
      const from = new Date(form.from_date);
      const to = new Date(form.to_date);

      const diffTime = to - from;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays > 0) {
        setForm((prev) => ({
          ...prev,
          total_days: diffDays,
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          total_days: 0,
        }));
      }
    }
  }, [form.from_date, form.to_date]);

  const fetchEmployeesAndProfile = async () => {
    try {
      if (role === "Employee") {
        setIsLoadingProfile(true);
        setProfileError(null);
        const res = await API.get(`/employees/profile/${encodeURIComponent(currentUserName)}`);
        if (res.data && res.data.id) {
          setEmployees([res.data]);
          setForm((prev) => ({
            ...prev,
            employee_id: res.data.id,
          }));
        } else {
          setProfileError("Profile not found.");
          toast.error("Employee profile not found. Please contact HR to create your profile.");
        }
      } else {
        const res = await API.get("/employees");
        // Safe check for paginated response
        const employeeList = res.data.employees || (Array.isArray(res.data) ? res.data : []);
        setEmployees(employeeList);
      }
    } catch (error) {
      console.error("Error loading employees/profile:", error);
      if (role === "Employee") {
        setProfileError("Failed to load employee profile.");
        toast.error("Failed to load your profile. Please make sure your HR has set up your employee record.");
      } else {
        toast.error("Failed to load employees list.");
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await API.get("/leave-types");
      setLeaveTypes(res.data);
    } catch (error) {
      console.error("Error fetching leave types:", error);
      toast.error("Failed to load leave types.");
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

    if (!form.employee_id) {
      toast.error("Employee profile is required to apply for leave.");
      return;
    }

    try {
      await API.post("/leaves", form);

      toast.success("Leave Applied Successfully ✅");

      setForm({
        employee_id: role === "Employee" ? form.employee_id : "",
        leave_type_id: "",
        from_date: "",
        to_date: "",
        total_days: "",
        reason: "",
      });
    } catch (error) {
      console.error("Error applying leave:", error);
      const errMsg = error.response?.data?.message || "Failed to Apply Leave";
      toast.error(errMsg);
    }
  };

  return (
    <>
      <Sidebar />

      <div className="main-content">
        <Topbar />

        {/* Header */}
        <div className="card p-4 shadow-sm mb-4">
          <h2 className="fw-bold text-primary">Leave Application</h2>
          <p className="text-muted mb-0">
            Submit your leave request for approval.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card p-3 shadow-sm text-center">
              <h6 className="text-muted">Leave Types Available</h6>
              <h2 className="text-primary">{leaveTypes.length}</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3 shadow-sm text-center">
              <h6 className="text-muted">Total Leave Days</h6>
              <h2 className="text-info">{form.total_days || 0}</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3 shadow-sm text-center">
              <h6 className="text-muted">Status</h6>
              <h2 className="text-warning">Pending Approval</h2>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Form */}
          <div className="col-md-8">
            <div className="card p-4 shadow-sm">
              <h4 className="mb-4 text-secondary">Apply for Leave</h4>
              
              {isLoadingProfile ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading Profile...</span>
                  </div>
                  <p className="mt-2 text-muted">Retrieving employee record...</p>
                </div>
              ) : profileError ? (
                <div className="alert alert-danger py-3">
                  <h5 className="alert-heading">⚠️ Profile Setup Required</h5>
                  <p className="mb-0">
                    We could not locate an Employee Profile for user account <strong>{currentUserName}</strong>.
                    Please ask your system Admin or HR to create your Employee Profile containing your department, designation, and salary information before you can submit leave requests.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {role === "Employee" ? (
                    <div className="mb-3">
                      <label className="form-label fw-bold">Employee Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={employees[0]?.name || currentUserName}
                        disabled
                      />
                    </div>
                  ) : (
                    <div className="mb-3">
                      <label className="form-label fw-bold">Select Employee</label>
                      <select
                        className="form-control"
                        name="employee_id"
                        value={form.employee_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Employee</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} ({emp.designation || "No Designation"})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label fw-bold">Select Leave Type</label>
                    <select
                      className="form-control"
                      name="leave_type_id"
                      value={form.leave_type_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Leave Type</option>
                      {leaveTypes.map((leave) => (
                        <option key={leave.id} value={leave.id}>
                          {leave.leave_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">From Date</label>
                      <input
                        type="date"
                        className="form-control mb-3"
                        name="from_date"
                        value={form.from_date}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold">To Date</label>
                      <input
                        type="date"
                        className="form-control mb-3"
                        name="to_date"
                        value={form.to_date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="alert alert-info">
                    <strong>Total Calculated Leave Days:</strong> {form.total_days || 0}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Reason for Leave</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Please specify a clear reason for applying..."
                      name="reason"
                      value={form.reason}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary px-4 fw-bold"
                    disabled={!form.employee_id}
                  >
                    🚀 Submit Leave Request
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-md-4">
            <div className="card p-4 shadow-sm mb-3">
              <h5 className="border-bottom pb-2">📋 Leave Guidelines</h5>
              <ul className="mt-3 ps-3">
                <li className="mb-2">Apply for leaves in advance to allow time for approval.</li>
                <li className="mb-2">Leaves must be approved by your reporting Manager.</li>
                <li className="mb-2">HR performs final approval and leave deduction.</li>
                <li className="mb-2">Ensure your reason is descriptive and valid.</li>
                <li>Emergency leaves require instant notify to your supervisor.</li>
              </ul>
            </div>

            <div className="card p-4 shadow-sm text-bg-light">
              <h5 className="fw-bold text-dark">💡 Quick Tips</h5>
              <p className="text-muted mb-0 small">
                Verify that your From Date is before or equal to your To Date. The system automatically computes the total days requested.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LeaveApplication;
