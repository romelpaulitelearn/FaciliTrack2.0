import { useState } from "react";
import { ChevronDown, ChevronUp, Check, X, ArrowLeft } from "lucide-react";
import type { ReservationRequest, Toast, User } from "../../types";

interface Props {
  user: User;
  addToast: (msg: string, type?: Toast["type"]) => void;
  onRoomBook: (timeSlot: string, department: string, gradeOrCourse: string, students: number) => void;
}

function DeclineModal({ onConfirm, onCancel }: { onConfirm: (r: string) => void; onCancel: () => void }) {
  const [reason, setReason] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="slide-up" style={{ background: "white", width: "100%", maxWidth: 380, borderRadius: 10, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <h4 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600 }}>Decline Request</h4>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#7F8C8D" }}>Optionally provide a reason:</p>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for declining…" rows={3}
          style={{ width: "100%", padding: "9px 12px", border: "0.5px solid #e0e0e0", borderRadius: 6, fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "10px", borderRadius: 6, fontSize: 13, border: "0.5px solid #e0e0e0", background: "white", color: "#7F8C8D", cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onConfirm(reason)} style={{ flex: 1, padding: "10px", borderRadius: 6, fontSize: 13, fontWeight: 500, background: "#E74C3C", color: "white", border: "none", cursor: "pointer" }}>Confirm Decline</button>
        </div>
      </div>
    </div>
  );
}

export default function ReservationsTab({ user, addToast, onRoomBook }: Props) {
  const [requests, setRequests] = useState<ReservationRequest[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [declineTarget, setDeclineTarget] = useState<string | null>(null);

  const pending = requests.filter((r) => r.status === "Pending").length;

  const handleAccept = (id: string) => {
    const req = requests.find((r) => r.id === id)!;
    setRequests((p) => p.map((r) => r.id === id ? { ...r, status: "Accepted" } : r));
    setExpanded(null);
    addToast("Reservation accepted. Room status updated to Occupied.", "success");
    onRoomBook(req.timeNeeded, req.department, req.gradeOrCourse, req.totalStudents);
  };

  const handleDecline = (id: string) => {
    setRequests((p) => p.map((r) => r.id === id ? { ...r, status: "Declined" } : r));
    setDeclineTarget(null);
    setExpanded(null);
    addToast("Reservation declined.", "info");
  };

  const Field = ({ label, value }: { label: string; value: string | number }) => (
    <div>
      <p style={{ margin: "0 0 2px", fontSize: 11, color: "#7F8C8D" }}>{label}</p>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#2C3E50" }}>{value}</p>
    </div>
  );

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1B4D3E", margin: 0 }}>Reservation Requests</h2>
        {pending > 0 && (
          <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: "#faf4f0", color: "#BA7517", border: "0.5px solid #f0d090" }}>
            Pending: {pending}
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {requests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 16px", background: "white", borderRadius: 8, border: "0.5px solid #e0e0e0", color: "#7F8C8D" }}>
            <p style={{ fontSize: 13, margin: 0 }}>No reservation requests yet</p>
          </div>
        ) : requests.map((req) => {
          const isOpen = expanded === req.id;
          const statusStyle: Record<string, { bg: string; color: string }> = {
            Pending:  { bg: "#faf4f0", color: "#BA7517" },
            Accepted: { bg: "#F0F7F0", color: "#2D7A4F" },
            Declined: { bg: "#fcebeb", color: "#A32D2D" },
          };
          const ss = statusStyle[req.status];

          return (
            <div key={req.id} style={{ background: "white", border: "0.5px solid #e0e0e0", borderRadius: 8, overflow: "hidden" }}>
              <button onClick={() => setExpanded(isOpen ? null : req.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#2D7A4F", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, flexShrink: 0 }}>
                    {req.accountabilityName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 500, fontSize: 13, color: "#2C3E50" }}>{req.accountabilityName}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#7F8C8D" }}>{req.dateNeeded} · {req.timeNeeded} · {req.facility}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: ss.bg, color: ss.color }}>{req.status}</span>
                  {isOpen ? <ChevronUp size={14} color="#7F8C8D" /> : <ChevronDown size={14} color="#7F8C8D" />}
                </div>
              </button>

              {isOpen && (
                <div className="fade-in" style={{ borderTop: "0.5px solid #e0e0e0", padding: "20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                    <Field label="Email" value={req.email} />
                    <Field label="Phone No." value={req.phone ?? "—"} />
                    <Field label="Date Filed" value={req.dateFiled} />
                    <Field label="Date Needed" value={req.dateNeeded} />
                    <Field label="Time Needed" value={req.timeNeeded} />
                    <Field label="Facility" value={req.facility} />
                    <Field label="Accountability Name" value={req.accountabilityName} />
                    <Field label="Department" value={req.department} />
                    <Field label="Grade / Course & Year" value={req.gradeOrCourse} />
                    <Field label="Subject" value={req.subject} />
                    <Field label="Total # Students" value={req.totalStudents} />
                  </div>

                  {req.status === "Pending" && (
                    <div style={{ display: "flex", gap: 8, paddingTop: 16, borderTop: "0.5px solid #e0e0e0" }}>
                      <button onClick={() => handleAccept(req.id)}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "#2D7A4F", color: "white", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                        <Check size={14} /> Accept
                      </button>
                      <button onClick={() => setDeclineTarget(req.id)}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "white", color: "#E74C3C", border: "0.5px solid #E74C3C", borderRadius: 6, fontSize: 13, cursor: "pointer" }}>
                        <X size={14} /> Decline
                      </button>
                      <button onClick={() => setExpanded(null)}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "white", color: "#7F8C8D", border: "0.5px solid #e0e0e0", borderRadius: 6, fontSize: 13, cursor: "pointer" }}>
                        <ArrowLeft size={14} /> Back
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {declineTarget && (
        <DeclineModal onConfirm={() => handleDecline(declineTarget)} onCancel={() => setDeclineTarget(null)} />
      )}
    </div>
  );
}
