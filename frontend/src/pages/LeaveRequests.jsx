import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { toast } from "react-toastify";

function LeaveRequests() {
  const [leaves, setLeaves] = useState([]);
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await API.get("/leaves");
      setLeaves(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await API.put(`/leaves/approve/${id}`);
      toast.success("Manager Approved ✅");
      fetchLeaves();
    } catch {
      toast.error("Approval Failed");
    }
  };

  const handleHRApprove = async (id) => {
    try {
      await API.put(`/leaves/hr-approve/${id}`);
      toast.success("HR Approved ✅");
      fetchLeaves();
    } catch {
      toast.error("HR Approval Failed");
    }
  };

  const handleReject = async (id) => {
    try {
      await API.put(`/leaves/reject/${id}`);
      toast.success("Leave Rejected ❌");
      fetchLeaves();
    } catch {
      toast.error("Rejection Failed");
    }
  };

  const handleHRReject = async (id) => {
    try {
      await API.put(`/leaves/hr-reject/${id}`);
      toast.success("HR Rejected ❌");
      fetchLeaves();
    } catch {
      toast.error("HR Rejection Failed");
    }
  };

  const pendingLeaves = leaves.filter(
    (leave) => leave.status === "Pending",
  ).length;

  const approvedLeaves = leaves.filter(
    (leave) => leave.status === "Approved" || leave.status === "HR Approved",
  ).length;

  const rejectedLeaves = leaves.filter(
    (leave) => leave.status === "Rejected" || leave.status === "HR Rejected",
  ).length;

  return (
    <>
      {" "}
      <Sidebar />
      <div className="main-content">
        <Topbar />

        {/* Header */}
        <div className="card p-4 shadow-sm mb-4">
          <h2 className="fw-bold">Leave Management</h2>
          <p className="text-muted mb-0">
            Manage employee leave approvals and requests
          </p>
        </div>

        {/* Summary Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card p-3 shadow-sm text-center">
              <h6>Total Requests</h6>
              <h2>{leaves.length}</h2>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card p-3 shadow-sm text-center">
              <h6>Pending</h6>
              <h2 className="text-warning">{pendingLeaves}</h2>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card p-3 shadow-sm text-center">
              <h6>Approved</h6>
              <h2 className="text-success">{approvedLeaves}</h2>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card p-3 shadow-sm text-center">
              <h6>Rejected</h6>
              <h2 className="text-danger">{rejectedLeaves}</h2>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card p-4 shadow-sm">
          <h4 className="mb-3">Leave Requests</h4>

          <div className="table-responsive">
            <table className="table align-middle table-hover">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th width="260">Actions</th>
                </tr>
              </thead>

              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>#{leave.id}</td>

                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={`https://ui-avatars.com/api/?name=${leave.name}&background=1677ff&color=fff`}
                          alt={leave.name}
                          width="40"
                          height="40"
                          className="rounded-circle"
                        />
                        <strong>{leave.name}</strong>
                      </div>
                    </td>

                    <td>{leave.leave_name}</td>

                    <td>{leave.from_date?.slice(0, 10)}</td>

                    <td>{leave.to_date?.slice(0, 10)}</td>

                    <td>{leave.total_days}</td>

                    <td>
                      {leave.status === "Pending" && (
                        <span className="badge bg-warning text-dark">
                          Pending
                        </span>
                      )}

                      {leave.status === "Manager Approved" && (
                        <span className="badge bg-primary">
                          Manager Approved
                        </span>
                      )}

                      {leave.status === "HR Approved" && (
                        <span className="badge bg-success">Approved</span>
                      )}

                      {leave.status === "Rejected" && (
                        <span className="badge bg-danger">Rejected</span>
                      )}

                      {leave.status === "HR Rejected" && (
                        <span className="badge bg-danger">HR Rejected</span>
                      )}
                    </td>

                    <td>
                      {role === "Manager" && leave.status === "Pending" && (
                        <>
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => handleApprove(leave.id)}
                          >
                            ✓ Approve
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleReject(leave.id)}
                          >
                            ✕ Reject
                          </button>
                        </>
                      )}

                      {role === "HR" && leave.status === "Manager Approved" && (
                        <>
                          <button
                            className="btn btn-primary btn-sm me-2"
                            onClick={() => handleHRApprove(leave.id)}
                          >
                            ✓ HR Approve
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleHRReject(leave.id)}
                          >
                            ✕ HR Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default LeaveRequests;
