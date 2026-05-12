export default function Slide04Architecture() {
  return (
    <div style={{
      width: "100vw", height: "100vh", overflow: "hidden",
      backgroundColor: "#FAFBFC", fontFamily: "'Inter', sans-serif",
      padding: "3vh 4vw", boxSizing: "border-box", position: "relative",
      display: "grid", gridTemplateRows: "auto auto 1fr auto",
      color: "#1E3A5F"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: "2vh", marginBottom: "2.5vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
          <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#0D9488", borderRadius: "0.35vw" }} />
          <div style={{ fontSize: "1.2vw", fontWeight: 800, color: "#1E3A5F" }}>Shagun Tadka</div>
        </div>
        <div style={{ fontSize: "0.95vw", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>System Architecture</div>
      </div>

      <div style={{ marginBottom: "3vh" }}>
        <div style={{ fontSize: "1.05vw", fontWeight: 700, color: "#0D9488", marginBottom: "0.8vh", textTransform: "uppercase", letterSpacing: "0.08em" }}>How it all connects</div>
        <h1 style={{ fontSize: "3.5vw", fontWeight: 900, margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em" }}>System Architecture</h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
        {/* Main arch flow */}
        <div style={{ background: "#FFFFFF", borderRadius: "1.2vw", border: "1px solid #E2E8F0", padding: "3vh 3vw", boxShadow: "0 2px 16px rgba(30,58,95,0.07)", display: "flex", alignItems: "center", justifyContent: "center", gap: "2vw" }}>
          {[
            { label: "Browser", sub: "React + Vite", color: "#2563EB", bg: "rgba(37,99,235,0.08)" },
            { label: "REST API", sub: "Express 5", color: "#0D9488", bg: "rgba(13,148,136,0.08)" },
            { label: "PostgreSQL", sub: "Drizzle ORM", color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
          ].map((node, i) => (
            <div key={node.label} style={{ display: "flex", alignItems: "center", gap: "2vw" }}>
              <div style={{ backgroundColor: node.bg, border: `2px solid ${node.color}33`, borderRadius: "1vw", padding: "2.5vh 3vw", textAlign: "center", minWidth: "10vw" }}>
                <div style={{ fontSize: "1.4vw", fontWeight: 800, color: node.color }}>{node.label}</div>
                <div style={{ fontSize: "0.9vw", color: "#64748B", marginTop: "0.4vh", fontWeight: 500 }}>{node.sub}</div>
              </div>
              {i < 2 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3vh" }}>
                  <div style={{ fontSize: "0.8vw", color: "#0D9488", fontWeight: 700, textAlign: "center" }}>REST + WS</div>
                  <div style={{ color: "#0D9488", fontSize: "2vw", lineHeight: 1 }}>&#8644;</div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2vw" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "1vw", border: "1px solid #E2E8F0", padding: "2.5vh 2.5vw", boxShadow: "0 2px 12px rgba(30,58,95,0.06)" }}>
            <div style={{ fontSize: "1vw", fontWeight: 700, color: "#0D9488", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1.5vh" }}>Real-time Layer</div>
            <div style={{ fontSize: "1.15vw", color: "#1E3A5F", lineHeight: 1.6, fontWeight: 500 }}>Socket.IO WebSocket channel for live order events between Waiter and Kitchen dashboards</div>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "1vw", border: "1px solid #E2E8F0", padding: "2.5vh 2.5vw", boxShadow: "0 2px 12px rgba(30,58,95,0.06)" }}>
            <div style={{ fontSize: "1vw", fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1.5vh" }}>API Contract</div>
            <div style={{ fontSize: "1.15vw", color: "#1E3A5F", lineHeight: 1.6, fontWeight: 500 }}>openapi.yaml → Orval codegen → typed React Query hooks + Zod validators</div>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "1vw", border: "1px solid #E2E8F0", padding: "2.5vh 2.5vw", boxShadow: "0 2px 12px rgba(30,58,95,0.06)" }}>
            <div style={{ fontSize: "1vw", fontWeight: 700, color: "#D97706", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1.5vh" }}>Monorepo</div>
            <div style={{ fontSize: "1.15vw", color: "#1E3A5F", lineHeight: 1.6, fontWeight: 500 }}>pnpm workspaces with shared libs: api-spec, db, api-client-react, api-zod</div>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "1vw", border: "1px solid #E2E8F0", padding: "2.5vh 2.5vw", boxShadow: "0 2px 12px rgba(30,58,95,0.06)" }}>
            <div style={{ fontSize: "1vw", fontWeight: 700, color: "#DC2626", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1.5vh" }}>Auth</div>
            <div style={{ fontSize: "1.15vw", color: "#1E3A5F", lineHeight: 1.6, fontWeight: 500 }}>JWT stored in localStorage as hms_token, sent as Bearer token on every request</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E2E8F0", paddingTop: "1.5vh", marginTop: "1.5vh", fontSize: "0.85vw", color: "#94A3B8", fontWeight: 500 }}>
        <div>Shagun Tadka — Restaurant Management System</div>
        <div><span>Slide 4 of 11</span></div>
      </div>
    </div>
  );
}
