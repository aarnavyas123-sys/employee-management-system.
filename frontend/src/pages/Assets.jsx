import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function Assets() {
  const [assets, setAssets] = useState([]);

  const [formData, setFormData] = useState({
    asset_code: "",
    asset_name: "",
    asset_type: "",
    status: "Available",
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await API.get("/assets");
      setAssets(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/assets", formData);

      setFormData({
        asset_code: "",
        asset_name: "",
        asset_type: "",
        status: "Available",
      });

      fetchAssets();

      alert("Asset Added Successfully");
    } catch (error) {
      console.log(error);
      alert("Failed to add asset");
    }
  };

  return (
    <div>
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <h2 className="mb-4">Asset Management</h2>

        {/* Add Asset Form */}

        <div className="card p-4 mb-4 shadow-sm">
          <h4 className="mb-3">Add Asset</h4>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-3">
                <input
                  type="text"
                  name="asset_code"
                  placeholder="Asset Code"
                  className="form-control"
                  value={formData.asset_code}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <input
                  type="text"
                  name="asset_name"
                  placeholder="Asset Name"
                  className="form-control"
                  value={formData.asset_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <input
                  type="text"
                  name="asset_type"
                  placeholder="Asset Type"
                  className="form-control"
                  value={formData.asset_type}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-2">
                <select
                  name="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option>Available</option>
                  <option>Allocated</option>
                </select>
              </div>

              <div className="col-md-1">
                <button className="btn btn-primary w-100" type="submit">
                  Add
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Assets Table */}

        <div className="card p-4 shadow-sm">
          <h4 className="mb-3">Assets List</h4>

          <table className="table table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>Asset Code</th>
                <th>Asset Name</th>
                <th>Asset Type</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td>{asset.id}</td>
                  <td>{asset.asset_code}</td>
                  <td>{asset.asset_name}</td>
                  <td>{asset.asset_type}</td>
                  <td>{asset.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Assets;
