import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import loginImage from "../assets/Login.png";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/v1/auth/login",
        form,
      );

      console.log("Login Response:", res.data);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("employeeId", res.data.id);

      toast.success("Login Successful 🚀");

      navigate("/dashboard");
    } catch (err) {
      console.log(err);

      toast.error(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-right">
          <img src={loginImage} alt="Login" className="auth-image" />
        </div>

        <div className="auth-left">
          <div className="auth-card">
            <h1 className="logo">EMS</h1>

            <h2>Welcome Back</h2>

            <p className="auth-subtitle">Employee Management System</p>

            <form onSubmit={handleSubmit}>
              <label>Work Email</label>

              <input
                type="email"
                name="email"
                placeholder="Enter Work Email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Enter Password"
                value={form.password}
                onChange={handleChange}
                required
              />

              <div className="text-center mt-3">
                <Link to="/forgot-password" className="text-decoration-none">
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" className="login-btn">
                Login
              </button>
            </form>

            <div className="auth-footer">
              Don't have an account?
              <Link to="/signup"> Sign Up</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
