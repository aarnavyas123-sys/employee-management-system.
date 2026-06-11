import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../services/api";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    token: "",
    newPassword: "",
  });

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      setForm((prev) => ({
        ...prev,
        token,
      }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/password/reset-password", form);

      toast.success("Password Reset Successfully ✅");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset Failed");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: "500px" }}>
        <h2 className="mb-4 text-center">Reset Password</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="token"
            className="form-control mb-3"
            placeholder="Reset Token"
            value={form.token}
            onChange={handleChange}
            readOnly
          />

          <input
            type="password"
            name="newPassword"
            className="form-control mb-3"
            placeholder="Enter New Password"
            value={form.newPassword}
            onChange={handleChange}
            required
          />

          <button type="submit" className="btn btn-success w-100">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
