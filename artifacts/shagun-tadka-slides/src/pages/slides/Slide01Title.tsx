const base = import.meta.env.BASE_URL;

export default function Slide01Title() {
  return (
    <div style={{
      width: "100vw", height: "100vh", overflow: "hidden",
      backgroundColor: "#FAFBFC", fontFamily: "'Inter', sans-serif",
      padding: "3vh 4vw", boxSizing: "border-box", position: "relative",
      display: "grid", gridTemplateColumns: "55fr 45fr",
      gridTemplateRows: "auto 1fr auto", gap: "0 4vw", color: "#1E3A5F"
    }}>
      {/* Header */}
      <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: "2vh", marginBottom: "1vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
          <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#0D9488", borderRadius: "0.35vw" }} />
          <div style={{ fontSize: "1.2vw", fontWeight: 800, letterSpacing: "0.02em", color: "#1E3A5F" }}>Shagun Tadka</div>
        </div>
        <div style={{ fontSize: "0.95vw", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>Project Overview  •  2026</div>
      </div>

      {/* Left: text content */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: "1.05vw", fontWeight: 700, color: "#0D9488", marginBottom: "1.5vh", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Restaurant Management System
        </div>
        <h1 style={{ fontSize: "5.5vw", fontWeight: 900, margin: "0 0 2.5vh 0", lineHeight: 1.05, letterSpacing: "-0.03em", color: "#1E3A5F" }}>
          Shagun Tadka
        </h1>
        <p style={{ fontSize: "1.5vw", fontWeight: 400, color: "#475569", margin: "0 0 4vh 0", lineHeight: 1.6, maxWidth: "38vw" }}>
          A full-stack, mobile-first platform managing every corner of your restaurant — orders, kitchen, billing, and analytics — all in one place.
        </p>

        <div style={{ display: "flex", gap: "2vw" }}>
          <div style={{ background: "#FFFFFF", padding: "2vh 2vw", borderRadius: "0.8vw", border: "1px solid #E2E8F0", flex: 1, boxShadow: "0 2px 12px rgba(30,58,95,0.07)" }}>
            <div style={{ fontSize: "0.85vw", fontWeight: 700, color: "#64748B", marginBottom: "0.8vh", textTransform: "uppercase", letterSpacing: "0.06em" }}>Roles</div>
            <div style={{ fontSize: "2.8vw", fontWeight: 800, color: "#1E3A5F", lineHeight: 1 }}>4</div>
            <div style={{ fontSize: "0.9vw", color: "#0D9488", fontWeight: 600, marginTop: "0.5vh" }}>Dashboards</div>
          </div>
          <div style={{ background: "#FFFFFF", padding: "2vh 2vw", borderRadius: "0.8vw", border: "1px solid #E2E8F0", flex: 1, boxShadow: "0 2px 12px rgba(30,58,95,0.07)" }}>
            <div style={{ fontSize: "0.85vw", fontWeight: 700, color: "#64748B", marginBottom: "0.8vh", textTransform: "uppercase", letterSpacing: "0.06em" }}>Stack</div>
            <div style={{ fontSize: "2.8vw", fontWeight: 800, color: "#1E3A5F", lineHeight: 1 }}>TS</div>
            <div style={{ fontSize: "0.9vw", color: "#0D9488", fontWeight: 600, marginTop: "0.5vh" }}>End-to-end</div>
          </div>
          <div style={{ background: "#FFFFFF", padding: "2vh 2vw", borderRadius: "0.8vw", border: "1px solid #E2E8F0", flex: 1, boxShadow: "0 2px 12px rgba(30,58,95,0.07)" }}>
            <div style={{ fontSize: "0.85vw", fontWeight: 700, color: "#64748B", marginBottom: "0.8vh", textTransform: "uppercase", letterSpacing: "0.06em" }}>Real-time</div>
            <div style={{ fontSize: "2.8vw", fontWeight: 800, color: "#1E3A5F", lineHeight: 1 }}>WS</div>
            <div style={{ fontSize: "0.9vw", color: "#0D9488", fontWeight: 600, marginTop: "0.5vh" }}>Socket.IO</div>
          </div>
        </div>
      </div>

      {/* Right: hero image */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", height: "68vh", borderRadius: "1.5vw", overflow: "hidden", border: "1px solid #E2E8F0", boxShadow: "0 8px 40px rgba(30,58,95,0.12)", backgroundColor: "#E2E8F0" }}>
          <img
            src={`${base}hero-title.png`}
            crossOrigin="anonymous"
            alt="Restaurant management dashboard"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E2E8F0", paddingTop: "1.5vh", fontSize: "0.85vw", color: "#94A3B8", fontWeight: 500, marginTop: "1vh" }}>
        <div>Shagun Tadka — Restaurant Management System</div>
        <div style={{ display: "flex", gap: "1vw" }}>
          <span>Full-Stack Project</span>
          <span>•</span>
          <span>Slide 1 of 11</span>
        </div>
      </div>
    </div>
  );
}
