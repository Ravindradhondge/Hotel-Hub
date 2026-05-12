export default function Slide10APIDesign() {
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
        <div style={{ fontSize: "0.95vw", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>API Design</div>
      </div>

      {/* Left */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: "1.05vw", fontWeight: 700, color: "#D97706", marginBottom: "1vh", textTransform: "uppercase", letterSpacing: "0.08em" }}>Contract-First</div>
        <h1 style={{ fontSize: "3.5vw", fontWeight: 900, margin: "0 0 2.5vh 0", lineHeight: 1.1, letterSpacing: "-0.02em" }}>API Design</h1>

        {/* Flow diagram */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0", marginBottom: "3vh" }}>
          {[
            { label: "openapi.yaml", sub: "Single source of truth — all endpoints defined here", color: "#D97706", bg: "rgba(217,119,6,0.08)" },
            { label: "Orval codegen", sub: "Generates React Query hooks + Zod schemas automatically", color: "#2563EB", bg: "rgba(37,99,235,0.08)" },
            { label: "API Client (hooks)", sub: "Frontend calls typed hooks — never raw fetch", color: "#0D9488", bg: "rgba(13,148,136,0.08)" },
            { label: "Route Handlers", sub: "Backend validates all inputs with auto-generated Zod schemas", color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
          ].map((item, i) => (
            <div key={item.label} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ backgroundColor: item.bg, border: `1px solid ${item.color}30`, borderRadius: "0.8vw", padding: "1.5vh 2vw", display: "flex", alignItems: "center", gap: "1.5vw" }}>
                <div style={{ fontSize: "1.1vw", fontWeight: 800, color: item.color, minWidth: "9vw" }}>{item.label}</div>
                <div style={{ fontSize: "0.95vw", color: "#64748B" }}>{item.sub}</div>
              </div>
              {i < 3 && (
                <div style={{ display: "flex", alignItems: "center", paddingLeft: "2vw", paddingTop: "0.5vh", paddingBottom: "0.5vh" }}>
                  <div style={{ fontSize: "1.2vw", color: "#CBD5E1" }}>&#8595;</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "2vh" }}>
        <div style={{ background: "#FFFFFF", borderRadius: "1.2vw", border: "1px solid #E2E8F0", padding: "3vh 3vw", boxShadow: "0 4px 20px rgba(30,58,95,0.08)" }}>
          <div style={{ fontSize: "1vw", fontWeight: 700, color: "#D97706", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2vh" }}>Result: Zero API Drift</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
              <div style={{ width: "0.6vw", height: "0.6vw", backgroundColor: "#0D9488", borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ fontSize: "1.1vw", fontWeight: 500, color: "#1E3A5F" }}>Full TypeScript coverage end-to-end</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
              <div style={{ width: "0.6vw", height: "0.6vw", backgroundColor: "#0D9488", borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ fontSize: "1.1vw", fontWeight: 500, color: "#1E3A5F" }}>Frontend and backend always in sync</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
              <div style={{ width: "0.6vw", height: "0.6vw", backgroundColor: "#0D9488", borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ fontSize: "1.1vw", fontWeight: 500, color: "#1E3A5F" }}>All inputs validated with generated Zod schemas</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
              <div style={{ width: "0.6vw", height: "0.6vw", backgroundColor: "#0D9488", borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ fontSize: "1.1vw", fontWeight: 500, color: "#1E3A5F" }}>No manual API integration code ever written</div>
            </div>
          </div>
        </div>

        <div style={{ background: "#1E3A5F", borderRadius: "1.2vw", padding: "2.5vh 3vw", boxShadow: "0 4px 20px rgba(30,58,95,0.15)" }}>
          <div style={{ fontSize: "0.9vw", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: "1.5vh", letterSpacing: "0.06em" }}>Codegen command</div>
          <div style={{ fontSize: "1.05vw", fontWeight: 700, color: "#0D9488", fontFamily: "monospace", lineHeight: 1.6 }}>
            pnpm --filter @workspace/api-spec run codegen
          </div>
          <div style={{ fontSize: "0.9vw", color: "rgba(255,255,255,0.4)", marginTop: "1vh" }}>Regenerates all hooks and Zod schemas from openapi.yaml</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E2E8F0", paddingTop: "1.5vh", marginTop: "1vh", fontSize: "0.85vw", color: "#94A3B8", fontWeight: 500 }}>
        <div>Shagun Tadka — Restaurant Management System</div>
        <div><span>Slide 10 of 11</span></div>
      </div>
    </div>
  );
}
