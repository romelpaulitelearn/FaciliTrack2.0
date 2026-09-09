import { useMemo, useState, type ReactNode, type CSSProperties, type FormEvent } from "react";
import { CheckCircle2, ClipboardList, QrCode } from "lucide-react";
import { FACILITIES_DATA } from "./../facilityData";

const API_BASE_URL = (import.meta.env.VITE_API_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:8443")).replace(/\/$/, "");

const TIME_SLOTS = [
  "8:00 AM - 11:00 AM",
  "9:00 AM - 12:00 PM",
  "1:00 PM - 4:00 PM",
  "2:00 PM - 5:00 PM",
];

type FormState = {
  email: string;
  phone: string;
  dateNeeded: string;
  timeNeeded: string;
  facility: string;
  accountabilityName: string;
  department: string;
  gradeOrCourse: string;
  subject: string;
  totalStudents: number;
};

const initialForm: FormState = {
  email: "",
  phone: "",
  dateNeeded: "",
  timeNeeded: TIME_SLOTS[0],
  facility: "",
  accountabilityName: "",
  department: "",
  gradeOrCourse: "",
  subject: "",
  totalStudents: 1,
};

export default function PublicReservation() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const minDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  const update = (field: keyof FormState, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!form.facility) {
      setError("Please select a facility.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.detail || "Unable to submit the reservation.");
      }

      setSubmittedId(String(data.id));
      setForm(initialForm);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit the reservation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <main style={styles.page}>
        <section style={styles.card}>
          <div style={styles.successIcon}><CheckCircle2 size={42} /></div>
          <p style={styles.kicker}>RESERVATION SUBMITTED</p>
          <h1 style={styles.title}>Your reservation request was received.</h1>
          <p style={styles.subtitle}>
            Your request has been saved and is now waiting for administrator review.
          </p>
          <div style={styles.referenceBox}>
            <span style={styles.referenceLabel}>Reservation ID</span>
            <strong style={styles.referenceValue}>#{submittedId}</strong>
          </div>
          <button
            type="button"
            onClick={() => setSubmittedId(null)}
            style={styles.primaryButton}
          >
            Make Another Reservation
          </button>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.brandRow}>
          <div style={styles.logo}><ClipboardList size={23} /></div>
          <div>
            <div style={styles.brand}>FaciliTrack</div>
            <div style={styles.brandSub}>Facility Reservation System</div>
          </div>
          <div style={styles.qrBadge}><QrCode size={19} /></div>
        </div>

        <div style={styles.header}>
          <p style={styles.kicker}>STUDENT RESERVATION</p>
          <h1 style={styles.title}>Reserve a facility</h1>
          <p style={styles.subtitle}>
            Fill out this form to submit a reservation request. No account or login is required.
          </p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.sectionTitle}>Contact Information</div>
          <div style={styles.grid}>
            <Field label="Email Address" required>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required placeholder="student@example.com" style={styles.input} />
            </Field>
            <Field label="Phone Number">
              <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="09XX XXX XXXX" style={styles.input} />
            </Field>
            <Field label="Accountability Name" required>
              <input type="text" value={form.accountabilityName} onChange={(e) => update("accountabilityName", e.target.value)} required placeholder="Full name" style={styles.input} />
            </Field>
            <Field label="Department" required>
              <input type="text" value={form.department} onChange={(e) => update("department", e.target.value)} required placeholder="Department" style={styles.input} />
            </Field>
            <Field label="Grade / Course & Year" required>
              <input type="text" value={form.gradeOrCourse} onChange={(e) => update("gradeOrCourse", e.target.value)} required placeholder="e.g. BSIT 3" style={styles.input} />
            </Field>
            <Field label="Subject" required>
              <input type="text" value={form.subject} onChange={(e) => update("subject", e.target.value)} required placeholder="Subject" style={styles.input} />
            </Field>
          </div>

          <div style={styles.sectionTitle}>Reservation Details</div>
          <div style={styles.grid}>
            <Field label="Facility" required>
              <select value={form.facility} onChange={(e) => update("facility", e.target.value)} required style={styles.input}>
                <option value="">Select a facility</option>
                {FACILITIES_DATA.map((facility) => <option key={facility.id} value={facility.name}>{facility.name}</option>)}
              </select>
            </Field>
            <Field label="Date Needed" required>
              <input type="date" min={minDate} value={form.dateNeeded} onChange={(e) => update("dateNeeded", e.target.value)} required style={styles.input} />
            </Field>
            <Field label="Time Needed" required>
              <select value={form.timeNeeded} onChange={(e) => update("timeNeeded", e.target.value)} required style={styles.input}>
                {TIME_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
              </select>
            </Field>
            <Field label="Total Students" required>
              <input type="number" min="1" value={form.totalStudents} onChange={(e) => update("totalStudents", Math.max(1, Number(e.target.value)))} required style={styles.input} />
            </Field>
          </div>

          <div style={styles.notice}>
            <strong>Before submitting:</strong> Please check that your facility, date, time, and contact details are correct.
          </div>

          <button type="submit" disabled={submitting} style={{ ...styles.primaryButton, opacity: submitting ? 0.65 : 1 }}>
            {submitting ? "Submitting..." : "Submit Reservation"}
          </button>
        </form>

        <p style={styles.footer}>Powered by FaciliTrack · Student access does not require an account.</p>
      </section>
    </main>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}{required && <span style={styles.required}> *</span>}</span>
      {children}
    </label>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f4f7f5",
    padding: "32px 16px 48px",
    boxSizing: "border-box",
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#24352e",
  },
  card: {
    width: "100%",
    maxWidth: 820,
    margin: "0 auto",
    background: "white",
    border: "1px solid #e0e7e3",
    borderRadius: 16,
    padding: "28px clamp(20px, 5vw, 48px)",
    boxSizing: "border-box",
    boxShadow: "0 10px 35px rgba(27,77,62,0.07)",
  },
  brandRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 34 },
  logo: { width: 42, height: 42, borderRadius: 10, background: "#1b4d3e", color: "white", display: "flex", alignItems: "center", justifyContent: "center" },
  brand: { fontSize: 17, fontWeight: 700, color: "#1b4d3e" },
  brandSub: { fontSize: 11, color: "#7f8c8d", marginTop: 2 },
  qrBadge: { marginLeft: "auto", width: 36, height: 36, borderRadius: 9, background: "#f0f6f2", color: "#2d7a4f", display: "flex", alignItems: "center", justifyContent: "center" },
  header: { marginBottom: 26 },
  kicker: { margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: 1.1, color: "#2d7a4f" },
  title: { margin: "7px 0 8px", fontSize: "clamp(25px, 5vw, 34px)", lineHeight: 1.15, color: "#1b4d3e", fontWeight: 650 },
  subtitle: { margin: 0, fontSize: 14, lineHeight: 1.6, color: "#6f7e78", maxWidth: 650 },
  error: { background: "#fff2f2", border: "1px solid #f0caca", color: "#a32d2d", borderRadius: 8, padding: "11px 13px", marginBottom: 18, fontSize: 13 },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: "#1b4d3e", borderBottom: "1px solid #e7ece9", paddingBottom: 9, marginTop: 3 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 7 },
  label: { fontSize: 12, fontWeight: 600, color: "#43564d" },
  required: { color: "#c0392b" },
  input: { width: "100%", boxSizing: "border-box", border: "1px solid #d7e0db", borderRadius: 8, padding: "11px 12px", fontSize: 13, color: "#263a31", background: "white", outline: "none" },
  notice: { background: "#f7faf8", border: "1px solid #e1eae5", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.5, color: "#61716a" },
  primaryButton: { width: "100%", border: "none", borderRadius: 8, padding: "12px 18px", background: "#2d7a4f", color: "white", fontSize: 14, fontWeight: 650, cursor: "pointer" },
  footer: { margin: "22px 0 0", textAlign: "center", fontSize: 11, color: "#8a9691" },
  successIcon: { width: 76, height: 76, borderRadius: "50%", background: "#edf7f0", color: "#2d7a4f", display: "flex", alignItems: "center", justifyContent: "center", margin: "20px auto 22px" },
  referenceBox: { margin: "24px auto", maxWidth: 300, background: "#f7faf8", border: "1px solid #e1eae5", borderRadius: 10, padding: "14px 18px", textAlign: "center" },
  referenceLabel: { display: "block", fontSize: 11, color: "#7f8c8d", marginBottom: 5 },
  referenceValue: { color: "#1b4d3e", fontSize: 20 },
};
