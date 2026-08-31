import { useState } from "react";
import { LayoutDashboard, Building2, Calendar, Settings, LogOut } from "lucide-react";
import TopNav from "../TopNav";
import AdminOverviewTab from "./AdminOverviewTab";
import FacilitiesTab from "./FacilitiesTab";
import ReservationsTab from "./ReservationsTab";
import SettingsTab from "../SettingsTab";
import type { User, AdminTab, Toast, Room } from "../../types";
import { getRoomsForFacility } from "../../facilityData";
import ToastContainer from "../Toast";

export default function AdminDashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [rooms, setRooms] = useState<Room[]>(() => getRoomsForFacility(user.facility));

  const addToast = (message: string, type: Toast["type"] = "success") =>
    setToasts((p) => [...p, { id: String(Date.now()), type, message }]);
  const removeToast = (id: string) => setToasts((p) => p.filter((t) => t.id !== id));

  const handleRoomBook = (timeSlot: string, department: string, gradeOrCourse: string, students: number) => {
    setRooms((prev) => {
      const firstAvail = prev.findIndex((r) => r.status === "Available");
      if (firstAvail === -1) return prev;
      return prev.map((r, i) =>
        i === firstAvail
          ? { ...r, status: "Occupied", timeSlot, department, gradeOrCourse, students }
          : r
      );
    });
    setActiveTab("facilities");
  };

  const navItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={16} />, id: "dashboard" },
    { label: "Facilities", icon: <Building2 size={16} />, id: "facilities" },
    { label: "Request Reservation", icon: <Calendar size={16} />, id: "reservations" },
    { label: "Settings", icon: <Settings size={16} />, id: "settings" },
    { label: "Logout", icon: <LogOut size={16} />, id: "logout" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f8fafa" }}>
      <TopNav
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as AdminTab)}
        onLogout={onLogout}
        user={user}
      />
      <main style={{ flex: 1, overflowY: "auto" }}>
        {activeTab === "dashboard" && <AdminOverviewTab user={user} rooms={rooms} />}
        {activeTab === "facilities" && <FacilitiesTab user={user} rooms={rooms} />}
        {activeTab === "reservations" && (
          <ReservationsTab user={user} addToast={addToast} onRoomBook={handleRoomBook} />
        )}
        {activeTab === "settings" && <SettingsTab user={user} addToast={addToast} />}
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
