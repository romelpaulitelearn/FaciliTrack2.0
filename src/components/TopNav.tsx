import { useState } from "react";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import facilitrackLogo from "@/imports/FACILITRACK_LOGO_copy.png";
import type { User } from "../types";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  id: string;
}

interface TopNavProps {
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  user: User;
}

export default function TopNav({ navItems, activeTab, onTabChange, onLogout, user }: TopNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mainItems = navItems.slice(0, -1);
  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <header style={{
        background: "white",
        borderBottom: "0.5px solid #e0e0e0",
        height: 60,
        display: "flex",
        alignItems: "center",
        paddingInline: 24,
        gap: 32,
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}>
        {/* Logo */}
        <img
          src={facilitrackLogo}
          alt="FaciliTrack"
          style={{ height: 32, width: "auto", objectFit: "contain", borderRadius: 4, flexShrink: 0 }}
        />

        {/* Nav links — desktop */}
        <nav className="hidden md:flex" style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
          {mainItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px",
                  border: "none",
                  borderBottom: active ? "2px solid #2D7A4F" : "2px solid transparent",
                  background: "transparent",
                  color: active ? "#2D7A4F" : "#2C3E50",
                  fontWeight: active ? 600 : 400,
                  fontSize: 13,
                  cursor: "pointer",
                  borderRadius: "4px 4px 0 0",
                  transition: "all 0.12s",
                  height: 60,
                  marginBottom: -1,
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.color = "#2D7A4F";
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.color = "#2C3E50";
                }}
              >
                <span style={{ display: "flex", color: active ? "#2D7A4F" : "#7F8C8D" }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right side */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {/* Role badge */}
          {user.role === "admin" && user.facility && (
            <span
              className="hidden lg:block"
              style={{
                fontSize: 11, fontWeight: 600,
                color: "#2D7A4F", background: "#F0F7F0",
                padding: "4px 10px", borderRadius: 20,
                border: "0.5px solid #2D7A4F",
              }}
            >
              ADMIN — {user.facility.toUpperCase()}
            </span>
          )}

          {/* User info */}
          <div className="hidden sm:flex" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "#1B4D3E", color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 600, flexShrink: 0,
            }}>
              {initials}
            </div>
            <span className="hidden lg:block" style={{ fontSize: 13, fontWeight: 500, color: "#2C3E50" }}>
              {user.name}
            </span>
          </div>

          {/* Logout button — styled like "Get started" pill */}
          <button
            onClick={onLogout}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px",
              background: "#2D7A4F", color: "white",
              border: "none", borderRadius: 20,
              fontSize: 13, fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.12s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1B4D3E"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#2D7A4F"; }}
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Logout</span>
          </button>

          {/* Mobile hamburger */}
          <button
            className="flex md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#7F8C8D", padding: 4, display: "flex" }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="md:hidden"
          style={{
            position: "fixed", top: 60, left: 0, right: 0, zIndex: 39,
            background: "white", borderBottom: "0.5px solid #e0e0e0",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            padding: "8px 16px 16px",
          }}
        >
          {mainItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onTabChange(item.id); setMobileOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", padding: "12px 12px",
                  border: "none", borderRadius: 8,
                  background: active ? "#F0F7F0" : "transparent",
                  color: active ? "#2D7A4F" : "#2C3E50",
                  fontWeight: active ? 600 : 400,
                  fontSize: 13, cursor: "pointer",
                  textAlign: "left",
                  borderLeft: active ? "3px solid #2D7A4F" : "3px solid transparent",
                }}
              >
                <span style={{ color: active ? "#2D7A4F" : "#7F8C8D", display: "flex" }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
          <div style={{ borderTop: "0.5px solid #e0e0e0", marginTop: 8, paddingTop: 8 }}>
            <button
              onClick={() => { onLogout(); setMobileOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "12px 12px",
                border: "none", borderRadius: 8,
                background: "transparent", color: "#E74C3C",
                fontSize: 13, cursor: "pointer", textAlign: "left",
              }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}
