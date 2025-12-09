import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "https://budget-tracker-backend-gd4s.onrender.com";


export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    try {
      await axios.post(`${API_BASE}/signup`, { name, email, password });
      setInfo("Account created! You can now log in.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Signup failed. Please try again."
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-auth">
        <h1 className="auth-title">TrackIt<span>Simple. Clear. In control.</span></h1>
        <p className="auth-subtitle">Create your space 💸</p>

        <form className="auth-form" onSubmit={handleSignup}>
          <label>
            Name
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </label>

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
              placeholder="Choose a strong password"
            />
          </label>

          {error && <p className="auth-error">{error}</p>}
          {info && <p className="auth-info">{info}</p>}

          <button className="primary-btn auth-btn" type="submit">
            Sign up
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
