import { Menu } from "lucide-react";
import type { User } from "../types";

interface HeaderProps {
  user: User;
  onMenuToggle: () => void;
}

export default function Header({ user, onMenuToggle }: HeaderProps) {
  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={{
      background: "white",
      borderBottom: "0.5px solid #e0e0e0",
      padding: "20px 32px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onMenuToggle}
          className="lg:hidden"
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#7F8C8D", padding: 4, display: "flex",
          }}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>
          Welcome, {user.name}
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user.role === "admin" && user.facility && (
          <span
            className="hidden sm:block"
            style={{
              background: "#2D7A4F", color: "white",
              padding: "6px 12px", borderRadius: 20,
              fontSize: 12, fontWeight: 500,
            }}
          >
            ADMIN — {user.facility.toUpperCase()}
          </span>
        )}
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "#2D7A4F", color: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 500, fontSize: 12,
        }}>
          {initials}
        </div>
      </div>
    </div>
  );
}
