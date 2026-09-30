import { useState } from "react";
import { PLANS, useAuth } from "../lib";
import BuyPlans from "../components/BuyPlans";

/* ---------- User page ---------- */
export default function UserPage() {
  const { user, buy: onBuy, update } = useAuth();
  const onSave = (name) => update({ name });
  const [name, setName] = useState(user.name);
  const [saved, setSaved] = useState(false);
  const plan = PLANS.find((p) => p.id === user.plan);
  return (
    <>
      <h2>Your account</h2>
      <p className="muted">Manage your details and subscription.</p>
      <div className="card" style={{ marginTop: 24, maxWidth: 480 }}>
        <label htmlFor="pn" style={{ marginTop: 0 }}>Full name</label>
        <input id="pn" value={name} onChange={(e) => { setName(e.target.value); setSaved(false); }} />
        <label htmlFor="pe">Email</label>
        <input id="pe" value={user.email} disabled />
        <div className="row" style={{ marginTop: 16 }}>
          <span>Member since</span><b>{new Date(user.joined).toLocaleDateString("en-IN")}</b>
        </div>
        <div className="row">
          <span>Plan</span>
          {plan ? <span className="badge ok">{plan.name} · ₹{plan.price}</span> : <span className="badge">No plan</span>}
        </div>
        <button className="btn" style={{ marginTop: 20 }} onClick={() => { onSave(name.trim() || user.name); setSaved(true); }}>
          Save changes
        </button>
        {saved && <span className="muted" style={{ marginLeft: 12 }}>Saved</span>}
      </div>
      <h3 style={{ marginTop: 36 }}>{plan ? "Change plan" : "Buy a plan"}</h3>
      <BuyPlans current={user.plan} onBuy={onBuy} />
    </>
  );
}

