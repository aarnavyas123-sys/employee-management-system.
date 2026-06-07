import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../services/api";
import { toast } from "react-toastify";

function LeaveApplication() {
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);

  const [form, setForm] = useState({
    employee_id: "",
    leave_type_id: "",
    from_date: "",
    to_date: "",
    total_days: "",
    reason: "",
  });

  useEffect(() => {
    fetchEmployees();
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
      }
    }
  }, [form.from_date, form.to_date]);

  const fetchEmployees = async () => {
    try {
      const res = await API.get("/employees");
      setEmployees(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await API.get("/leave-types");
      setLeaveTypes(res.data);
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
      await API.post("/leaves", form);

      toast.success("Leave Applied Successfully ✅");

      setForm({
        employee_id: "",
        leave_type_id: "",
        from_date: "",
        to_date: "",
        total_days: "",
        reason: "",
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to Apply Leave");
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
              <h6>Leave Types</h6>
              <h2>{leaveTypes.length}</h2>
            </div>
          </div>
          ```
          <div className="col-md-4">
            <div className="card p-3 shadow-sm text-center">
              <h6>Total Leave Days</h6>
              <h2>{form.total_days || 0}</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3 shadow-sm text-center">
              <h6>Status</h6>
              <h2 className="text-warning">Pending</h2>
            </div>
          </div>
          ```
        </div>

        <div className="row">
          {/* Form */}
          <div className="col-md-8">
            <div className="card p-4 shadow-sm">
              <h4 className="mb-4">Apply for Leave</h4>
              ```
              <form onSubmit={handleSubmit}>
                <select
                  className="form-control mb-3"
                  name="employee_id"
                  value={form.employee_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Employee</option>

                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>

                <select
                  className="form-control mb-3"
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
                  <strong>Total Leave Days:</strong> {form.total_days || 0}
                </div>

                <textarea
                  className="form-control mb-3"
                  rows="4"
                  placeholder="Reason for Leave"
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  required
                />

                <button type="submit" className="btn btn-primary px-4">
                  🚀 Submit Leave Request
                </button>
              </form>
            </div>
          </div>
          {/* Right Panel */}
          <div className="col-md-4">
            <div className="card p-4 shadow-sm">
              <h5>Leave Guidelines</h5>

              <ul className="mt-3">
                <li>Apply leave in advance.</li>
                <li>Manager approval required.</li>
                <li>HR approval required for final approval.</li>
                <li>Provide valid reason.</li>
                <li>Emergency leaves require notification.</li>
              </ul>
            </div>

            <div className="card p-4 shadow-sm mt-3">
              <h5>Quick Tips</h5>

              <p className="text-muted">
                Double-check your dates before submitting your request.
              </p>
            </div>
          </div>
          ```
        </div>
      </div>
    </>
  );
}

export default LeaveApplication;
