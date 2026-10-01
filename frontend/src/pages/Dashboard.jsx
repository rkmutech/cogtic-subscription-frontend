import { useEffect, useState } from "react";
import { getMyUsageSummary, getPlans, recordUsage } from "../api/billing";
import { useAuth } from "../context/useAuth";
import BuyPlans from "../components/BuyPlans";

export default function Dashboard() {
  const { user, buy } = useAuth();
  const [plans, setPlans] = useState([]);
  const [usage, setUsage] = useState(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user?.tenantId) {
      setPlans([]);
      setUsage(null);
      setError("");
      return;
    }

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
  }, [user?.tenantId]);

  const usageSummary = usage
    ? {
        totalUsage: usage.totalUsage ?? usage.total_usage ?? 0,
        planLimit: usage.planlimit ?? usage.plan_limit ?? null,
        remaining: usage.remaining ?? usage.remaining_requests ?? null,
        overageCost: usage.overageCost ?? usage.overage_cost ?? "—",
        periodStart: usage.periodStart ?? usage.period_start ?? "",
        periodEnd: usage.periodEnd ?? usage.period_end ?? "",
      }
    : null;

  const planLimitReached =
    usageSummary &&
    usageSummary.planLimit != null &&
    Number(usageSummary.remaining ?? 0) <= 0;
  const plan = planLimitReached ? null : plans.find((item) => item.id === user.planId);

  async function handleSendRequest() {
    if (!user?.tenantId) return;

    if (usageSummary && Number(usageSummary.remaining ?? 0) <= 0) {
      setError("Your plan limit has been reached. Please buy another plan.");
      return;
    }

    try {
      setSending(true);
      setError("");
      await recordUsage();
      const nextSummary = await getMyUsageSummary(user.tenantId);
      setUsage(nextSummary);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Could not record request.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="user-dashboard">
      <header className="user-dashboard-hero">
        <span className="user-dashboard-kicker">ACCOUNT OVERVIEW</span>
        <h2>Welcome, {(user.name || "there").split(" ")[0]}</h2>
        <p>Here is what is happening in your Cogtic account.</p>
      </header>
      {error && (
        <div className="err" role="alert">
          {error}
        </div>
      )}
      {!plan ? (
        <>
          <div className="banner user-no-plan">
            <span>
              <b>{planLimitReached ? "Plan limit reached." : "No plan is assigned."}</b>{" "}
              {planLimitReached
                ? "Buy another plan to continue."
                : "Choose a plan to continue."}
            </span>
          </div>
          <BuyPlans plans={plans} current={planLimitReached ? null : user.planId} onBuy={buy} />
        </>
      ) : (
        <>
          <div className="stats user-stats">
            <div className="card user-stat user-stat-purple">
              <span className="muted">Current plan</span>
              <b>{plan.name}</b>
            </div>
            <div className="card user-stat user-stat-blue">
              <span className="muted">Monthly price</span>
              <b>₹{plan.monthly_price}</b>
            </div>
            <div className="card user-stat user-stat-teal">
              <span className="muted">Requests this period</span>
              <b>
                {usageSummary
                  ? String(usageSummary.totalUsage) +
                    " / " +
                    (usageSummary.planLimit ?? "—")
                  : "Loading…"}
              </b>
            </div>
            <div className="card user-stat user-stat-orange">
              <span className="muted">Overage</span>
              <b>₹{usageSummary?.overageCost ?? "—"}</b>
            </div>
          </div>

          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
            <button
              className="btn"
              onClick={handleSendRequest}
              disabled={sending || !!planLimitReached}
            >
              {planLimitReached ? "Plan limit reached" : sending ? "Sending…" : "Send request"}
            </button>
          </div>

          <div className="card user-billing" style={{ marginTop: 20 }}>
            <h3 style={{ marginTop: 0 }}>Billing period</h3>
            <p className="muted">
              {usageSummary
                ? usageSummary.periodStart + " to " + usageSummary.periodEnd
                : "Loading usage…"}
            </p>
            <p className="muted">
              {usageSummary?.remaining ?? "—"} included requests remaining
            </p>
          </div>
        </>
      )}
    </div>
  );
}
