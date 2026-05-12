export default function Slide02WhatIs() {
  return (
    <div style={{
      width: "100vw", height: "100vh", overflow: "hidden",
      backgroundColor: "#FAFBFC", fontFamily: "'Inter', sans-serif",
      padding: "3vh 4vw", boxSizing: "border-box", position: "relative",
      display: "grid", gridTemplateColumns: "1fr 1fr",
      gridTemplateRows: "auto 1fr auto", gap: "0 4vw", color: "#1E3A5F"
    }}>
      {/* Header */}
      <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: "2vh", marginBottom: "2vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
          <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#0D9488", borderRadius: "0.35vw" }} />
          <div style={{ fontSize: "1.2vw", fontWeight: 800, color: "#1E3A5F" }}>Shagun Tadka</div>
        </div>
        <div style={{ fontSize: "0.95vw", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>What is it?</div>
      </div>

      {/* Left */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: "1.05vw", fontWeight: 700, color: "#0D9488", marginBottom: "1vh", textTransform: "uppercase", letterSpacing: "0.08em" }}>Overview</div>
        <h1 style={{ fontSize: "3.8vw", fontWeight: 900, margin: "0 0 2vh 0", lineHeight: 1.1, letterSpacing: "-0.02em" }}>What is Shagun Tadka?</h1>
        <p style={{ fontSize: "1.3vw", color: "#475569", lineHeight: 1.6, margin: "0 0 3vh 0" }}>
          A role-based web application built for Indian restaurants and hotels. Four dedicated staff dashboards. One unified system.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5vw", background: "#FFFFFF", padding: "1.8vh 2vw", borderRadius: "0.8vw", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(30,58,95,0.05)" }}>
            <div style={{ width: "2.2vw", height: "2.2vw", backgroundColor: "rgba(13,148,136,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1vw", fontWeight: 800, color: "#0D9488", flexShrink: 0 }}>1</div>
            <div style={{ fontSize: "1.1vw", fontWeight: 600, color: "#1E3A5F" }}>Four staff dashboards: Waiter, Kitchen, Accountant, Owner</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5vw", background: "#FFFFFF", padding: "1.8vh 2vw", borderRadius: "0.8vw", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(30,58,95,0.05)" }}>
            <div style={{ width: "2.2vw", height: "2.2vw", backgroundColor: "rgba(13,148,136,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1vw", fontWeight: 800, color: "#0D9488", flexShrink: 0 }}>2</div>
            <div style={{ fontSize: "1.1vw", fontWeight: 600, color: "#1E3A5F" }}>Real-time order updates between Waiter and Kitchen via Socket.IO</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5vw", background: "#FFFFFF", padding: "1.8vh 2vw", borderRadius: "0.8vw", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(30,58,95,0.05)" }}>
            <div style={{ width: "2.2vw", height: "2.2vw", backgroundColor: "rgba(13,148,136,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1vw", fontWeight: 800, color: "#0D9488", flexShrink: 0 }}>3</div>
            <div style={{ fontSize: "1.1vw", fontWeight: 600, color: "#1E3A5F" }}>JWT-secured login with role-based access control</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5vw", background: "#FFFFFF", padding: "1.8vh 2vw", borderRadius: "0.8vw", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(30,58,95,0.05)" }}>
            <div style={{ width: "2.2vw", height: "2.2vw", backgroundColor: "rgba(13,148,136,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1vw", fontWeight: 800, color: "#0D9488", flexShrink: 0 }}>4</div>
            <div style={{ fontSize: "1.1vw", fontWeight: 600, color: "#1E3A5F" }}>Built mobile-first — works great on smartphones on the go</div>
          </div>
        </div>
      </div>

      {/* Right: role cards */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "2vh" }}>
        {[
          { role: "Owner", color: "#0D9488", bg: "rgba(13,148,136,0.08)", desc: "Analytics, menu, staff, inventory, expenses" },
          { role: "Waiter", color: "#2563EB", bg: "rgba(37,99,235,0.08)", desc: "Table grid, create orders, track status" },
          { role: "Kitchen", color: "#D97706", bg: "rgba(217,119,6,0.08)", desc: "Live order tickets, status management" },
          { role: "Accountant", color: "#7C3AED", bg: "rgba(124,58,237,0.08)", desc: "Billing, GST invoices, daily reports" },
        ].map((r) => (
          <div key={r.role} style={{ background: "#FFFFFF", padding: "2.5vh 2.5vw", borderRadius: "1vw", border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(30,58,95,0.06)", display: "flex", alignItems: "center", gap: "2vw" }}>
            <div style={{ width: "3.5vw", height: "3.5vw", backgroundColor: r.bg, borderRadius: "0.8vw", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ width: "1.4vw", height: "1.4vw", backgroundColor: r.color, borderRadius: "50%" }} />
            </div>
            <div>
              <div style={{ fontSize: "1.3vw", fontWeight: 800, color: r.color }}>{r.role}</div>
              <div style={{ fontSize: "1vw", color: "#64748B", marginTop: "0.3vh" }}>{r.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E2E8F0", paddingTop: "1.5vh", fontSize: "0.85vw", color: "#94A3B8", fontWeight: 500, marginTop: "1vh" }}>
        <div>Shagun Tadka — Restaurant Management System</div>
        <div><span>Slide 2 of 11</span></div>
      </div>
    </div>
  );
}
