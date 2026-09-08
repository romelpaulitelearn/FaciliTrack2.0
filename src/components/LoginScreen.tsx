import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Loader2, Lock, AlertTriangle } from "lucide-react";
import facilitrackLogo from "@/imports/FACILITRACK_LOGO_copy.png";
import campusBg from "@/imports/IMG_3926.JPG";
import type { User } from "../types";

const MAX_ATTEMPTS = 3;
const LOCKOUT_SEQUENCE = [30, 60, 180, 300, 900, 1800, 3600, 43200, 86400];
const API_BASE_URL = (import.meta.env.VITE_API_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:8443")).replace(/\/$/, "");

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds} seconds`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
  return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) > 1 ? "s" : ""}`;
};

export default function LoginScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockoutStage, setLockoutStage] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetLockoutState = () => {
    setAttempts(0);
    setLockoutStage(0);
    setLockedUntil(null);
    setCountdown(0);
    setError("");
  };

  // Countdown tick
  useEffect(() => {
    if (!lockedUntil) return;
    const tick = () => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        resetLockoutState();
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setCountdown(remaining);
      }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [lockedUntil]);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;
  const mm = String(Math.floor(countdown / 60)).padStart(2, "0");
  const ss = String(countdown % 60).padStart(2, "0");

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setForgotLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: forgotUsername, email: forgotEmail, newPassword: forgotPassword }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Unable to reset password.");
      }
      setForgotOpen(false);
      setForgotUsername("");
      setForgotEmail("");
      setForgotPassword("");
      setError("Password reset successfully. You can now sign in.");
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Unable to reset password.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const user: User = {
          id: data.id,
          name: data.name,
          username: data.username,
          role: data.role,
          facility: data.facility,
          facilities: data.facilities,
        };
        resetLockoutState();
        onLogin(user);
      } else {
        if (response.status >= 500) {
          setError("The login service is unavailable. Please try again shortly.");
        } else {
          const next = attempts + 1;
          const shouldLock = next >= MAX_ATTEMPTS || lockoutStage > 0;
          setAttempts(next);

          if (shouldLock) {
            const duration = LOCKOUT_SEQUENCE[Math.min(lockoutStage, LOCKOUT_SEQUENCE.length - 1)];
            setLockedUntil(Date.now() + duration * 1000);
            setLockoutStage((prev) => Math.min(prev + 1, LOCKOUT_SEQUENCE.length - 1));
            setAttempts(0);
            setError(`Too many failed attempts. Account locked for ${formatDuration(duration)}.`);
          } else {
            setError(`Invalid username or password. ${MAX_ATTEMPTS - next} attempt${MAX_ATTEMPTS - next === 1 ? "" : "s"} remaining.`);
          }
        }
      }
    } catch {
      setError("Unable to reach the login service. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafa" }}>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex"
        style={{ flex: 1, position: "relative", overflow: "hidden", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60 }}>
        <img src={campusBg} alt="St. Paul University campus"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,84,0,0.8) 0%, rgba(223,181,0,0.8) 100%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <img src={facilitrackLogo} alt="FaciliTrack"
            style={{ width: "100%", maxWidth: 380, height: "auto", objectFit: "contain", borderRadius: 12, filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.3))" }} />
          <div style={{ display: "flex", gap: 16, marginTop: 48 }}>
            {[["8","Rooms"],["120+","Bookings/mo"],["4","Admins"]].map(([v,l]) => (
              <div key={l} style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", borderRadius: 10, padding: "12px 20px", textAlign: "center", border: "1px solid rgba(255,255,255,0.2)" }}>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: 22 }}>{v}</div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ width: "100%", maxWidth: 340 }}>

          <div className="lg:hidden" style={{ textAlign: "center", marginBottom: 32 }}>
            <img src={facilitrackLogo} alt="FaciliTrack"
              style={{ height: 52, width: "auto", objectFit: "contain", borderRadius: 6 }} />
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 500, color: "#1B4D3E", margin: "0 0 24px", textAlign: "center" }}>Sign In</h2>

          {/* Lockout banner */}
          {isLocked && (
            <div style={{ marginBottom: 16, padding: "14px 14px", background: "#FEF2F2", border: "0.5px solid #FCA5A5", borderRadius: 8, display: "flex", gap: 10 }}>
              <Lock size={16} style={{ color: "#E74C3C", flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "#B91C1C" }}>Account temporarily locked</p>
                <p style={{ margin: "0 0 6px", fontSize: 12, color: "#B91C1C" }}>
                  Too many failed attempts. Try again in&nbsp;
                  <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>{mm}:{ss}</span>
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "#7F8C8D" }}>
                  Forgot your password?{" "}
                    <a href="#forgot-password" onClick={(e) => { e.preventDefault(); setForgotOpen(true); }} style={{ color: "#2D7A4F", textDecoration: "none", fontWeight: 500 }}>
                    Reset it here
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Attempt warning (not yet locked) */}
          {!isLocked && error && (
            <div style={{ marginBottom: 16, padding: "10px 12px", background: "#FEF2F2", border: "0.5px solid #FCA5A5", borderRadius: 6, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <AlertTriangle size={14} style={{ color: "#E74C3C", flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ margin: 0, color: "#B91C1C", fontSize: 12 }}>{error}</p>
                {attempts >= 2 && (
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "#7F8C8D" }}>
                    2 attempts reached — consider using the forgot password option.{" "}
                    <a href="#forgot-password" onClick={(e) => { e.preventDefault(); setForgotOpen(true); }} style={{ color: "#2D7A4F", textDecoration: "none" }}>Forgot password?</a>
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#2C3E50", marginBottom: 6 }}>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username" required disabled={isLocked}
                style={{ width: "100%", padding: "10px 12px", border: "0.5px solid #e0e0e0", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: isLocked ? "#F8FAFA" : "white", outline: "none", color: "#2C3E50", opacity: isLocked ? 0.6 : 1 }}
                onFocus={(e) => { if (!isLocked) { e.target.style.borderColor="#2D7A4F"; e.target.style.boxShadow="0 0 0 3px rgba(45,122,79,0.1)"; }}}
                onBlur={(e)  => { e.target.style.borderColor="#e0e0e0"; e.target.style.boxShadow="none"; }} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#2C3E50", marginBottom: 6 }}>Password</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8, border: "0.5px solid #e0e0e0", borderRadius: 6, padding: "0 12px", background: isLocked ? "#F8FAFA" : "white", opacity: isLocked ? 0.6 : 1 }}>
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" required disabled={isLocked}
                  style={{ flex: 1, padding: "10px 0", border: "none", fontSize: 14, outline: "none", background: "transparent", color: "#2C3E50" }} />
                <button type="button" onClick={() => setShowPass(!showPass)} disabled={isLocked}
                  style={{ background: "none", border: "none", cursor: isLocked ? "default" : "pointer", padding: 4, color: "#7F8C8D", display: "flex" }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#7F8C8D", cursor: "pointer" }}>
              <input type="checkbox" checked={showPass} onChange={() => setShowPass(!showPass)}
                style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#2D7A4F" }} />
              Show password
            </label>

            <div style={{ textAlign: "right" }}>
              <a href="#forgot-password" onClick={(e) => { e.preventDefault(); setForgotOpen(true); }} style={{ fontSize: 13, color: "#2D7A4F", textDecoration: "none" }}>Forgot password?</a>
            </div>

            <button type="submit" disabled={loading || isLocked}
              style={{ background: isLocked ? "#ccc" : "#2D7A4F", color: "white", padding: "12px", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: loading || isLocked ? "not-allowed" : "pointer", opacity: loading ? 0.85 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.15s" }}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : isLocked ? <><Lock size={14} /> Locked</> : "Sign In"}
            </button>
          </form>

          {forgotOpen && (
            <div style={{ position: "fixed", inset: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.35)" }}>
              <form onSubmit={handleForgotPassword} style={{ width: "100%", maxWidth: 360, padding: 24, borderRadius: 10, background: "white", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
                <h3 style={{ margin: "0 0 6px", color: "#1B4D3E", fontSize: 17 }}>Reset Password</h3>
                <p style={{ margin: "0 0 18px", color: "#7F8C8D", fontSize: 12 }}>Enter your username and registered email.</p>
                {[ ["Username", forgotUsername, setForgotUsername, "text"], ["Registered email", forgotEmail, setForgotEmail, "email"], ["New password", forgotPassword, setForgotPassword, "password"] ].map(([label, value, setter, type]) => (
                  <label key={label as string} style={{ display: "block", marginBottom: 12, color: "#2C3E50", fontSize: 12 }}>
                    {label}
                    <input type={type as string} value={value as string} onChange={(event) => (setter as (value: string) => void)(event.target.value)} required minLength={type === "password" ? 6 : undefined}
                      style={{ width: "100%", boxSizing: "border-box", marginTop: 6, padding: "10px 12px", border: "0.5px solid #d8e0dc", borderRadius: 6, fontSize: 13 }} />
                  </label>
                ))}
                <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                  <button type="button" onClick={() => setForgotOpen(false)} style={{ flex: 1, padding: 10, border: "0.5px solid #e0e0e0", borderRadius: 6, background: "white", color: "#7F8C8D" }}>Cancel</button>
                  <button type="submit" disabled={forgotLoading} style={{ flex: 1, padding: 10, border: "none", borderRadius: 6, background: "#2D7A4F", color: "white" }}>{forgotLoading ? "Resetting..." : "Reset Password"}</button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
