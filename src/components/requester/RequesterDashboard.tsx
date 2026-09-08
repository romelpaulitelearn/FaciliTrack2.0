import { useState } from "react";
import { Calendar, LogOut, Settings } from "lucide-react";
import TopNav from "../TopNav";
import ReservationsTab from "../admin/ReservationsTab";
import SettingsTab from "../SettingsTab";
import type { RequesterTab, Toast, User } from "../../types";
import ToastContainer from "../Toast";

export default function RequesterDashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<RequesterTab>("reservations");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast["type"] = "success") =>
    setToasts((current) => [...current, { id: String(Date.now()), type, message }]);
  const removeToast = (id: string) => setToasts((current) => current.filter((toast) => toast.id !== id));

  const navItems = [
    { label: "Reserve Facility", icon: <Calendar size={16} />, id: "reservations" },
    { label: "Settings", icon: <Settings size={16} />, id: "settings" },
    { label: "Logout", icon: <LogOut size={16} />, id: "logout" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f8fafa" }}>
      <TopNav
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as RequesterTab)}
        onLogout={onLogout}
        user={user}
      />
      <main style={{ flex: 1, overflowY: "auto" }}>
        {activeTab === "reservations" && <ReservationsTab user={user} addToast={addToast} />}
        {activeTab === "settings" && <SettingsTab user={user} addToast={addToast} />}
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
