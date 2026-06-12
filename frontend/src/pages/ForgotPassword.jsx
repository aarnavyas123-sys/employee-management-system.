import { useState } from "react";
import { toast } from "react-toastify";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/password/forgot-password", {
        email,
      });

      toast.success("Reset Token Generated ✅");

      navigate(`/reset-password?token=${res.data.token}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Generate Token");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: "500px" }}>
        <h2 className="mb-4 text-center">Forgot Password</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="form-control mb-3"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="btn btn-primary w-100">
            Generate Reset Token
          </button>
        </form>

        {token && (
          <div className="alert alert-success mt-3">
            <strong>Reset Token:</strong>
            <br />
            {token}
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
