import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../services/api";
import { toast } from "react-toastify";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dynamic Multi-parameter Operational State Tracking Engine
  const [filters, setFilters] = useState({
    search: "",
    actionType: "All",
    startDate: "",
    endDate: "",
  });

  // Unique actionable log filters selection mapping
  const actionCategories = [
    "All",
    "User Login",
    "User Registered",
    "User Created",
    "Role Updated",
    "Status Changed",
    "Leave Applied",
    "Manager Approved",
    "Leave Rejected",
    "HR Approved",
    "HR Rejected",
    "Asset Returned",
  ];

  useEffect(() => {
    loadSystemAuditRegistry();
  }, []);

  const loadSystemAuditRegistry = async (customFilters = filters) => {
    setLoading(true);
    try {
      // Build tracking parameters map dynamically mapping to back-end specifications
      const requestParams = {};
      if (customFilters.search) requestParams.search = customFilters.search;
      if (customFilters.actionType && customFilters.actionType !== "All") {
        requestParams.actionType = customFilters.actionType;
      }
      if (customFilters.startDate)
        requestParams.startDate = customFilters.startDate;
      if (customFilters.endDate) requestParams.endDate = customFilters.endDate;

      const res = await API.get("/audit-logs", {
        params: requestParams,
      });
      setLogs(res.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to parse corporate ledger tracks",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    loadSystemAuditRegistry();
  };

  const handleResetFilters = () => {
    const freshResetState = {
      search: "",
      actionType: "All",
      startDate: "",
      endDate: "",
    };
    setFilters(freshResetState);
    loadSystemAuditRegistry(freshResetState);
  };

  // Helper calculation grid context formatting mapping
  const getActionThemeBadge = (action) => {
    if (action.includes("Created") || action.includes("Registered"))
      return "badge bg-success bg-opacity-10 text-success border border-success border-opacity-20";
    if (action.includes("Updated") || action.includes("Changed"))
      return "badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-20";
    if (action.includes("Rejected"))
      return "badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-20";
    if (action.includes("Approved"))
      return "badge bg-info bg-opacity-10 text-info border border-info border-opacity-20";
    return "badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-20";
  };

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <Topbar />

        {/* Dynamic Header Block Element Section */}
        <div className="card p-4 shadow-sm mb-4">
          <h2 className="fw-bold text-dark mb-1">
            System Compliance Audit Logs
          </h2>
          <p className="text-muted mb-0">
            Review transactional operations, identity access patterns, security
            alterations, and pipeline data changes.
          </p>
        </div>

        {/* Advanced Filters Control Terminal Block */}
        <div className="card p-4 shadow-sm mb-4 border-0">
          <h5 className="fw-semibold text-primary mb-3">
            🛠️ Log Filter & Analytics Matrix
          </h5>
          <form onSubmit={handleApplyFilters}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label small fw-medium text-secondary">
                  Search Operator / Detail Text
                </label>
                <input
                  type="text"
                  name="search"
                  className="form-control"
                  placeholder="🔍 Name, email, log info..."
                  value={filters.search}
                  onChange={handleFilterInputChange}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-medium text-secondary">
                  Action Event Type
                </label>
                <select
                  name="actionType"
                  className="form-select"
                  value={filters.actionType}
                  onChange={handleFilterInputChange}
                >
                  {actionCategories.map((type, idx) => (
                    <option key={idx} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label small fw-medium text-secondary">
                  Start Temporal Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  className="form-control"
                  value={filters.startDate}
                  onChange={handleFilterInputChange}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label small fw-medium text-secondary">
                  End Temporal Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  className="form-control"
                  value={filters.endDate}
                  onChange={handleFilterInputChange}
                />
              </div>

              <div className="col-md-2 d-flex align-items-end gap-2">
                <button
                  type="submit"
                  className="btn btn-primary flex-grow-1 fw-medium"
                  disabled={loading}
                >
                  {loading ? "Syncing..." : "Apply Filters"}
                </button>
                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={handleResetFilters}
                  disabled={loading}
                >
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Ledger Log Stream Table Grid Container Block */}
        <div className="card p-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0 fw-semibold text-dark">
              Immutable Tracking Ledger
            </h4>
            <span className="badge bg-light text-dark border px-3 py-2 fw-medium">
              Resolved Entries Count: {logs.length}
            </span>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th width="80">Log ID</th>
                  <th width="180">Timestamp Clock</th>
                  <th width="200">System Operator Context</th>
                  <th width="180">Action Event Node</th>
                  <th>Descriptive Metadata Logs</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center p-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      ></div>
                      <p className="mt-2 mb-0 text-muted">
                        Scanning global tracking ledger tracks...
                      </p>
                    </td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td className="fw-bold text-muted">#{log.id}</td>
                      <td className="small text-secondary">
                        {new Date(log.created_at).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td>
                        <div className="fw-bold text-dark">
                          {log.operator_name || `Account ID: ${log.user_id}`}
                        </div>
                        {log.operator_email && (
                          <small className="text-muted d-block">
                            {log.operator_email}
                          </small>
                        )}
                      </td>
                      <td>
                        <span
                          className={`px-2 py-1 fs-7 rounded-pill ${getActionThemeBadge(log.action)}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td
                        className="text-wrap text-dark fs-6 fw-normal"
                        style={{ maxWidth: "400px" }}
                      >
                        {log.details}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted p-4">
                      No compliance transaction entries discovered matching
                      matching search queries.
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

export default AuditLogs;
