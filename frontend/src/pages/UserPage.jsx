import { useEffect, useState } from "react";
import { getPlans } from "../api/billing";
import { useAuth } from "../context/useAuth";
import BuyPlans from "../components/BuyPlans";

export default function UserPage() {
  const { user, buy, update } = useAuth();
  const [name, setName] = useState(user.name || "");
  const [plans, setPlans] = useState([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    getPlans().then(setPlans).catch((err) => setError(err.message));
  }, []);
  async function saveName() {
    try {
      await update({ name });
      setSaved(true);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Could not save company name.");
    }
  }
  return <>
    <h2>Your account</h2>
    <p className="muted">Manage your company details and subscription.</p>
    <div className="card" style={{ marginTop: 24, maxWidth: 480 }}>
      <label htmlFor="company-name" style={{ marginTop: 0 }}>Company name</label>
      <input id="company-name" value={name} onChange={(e) => { setName(e.target.value); setSaved(false); }} />
      <label htmlFor="account-email">Email</label><input id="account-email" value={user.email} disabled />
      <div className="row" style={{ marginTop: 16 }}><span>Member since</span><b>{user.joined ? new Date(user.joined).toLocaleDateString("en-IN") : "—"}</b></div>
      {error && <div className="err" role="alert">{error}</div>}
      <button className="btn" style={{ marginTop: 20 }} onClick={saveName}>Save changes</button>
      {saved && <span className="muted" style={{ marginLeft: 12 }}>Saved</span>}
    </div>
    <h3 style={{ marginTop: 36 }}>{user.planId ? "Change plan" : "Choose a plan"}</h3>
    <BuyPlans plans={plans} current={user.planId} onBuy={buy} />
  </>;
}

