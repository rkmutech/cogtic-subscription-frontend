import { DB, PLANS, useAuth } from "../lib";

/* ---------- Admin dashboard ---------- */
export default function Admin() {
  const { refresh } = useAuth();
  const users = DB.users().filter((u) => u.role !== "admin");
  const all = users.flatMap((u) => (u.purchases || []).map((p) => ({ ...p, name: u.name, email: u.email })));
  const revenue = all.reduce((s, p) => s + p.amount, 0);
  const count = (id) => users.filter((u) => u.plan === id).length;
  const remove = (email) => {
    if (window.confirm("Delete this user? This cannot be undone.")) { DB.saveUsers(DB.users().filter((u) => u.email !== email)); refresh(); }
  };
  return (
    <>
      <h2>Admin dashboard</h2>
      <p className="muted">Users, plans and revenue across Cogtic.</p>
      <div className="stats">
        <div className="card"><span className="muted">Total users</span><b>{users.length}</b></div>
        <div className="card"><span className="muted">Revenue</span><b>₹{revenue}</b></div>
        {PLANS.map((p) => (
          <div className="card" key={p.id}><span className="muted">{p.name} ₹{p.price} users</span><b>{count(p.id)}</b></div>
        ))}
        <div className="card"><span className="muted">Without a plan</span><b>{users.filter((u) => !u.plan).length}</b></div>
      </div>
      <h3 style={{ marginTop: 28 }}>Plans</h3>
      <div className="plans">
        {PLANS.map((p) => (
          <div className="card plan" key={p.id}>
            <h3 style={{ margin: "8px 0 0" }}>{p.name}</h3>
            <div className="price">₹{p.price}<small> /month</small></div>
            <ul>{p.perks.map((x) => <li key={x}>{x}</li>)}</ul>
            <span className="badge ok">{count(p.id)} user{count(p.id) === 1 ? "" : "s"}</span>
          </div>
        ))}
      </div>
      <div className="card tw" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>Users</h3>
        {users.length === 0 ? <p className="muted">No users have registered yet.</p> : (
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Plan</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email}>
                  <td>{u.name}</td><td>{u.email}</td>
                  <td>{new Date(u.joined).toLocaleDateString("en-IN")}</td>
                  <td>
                    {u.plan ? (
                      <span className="badge ok">{PLANS.find((p) => p.id === u.plan)?.name} (₹{PLANS.find((p) => p.id === u.plan)?.price})</span>
                    ) : (
                      <span className="badge">No plan</span>
                    )}
                  </td>
                  <td><button className="btn sm danger" onClick={() => remove(u.email)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="card tw" style={{ marginTop: 20 }}>
        <h3 style={{ marginTop: 0 }}>Recent purchases</h3>
        {all.length === 0 ? <p className="muted">No purchases yet.</p> : (
          <table>
            <thead><tr><th>User</th><th>Plan</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody>
              {[...all].reverse().map((p, i) => (
                <tr key={i}><td>{p.name}</td><td>{p.plan}</td><td>₹{p.amount}</td><td>{new Date(p.date).toLocaleString("en-IN")}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

