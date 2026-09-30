import { useEffect, useState } from "react";
import * as authApi from "../api/auth";
import AuthContext from "./auth-context";

function normalizeUser(data) {
  return {
    id: data.id,
    email: data.email,
    role: data.role,
    name: data.name,
    tenantId: data.tenant_id,
    planId: data.plan_id,
    joined: data.created_at,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() =>
    Boolean(localStorage.getItem("token")),
  );

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    authApi
      .getCurrentUser()
      .then((data) => {
        const nextUser = normalizeUser(data);
        localStorage.setItem("user", JSON.stringify(nextUser));
        setUser(nextUser);
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const tokenData = await authApi.login(email, password);
    localStorage.setItem("token", tokenData.access_token);
    const nextUser = normalizeUser(await authApi.getCurrentUser());
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  }

  async function register(name, email, password) {
    await authApi.register({ name, email, password });
    return login(email, password);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  async function update(patch) {
    if (patch.name !== undefined) {
      const nextUser = normalizeUser(await authApi.updateName(patch.name));
      localStorage.setItem("user", JSON.stringify(nextUser));
      setUser(nextUser);
    }
  }
  
  async function buy(planId) {
    const nextUser = normalizeUser(await authApi.updatePlan(planId));
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, update, buy }}
    >
      {children}
    </AuthContext.Provider>
  );
}
