import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import AuthLayout from "../components/AuthLayout";

export default function Register() {
  const { user, register } = useAuth();
  const [f, setF] = useState({ nameName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(f.nameName, f.email, f.password);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not create your account. Please try again.");
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={submit}>
        <h2>Create your account</h2>
        <p className="muted">
          Already have an account? <Link className="link" to="/login" style={{ textDecoration: "none" }}>Log in</Link>
        </p>
        <label htmlFor="nameName"> name</label>
        <input id="nameName" value={f.nameName} onChange={set("nameName")} autoComplete="organization" required />
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={f.email} onChange={set("email")} autoComplete="email" />
        <label htmlFor="pw">Password</label>
        <input id="pw" type="password" value={f.password} onChange={set("password")} autoComplete="new-password" />
        {error && <div className="err" role="alert">{error}</div>}
        <button className="btn full" disabled={!f.nameName.trim()}>Register</button>
      </form>
    </AuthLayout>
  );
}
