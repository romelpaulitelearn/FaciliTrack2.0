import { useEffect, useState } from "react";
import { Edit2, Plus, Search, Trash2, X } from "lucide-react";
import type { UserAccount } from "../../types";

const API_BASE_URL = (import.meta.env.VITE_API_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:8443")).replace(/\/$/, "");

type UserForm = Omit<UserAccount, "id">;

const emptyForm: UserForm = { name: "", email: "", username: "", password: "", status: "Active" };

function UserModal({ user, onSave, onClose }: { user?: UserAccount; onSave: (form: UserForm) => void; onClose: () => void }) {
  const [form, setForm] = useState<UserForm>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    username: user?.username ?? "",
    password: "",
    status: user?.status ?? "Active",
  });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.35)" }}>
      <div style={{ width: "100%", maxWidth: 420, background: "white", borderRadius: 10, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ margin: 0, color: "#1B4D3E", fontSize: 16 }}>{user ? "Edit User" : "Create User"}</h3>
          <button type="button" onClick={onClose} aria-label="Close" style={{ border: "none", background: "none", color: "#7F8C8D", cursor: "pointer" }}><X size={16} /></button>
        </div>
        <form onSubmit={(event) => { event.preventDefault(); onSave(form); }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {(["name", "email", "username"] as const).map((key) => (
            <label key={key} style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12, color: "#2C3E50" }}>
              {key === "name" ? "Full Name" : key[0].toUpperCase() + key.slice(1)}
              <input required value={form[key]} type={key === "email" ? "email" : "text"} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} style={{ padding: "9px 12px", border: "0.5px solid #e0e0e0", borderRadius: 6, fontSize: 13 }} />
            </label>
          ))}
          <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12, color: "#2C3E50" }}>
            Password
            <input required={!user} minLength={6} type="password" placeholder={user ? "Leave blank to keep current password" : "At least 6 characters"} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} style={{ padding: "9px 12px", border: "0.5px solid #e0e0e0", borderRadius: 6, fontSize: 13 }} />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {(["Active", "Inactive"] as const).map((status) => <button type="button" key={status} onClick={() => setForm((current) => ({ ...current, status }))} style={{ flex: 1, padding: 9, borderRadius: 6, border: "0.5px solid #e0e0e0", background: form.status === status ? "#2D7A4F" : "white", color: form.status === status ? "white" : "#7F8C8D" }}>{status}</button>)}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: 10, borderRadius: 6, border: "0.5px solid #e0e0e0", background: "white" }}>Cancel</button>
            <button type="submit" style={{ flex: 1, padding: 10, borderRadius: 6, border: "none", background: "#2D7A4F", color: "white" }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ManageUsersTab({ addToast }: { addToast?: (message: string, type?: "success" | "error" | "info") => void }) {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<UserAccount>();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string>();

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/requesters`);
      if (!response.ok) throw new Error();
      setUsers((await response.json()).map((item: UserAccount) => ({ ...item, id: String(item.id), password: "" })));
    } catch {
      addToast?.("Unable to load users. Please try again.", "error");
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const saveUser = async (form: UserForm) => {
    const isEdit = Boolean(editing);
    try {
      const response = await fetch(`${API_BASE_URL}/requesters${isEdit ? `/${editing?.id}` : ""}`, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Unable to save user.");
      const saved = { ...data, id: String(data.id), password: "" } as UserAccount;
      setUsers((current) => isEdit ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]);
      addToast?.(isEdit ? "User updated successfully." : "User created successfully.", "success");
      setModalOpen(false);
      setEditing(undefined);
    } catch (error) {
      addToast?.(error instanceof Error ? error.message : "Unable to save user.", "error");
    }
  };

  const deleteUser = async () => {
    if (!deleteId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/requesters/${deleteId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to delete user.");
      setUsers((current) => current.filter((item) => item.id !== deleteId));
      addToast?.("User deleted successfully.", "success");
    } catch (error) {
      addToast?.(error instanceof Error ? error.message : "Unable to delete user.", "error");
    } finally { setDeleteId(undefined); }
  };

  const filtered = users.filter((user) => `${user.name} ${user.email} ${user.username}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 500, color: "#1B4D3E" }}>Manage Users</h2>
        <button onClick={() => { setEditing(undefined); setModalOpen(true); }} style={{ display: "flex", gap: 8, alignItems: "center", padding: "9px 16px", border: "none", borderRadius: 6, background: "#2D7A4F", color: "white" }}><Plus size={14} /> Create User</button>
      </div>
      <div style={{ position: "relative", marginBottom: 20 }}><Search size={14} style={{ position: "absolute", left: 12, top: 12, color: "#7F8C8D" }} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users..." style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px 10px 36px", border: "0.5px solid #e0e0e0", borderRadius: 6 }} /></div>
      <div style={{ background: "white", border: "0.5px solid #e0e0e0", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr style={{ background: "#f8fafa" }}>{["Name", "Email", "Username", "Status", "Actions"].map((heading) => <th key={heading} style={{ padding: 12, textAlign: "left", color: "#7F8C8D", fontWeight: 500 }}>{heading}</th>)}</tr></thead><tbody>
          {filtered.map((user) => <tr key={user.id} style={{ borderTop: "0.5px solid #e0e0e0" }}><td style={{ padding: 12 }}>{user.name}</td><td style={{ padding: 12, color: "#7F8C8D" }}>{user.email}</td><td style={{ padding: 12, color: "#7F8C8D" }}>{user.username}</td><td style={{ padding: 12 }}>{user.status}</td><td style={{ padding: 12 }}><button onClick={() => { setEditing(user); setModalOpen(true); }} aria-label={`Edit ${user.name}`} style={{ marginRight: 10, border: "none", background: "none", color: "#2D7A4F" }}><Edit2 size={14} /></button><button onClick={() => setDeleteId(user.id)} aria-label={`Delete ${user.name}`} style={{ border: "none", background: "none", color: "#C0392B" }}><Trash2 size={14} /></button></td></tr>)}
          {!filtered.length && <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#7F8C8D" }}>No users found.</td></tr>}
        </tbody></table>
      </div>
      {modalOpen && <UserModal user={editing} onSave={saveUser} onClose={() => { setModalOpen(false); setEditing(undefined); }} />}
      {deleteId && <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.35)" }}><div style={{ background: "white", padding: 24, borderRadius: 10 }}><h3>Delete User</h3><p>This action cannot be undone.</p><button onClick={() => setDeleteId(undefined)}>Cancel</button><button onClick={deleteUser} style={{ marginLeft: 8, background: "#C0392B", color: "white", border: "none", padding: 8 }}>Delete</button></div></div>}
    </div>
  );
}
