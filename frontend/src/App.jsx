import { BrowserRouter, Routes, Route, Navigate, NavLink, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UserPage from "./pages/UserPage";
import Admin from "./pages/Admin";

function Layout() {
  const { user, logout } = useAuth();
  const admin = user.role === "admin";
  return (
    <div className="app">
      <nav className="nav">
        <div className="logo">Cog<span>tic</span></div>
        {admin ? (
          <NavLink to="/admin">Admin dashboard</NavLink>
        ) : (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/user">My account</NavLink>
          </>
        )}
        <div className="sp" />
        <button onClick={logout}>Log out</button>
      </nav>
      <main className="main"><Outlet /></main>
    </div>
  );
}

// Only lets the right role in; everyone else is sent to the right place.
function Guard({ role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return <Layout />;
}

function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<Guard role="user" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/user" element={<UserPage />} />
          </Route>
          <Route element={<Guard role="admin" />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
