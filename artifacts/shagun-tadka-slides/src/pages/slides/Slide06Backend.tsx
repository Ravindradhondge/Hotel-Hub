export default function Slide06Backend() {
  return (
    <div style={{
      width: "100vw", height: "100vh", overflow: "hidden",
      backgroundColor: "#1E3A5F", fontFamily: "'Inter', sans-serif",
      padding: "3vh 4vw", boxSizing: "border-box", position: "relative",
      display: "grid", gridTemplateColumns: "1fr 1fr",
      gridTemplateRows: "auto 1fr auto", gap: "0 4vw", color: "#F8FAFC"
    }}>
      {/* Header */}
      <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.12)", paddingBottom: "2vh", marginBottom: "2.5vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
          <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#0D9488", borderRadius: "0.35vw" }} />
          <div style={{ fontSize: "1.2vw", fontWeight: 800, color: "#F8FAFC" }}>Shagun Tadka</div>
        </div>
        <div style={{ fontSize: "0.95vw", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Backend</div>
      </div>

      {/* Left */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: "1.05vw", fontWeight: 700, color: "#0D9488", marginBottom: "1vh", textTransform: "uppercase", letterSpacing: "0.08em" }}>Node.js + Express 5</div>
        <h1 style={{ fontSize: "3.8vw", fontWeight: 900, margin: "0 0 2vh 0", lineHeight: 1.1, letterSpacing: "-0.02em" }}>Backend Layer</h1>
        <p style={{ fontSize: "1.3vw", color: "rgba(255,255,255,0.65)", lineHeight: 1.6, margin: "0 0 3vh 0" }}>
          TypeScript throughout. Structured route handlers, JWT auth, Zod validation, and real-time Socket.IO events.
        </p>

        <div style={{ display: "flex", gap: "2vw" }}>
          <div style={{ background: "rgba(13,148,136,0.15)", border: "1px solid rgba(13,148,136,0.3)", borderRadius: "0.8vw", padding: "2vh 2vw", flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: "2.8vw", fontWeight: 900, color: "#0D9488" }}>Node</div>
            <div style={{ fontSize: "0.9vw", color: "rgba(255,255,255,0.5)", fontWeight: 600, marginTop: "0.5vh" }}>v24 Runtime</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "0.8vw", padding: "2vh 2vw", flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: "2.8vw", fontWeight: 900, color: "#F8FAFC" }}>WS</div>
            <div style={{ fontSize: "0.9vw", color: "rgba(255,255,255,0.5)", fontWeight: 600, marginTop: "0.5vh" }}>Socket.IO</div>
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh", justifyContent: "center" }}>
        {[
          { tech: "Node.js 24", desc: "Runtime with TypeScript compiled via esbuild", color: "#0D9488" },
          { tech: "Express 5", desc: "HTTP server with structured route handlers", color: "#38BDF8" },
          { tech: "JWT Auth", desc: "Stateless tokens stored in localStorage", color: "#FCD34D" },
          { tech: "Zod Validation", desc: "All request bodies validated with auto-generated schemas", color: "#C084FC" },
          { tech: "Socket.IO", desc: "Bidirectional real-time events for order flow", color: "#34D399" },
          { tech: "Role middleware", desc: "owner, waiter, kitchen, accountant access control", color: "#FB923C" },
          { tech: "Pino logger", desc: "Structured request logging in every route", color: "#94A3B8" },
        ].map((item) => (
          <div key={item.tech} style={{ display: "flex", alignItems: "center", gap: "1.5vw", background: "rgba(255,255,255,0.05)", padding: "1.5vh 2vw", borderRadius: "0.8vw", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ width: "0.6vw", height: "0.6vw", backgroundColor: item.color, borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ fontSize: "1.05vw", fontWeight: 700, color: item.color, minWidth: "9vw" }}>{item.tech}</div>
            <div style={{ fontSize: "0.95vw", color: "rgba(255,255,255,0.55)" }}>{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: "1.5vh", marginTop: "1vh", fontSize: "0.85vw", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>
        <div>Shagun Tadka — Restaurant Management System</div>
        <div><span>Slide 6 of 11</span></div>
      </div>
    </div>
  );
}
