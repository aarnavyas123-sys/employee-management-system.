import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../services/api";
import { toast } from "react-toastify";

function Reports() {
  const exportEmployees = async () => {
    try {
      const res = await API.get("/employees");

      const worksheet = XLSX.utils.json_to_sheet(res.data);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const file = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(file, "Employee_Report.xlsx");

      toast.success("Employee Report Exported");
    } catch (error) {
      toast.error("Failed to Export Employee Report");
    }
  };

  const exportLeaves = async () => {
    try {
      const res = await API.get("/leaves");

      const worksheet = XLSX.utils.json_to_sheet(res.data);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Leaves");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const file = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(file, "Leave_Report.xlsx");

      toast.success("Leave Report Exported");
    } catch (error) {
      toast.error("Failed to Export Leave Report");
    }
  };

  const exportAssets = async () => {
    try {
      const res = await API.get("/assets");

      const worksheet = XLSX.utils.json_to_sheet(res.data);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Assets");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const file = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(file, "Asset_Report.xlsx");

      toast.success("Asset Report Exported");
    } catch (error) {
      toast.error("Failed to Export Asset Report");
    }
  };

  return (
    <>
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="card p-4 shadow-sm">
          <h2 className="mb-4">Reports & Analytics</h2>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card text-center p-4 shadow-sm">
                <h4>Employee Report</h4>

                <button
                  className="btn btn-primary mt-3"
                  onClick={exportEmployees}
                >
                  Export Excel
                </button>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card text-center p-4 shadow-sm">
                <h4>Leave Report</h4>

                <button className="btn btn-success mt-3" onClick={exportLeaves}>
                  Export Excel
                </button>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card text-center p-4 shadow-sm">
                <h4>Asset Report</h4>

                <button className="btn btn-warning mt-3" onClick={exportAssets}>
                  Export Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Reports;
