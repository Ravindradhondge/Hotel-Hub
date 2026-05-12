export default function Slide07Database() {
  return (
    <div style={{
      width: "100vw", height: "100vh", overflow: "hidden",
      backgroundColor: "#FAFBFC", fontFamily: "'Inter', sans-serif",
      padding: "3vh 4vw", boxSizing: "border-box", position: "relative",
      display: "grid", gridTemplateColumns: "45fr 55fr",
      gridTemplateRows: "auto 1fr auto", gap: "0 4vw", color: "#1E3A5F"
    }}>
      {/* Header */}
      <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: "2vh", marginBottom: "2.5vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
          <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#0D9488", borderRadius: "0.35vw" }} />
          <div style={{ fontSize: "1.2vw", fontWeight: 800, color: "#1E3A5F" }}>Shagun Tadka</div>
        </div>
        <div style={{ fontSize: "0.95vw", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>Database</div>
      </div>

      {/* Left */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: "1.05vw", fontWeight: 700, color: "#7C3AED", marginBottom: "1vh", textTransform: "uppercase", letterSpacing: "0.08em" }}>PostgreSQL + Drizzle ORM</div>
        <h1 style={{ fontSize: "3.5vw", fontWeight: 900, margin: "0 0 2vh 0", lineHeight: 1.1, letterSpacing: "-0.02em" }}>Database Layer</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh" }}>
          <div style={{ background: "#FFFFFF", padding: "2vh 2vw", borderRadius: "0.8vw", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(30,58,95,0.05)" }}>
            <div style={{ fontSize: "0.9vw", fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: "0.5vh" }}>PostgreSQL</div>
            <div style={{ fontSize: "1.1vw", color: "#1E3A5F", fontWeight: 500 }}>Relational, ACID-compliant, hosted on Replit</div>
          </div>
          <div style={{ background: "#FFFFFF", padding: "2vh 2vw", borderRadius: "0.8vw", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(30,58,95,0.05)" }}>
            <div style={{ fontSize: "0.9vw", fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: "0.5vh" }}>Drizzle ORM</div>
            <div style={{ fontSize: "1.1vw", color: "#1E3A5F", fontWeight: 500 }}>Type-safe SQL queries written in TypeScript</div>
          </div>
          <div style={{ background: "#FFFFFF", padding: "2vh 2vw", borderRadius: "0.8vw", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(30,58,95,0.05)" }}>
            <div style={{ fontSize: "0.9vw", fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: "0.5vh" }}>Schema-first</div>
            <div style={{ fontSize: "1.1vw", color: "#1E3A5F", fontWeight: 500 }}>Drizzle schema → Zod validators via drizzle-zod</div>
          </div>
          <div style={{ background: "#FFFFFF", padding: "2vh 2vw", borderRadius: "0.8vw", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(30,58,95,0.05)" }}>
            <div style={{ fontSize: "0.9vw", fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: "0.5vh" }}>Migrations</div>
            <div style={{ fontSize: "1.05vw", color: "#7C3AED", fontWeight: 700, fontFamily: "monospace" }}>pnpm --filter @workspace/db run push</div>
          </div>
        </div>
      </div>

      {/* Right: tables */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ background: "#FFFFFF", borderRadius: "1.2vw", border: "1px solid #E2E8F0", padding: "2.5vh 2.5vw", boxShadow: "0 4px 20px rgba(30,58,95,0.08)" }}>
          <div style={{ fontSize: "1vw", fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2vh" }}>Database Tables</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2vh" }}>
            {[
              { table: "users", desc: "Staff accounts + roles" },
              { table: "tables", desc: "Restaurant table layout" },
              { table: "menu_items", desc: "Food menu with pricing" },
              { table: "orders", desc: "Order lifecycle tracking" },
              { table: "order_items", desc: "Items within each order" },
              { table: "payments", desc: "Payment records + GST" },
              { table: "inventory", desc: "Stock levels + alerts" },
              { table: "expenses", desc: "Monthly expense log" },
              { table: "attendance", desc: "Staff check-in / out" },
            ].map((t) => (
              <div key={t.table} style={{ display: "flex", alignItems: "flex-start", gap: "0.8vw", padding: "1.2vh 1.2vw", background: "rgba(124,58,237,0.04)", borderRadius: "0.6vw", border: "1px solid rgba(124,58,237,0.1)" }}>
                <div style={{ width: "0.5vw", height: "0.5vw", backgroundColor: "#7C3AED", borderRadius: "50%", marginTop: "0.6vh", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "0.95vw", fontWeight: 700, color: "#7C3AED", fontFamily: "monospace" }}>{t.table}</div>
                  <div style={{ fontSize: "0.8vw", color: "#64748B", marginTop: "0.2vh" }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E2E8F0", paddingTop: "1.5vh", marginTop: "1vh", fontSize: "0.85vw", color: "#94A3B8", fontWeight: 500 }}>
        <div>Shagun Tadka — Restaurant Management System</div>
        <div><span>Slide 7 of 11</span></div>
      </div>
    </div>
  );
}
