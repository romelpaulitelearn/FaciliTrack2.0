import facilitrackLogo from "@/imports/FACILITRACK_LOGO_copy.png";
import { X } from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  id: string;
}

interface SidebarProps {
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ navItems, activeTab, onTabChange, onLogout, isOpen, onClose }: SidebarProps) {
  const mainItems = navItems.slice(0, -1);
  const logoutItem = navItems[navItems.length - 1];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 30 }}
          className="lg:hidden"
        />
      )}

      <aside
        style={{
          width: 220,
          background: "white",
          borderRight: "0.5px solid #e0e0e0",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          zIndex: 40,
        }}
        className={`fixed lg:static inset-y-0 left-0 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div style={{ padding: "20px 16px 16px", borderBottom: "0.5px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img
            src={facilitrackLogo}
            alt="FaciliTrack – Real-Time Facility Reservation"
            style={{ height: 36, width: "auto", objectFit: "contain", borderRadius: 4 }}
          />
          <button
            onClick={onClose}
            className="lg:hidden"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#7F8C8D", padding: 2, display: "flex", flexShrink: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, padding: "12px 12px" }}>
          {mainItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onTabChange(item.id); onClose(); }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: "none",
                  borderLeft: active ? "3px solid #2D7A4F" : "3px solid transparent",
                  background: active ? "#F0F7F0" : "transparent",
                  color: active ? "#2C3E50" : "#7F8C8D",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: active ? 500 : 400,
                  textAlign: "left",
                  width: "100%",
                  transition: "all 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.background = "#F8FAFA";
                    (e.currentTarget as HTMLButtonElement).style.color = "#2C3E50";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = "#7F8C8D";
                  }
                }}
              >
                <span style={{ color: active ? "#2D7A4F" : "inherit", display: "flex" }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: "0 12px 16px", borderTop: "0.5px solid #e0e0e0" }}>
          <button
            onClick={onLogout}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", marginTop: 8,
              borderRadius: 6, border: "none",
              background: "transparent",
              color: "#E74C3C",
              cursor: "pointer",
              fontSize: 13,
              width: "100%",
              textAlign: "left",
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FEF2F2"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <span style={{ display: "flex" }}>{logoutItem.icon}</span>
            {logoutItem.label}
          </button>
        </div>
      </aside>
    </>
  );
}
