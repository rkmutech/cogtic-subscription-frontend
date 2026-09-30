import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../lib";
import AuthLayout from "../components/AuthLayout";

export default function Register() {
  const { user, register } = useAuth();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (user) return <Navigate to="/" replace />;

  const submit = (e) => {
    e.preventDefault();
    const err = register(f.name, f.email, f.password);
    if (err) setError(err);
  };

  return (
    <AuthLayout>
      <form onSubmit={submit}>
        <h2>Create your account</h2>
        <p className="muted">
          Already have an account? <Link className="link" to="/login" style={{ textDecoration: "none" }}>Log in</Link>
        </p>
        <label htmlFor="name">Full name</label>
        <input id="name" value={f.name} onChange={set("name")} autoComplete="name" />
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={f.email} onChange={set("email")} autoComplete="email" />
        <label htmlFor="pw">Password</label>
        <input id="pw" type="password" value={f.password} onChange={set("password")} autoComplete="new-password" />
        {error && <div className="err" role="alert">{error}</div>}
        <button className="btn full">Register</button>
      </form>
    </AuthLayout>
  );
}
