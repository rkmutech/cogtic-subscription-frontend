import { useEffect, useState } from "react";
import { getPlans, getUsers } from "../api/billing";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getUsers(), getPlans()])
      .then(([registeredUsers, availablePlans]) => {
        setUsers(registeredUsers.filter((user) => user.role !== "admin"));
        setPlans(availablePlans);
      })
      .catch((err) =>
        setError(
          err.response?.data?.detail ||
            err.message ||
            "Could not load admin data.",
        ),
      );
  }, []);

  const planName = (planId) =>
    plans.find((plan) => plan.id === planId)?.name || "No plan";
  return (
    <>
      <h2>Admin dashboard</h2>
      <p className="muted">Users and plans from the Cogtic backend.</p>
      {error && (
        <div className="err" role="alert">
          {error}
        </div>
      )}
      <div className="stats">
        <div className="card">
          <span className="muted">Registered users</span>
          <b>{users.length}</b>
        </div>
        {plans.map((plan) => (
          <div className="card" key={plan.id}>
            <span className="muted">{plan.name} subscribers</span>
            <b>{users.filter((user) => user.plan_id === plan.id).length}</b>
          </div>
        ))}
      </div>
      <div className="card tw" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>Users</h3>
        {users.length === 0 ? (
          <p className="muted">No users have registered yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Plan</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name || "—"}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-IN")
                      : "—"}
                  </td>
                  <td>{planName(user.plan_id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
