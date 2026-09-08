import { useEffect, useState } from "react";
import type { ReservationRequest, User, Room } from "../../types";

const API_BASE_URL = (import.meta.env.VITE_API_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:8443")).replace(/\/$/, "");

const SPARK_HEIGHTS = [0, 0, 0, 0, 0, 0, 0];
const SPARK_COLORS  = ["#e0e0e0","#e0e0e0","#e0e0e0","#e0e0e0","#e0e0e0","#e0e0e0","#e0e0e0"];

interface Props { user: User; rooms: Room[]; }

export default function AdminOverviewTab({ user, rooms }: Props) {
  const occupied = rooms.filter((r) => r.status === "Occupied").length;
  const available = rooms.filter((r) => r.status === "Available").length;
  const [pending, setPending] = useState(0);
  const [reservations, setReservations] = useState<ReservationRequest[]>([]);
  const usageRows = reservations
    .filter((request) => request.status === "Accepted")
    .map((request) => ({
      date: request.dateNeeded,
      time: request.timeNeeded,
      room: request.facility,
      dept: request.department,
      course: request.gradeOrCourse,
      year: request.subject,
      students: request.totalStudents,
    }));

  useEffect(() => {
    const facilities = user.facilities?.length ? user.facilities : user.facility ? [user.facility] : [];
    const urls = facilities.length
      ? facilities.map((facility) => `${API_BASE_URL}/reservations?facility=${encodeURIComponent(facility)}`)
      : [`${API_BASE_URL}/reservations`];
    const loadReservations = () => Promise.all(urls.map((url) => fetch(url).then((response) => response.ok ? response.json() : Promise.reject(new Error("Reservation API unavailable")))))
      .then((batches: ReservationRequest[][]) => {
        const unique = new Map(batches.flat().map((request) => [request.id, request]));
        const requests = Array.from(unique.values()).sort((a, b) => Number(b.id) - Number(a.id));
        setReservations(requests);
        setPending(requests.filter((request) => request.status === "Pending").length);
      })
      .catch(() => setPending(0));
    void loadReservations();
    const refreshTimer = window.setInterval(() => { void loadReservations(); }, 10000);
    return () => window.clearInterval(refreshTimer);
  }, [user.facility, user.facilities]);

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <h2 style={{ fontSize: 16, fontWeight: 500, color: "#1B4D3E", margin: "0 0 24px" }}>Overview</h2>

      {/* 4 stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}
        className="grid-cols-2 xl:grid-cols-4">

        <div style={{ background: "white", border: "0.5px solid #e0e0e0", borderRadius: 8, padding: 16 }}>
          <p style={{ fontSize: 12, color: "#7F8C8D", margin: "0 0 12px", fontWeight: 500 }}>Usage Last Week</p>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", height: 80, marginBottom: 8 }}>
            {SPARK_HEIGHTS.map((h, i) => (
              <div key={i} style={{ width: 8, height: h, background: SPARK_COLORS[i], borderRadius: 2 }} />
            ))}
          </div>
          <p style={{ fontSize: 13, color: "#2C3E50", margin: 0, fontWeight: 500 }}>48 hrs</p>
        </div>

        <div style={{ background: "white", border: "0.5px solid #e0e0e0", borderRadius: 8, padding: 16 }}>
          <p style={{ fontSize: 12, color: "#7F8C8D", margin: "0 0 12px", fontWeight: 500 }}>Currently Using</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <p style={{ fontSize: 32, fontWeight: 500, color: "#2D7A4F", margin: 0 }}>{occupied}</p>
            <p style={{ fontSize: 12, color: "#7F8C8D", margin: 0 }}>rooms</p>
          </div>
          <p style={{ fontSize: 11, color: "#27AE60", margin: "4px 0 0" }}>occupied</p>
        </div>

        <div style={{ background: "white", border: "0.5px solid #e0e0e0", borderRadius: 8, padding: 16 }}>
          <p style={{ fontSize: 12, color: "#7F8C8D", margin: "0 0 12px", fontWeight: 500 }}>Available Now</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <p style={{ fontSize: 32, fontWeight: 500, color: "#27AE60", margin: 0 }}>{available}</p>
            <p style={{ fontSize: 12, color: "#7F8C8D", margin: 0 }}>rooms</p>
          </div>
          <p style={{ fontSize: 11, color: "#27AE60", margin: "4px 0 0" }}>available</p>
        </div>

        <div style={{ background: "white", border: "0.5px solid #e0e0e0", borderRadius: 8, padding: 16,
          ...(pending > 0 ? { background: "#FFFBEB", border: "0.5px solid #F0D090" } : {}) }}>
          <p style={{ fontSize: 12, color: "#7F8C8D", margin: "0 0 12px", fontWeight: 500 }}>Pending Requests</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <p style={{ fontSize: 32, fontWeight: 500, color: pending > 0 ? "#BA7517" : "#2C3E50", margin: 0 }}>{pending}</p>
            <p style={{ fontSize: 12, color: "#7F8C8D", margin: 0 }}>requests</p>
          </div>
          <p style={{ fontSize: 11, color: "#BA7517", margin: "4px 0 0" }}>{pending > 0 ? "awaiting review" : "none pending"}</p>
        </div>
      </div>

      {/* Reservation requests */}
      <div style={{ background: "white", border: "0.5px solid #e0e0e0", borderRadius: 8, padding: 20, marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 500, color: "#1B4D3E", margin: "0 0 16px" }}>Reservation Requests</h3>
        {reservations.length === 0 ? (
          <p style={{ margin: 0, padding: "16px 0", textAlign: "center", color: "#7F8C8D", fontSize: 13 }}>No reservation requests yet</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
              <thead><tr style={{ borderBottom: "0.5px solid #e0e0e0" }}>
                {["Requester", "Facility", "Date", "Status"].map((heading) => <th key={heading} style={{ textAlign: "left", padding: "10px 16px 10px 0", fontWeight: 500, color: "#7F8C8D" }}>{heading}</th>)}
              </tr></thead>
              <tbody>{reservations.map((request) => (
                <tr key={request.id} style={{ borderBottom: "0.5px solid #e0e0e0" }}>
                  <td style={{ padding: "11px 16px 11px 0", fontWeight: 500 }}>{request.accountabilityName}</td>
                  <td style={{ padding: "11px 16px 11px 0" }}>{request.facility}</td>
                  <td style={{ padding: "11px 16px 11px 0" }}>{request.dateNeeded}</td>
                  <td style={{ padding: "11px 0" }}><span style={{ color: request.status === "Accepted" ? "#2D7A4F" : request.status === "Declined" ? "#A32D2D" : "#BA7517", fontWeight: 500 }}>{request.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      {/* Usage History */}
      <div style={{ background: "white", border: "0.5px solid #e0e0e0", borderRadius: 8, padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 500, color: "#1B4D3E", margin: "0 0 16px" }}>Usage History</h3>
        {usageRows.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 16px", color: "#7F8C8D" }}>
            <p style={{ fontSize: 13, margin: 0 }}>No usage history yet</p>
          </div>
        ) : null}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid #e0e0e0" }}>
                {["Date","Time","Room","Department","Course","Year","Students"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px 12px 0", fontWeight: 500, color: "#7F8C8D", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usageRows.length > 0 ? usageRows.map((row, i) => (
                <tr key={i} style={{ borderBottom: "0.5px solid #e0e0e0", background: i % 2 === 0 ? "#f8fafa" : "white" }}>
                  <td style={{ padding: "12px 16px 12px 0", whiteSpace: "nowrap" }}>{row.date}</td>
                  <td style={{ padding: "12px 16px 12px 0", whiteSpace: "nowrap" }}>{row.time}</td>
                  <td style={{ padding: "12px 16px 12px 0", fontWeight: 500 }}>{row.room}</td>
                  <td style={{ padding: "12px 16px 12px 0" }}>{row.dept}</td>
                  <td style={{ padding: "12px 16px 12px 0" }}>{row.course}</td>
                  <td style={{ padding: "12px 16px 12px 0" }}>{row.year}</td>
                  <td style={{ padding: "12px 0" }}>{row.students}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} style={{ padding: "24px 0", textAlign: "center", color: "#7F8C8D" }}>No usage history for this facility yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
