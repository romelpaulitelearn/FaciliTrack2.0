import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Check, X, ArrowLeft } from "lucide-react";
import type { ReservationRequest, Toast, User } from "../../types";

interface Props {
  user: User;
  addToast: (msg: string, type?: Toast["type"]) => void;
  onRoomBook?: (timeSlot: string, department: string, gradeOrCourse: string, students: number) => void;
}

const RESERVATIONS_STORAGE_KEY = "facilitrack-reservation-requests";
const API_BASE_URL = (import.meta.env.VITE_API_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:8443")).replace(/\/$/, "");
const TIME_SLOTS = ["8:00 AM - 11:00 AM", "9:00 AM - 12:00 PM", "1:00 PM - 4:00 PM", "2:00 PM - 5:00 PM"];
const FACILITIES = ["Computer Laboratory", "Science & Physics Lab", "Tertiary Classroom", "Hotel Restaurant Management", "Gymnasium"];

type ReservationForm = Omit<ReservationRequest, "id" | "dateFiled" | "status">;

const emptyForm = (user: User): ReservationForm => ({
  email: `${user.username}@school.edu`,
  phone: "",
  dateNeeded: "",
  timeNeeded: TIME_SLOTS[0],
  facility: user.facility ?? "",
  accountabilityName: user.name,
  department: "",
  gradeOrCourse: "",
  subject: "",
  totalStudents: 1,
});

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
  const canApprove = user.role === "admin";
  const isRequester = user.role === "requester";
  const requesterEmail = `${user.username}@school.edu`;
  const [requests, setRequests] = useState<ReservationRequest[]>(() => {
    try {
      const stored = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
      const parsed: ReservationRequest[] = stored ? JSON.parse(stored) : [];
      return isRequester ? parsed.filter((request) => request.email === requesterEmail) : parsed;
    } catch {
      return [];
    }
  });
  const requestsRef = useRef<ReservationRequest[]>([]);
  const hasLoadedRequests = useRef(false);
  const [form, setForm] = useState<ReservationForm>(() => emptyForm(user));
  const [expanded, setExpanded] = useState<string | null>(null);
  const [declineTarget, setDeclineTarget] = useState<string | null>(null);

  useEffect(() => {
    requestsRef.current = requests;
    localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    const facilities = user.role === "admin" && user.facilities?.length
      ? user.facilities
      : user.facility ? [user.facility] : [];
    const urls = facilities.length
      ? facilities.map((facility) => `${API_BASE_URL}/reservations?facility=${encodeURIComponent(facility)}`)
      : [`${API_BASE_URL}/reservations`];

    const loadRequests = () => Promise.all(urls.map((url) => fetch(url).then((response) => response.ok ? response.json() : Promise.reject(new Error("Reservation API unavailable")))))
      .then((batches: ReservationRequest[][]) => {
        const unique = new Map(batches.flat().map((request) => [request.id, request]));
        const nextRequests = Array.from(unique.values()).filter((request) => !isRequester || request.email === requesterEmail);
        if (isRequester && hasLoadedRequests.current) {
          nextRequests.forEach((nextRequest) => {
            const previousRequest = requestsRef.current.find((request) => request.id === nextRequest.id);
            if (previousRequest && previousRequest.status !== nextRequest.status) {
              addToast(nextRequest.status === "Accepted" ? "Your reservation was approved by the Admin." : "Your reservation was declined by the Admin.", nextRequest.status === "Accepted" ? "success" : "error");
            }
          });
        }
        requestsRef.current = nextRequests;
        setRequests(nextRequests);
        hasLoadedRequests.current = true;
      })
      .catch(() => undefined);

    void loadRequests();
    const refreshTimer = window.setInterval(() => { void loadRequests(); }, 10000);
    return () => window.clearInterval(refreshTimer);
  }, [user.facility, user.facilities, user.role, requesterEmail, isRequester, addToast]);

  useEffect(() => {
    const syncRequests = (event: StorageEvent) => {
      if (event.key !== RESERVATIONS_STORAGE_KEY) return;
      setRequests(event.newValue ? JSON.parse(event.newValue) : []);
    };
    window.addEventListener("storage", syncRequests);
    return () => window.removeEventListener("storage", syncRequests);
  }, []);

  const updateForm = (field: keyof ReservationForm, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const request: ReservationRequest = {
      ...form,
      id: `reservation-${Date.now()}`,
      dateFiled: new Date().toLocaleDateString("en-US"),
      status: "Pending",
    };
    try {
      const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Reservation API unavailable");
      const savedRequest: ReservationRequest = await response.json();
      setRequests((current) => [savedRequest, ...current]);
    } catch {
      addToast("Unable to submit reservation. Please try again.", "error");
      return;
    }
    setForm(emptyForm(user));
    addToast("Reservation request submitted. It is now visible to the admin.", "success");
  };

  const pending = requests.filter((r) => r.status === "Pending").length;

  const updateReservationStatus = async (id: string, status: "Accepted" | "Declined", rejectionReason?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectionReason }),
      });
      if (!response.ok) throw new Error("Reservation API unavailable");
      const savedRequest: ReservationRequest = await response.json();
      setRequests((current) => current.map((request) => request.id === id ? savedRequest : request));
      return savedRequest;
    } catch {
      addToast("Unable to update reservation. Please try again.", "error");
      return null;
    }
  };

  const handleAccept = async (id: string) => {
    const req = requests.find((r) => r.id === id)!;
    const savedRequest = await updateReservationStatus(id, "Accepted");
    if (!savedRequest) return;
    setExpanded(null);
    addToast("Reservation approved. Room status updated to Occupied.", "success");
    onRoomBook?.(req.timeNeeded, req.department, req.gradeOrCourse, req.totalStudents);
  };

  const handleDecline = async (id: string, reason: string) => {
    const savedRequest = await updateReservationStatus(id, "Declined", reason);
    if (!savedRequest) return;
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
      <div style={{ background: "white", border: "0.5px solid #e0e0e0", borderRadius: 8, padding: 24, marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1B4D3E", margin: "0 0 6px" }}>Reservation Form</h2>
        <p style={{ fontSize: 12, color: "#7F8C8D", margin: "0 0 20px" }}>Submit a request for a facility reservation.</p>
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
          {[
            ["accountabilityName", "Accountability Name", "text", "Full name"],
            ["email", "Email", "email", "name@school.edu"],
            ["phone", "Phone No.", "tel", "09XXXXXXXXX"],
            ["department", "Department", "text", "Department or office"],
            ["gradeOrCourse", "Grade / Course & Year", "text", "e.g. BSIT 2"],
            ["subject", "Subject", "text", "Subject name"],
          ].map(([field, label, type, placeholder]) => (
            <label key={field} style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "#2C3E50" }}>
              {label}
              <input type={type} value={form[field as keyof ReservationForm] as string} onChange={(event) => updateForm(field as keyof ReservationForm, event.target.value)} placeholder={placeholder} required={field !== "phone"}
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "0.5px solid #d8e0dc", borderRadius: 6, fontSize: 13, outline: "none" }} />
            </label>
          ))}
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "#2C3E50" }}>
            Facility
            {canApprove ? (
              <input value={form.facility} readOnly style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "0.5px solid #d8e0dc", borderRadius: 6, fontSize: 13, background: "#f5f8f6", color: "#52645b" }} />
            ) : (
              <select value={form.facility} onChange={(event) => updateForm("facility", event.target.value)} required style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "0.5px solid #d8e0dc", borderRadius: 6, fontSize: 13, background: "white" }}>
                <option value="">Select a facility</option>
                {FACILITIES.map((facility) => <option key={facility}>{facility}</option>)}
              </select>
            )}
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "#2C3E50" }}>
            Date Needed
            <input type="date" value={form.dateNeeded} min={new Date().toISOString().split("T")[0]} onChange={(event) => updateForm("dateNeeded", event.target.value)} required
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "0.5px solid #d8e0dc", borderRadius: 6, fontSize: 13 }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "#2C3E50" }}>
            Time Needed
            <select value={form.timeNeeded} onChange={(event) => updateForm("timeNeeded", event.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "0.5px solid #d8e0dc", borderRadius: 6, fontSize: 13, background: "white" }}>
              {TIME_SLOTS.map((slot) => <option key={slot}>{slot}</option>)}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "#2C3E50" }}>
            Total Students
            <input type="number" min="1" value={form.totalStudents} onChange={(event) => updateForm("totalStudents", Number(event.target.value))} required
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "0.5px solid #d8e0dc", borderRadius: 6, fontSize: 13 }} />
          </label>
          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
            <button type="submit" style={{ padding: "10px 18px", border: "none", borderRadius: 6, background: "#2D7A4F", color: "white", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Submit Reservation</button>
          </div>
        </form>
      </div>

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

                  {canApprove && req.status === "Pending" && (
                    <div style={{ display: "flex", gap: 8, paddingTop: 16, borderTop: "0.5px solid #e0e0e0" }}>
                      <button onClick={() => handleAccept(req.id)}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "#2D7A4F", color: "white", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                        <Check size={14} /> Approve
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
        <DeclineModal onConfirm={(reason) => handleDecline(declineTarget, reason)} onCancel={() => setDeclineTarget(null)} />
      )}
    </div>
  );
}
