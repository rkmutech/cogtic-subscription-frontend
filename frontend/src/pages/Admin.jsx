import { useEffect, useState } from "react";
import {
  createPlan,
  deleteUser,
  getPlans,
  getUsers,
  updatePlanDetails,
} from "../api/billing";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState("");
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const [newPlan, setNewPlan] = useState({
    name: "",
    monthly_price: "",
    included_requests: "",
    overage_rate: "",
  });

  const [savingPlan, setSavingPlan] = useState(false);
  const [planMessage, setPlanMessage] = useState("");
  const [planToEdit, setPlanToEdit] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [savingPlanEdit, setSavingPlanEdit] = useState(false);

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
  const today = new Date();
  const dailySignups = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    const count = users.filter((user) => {
      if (!user.created_at) return false;
      const joined = new Date(user.created_at);
      return joined >= day && joined < nextDay;
    }).length;
    return {
      label: day.toLocaleDateString("en-IN", { weekday: "short" }),
      date: day.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      count,
    };
  });
  
  const weeklySignups = dailySignups.reduce((sum, day) => sum + day.count, 0);
  const assignedUsers = users.filter((user) => user.plan_id != null).length;
  const maxDailySignups = Math.max(1, ...dailySignups.map((day) => day.count));
  const recentUsers = [...users].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
  );

  async function removeUser() {
    if (!userToDelete || deleteConfirmation !== "YES") return;
    setError("");
    setDeletingUserId(userToDelete.id);
    try {
      await deleteUser(userToDelete.id);
      setUsers((current) =>
        current.filter((item) => item.id !== userToDelete.id),
      );
      setUserToDelete(null);
      setDeleteConfirmation("");
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Could not delete user.",
      );
    } finally {
      setDeletingUserId(null);
    }
  }

  async function addPlan(event) {
    event.preventDefault();
    setError("");
    setPlanMessage("");
    setSavingPlan(true);
    try {
      const created = await createPlan({
        name: newPlan.name.trim(),
        monthly_price: Number(newPlan.monthly_price),
        included_requests: Number(newPlan.included_requests),
        overage_rate: Number(newPlan.overage_rate),
      });
      setPlans((current) => [...current, created]);
      setNewPlan({
        name: "",
        monthly_price: "",
        included_requests: "",
        overage_rate: "",
      });
      setPlanMessage(`${created.name} plan added.`);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Could not create plan.",
      );
    } finally {
      setSavingPlan(false);
    }
  }

  async function savePlanEdit(event) {
    event.preventDefault();
    if (!planToEdit || !editDraft) return;
    setError("");
    setSavingPlanEdit(true);
    try {
      const updated = await updatePlanDetails(planToEdit.id, {
        name: editDraft.name.trim(),
        monthly_price: Number(editDraft.monthly_price),
        included_requests: Number(editDraft.included_requests),
        overage_rate: Number(editDraft.overage_rate),
      });
      setPlans((current) =>
        current.map((plan) => (plan.id === planToEdit.id ? updated : plan)),
      );
      setPlanToEdit(null);
      setEditDraft(null);
      setPlanMessage(`${updated.name} plan updated.`);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Could not update plan.",
      );
    } finally {
      setSavingPlanEdit(false);
    }
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">COGTIC OVERVIEW</span>
          <h2>Admin dashboard</h2>
          <p className="muted">A clear view of your users and weekly growth.</p>
        </div>
        <div className="admin-date">
          {today.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </header>

      {error && (
        <div className="err" role="alert">
          {error}
        </div>
      )}

      <section className="admin-metrics" aria-label="Account summary">
        <article className="admin-metric metric-purple">
          <span>Total users</span>
          <strong>{users.length.toLocaleString("en-IN")}</strong>
          <small>Registered accounts</small>
        </article>
        <article className="admin-metric metric-blue">
          <span>New this week</span>
          <strong>{weeklySignups.toLocaleString("en-IN")}</strong>
          <small>Signups in the last 7 days</small>
        </article>
        <article className="admin-metric metric-teal">
          <span>On a plan</span>
          <strong>{assignedUsers.toLocaleString("en-IN")}</strong>
          <small>Users with a subscription</small>
        </article>
        <article className="admin-metric metric-orange">
          <span>Available plans</span>
          <strong>{plans.length.toLocaleString("en-IN")}</strong>
          <small>Plans offered</small>
        </article>
      </section>

      <section className="admin-content-grid">
        <article className="admin-panel weekly-panel">
          <div className="admin-panel-heading">
            <div>
              <span className="admin-eyebrow">WEEKLY REPORT</span>
              <h3>New user signups</h3>
            </div>
            <span className="admin-period">Last 7 days</span>
          </div>
          <div
            className="signup-chart"
            role="img"
            aria-label={`Daily signups for the last 7 days: ${weeklySignups} total`}
          >
            {dailySignups.map((day) => (
              <div className="signup-day" key={day.date}>
                <span className="signup-count">{day.count}</span>
                <div className="signup-bar-track">
                  <div
                    className="signup-bar"
                    style={{
                      height: day.count
                        ? `${Math.max(8, (day.count / maxDailySignups) * 100)}%`
                        : "0%",
                    }}
                  />
                </div>
                <span className="signup-label">{day.label}</span>
                <small>{day.date}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel plans-panel">
          <div className="admin-panel-heading">
            <div>
              <span className="admin-eyebrow">SUBSCRIPTIONS</span>
              <h3>Plan distribution</h3>
            </div>
          </div>
          {plans.length === 0 ? (
            <p className="muted">No plans available.</p>
          ) : (
            <div className="plan-distribution">
              {plans.map((plan, index) => {
                const subscribers = users.filter(
                  (user) => user.plan_id === plan.id,
                ).length;
                const percentage = users.length
                  ? Math.round((subscribers / users.length) * 100)
                  : 0;
                return (
                  <div className="distribution-item" key={plan.id}>
                    <div className="distribution-label">
                      <span>
                        <i className={`plan-dot plan-dot-${index % 4}`} />
                        {plan.name}
                      </span>
                      <b>{subscribers}</b>
                    </div>
                    <div className="distribution-track">
                      <div
                        className={`distribution-fill plan-fill-${index % 4}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="distribution-footnote">
                {users.length - assignedUsers} users without a plan
              </div>
            </div>
          )}
        </article>
      </section>

      <section className="admin-plan-layout">
        <article className="admin-panel plan-catalog-panel">
          <div className="admin-panel-heading">
            <div>
              <span className="admin-eyebrow">PLAN DETAILS</span>
              <h3>Available plans</h3>
            </div>
            <span className="admin-period">{plans.length} plans</span>
          </div>
          {plans.length === 0 ? (
            <p className="muted">No plans have been added yet.</p>
          ) : (
            <div className="plan-catalog">
              {plans.map((plan, index) => (
                <div className="catalog-plan" key={plan.id}>
                  <div className="catalog-plan-heading">
                    <i className={`plan-dot plan-dot-${index % 4}`} />
                    <b>{plan.name}</b>
                  </div>
                  <strong>
                    ₹{Number(plan.monthly_price).toLocaleString("en-IN")}
                    <small> / month</small>
                  </strong>
                  <span>
                    {Number(
                      plan.included_requests ?? plan.includedRequests ?? 0,
                    ).toLocaleString("en-IN")}{" "}
                    included requests
                  </span>
                  <span>₹{plan.overage_rate} per extra request</span>
                  <button
                    className="btn sm plan-edit-button"
                    onClick={() => {
                      setPlanToEdit(plan);
                      setEditDraft({
                        name: plan.name,
                        monthly_price: String(plan.monthly_price),
                        included_requests: String(
                          plan.included_requests ?? plan.includedRequests ?? 0,
                        ),
                        overage_rate: String(plan.overage_rate),
                      });
                      setError("");
                    }}
                  >
                    Edit plan
                  </button>
                </div>
              ))}
            </div>
          )}
        </article>

        <form className="admin-panel new-plan-form" onSubmit={addPlan}>
          <span className="admin-eyebrow">GROW YOUR OFFER</span>
          <h3>Introduce a new plan</h3>
          <p className="muted">Create a plan and make it available to users.</p>
          <label htmlFor="new-plan-name">Plan name</label>
          <input
            id="new-plan-name"
            value={newPlan.name}
            onChange={(event) =>
              setNewPlan({ ...newPlan, name: event.target.value })
            }
            maxLength={50}
            required
          />
          <label htmlFor="new-plan-price">Monthly price (₹)</label>
          <input
            id="new-plan-price"
            type="number"
            min="0"
            step="0.01"
            value={newPlan.monthly_price}
            onChange={(event) =>
              setNewPlan({ ...newPlan, monthly_price: event.target.value })
            }
            required
          />
          <label htmlFor="new-plan-requests">Included requests</label>
          <input
            id="new-plan-requests"
            type="number"
            min="0"
            step="1"
            value={newPlan.included_requests}
            onChange={(event) =>
              setNewPlan({ ...newPlan, included_requests: event.target.value })
            }
            required
          />
          <label htmlFor="new-plan-overage">Overage per request (₹)</label>
          <input
            id="new-plan-overage"
            type="number"
            min="0"
            step="0.0001"
            value={newPlan.overage_rate}
            onChange={(event) =>
              setNewPlan({ ...newPlan, overage_rate: event.target.value })
            }
            required
          />
          {planMessage && (
            <p className="plan-success" role="status">
              {planMessage}
            </p>
          )}
          <button className="btn" type="submit" disabled={savingPlan}>
            {savingPlan ? "Adding plan…" : "Add plan"}
          </button>
        </form>
      </section>

      {planToEdit && editDraft && (
        <div className="modal" role="presentation">
          <form
            className="card plan-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-plan-title"
            onSubmit={savePlanEdit}
          >
            <span className="admin-eyebrow">PLAN SETTINGS</span>
            <h3 id="edit-plan-title">Edit {planToEdit.name}</h3>
            <label htmlFor="edit-plan-name">Plan name</label>
            <input
              id="edit-plan-name"
              value={editDraft.name}
              onChange={(event) =>
                setEditDraft({ ...editDraft, name: event.target.value })
              }
              maxLength={50}
              required
            />
            <label htmlFor="edit-plan-price">Monthly price (₹)</label>
            <input
              id="edit-plan-price"
              type="number"
              min="0"
              step="0.01"
              value={editDraft.monthly_price}
              onChange={(event) =>
                setEditDraft({
                  ...editDraft,
                  monthly_price: event.target.value,
                })
              }
              required
            />
            <label htmlFor="edit-plan-requests">Included requests</label>
            <input
              id="edit-plan-requests"
              type="number"
              min="0"
              step="1"
              value={editDraft.included_requests}
              onChange={(event) =>
                setEditDraft({
                  ...editDraft,
                  included_requests: event.target.value,
                })
              }
              required
            />
            <label htmlFor="edit-plan-overage">Overage per request (₹)</label>
            <input
              id="edit-plan-overage"
              type="number"
              min="0"
              step="0.0001"
              value={editDraft.overage_rate}
              onChange={(event) =>
                setEditDraft({ ...editDraft, overage_rate: event.target.value })
              }
              required
            />
            {error && (
              <div className="err" role="alert">
                {error}
              </div>
            )}
            <div className="plan-edit-actions">
              <button className="btn" type="submit" disabled={savingPlanEdit}>
                {savingPlanEdit ? "Saving…" : "Save changes"}
              </button>
              <button
                className="btn ghost"
                type="button"
                disabled={savingPlanEdit}
                onClick={() => {
                  setPlanToEdit(null);
                  setEditDraft(null);
                  setError("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <section className="admin-panel recent-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="admin-eyebrow">LATEST ACTIVITY</span>
            <h3>User management</h3>
          </div>
          <span className="admin-period">{users.length} total</span>
        </div>
        {recentUsers.length === 0 ? (
          <p className="muted">No users have registered yet.</p>
        ) : (
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Plan</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>{user.name || "—"}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td>{planName(user.plan_id)}</td>
                    <td>
                      <button
                        className="btn sm danger"
                        onClick={() => {
                          setUserToDelete(user);
                          setDeleteConfirmation("");
                          setError("");
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {userToDelete && (
        <div className="modal" role="presentation">
          <div
            className="card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
          >
            <h3 id="delete-user-title" style={{ marginTop: 0 }}>
              Delete user account?
            </h3>
            <p>
              This will permanently delete the account for:
              <br />
              <b>{userToDelete.name || userToDelete.email}</b>
              {userToDelete.name && <span> ({userToDelete.email})</span>}
            </p>
            <p className="muted">Type YES to confirm this action.</p>
            <label htmlFor="delete-confirmation">Confirmation</label>
            <input
              id="delete-confirmation"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              autoComplete="off"
              autoFocus
            />
            {error && (
              <div className="err" role="alert">
                {error}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                className="btn danger"
                disabled={
                  deleteConfirmation !== "YES" || deletingUserId !== null
                }
                onClick={removeUser}
              >
                {deletingUserId === userToDelete.id
                  ? "Deleting…"
                  : "Yes, delete user"}
              </button>
              <button
                className="btn ghost"
                disabled={deletingUserId !== null}
                onClick={() => {
                  setUserToDelete(null);
                  setDeleteConfirmation("");
                  setError("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
