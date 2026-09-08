import { useState } from "react";
import { Eye, EyeOff, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import type { User as UserType } from "../types";

const API_BASE_URL = (import.meta.env.VITE_API_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:8443")).replace(/\/$/, "");

interface SettingsTabProps {
  user: UserType;
  addToast: (msg: string, type?: "success" | "error" | "info") => void;
}

const FAQ_ITEMS = [
  { q: "How do I approve a reservation request?", a: "Go to Request Reservation tab, expand a pending request, then click Approve. The room will automatically be marked as Occupied." },
  { q: "How do I update a room's status?", a: "Room status updates automatically when a reservation is accepted or declined. Manual overrides are available to the Superadmin." },
  { q: "What happens after 3 failed login attempts?", a: "The account is temporarily locked for 5 minutes. Contact your Superadmin to reset if needed." },
  { q: "How do I change my assigned facility?", a: "Facility assignments are managed by the Superadmin. Contact them to update your assignment." },
  { q: "Can I cancel an accepted reservation?", a: "Yes — contact the Superadmin or the accountability person. The system will then revert the room to Available." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "0.5px solid #e0e0e0" }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#2C3E50" }}>{q}</span>
        {open ? <ChevronUp size={14} color="#7F8C8D" /> : <ChevronDown size={14} color="#7F8C8D" />}
      </button>
      {open && (
        <p className="fade-in" style={{ margin: "0 0 12px", fontSize: 13, color: "#7F8C8D", lineHeight: 1.6 }}>{a}</p>
      )}
    </div>
  );
}

export default function SettingsTab({ user, addToast }: SettingsTabProps) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [textSize, setTextSize] = useState(14);

  const handlePwUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) { addToast("Passwords do not match.", "error"); return; }
    if (newPw.length < 6) { addToast("Password must be at least 6 characters.", "error"); return; }
    try {
      const response = await fetch(`${API_BASE_URL}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, currentPassword: currentPw, newPassword: newPw }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail || "Unable to update password.");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      addToast(result.message || "Password updated successfully.", "success");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to update password.", "error");
    }
  };

  const roleLabel = user.role === "superadmin" ? "Super Admin" : user.role === "requester" ? "Student" : `${user.facility} Admin`;

  const inputStyle: React.CSSProperties = {
    flex: 1, padding: "9px 0", border: "none", fontSize: 13,
    outline: "none", background: "transparent", color: "#2C3E50",
  };

  return (
    <div className="fade-in" style={{ padding: 32, maxWidth: 620 }}>
      <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1B4D3E", margin: "0 0 24px" }}>Settings</h2>

      {/* About */}
      <div style={{ background: "#F0F7F0", border: "0.5px solid #e0e0e0", borderRadius: 8, padding: 20, marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#7F8C8D", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.04em" }}>About</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1B4D3E", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 14, flexShrink: 0 }}>
            {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{user.name}</p>
            <p style={{ margin: "2px 0 0", color: "#7F8C8D", fontSize: 12 }}>{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div style={{ background: "white", border: "0.5px solid #e0e0e0", borderRadius: 8, padding: 20, marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#7F8C8D", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Change Password</p>
        <form onSubmit={handlePwUpdate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Current Password", val: currentPw, set: setCurrentPw },
            { label: "New Password", val: newPw, set: setNewPw },
            { label: "Confirm New Password", val: confirmPw, set: setConfirmPw },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#2C3E50", marginBottom: 5 }}>{label}</label>
              <div style={{ display: "flex", alignItems: "center", border: "0.5px solid #e0e0e0", borderRadius: 6, padding: "0 12px", background: "white" }}>
                <input type={showPw ? "text" : "password"} value={val} onChange={(e) => set(e.target.value)}
                  placeholder="••••••••" required style={inputStyle} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#7F8C8D", display: "flex", padding: 2 }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}
          <button type="submit"
            style={{ alignSelf: "flex-start", padding: "9px 20px", background: "#2D7A4F", color: "white", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer", marginTop: 4 }}>
            Update Password
          </button>
        </form>
      </div>

      {/* Text Size — slider */}
      <div style={{ background: "white", border: "0.5px solid #e0e0e0", borderRadius: 8, padding: 20, marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#7F8C8D", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Text Size</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <span style={{ fontSize: 11, color: "#7F8C8D", width: 28 }}>A</span>
          <input
            type="range" min={12} max={18} step={1} value={textSize}
            onChange={(e) => setTextSize(Number(e.target.value))}
            style={{ flex: 1, accentColor: "#2D7A4F", cursor: "pointer" }}
          />
          <span style={{ fontSize: 18, color: "#7F8C8D", width: 28, textAlign: "right" }}>A</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#2D7A4F", background: "#F0F7F0", padding: "3px 8px", borderRadius: 6, minWidth: 34, textAlign: "center" }}>
            {textSize}px
          </span>
        </div>
        <div style={{ padding: "12px 14px", background: "#F8FAFA", border: "0.5px solid #e0e0e0", borderRadius: 6 }}>
          <p style={{ margin: 0, fontSize: textSize, color: "#2C3E50", lineHeight: 1.5, transition: "font-size 0.15s" }}>
            Preview: The quick brown fox jumps over the lazy dog. FaciliTrack manages rooms efficiently.
          </p>
        </div>
      </div>

      {/* Help / FAQ */}
      <div style={{ background: "white", border: "0.5px solid #e0e0e0", borderRadius: 8, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <HelpCircle size={14} style={{ color: "#2D7A4F" }} />
          <p style={{ fontSize: 12, fontWeight: 600, color: "#7F8C8D", margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>Help & FAQ</p>
        </div>
        <div>
          {FAQ_ITEMS.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </div>
  );
}
