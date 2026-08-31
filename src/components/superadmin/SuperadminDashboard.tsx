import { useState } from "react";
import { LayoutDashboard, Users, Settings, LogOut } from "lucide-react";
import TopNav from "../TopNav";
import OverviewTab from "./OverviewTab";
import ManageAdminTab from "./ManageAdminTab";
import SettingsTab from "../SettingsTab";
import type { User, SuperadminTab, Toast } from "../../types";
import ToastContainer from "../Toast";

export default function SuperadminDashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<SuperadminTab>("dashboard");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast["type"] = "success") =>
    setToasts((p) => [...p, { id: String(Date.now()), type, message }]);
  const removeToast = (id: string) => setToasts((p) => p.filter((t) => t.id !== id));

  const navItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={16} />, id: "dashboard" },
    { label: "Manage Admin", icon: <Users size={16} />, id: "manage-admin" },
    { label: "Settings", icon: <Settings size={16} />, id: "settings" },
    { label: "Logout", icon: <LogOut size={16} />, id: "logout" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f8fafa" }}>
      <TopNav
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as SuperadminTab)}
        onLogout={onLogout}
        user={user}
      />
      <main style={{ flex: 1, overflowY: "auto" }}>
        {activeTab === "dashboard" && <OverviewTab />}
        {activeTab === "manage-admin" && <ManageAdminTab />}
        {activeTab === "settings" && <SettingsTab user={user} addToast={addToast} />}
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
