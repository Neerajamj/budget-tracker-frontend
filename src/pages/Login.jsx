import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
const API_BASE = "https://budget-tracker-backend-gd4s.onrender.com";


export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${API_BASE}/login`, { email, password });
      const { token } = res.data;
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Login failed. Please check your details."
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-auth">
        <h1 className="auth-title">TrackIt<span>Simple. Clear. In control.</span></h1>
        <p className="auth-subtitle">Welcome back 👋</p>

        <form className="auth-form" onSubmit={handleLogin}>
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button className="primary-btn auth-btn" type="submit">
            Sign in
          </button>
        </form>

        <p className="auth-footer">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
