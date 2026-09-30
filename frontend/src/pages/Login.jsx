import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const { user, login } = useAuth();
  const [f, setF] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(f.email, f.password);
    } catch (err) {
      setError(err.response?.data?.detail || "Email or password is incorrect.");
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={submit}>
        <h2>Log in to Cogtic</h2>
        <p className="muted">
          New here? <Link className="link" to="/register" style={{ textDecoration: "none" }}>Register</Link>
        </p>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={f.email} onChange={set("email")} autoComplete="email" />
        <label htmlFor="pw">Password</label>
        <input id="pw" type="password" value={f.password} onChange={set("password")} autoComplete="current-password" />
        {error && <div className="err" role="alert">{error}</div>}
        <button className="btn full">Log in</button>
        {/* <div className="hint">Demo admin: admin@cogtic.com / admin123</div> */}
      </form>
    </AuthLayout>
  );
}
