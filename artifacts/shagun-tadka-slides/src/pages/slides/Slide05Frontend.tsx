export default function Slide05Frontend() {
  return (
    <div style={{
      width: "100vw", height: "100vh", overflow: "hidden",
      backgroundColor: "#FAFBFC", fontFamily: "'Inter', sans-serif",
      padding: "3vh 4vw", boxSizing: "border-box", position: "relative",
      display: "grid", gridTemplateColumns: "1fr 1fr",
      gridTemplateRows: "auto 1fr auto", gap: "0 4vw", color: "#1E3A5F"
    }}>
      {/* Header */}
      <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: "2vh", marginBottom: "2.5vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
          <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#0D9488", borderRadius: "0.35vw" }} />
          <div style={{ fontSize: "1.2vw", fontWeight: 800, color: "#1E3A5F" }}>Shagun Tadka</div>
        </div>
        <div style={{ fontSize: "0.95vw", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>Frontend</div>
      </div>

      {/* Left */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: "1.05vw", fontWeight: 700, color: "#2563EB", marginBottom: "1vh", textTransform: "uppercase", letterSpacing: "0.08em" }}>React + Vite</div>
        <h1 style={{ fontSize: "3.8vw", fontWeight: 900, margin: "0 0 2vh 0", lineHeight: 1.1, letterSpacing: "-0.02em" }}>Frontend Layer</h1>
        <p style={{ fontSize: "1.3vw", color: "#475569", lineHeight: 1.6, margin: "0 0 3vh 0" }}>
          A TypeScript-first React app with auto-generated API hooks, real-time WebSocket events, and a mobile-optimized UI.
        </p>

        <div style={{ display: "flex", gap: "2vw" }}>
          <div style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: "0.8vw", padding: "2vh 2vw", flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: "2.8vw", fontWeight: 900, color: "#2563EB" }}>100%</div>
            <div style={{ fontSize: "0.9vw", color: "#64748B", fontWeight: 600, marginTop: "0.5vh" }}>TypeScript</div>
          </div>
          <div style={{ background: "rgba(13,148,136,0.08)", border: "1px solid rgba(13,148,136,0.2)", borderRadius: "0.8vw", padding: "2vh 2vw", flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: "2.8vw", fontWeight: 900, color: "#0D9488" }}>Live</div>
            <div style={{ fontSize: "0.9vw", color: "#64748B", fontWeight: 600, marginTop: "0.5vh" }}>Updates</div>
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh", justifyContent: "center" }}>
        {[
          { tech: "React 18", desc: "Type-safe UI components with TypeScript", color: "#2563EB" },
          { tech: "Vite", desc: "Lightning-fast development builds and HMR", color: "#D97706" },
          { tech: "Wouter", desc: "Lightweight client-side routing", color: "#7C3AED" },
          { tech: "TanStack Query", desc: "Server-state caching and mutations", color: "#0D9488" },
          { tech: "Shadcn/UI + Tailwind", desc: "Polished component library with design tokens", color: "#DC2626" },
          { tech: "Orval codegen", desc: "Auto-generated typed hooks from OpenAPI spec", color: "#0369A1" },
          { tech: "Socket.IO client", desc: "Real-time kitchen and waiter updates", color: "#059669" },
        ].map((item) => (
          <div key={item.tech} style={{ display: "flex", alignItems: "center", gap: "1.5vw", background: "#FFFFFF", padding: "1.5vh 2vw", borderRadius: "0.8vw", border: "1px solid #E2E8F0", boxShadow: "0 1px 6px rgba(30,58,95,0.05)" }}>
            <div style={{ width: "0.6vw", height: "0.6vw", backgroundColor: item.color, borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ fontSize: "1.05vw", fontWeight: 700, color: item.color, minWidth: "10vw" }}>{item.tech}</div>
            <div style={{ fontSize: "0.95vw", color: "#64748B" }}>{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E2E8F0", paddingTop: "1.5vh", marginTop: "1vh", fontSize: "0.85vw", color: "#94A3B8", fontWeight: 500 }}>
        <div>Shagun Tadka — Restaurant Management System</div>
        <div><span>Slide 5 of 11</span></div>
      </div>
    </div>
  );
}
