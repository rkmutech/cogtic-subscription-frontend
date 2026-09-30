export default function AuthLayout({ children }) {
  return (
    <div className="auth">
      <div className="auth-side">
        <div className="logo">
          Cog<span>tic</span>
        </div>
        <div>
          <h1>Think faster. Work smarter.</h1>
          <p>
            Log in to see your dashboard, manage your account and pick the plan
            that fits you.
          </p>
        </div>
        <small className="muted">© {new Date().getFullYear()} Cogtic</small>
      </div>
      <div className="auth-form">{children}</div>
    </div>
  );
}
