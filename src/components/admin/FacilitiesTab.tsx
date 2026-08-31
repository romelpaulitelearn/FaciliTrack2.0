import { useState, useEffect } from "react";
import { Clock, Users, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { getFacilityByName, type Facility, type FacilityRoom } from "../../facilityData";
import type { User } from "../../types";

function FacilitySection({ facility, rooms }: { facility: Facility; rooms: FacilityRoom[] }) {
  const [collapsed, setCollapsed] = useState(false);
  const available = rooms.filter((r) => r.status === "Available").length;
  const occupied = rooms.filter((r) => r.status === "Occupied").length;

  return (
    <div style={{ background: "white", border: "0.5px solid #e0e0e0", borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
      {/* Facility header row */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", background: "#F8FAFA", border: "none", borderBottom: collapsed ? "none" : "0.5px solid #e0e0e0",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1B4D3E" }}>{facility.name}</span>
          <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#DCFCE7", color: "#27AE60" }}>
            {available} Available
          </span>
          {occupied > 0 && (
            <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#FEE2E2", color: "#E74C3C" }}>
              {occupied} Occupied
            </span>
          )}
        </div>
        <span style={{ color: "#7F8C8D", display: "flex" }}>
          {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
        </span>
      </button>

      {/* Room rows */}
      {!collapsed && (
        <div>
          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "200px 120px 1fr 120px 140px 80px",
            padding: "8px 20px 8px 40px",
            background: "#FAFAFA",
            borderBottom: "0.5px solid #f0f0f0",
          }}>
            {["Room", "Status", "Schedule", "Department", "Course & Year", "Students"].map((h) => (
              <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#B0BEC5", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</span>
            ))}
          </div>

          {facility.rooms.map((room, i) => {
            const isOccupied = room.status === "Occupied";
            return (
              <div
                key={room.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "200px 120px 1fr 120px 140px 80px",
                  padding: "12px 20px 12px 40px",
                  alignItems: "center",
                  borderBottom: i < facility.rooms.length - 1 ? "0.5px solid #F5F5F5" : "none",
                  borderLeft: `3px solid ${isOccupied ? "#E74C3C" : "#27AE60"}`,
                  background: isOccupied ? "#FFFAFA" : "white",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = isOccupied ? "#FEF2F2" : "#F0F7F0"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = isOccupied ? "#FFFAFA" : "white"; }}
              >
                {/* Room name */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: isOccupied ? "#E74C3C" : "#27AE60", display: "flex" }}>
                    {isOccupied ? <XCircle size={13} /> : <CheckCircle size={13} />}
                  </span>
                  <span style={{ fontWeight: 500, fontSize: 13, color: "#2C3E50" }}>{room.name}</span>
                </div>

                {/* Status */}
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                  background: isOccupied ? "#FEE2E2" : "#DCFCE7",
                  color: isOccupied ? "#E74C3C" : "#27AE60",
                  width: "fit-content",
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                  {room.status}
                </span>

                {/* Schedule */}
                {isOccupied && room.timeSlot ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                    <Clock size={11} style={{ color: "#7F8C8D", flexShrink: 0 }} />
                    <span style={{ fontWeight: 500, color: "#2C3E50" }}>{room.timeSlot}</span>
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: "#D0D0D0" }}>—</span>
                )}

                {/* Department */}
                <span style={{ fontSize: 12, color: isOccupied ? "#2C3E50" : "#D0D0D0" }}>
                  {isOccupied ? room.department : "—"}
                </span>

                {/* Course & Year */}
                <span style={{ fontSize: 12, color: isOccupied ? "#2C3E50" : "#D0D0D0" }}>
                  {isOccupied ? room.gradeOrCourse : "—"}
                </span>

                {/* Students */}
                {isOccupied && room.students ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                    <Users size={11} style={{ color: "#7F8C8D" }} />
                    <span style={{ color: "#2C3E50", fontWeight: 500 }}>{room.students}</span>
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: "#D0D0D0" }}>—</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function FacilitiesTab({ user, rooms }: { user?: User; rooms?: unknown }) {
  const assignedFacility = user?.facility ? getFacilityByName(user.facility) : undefined;
  const filteredFacilities = assignedFacility ? [assignedFacility] : FACILITIES_DATA;
  const totalAvailable = filteredFacilities.reduce((s, f) => s + f.rooms.filter((r) => r.status === "Available").length, 0);
  const totalOccupied = filteredFacilities.reduce((s, f) => s + f.rooms.filter((r) => r.status === "Occupied").length, 0);
  const totalRooms = filteredFacilities.reduce((s, f) => s + f.rooms.length, 0);

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#1B4D3E", margin: 0 }}>Facilities</h2>
          <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#DCFCE7", color: "#27AE60", border: "0.5px solid #27AE60" }}>
            {totalAvailable} Available
          </span>
          <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#FEE2E2", color: "#E74C3C", border: "0.5px solid #E74C3C" }}>
            {totalOccupied} Occupied
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "#7F8C8D" }}>
          {FACILITIES_DATA.length} facilities · {totalRooms} rooms total — click a facility to collapse/expand
        </p>
      </div>

      {/* Facility sections */}
      {filteredFacilities.map((facility) => (
        <FacilitySection key={facility.id} facility={facility} />
      ))}

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
        {[{ color: "#27AE60", label: "Available — free to book" }, { color: "#E74C3C", label: "Occupied — currently in use" }].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#7F8C8D" }}>
            <div style={{ width: 3, height: 14, borderRadius: 2, background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
