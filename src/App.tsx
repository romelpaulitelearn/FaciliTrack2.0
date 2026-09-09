import { useState } from "react";
import LoginScreen from "./components/LoginScreen";
import SuperadminDashboard from "./components/superadmin/SuperadminDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import RequesterDashboard from "./components/requester/RequesterDashboard";
import PublicReservation from "./components/PublicReservation";
import type { User } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  // Public student reservation page.
  // This page does not require login.
  if (
    window.location.pathname === "/reserve" ||
    window.location.pathname === "/reserve/"
  ) {
    return <PublicReservation />;
  }

  if (!user) return <LoginScreen onLogin={setUser} />;

  if (user.role === "superadmin") {
    return (
      <SuperadminDashboard
        user={user}
        onLogout={() => setUser(null)}
      />
    );
  }

  if (user.role === "requester") {
    return (
      <RequesterDashboard
        user={user}
        onLogout={() => setUser(null)}
      />
    );
  }

  return (
    <AdminDashboard
      user={user}
      onLogout={() => setUser(null)}
    />
  );
}