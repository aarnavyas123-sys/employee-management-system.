import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function ApprovalHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await API.get("/leaves/history");
      setHistory(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const approvedCount = history.filter((item) =>
    item.action?.toLowerCase().includes("approve"),
  ).length;

  const rejectedCount = history.filter((item) =>
    item.action?.toLowerCase().includes("reject"),
  ).length;

  return (
    <>
      {" "}
      <Sidebar />
      <div className="main-content">
        <Topbar />

        {/* Header */}
        <div className="card p-4 shadow-sm mb-4">
          <h2 className="fw-bold">Approval History</h2>

          <p className="text-muted mb-0">
            Complete history of leave approvals and rejections.
          </p>
        </div>

        {/* Stats */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card p-3 shadow-sm text-center">
              <h6>Total Records</h6>
              <h2>{history.length}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-3 shadow-sm text-center">
              <h6>Approved</h6>
              <h2 className="text-success">{approvedCount}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-3 shadow-sm text-center">
              <h6>Rejected</h6>
              <h2 className="text-danger">{rejectedCount}</h2>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="card p-4 shadow-sm">
          <h4 className="mb-3">Approval Timeline</h4>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Leave ID</th>
                  <th>Employee</th>
                  <th>Approved By</th>
                  <th>Action</th>
                  <th>Remarks</th>
                </tr>
              </thead>

              <tbody>
                {history.length > 0 ? (
                  history.map((item) => (
                    <tr key={item.id}>
                      <td>#{item.id}</td>

                      <td>#{item.leave_id}</td>

                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={`https://ui-avatars.com/api/?name=${item.employee_name}&background=1677ff&color=fff`}
                            alt={item.employee_name}
                            width="40"
                            height="40"
                            className="rounded-circle"
                          />

                          <strong>{item.employee_name}</strong>
                        </div>
                      </td>

                      <td>{item.approved_by_name}</td>

                      <td>
                        {item.action?.toLowerCase().includes("approve") ? (
                          <span className="badge bg-success">
                            {item.action}
                          </span>
                        ) : (
                          <span className="badge bg-danger">{item.action}</span>
                        )}
                      </td>

                      <td>{item.remarks || "No Remarks"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No Approval History Found
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

export default ApprovalHistory;
