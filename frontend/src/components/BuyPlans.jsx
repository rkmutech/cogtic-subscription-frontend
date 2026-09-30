import { useState } from "react";
import { PLANS } from "../lib";

/* ---------- Buy plan UI ---------- */
export default function BuyPlans({ current, onBuy }) {
  const [pick, setPick] = useState(null);
  return (
    <>
      <div className="plans">
        {PLANS.map((p) => (
          <div key={p.id} className={`card plan ${p.id === "pro" ? "best" : ""}`}>
            {p.id === "pro" && <span className="badge">Best value</span>}
            <h3 style={{ margin: "8px 0 0" }}>{p.name}</h3>
            <div className="price">₹{p.price}<small> /month</small></div>
            <ul>{p.perks.map((x) => <li key={x}>{x}</li>)}</ul>
            {current === p.id ? (
              <span className="badge ok">Your current plan</span>
            ) : (
              <button className="btn" onClick={() => setPick(p)}>Buy {p.name} for ₹{p.price}</button>
            )}
          </div>
        ))}
      </div>
      {pick && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Confirm purchase</h3>
            <div className="row"><span>Plan</span><b>{pick.name}</b></div>
            <div className="row"><span>Amount</span><b>₹{pick.price}</b></div>
            <p className="muted" style={{ fontSize: 13 }}>
              Demo checkout. Connect Razorpay or another payment gateway here before going live.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" onClick={() => { onBuy(pick.id); setPick(null); }}>Pay ₹{pick.price}</button>
              <button className="btn ghost" onClick={() => setPick(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

