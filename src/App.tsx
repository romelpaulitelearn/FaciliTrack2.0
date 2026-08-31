import { useState } from "react";
import LoginScreen from "./components/LoginScreen";
import SuperadminDashboard from "./components/superadmin/SuperadminDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import type { User } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  if (!user) return <LoginScreen onLogin={setUser} />;
  if (user.role === "superadmin") return <SuperadminDashboard user={user} onLogout={() => setUser(null)} />;
  return <AdminDashboard user={user} onLogout={() => setUser(null)} />;
}
