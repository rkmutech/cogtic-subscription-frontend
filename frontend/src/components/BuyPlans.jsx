import { useState } from "react";

export default function BuyPlans({ plans, current, onBuy }) {
  const [pick, setPick] = useState(null);
  const [notice, setNotice] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function confirm() {
    setSaving(true);
    setError("");
    try {
      await onBuy(pick.id);
      setPick(null);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Could not update plan.",
      );
    } finally {
      setSaving(false);
    }
  }
  
  return (
    <>
      <div className="plans">
        {plans.map((plan) => (
          <div key={plan.id} className="card plan">
            <h3 style={{ margin: "8px 0 0" }}>{plan.name}</h3>
            <div className="price">
              ₹{plan.monthly_price}
              <small> /month</small>
            </div>
            <ul>
              <li>
                {formatIncludedRequests(
                  plan.includedRequests ?? plan.included_requests,
                )} included requests
              </li>
              <li>₹{plan.overage_rate} per extra request</li>
            </ul>
            {current === plan.id ? (
              <span className="badge ok">Your current plan</span>
            ) : (
              <button
                className="btn"
                onClick={() => {
                  setError("");
                  if (current != null) {
                    setNotice(true);
                    return;
                  }
                  setPick(plan);
                }}
              >
                Choose {plan.name}
              </button>
            )}
          </div>
        ))}
      </div>
      {error && (
        <div className="err" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="modal" role="presentation">
          <div
            className="card plan-notice-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-notice-title"
          >
            <h3 id="plan-notice-title" style={{ marginTop: 0 }}>
              You already have a plan
            </h3>
            <p className="muted">
              Sorry, you can’t buy another plan while your current plan is
              active. Your current plan will stay unchanged.
            </p>
            <button className="btn" onClick={() => setNotice(false)}>
              OK
            </button>
          </div>
        </div>
      )}
      {pick && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Confirm plan change</h3>
            <div className="row">
              <span>Plan</span>
              <b>{pick.name}</b>
            </div>
            <div className="row">
              <span>Monthly price</span>
              <b>₹{pick.monthly_price}</b>
            </div>
            <p className="muted" style={{ fontSize: 13 }}>
              This updates the plan on your Cogtic account.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" disabled={saving} onClick={confirm}>
                {saving ? "Saving…" : "Confirm plan"}
              </button>
              <button
                className="btn ghost"
                disabled={saving}
                onClick={() => setPick(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function formatIncludedRequests(value) {
  if (value === null || value === undefined || value === "") return "—";
  const count = Number(value);
  return Number.isFinite(count) ? count.toLocaleString() : "—";
}
