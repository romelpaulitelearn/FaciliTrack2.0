import { useEffect, useState } from "react";
import { Search, Plus, Eye, EyeOff, Edit2, Trash2, X } from "lucide-react";
import type { Admin } from "../../types";
import { MOCK_ADMINS } from "../../data";

const FACILITIES = ["Computer Laboratory", "Science & Physics Lab", "Tertiary Classroom", "Hotel Restaurant Management", "Gymnasium"];

function PasswordStrength({ password }: { password: string }) {
  const strength = !password ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;
  const colors = ["#e0e0e0", "#E74C3C", "#F39C12", "#2D7A4F", "#27AE60"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
      <div style={{ display: "flex", gap: 3, flex: 1 }}>
        {[1,2,3,4].map((i) => (
          <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= strength ? colors[strength] : "#e0e0e0", transition: "background 0.2s" }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color: colors[strength], fontWeight: 500 }}>{labels[strength]}</span>
    </div>
  );
}

function AdminModal({ admin, onSave, onClose }: { admin?: Admin; onSave: (a: Admin) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: admin?.name ?? "",
    email: admin?.email ?? "",
    username: admin?.username ?? "",
    password: admin?.password ?? "",
    facilities: admin?.facilities ?? [],
    status: (admin?.status ?? "Active") as "Active" | "Inactive",
  });
  const [showPass, setShowPass] = useState(false);

  const toggleFac = (f: string) => setForm((p) => ({ ...p, facilities: [f] }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="slide-up" style={{ background: "white", width: "100%", maxWidth: 420, borderRadius: 10, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "0.5px solid #e0e0e0" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1B4D3E" }}>{admin ? "Edit Admin" : "Create Admin"}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#7F8C8D", padding: 2, display: "flex" }}><X size={16} /></button>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); onSave({ ...form, id: admin?.id ?? String(Date.now()) }); }}
          style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}
        >
          {[
            ["Full Name", "name", "e.g. Jefferson Gabriel"],
            ["Email", "email", "e.g. jgabriel@school.edu"],
            ["Username", "username", "e.g. jgabriel"],
          ].map(([label, key, ph]) => (
            <div key={key}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#2C3E50", marginBottom: 5 }}>{label}</label>
              <input
                value={form[key as "name" | "email" | "username"]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={ph} required={key !== "email" ? true : true}
                type={key === "email" ? "email" : "text"}
                style={{ width: "100%", padding: "9px 12px", border: "0.5px solid #e0e0e0", borderRadius: 6, fontSize: 13, boxSizing: "border-box", outline: "none", color: "#2C3E50" }}
              />
            </div>
          ))}

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#2C3E50", marginBottom: 5 }}>Password</label>
            <div style={{ display: "flex", alignItems: "center", border: "0.5px solid #e0e0e0", borderRadius: 6, padding: "0 12px", background: "white" }}>
              <input type={showPass ? "text" : "password"} value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="••••••••" required
                style={{ flex: 1, padding: "9px 0", border: "none", fontSize: 13, outline: "none", background: "transparent" }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ background: "none", border: "none", cursor: "pointer", color: "#7F8C8D", display: "flex" }}>
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <PasswordStrength password={form.password} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#2C3E50", marginBottom: 8 }}>Facilities Assigned</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {FACILITIES.map((f) => (
                <button key={f} type="button" onClick={() => toggleFac(f)}
                  style={{ padding: "5px 10px", borderRadius: 20, fontSize: 12, border: `0.5px solid ${form.facilities.includes(f) ? "#2D7A4F" : "#e0e0e0"}`,
                    background: form.facilities.includes(f) ? "#2D7A4F" : "white", color: form.facilities.includes(f) ? "white" : "#7F8C8D", cursor: "pointer", transition: "all 0.1s" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#2C3E50", marginBottom: 8 }}>Status</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["Active", "Inactive"] as const).map((s) => (
                <button key={s} type="button" onClick={() => setForm((p) => ({ ...p, status: s }))}
                  style={{ flex: 1, padding: "8px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.1s",
                    background: form.status === s ? (s === "Active" ? "#2D7A4F" : "#888") : "white",
                    color: form.status === s ? "white" : "#7F8C8D",
                    border: `0.5px solid ${form.status === s ? (s === "Active" ? "#2D7A4F" : "#888") : "#e0e0e0"}` }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: "10px", borderRadius: 6, fontSize: 13, border: "0.5px solid #e0e0e0", background: "white", color: "#7F8C8D", cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit"
              style={{ flex: 1, padding: "10px", borderRadius: 6, fontSize: 13, fontWeight: 500, background: "#2D7A4F", color: "white", border: "none", cursor: "pointer" }}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ManageAdminTab({ addToast }: { addToast?: (message: string, type?: "success" | "error" | "info") => void }) {
  const [admins, setAdmins] = useState<Admin[]>(MOCK_ADMINS);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Admin | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const response = await fetch("http://localhost:8000/admins");
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data) && data.length) {
          const mapped = data.map((item: any) => ({
            id: String(item.id),
            name: item.name,
            email: item.email || `${item.username}@school.edu`,
            username: item.username,
            password: "",
            facilities: Array.isArray(item.facilities) ? item.facilities : [item.facilities || ""].filter(Boolean),
            status: item.status === "Inactive" ? "Inactive" : "Active",
          }));
          setAdmins(mapped);
        }
      } catch {
        // fallback to mock data when backend is unavailable
      }
    };

    loadAdmins();
  }, []);

  const filtered = admins.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (a: Admin) => {
    const payload = {
      name: a.name,
      email: a.email,
      username: a.username,
      password: a.password,
      facilities: a.facilities,
      status: a.status,
    };

    try {
      const isUpdate = !!a.id && admins.some((admin) => admin.id === a.id);
      const response = await fetch(`http://localhost:8000/admins${isUpdate ? `/${a.id}` : ""}`, {
        method: isUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const saved = await response.json();
        const normalized = {
          id: String(saved.id ?? a.id ?? Date.now()),
          name: saved.name ?? a.name,
          email: saved.email ?? a.email ?? `${a.username}@school.edu`,
          username: saved.username ?? a.username,
          password: a.password,
          facilities: Array.isArray(saved.facilities) ? saved.facilities : a.facilities,
          status: saved.status ?? a.status,
        };
        setAdmins((prev) => prev.find((x) => x.id === normalized.id)
          ? prev.map((x) => x.id === normalized.id ? normalized : x)
          : [normalized, ...prev]);
        addToast?.(isUpdate ? "Admin updated successfully." : "Admin created successfully.", "success");
      } else {
        setAdmins((prev) => prev.find((x) => x.id === a.id) ? prev.map((x) => x.id === a.id ? a : x) : [a, ...prev]);
        addToast?.(isUpdate ? "Failed to update admin." : "Failed to create admin.", "error");
      }
    } catch {
      setAdmins((prev) => prev.find((x) => x.id === a.id) ? prev.map((x) => x.id === a.id ? a : x) : [a, ...prev]);
      addToast?.("Unable to save admin. Please try again.", "error");
    }

    setModal(null);
  };

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1B4D3E", margin: 0 }}>Manage Administrators</h2>
        <button
          onClick={() => { setEditing(undefined); setModal("create"); }}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", background: "#2D7A4F", color: "white", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer" }}
        >
          <Plus size={14} /> Create Admin
        </button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#7F8C8D" }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search admins…"
          style={{ width: "100%", padding: "10px 12px 10px 36px", border: "0.5px solid #e0e0e0", borderRadius: 6, fontSize: 13, boxSizing: "border-box", outline: "none", background: "white" }} />
      </div>

      {/* Table — Name | Username | Facilities | Status | Actions (NO password column) */}
      <div style={{ background: "white", border: "0.5px solid #e0e0e0", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid #e0e0e0", background: "#f8fafa" }}>
                {["Name", "Email", "Username", "Facilities Assigned", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontWeight: 500, color: "#7F8C8D", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((admin, i) => (
                <tr
                  key={admin.id}
                  style={{ borderBottom: "0.5px solid #e0e0e0", background: i % 2 === 0 ? "white" : "#f8fafa", transition: "background 0.1s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "#F0F7F0"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? "white" : "#f8fafa"; }}
                >
                  {/* Name */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#2D7A4F", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, flexShrink: 0 }}>
                        {admin.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{admin.name}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td style={{ padding: "12px 16px", color: "#7F8C8D" }}>{admin.email || "—"}</td>

                  {/* Username */}
                  <td style={{ padding: "12px 16px", color: "#7F8C8D", fontFamily: "monospace" }}>{admin.username}</td>

                  {/* Facilities */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {admin.facilities.slice(0, 2).map((f) => (
                        <span key={f} style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, background: "#F0F7F0", color: "#2D7A4F", whiteSpace: "nowrap" }}>{f}</span>
                      ))}
                      {admin.facilities.length > 2 && (
                        <span style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, background: "#f1f1f1", color: "#7F8C8D" }}>+{admin.facilities.length - 2}</span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "4px 10px", borderRadius: 4, fontSize: 12, background: admin.status === "Active" ? "#F0F7F0" : "#f1f1f1", color: admin.status === "Active" ? "#2D7A4F" : "#7F8C8D" }}>
                      {admin.status}
                    </span>
                  </td>

                  {/* Actions — 20px gap between Edit and Delete */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                      <button
                        onClick={() => { setEditing(admin); setModal("edit"); }}
                        title="Edit admin"
                        style={{ padding: 6, background: "none", border: "0.5px solid #e0e0e0", borderRadius: 5, cursor: "pointer", color: "#7F8C8D", display: "flex", transition: "all 0.1s" }}
                        onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background="#F0F7F0"; b.style.color="#2D7A4F"; b.style.borderColor="#2D7A4F"; }}
                        onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background="none"; b.style.color="#7F8C8D"; b.style.borderColor="#e0e0e0"; }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteId(admin.id)}
                        title="Delete admin"
                        style={{ padding: 6, background: "none", border: "0.5px solid #e0e0e0", borderRadius: 5, cursor: "pointer", color: "#7F8C8D", display: "flex", transition: "all 0.1s" }}
                        onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background="#FEF2F2"; b.style.color="#E74C3C"; b.style.borderColor="#E74C3C"; }}
                        onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background="none"; b.style.color="#7F8C8D"; b.style.borderColor="#e0e0e0"; }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ padding: "32px 16px", textAlign: "center", color: "#7F8C8D" }}>No admins found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="slide-up" style={{ background: "white", width: "100%", maxWidth: 360, borderRadius: 10, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h4 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 600 }}>Delete Admin</h4>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#7F8C8D" }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteId(null)}
                style={{ flex: 1, padding: "10px", borderRadius: 6, fontSize: 13, border: "0.5px solid #e0e0e0", background: "white", color: "#7F8C8D", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={async () => {
                try {
                  const response = await fetch(`http://localhost:8000/admins/${deleteId}`, { method: "DELETE" });
                  if (response.ok) {
                    setAdmins((p) => p.filter((a) => a.id !== deleteId));
                    addToast?.("Admin deleted successfully.", "success");
                  } else {
                    addToast?.("Failed to delete admin.", "error");
                  }
                } catch {
                  setAdmins((p) => p.filter((a) => a.id !== deleteId));
                  addToast?.("Unable to delete admin. Please try again.", "error");
                }
                setDeleteId(null);
              }}
                style={{ flex: 1, padding: "10px", borderRadius: 6, fontSize: 13, fontWeight: 500, background: "#E74C3C", color: "white", border: "none", cursor: "pointer" }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {(modal === "create" || modal === "edit") && (
        <AdminModal admin={editing} onSave={handleSave} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
