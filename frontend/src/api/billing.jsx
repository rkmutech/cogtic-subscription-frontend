import client from "./client";
export async function getPlans() {
  const res = await client.get("/plans");
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
