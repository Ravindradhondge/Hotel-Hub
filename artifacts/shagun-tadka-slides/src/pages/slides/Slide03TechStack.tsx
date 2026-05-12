export default function Slide03TechStack() {
  return (
    <div style={{
      width: "100vw", height: "100vh", overflow: "hidden",
      backgroundColor: "#FAFBFC", fontFamily: "'Inter', sans-serif",
      padding: "3vh 4vw", boxSizing: "border-box", position: "relative",
      display: "grid", gridTemplateRows: "auto auto 1fr auto",
      gap: "0", color: "#1E3A5F"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: "2vh", marginBottom: "2.5vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
          <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#0D9488", borderRadius: "0.35vw" }} />
          <div style={{ fontSize: "1.2vw", fontWeight: 800, color: "#1E3A5F" }}>Shagun Tadka</div>
        </div>
        <div style={{ fontSize: "0.95vw", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>Technology Stack</div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: "3vh" }}>
        <div style={{ fontSize: "1.05vw", fontWeight: 700, color: "#0D9488", marginBottom: "0.8vh", textTransform: "uppercase", letterSpacing: "0.08em" }}>Full-Stack TypeScript</div>
        <h1 style={{ fontSize: "3.5vw", fontWeight: 900, margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em" }}>Technology Stack at a Glance</h1>
      </div>

      {/* Cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1.5vw", alignContent: "start" }}>
        {[
          { layer: "Frontend", color: "#2563EB", bg: "rgba(37,99,235,0.06)", items: ["React 18", "Vite", "TypeScript", "TailwindCSS", "TanStack Query", "Socket.IO client"] },
          { layer: "Backend", color: "#0D9488", bg: "rgba(13,148,136,0.06)", items: ["Node.js 24", "Express 5", "Socket.IO", "JWT Auth", "Pino Logger", "esbuild"] },
          { layer: "Database", color: "#7C3AED", bg: "rgba(124,58,237,0.06)", items: ["PostgreSQL", "Drizzle ORM", "drizzle-zod", "TypeScript types", "Schema-first", "Migrations"] },
          { layer: "API Design", color: "#D97706", bg: "rgba(217,119,6,0.06)", items: ["OpenAPI 3.0", "Orval codegen", "React Query hooks", "Zod validators", "Contract-first", "Type-safe"] },
          { layer: "Tooling", color: "#DC2626", bg: "rgba(220,38,38,0.06)", items: ["pnpm workspaces", "TypeScript 5.9", "Wouter router", "Shadcn/UI", "Monorepo libs", "esbuild"] },
        ].map((col) => (
          <div key={col.layer} style={{ background: "#FFFFFF", borderRadius: "1vw", border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(30,58,95,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "1.5vh 1.5vw", backgroundColor: col.bg, borderBottom: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: "1vw", fontWeight: 800, color: col.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{col.layer}</div>
            </div>
            <div style={{ padding: "1.5vh 1.5vw", display: "flex", flexDirection: "column", gap: "1.2vh" }}>
              {col.items.map((item) => (
                <div key={item} style={{ fontSize: "0.95vw", fontWeight: 500, color: "#1E3A5F", display: "flex", alignItems: "center", gap: "0.6vw" }}>
                  <div style={{ width: "0.5vw", height: "0.5vw", backgroundColor: col.color, borderRadius: "50%", flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Language badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E2E8F0", paddingTop: "1.5vh", marginTop: "2vh", fontSize: "0.85vw", color: "#94A3B8", fontWeight: 500 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
          <div style={{ backgroundColor: "rgba(13,148,136,0.1)", color: "#0D9488", fontWeight: 700, fontSize: "0.9vw", padding: "0.4vh 1vw", borderRadius: "2vw" }}>TypeScript end-to-end — frontend + backend</div>
        </div>
        <div><span>Slide 3 of 11</span></div>
      </div>
    </div>
  );
}
