import client from "./client";

export async function register({ email, password, name }) {
  const res = await client.post("/user/register", { email, password, name });
  return res.data;
}
export async function login(email, password) {
  const body = new URLSearchParams({ username: email, password });
  const res = await client.post("/auth/login", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return res.data;
}
export async function getCurrentUser() {
  const res = await client.get("/user/me");
  return res.data;
}
export async function updateName(name) {
  const res = await client.patch("/user/me", { name });
  return res.data;
}
export async function updatePlan(planId) {
  const res = await client.patch("/user/me/plan", { plan_id: planId });
  return res.data;
}
