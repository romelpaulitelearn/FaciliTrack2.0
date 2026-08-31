import { Plus, Edit, Trash2 } from "lucide-react";
import { MOCK_ADMINS, WEEKLY_ADMINS, AUDIT_LOG } from "../../data";

const BAR_COLORS = ["#2D7A4F","#2D7A4F","#2D7A4F","#2D7A4F","#2D7A4F","#2D7A4F","#7BC043"];
const BAR_HEIGHTS = [40, 65, 50, 75, 55, 70, 80];

const ACTIVITY = [
  { icon: <Plus size={14} style={{ color: "#2D7A4F" }} />, iconBg: "#F0F7F0", title: "Created Admin", sub: "Jefferson Gabriel" },
  { icon: <Edit size={14} style={{ color: "#BA7517" }} />, iconBg: "#faf4f0", title: "Edited Facilities", sub: "Admin – Computer Lab" },
  { icon: <Trash2 size={14} style={{ color: "#A32D2D" }} />, iconBg: "#fcebeb", title: "Deleted Admin", sub: "Robert Chen" },
];

export default function OverviewTab() {
  const activeCount = MOCK_ADMINS.filter((a) => a.status === "Active").length;
  const inactiveCount = MOCK_ADMINS.filter((a) => a.status === "Inactive").length;

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1B4D3E", margin: "0 0 16px" }}>Overview</h2>
      </div>

      {/* 3-col cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}
        className="grid-cols-1 md:grid-cols-2 xl:grid-cols-3">

        {/* Card 1 — Admin Accounts */}
        <div style={{ background: "white", border: "0.5px solid #e0e0e0", borderRadius: 8, padding: 20, minHeight: 140 }}>
          <p style={{ fontSize: 12, color: "#7F8C8D", margin: "0 0 16px", fontWeight: 500 }}>Admin Accounts</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "#F0F7F0", padding: 16, borderRadius: 6, textAlign: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D7A4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><polyline points="16 11 18 13 22 9" />
              </svg>
              <p style={{ fontSize: 20, fontWeight: 500, color: "#1B4D3E", margin: 0 }}>{activeCount}</p>
              <p style={{ fontSize: 11, color: "#7F8C8D", margin: "4px 0 0" }}>Active</p>
            </div>
            <div style={{ background: "#f1f1f1", padding: 16, borderRadius: 6, textAlign: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888780" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><line x1="18" y1="8" x2="23" y2="13" /><line x1="23" y1="8" x2="18" y2="13" />
              </svg>
              <p style={{ fontSize: 20, fontWeight: 500, color: "#5F5E5A", margin: 0 }}>{inactiveCount}</p>
              <p style={{ fontSize: 11, color: "#7F8C8D", margin: "4px 0 0" }}>Inactive</p>
            </div>
          </div>
        </div>

        {/* Card 2 — Weekly Chart */}
        <div style={{ background: "white", border: "0.5px solid #e0e0e0", borderRadius: 8, padding: 20 }}>
          <p style={{ fontSize: 12, color: "#7F8C8D", margin: "0 0 16px", fontWeight: 500 }}>Active Admins Last 7 Days</p>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", height: 100 }}>
            {WEEKLY_ADMINS.map((d, i) => (
              <div key={d.day} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: 20, height: BAR_HEIGHTS[i], background: BAR_COLORS[i], borderRadius: 3 }} />
                <span style={{ fontSize: 10, color: "#7F8C8D" }}>{d.day.slice(0, 1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3 — Recent Activity */}
        <div style={{ background: "white", border: "0.5px solid #e0e0e0", borderRadius: 8, padding: 20 }}>
          <p style={{ fontSize: 12, color: "#7F8C8D", margin: "0 0 16px", fontWeight: 500 }}>Recent Activity</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ACTIVITY.map((a) => (
              <div key={a.title} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{
                  width: 24, height: 24, background: a.iconBg, borderRadius: 4,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {a.icon}
                </div>
                <div style={{ fontSize: 12 }}>
                  <p style={{ margin: 0, fontWeight: 500 }}>{a.title}</p>
                  <p style={{ margin: 0, color: "#7F8C8D", fontSize: 11 }}>{a.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div style={{ background: "white", border: "0.5px solid #e0e0e0", borderRadius: 8, padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 500, color: "#1B4D3E", margin: "0 0 16px" }}>Admin Audit Log</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid #e0e0e0" }}>
                {["Date", "Action", "Admin Name", "Details"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 0", fontWeight: 500, color: "#7F8C8D" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AUDIT_LOG.map((row, i) => {
                const actionStyle: Record<string, { bg: string; color: string }> = {
                  Created:  { bg: "#F0F7F0", color: "#2D7A4F" },
                  Updated:  { bg: "#faf4f0", color: "#BA7517" },
                  Edited:   { bg: "#faf4f0", color: "#BA7517" },
                  Deactivated: { bg: "#fcebeb", color: "#A32D2D" },
                  Deleted:  { bg: "#fcebeb", color: "#A32D2D" },
                  "Password Reset": { bg: "#F0F7F0", color: "#2D7A4F" },
                };
                const s = actionStyle[row.action] ?? { bg: "#F0F7F0", color: "#2D7A4F" };
                return (
                  <tr key={i} style={{ borderBottom: "0.5px solid #e0e0e0", background: i % 2 === 0 ? "#f8fafa" : "white" }}>
                    <td style={{ padding: "12px 0" }}>{row.date}</td>
                    <td style={{ padding: "12px 0" }}>
                      <span style={{ background: s.bg, color: s.color, padding: "4px 8px", borderRadius: 4, fontSize: 12 }}>{row.action}</span>
                    </td>
                    <td style={{ padding: "12px 0", fontWeight: 500 }}>{row.admin}</td>
                    <td style={{ padding: "12px 0", color: "#7F8C8D" }}>{row.details}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
