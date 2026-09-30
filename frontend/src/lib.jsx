import { createContext, useContext, useState } from "react";

export const PLANS = [
  { id: "starter", name: "Starter", price: 100, perks: ["1 project", "Basic reports", "Email support"] },
  { id: "pro", name: "Pro", price: 1000, perks: ["Unlimited projects", "Advanced analytics", "Priority support", "Team access"] },
  { id: "business", name: "Business", price: 2000, perks: ["Everything in Pro", "Dedicated account manager", "Custom integrations", "SLA & phone support"] },
];

// Fake backend using localStorage. Replace with real API calls.
export const DB = {
  users: () => {
    const list = JSON.parse(localStorage.getItem("cogtic_users") || "[]");
    if (!list.some((u) => u.role === "admin")) {
      list.unshift({ name: "Cogtic Admin", email: "admin@cogtic.com", password: "admin123", role: "admin", plan: null, purchases: [], joined: new Date().toISOString() });
      localStorage.setItem("cogtic_users", JSON.stringify(list));
    }
    return list;
  },
  saveUsers: (u) => localStorage.setItem("cogtic_users", JSON.stringify(u)),
  session: () => localStorage.getItem("cogtic_session"),
  setSession: (e) => (e ? localStorage.setItem("cogtic_session", e) : localStorage.removeItem("cogtic_session")),
};

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [email, setEmail] = useState(DB.session());
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);
  const user = DB.users().find((u) => u.email === email) || null;

  const update = (patch) => {
    DB.saveUsers(DB.users().map((u) => (u.email === email ? { ...u, ...patch } : u)));
    refresh();
  };
  const buy = (id) => {
    const p = PLANS.find((x) => x.id === id);
    update({ plan: id, purchases: [...(user.purchases || []), { plan: id, amount: p.price, date: new Date().toISOString() }] });
  };
  const login = (mail, pw) => {
    const em = mail.trim().toLowerCase();
    if (!DB.users().find((u) => u.email === em && u.password === pw)) return "Email or password is incorrect.";
    DB.setSession(em); setEmail(em); return null;
  };
  const register = (name, mail, pw) => {
    const em = mail.trim().toLowerCase();
    if (!name.trim()) return "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(em)) return "Enter a valid email address.";
    if (pw.length < 6) return "Password must be at least 6 characters.";
    const users = DB.users();
    if (users.some((u) => u.email === em)) return "This email is already registered. Log in instead.";
    DB.saveUsers([...users, { name: name.trim(), email: em, password: pw, role: "user", plan: null, purchases: [], joined: new Date().toISOString() }]);
    DB.setSession(em); setEmail(em); return null;
  };
  const logout = () => { DB.setSession(null); setEmail(null); };

  return <Ctx.Provider value={{ user, update, buy, login, register, logout, refresh }}>{children}</Ctx.Provider>;
}
