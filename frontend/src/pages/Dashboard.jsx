import { useEffect, useState } from "react";
import { getMyUsageSummary, getPlans } from "../api/billing";
import { useAuth } from "../context/useAuth";
import BuyPlans from "../components/BuyPlans";

export default function Dashboard() {
  const { user, buy } = useAuth();
  const [plans, setPlans] = useState([]);
  const [usage, setUsage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getPlans(), getMyUsageSummary(user.tenantId)])
      .then(([availablePlans, summary]) => {
        if (active) {
          setPlans(availablePlans);
          setUsage(summary);
        }
      })
      .catch((err) => {
        if (active)
          setError(
            err.response?.data?.detail ||
              err.message ||
              "Could not load account data.",
          );
      });
    return () => {
      active = false;
    };
  }, [user.tenantId]);

  const plan = plans.find((item) => item.id === user.planId);
  return (
    <>
      <h2>Welcome, {(user.name || "there").split(" ")[0]}</h2>
      <p className="muted">Here is what is happening in your Cogtic account.</p>
      {error && (
        <div className="err" role="alert">
          {error}
        </div>
      )}
      {!plan ? (
        <>
          <div className="banner">
            <span>
              <b>No plan is assigned.</b> Choose a plan to continue.
            </span>
          </div>
          <BuyPlans plans={plans} current={user.planId} onBuy={buy} />
        </>
      ) : (
        <>
          <div className="stats">
            <div className="card">
              <span className="muted">Current plan</span>
              <b>{plan.name}</b>
            </div>
            <div className="card">
              <span className="muted">Monthly price</span>
              <b>₹{plan.monthly_price}</b>
            </div>
            <div className="card">
              <span className="muted">Requests this period</span>
              <b>
                {usage
                  ? String(usage.total_usage) + " / " + usage.plan_limit
                  : "Loading…"}
              </b>
            </div>
            <div className="card">
              <span className="muted">Overage</span>
              <b>₹{usage?.overage_cost ?? "—"}</b>
            </div>
          </div>
          <div className="card" style={{ marginTop: 20 }}>
            <h3 style={{ marginTop: 0 }}>Billing period</h3>
            <p className="muted">
              {usage
                ? usage.period_start + " to " + usage.period_end
                : "Loading usage…"}
            </p>
            <p className="muted">
              {usage?.remaining ?? "—"} included requests remaining
            </p>
          </div>
        </>
      )}
    </>
  );
}
