import client from "./client";

export async function getPlans() {
  const res = await client.get("/plans");
  return res.data;
}

export async function createPlan(plan) {
  const res = await client.post("/plans", plan);
  return res.data;
}

export async function updatePlanDetails(planId, plan) {
  const res = await client.patch(`/plans/${encodeURIComponent(planId)}`, plan);
  return res.data;
}

export async function getMyUsageSummary(tenantId) {
  const res = await client.get("/tenants/" + tenantId + "/usage-summary");
  return res.data;
}

export async function getUsers() {
  const res = await client.get("/admin/users");
  return res.data;
}

export async function deleteUser(userId) {
  const res = await client.delete(`/admin/users/${encodeURIComponent(userId)}`);
  return res.data;
}
