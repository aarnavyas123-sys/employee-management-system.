import { useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import signupImage from "../assets/signup.png";
import { signupUser } from "../services/api";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Employee",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      await signupUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      toast.success("Account Created Successfully 🎉");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup Failed");
    }
  };

  return (
    <div className="auth-container">
      {" "}
      <div className="auth-wrapper">
        <div className="auth-right">
          <img
            src={signupImage}
            alt="Signup Illustration"
            className="auth-image"
          />
        </div>

        <div className="auth-left">
          <div className="auth-card">
            <h1 className="logo">EMS</h1>

            <h2>Create Account</h2>

            <p className="auth-subtitle">Employee Management System</p>

            <form onSubmit={handleSubmit}>
              <label>Full Name</label>

              <input
                type="text"
                name="name"
                placeholder="Enter Full Name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <label>Work Email</label>

              <input
                type="email"
                name="email"
                placeholder="Enter Work Email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <label>Role</label>

              <select name="role" value={form.role} onChange={handleChange}>
                <option>Employee</option>
                <option>Manager</option>
                <option>HR</option>
              </select>

              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Create Password"
                value={form.password}
                onChange={handleChange}
                required
              />

              <label>Confirm Password</label>

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />

              <div className="terms-box">
                <input type="checkbox" required />
                <label>I agree to Terms & Conditions</label>
              </div>

              <button type="submit" className="signup-btn">
                Sign Up
              </button>
            </form>

            <div className="auth-footer">
              Already have an account?
              <Link to="/"> Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
