import { PLANS, useAuth } from "../lib";
import BuyPlans from "../components/BuyPlans";

/* ---------- Dashboard ---------- */
export default function Dashboard() {
  const { user, buy: onBuy } = useAuth();
  const plan = PLANS.find((p) => p.id === user.plan);
  return (
    <>
      <h2>Welcome, {user.name.split(" ")[0]}</h2>
      <p className="muted">Here is what is happening in your Cogtic account.</p>
      {!plan ? (
        <>
          <div className="banner">
            <span><b>You don't have a plan yet.</b> Buy a plan to unlock your dashboard features.</span>
          </div>
          <BuyPlans current={null} onBuy={onBuy} />
        </>
      ) : (
        <>
          <div className="stats">
            <div className="card"><span className="muted">Current plan</span><b>{plan.name}</b></div>
            <div className="card"><span className="muted">Amount paid</span><b>₹{plan.price}</b></div>
            <div className="card"><span className="muted">Projects</span><b>{plan.id === "pro" ? "Unlimited" : "1"}</b></div>
            <div className="card"><span className="muted">Status</span><b style={{ color: "#0a7d71" }}>Active</b></div>
          </div>
          <div className="card" style={{ marginTop: 20 }}>
            <h3 style={{ marginTop: 0 }}>Included in your plan</h3>
            <ul className="muted">{plan.perks.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        </>
      )}
    </>
  );
}

