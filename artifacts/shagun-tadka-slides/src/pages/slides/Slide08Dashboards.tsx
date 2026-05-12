export default function Slide08Dashboards() {
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
        <div style={{ fontSize: "0.95vw", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>Role Dashboards</div>
      </div>

      <div style={{ marginBottom: "3vh" }}>
        <div style={{ fontSize: "1.05vw", fontWeight: 700, color: "#0D9488", marginBottom: "0.8vh", textTransform: "uppercase", letterSpacing: "0.08em" }}>Four roles, four dashboards</div>
        <h1 style={{ fontSize: "3.5vw", fontWeight: 900, margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em" }}>Role-Based Dashboards</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "2vw" }}>
        {[
          {
            role: "Waiter", color: "#2563EB", bg: "rgba(37,99,235,0.06)", border: "rgba(37,99,235,0.15)",
            steps: ["Table grid view", "Create new order", "Track live status", "Cancel pending orders"]
          },
          {
            role: "Kitchen", color: "#D97706", bg: "rgba(217,119,6,0.06)", border: "rgba(217,119,6,0.15)",
            steps: ["Live incoming tickets", "Start Cooking action", "Mark Ready status", "Real-time via Socket.IO"]
          },
          {
            role: "Accountant", color: "#7C3AED", bg: "rgba(124,58,237,0.06)", border: "rgba(124,58,237,0.15)",
            steps: ["Pending bills queue", "GST invoice generation", "Collect payment", "Daily report view"]
          },
          {
            role: "Owner", color: "#0D9488", bg: "rgba(13,148,136,0.06)", border: "rgba(13,148,136,0.15)",
            steps: ["Revenue analytics", "Monthly charts", "Top-selling items", "Menu, inventory, expenses, staff"]
          },
        ].map((d) => (
          <div key={d.role} style={{ background: "#FFFFFF", borderRadius: "1.2vw", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 4px 20px rgba(30,58,95,0.07)", display: "flex", flexDirection: "column" }}>
            <div style={{ backgroundColor: d.bg, borderBottom: `1px solid ${d.border}`, padding: "2.5vh 2vw" }}>
              <div style={{ fontSize: "1.5vw", fontWeight: 900, color: d.color }}>{d.role}</div>
              <div style={{ fontSize: "0.85vw", color: "#64748B", marginTop: "0.3vh", fontWeight: 500 }}>Dashboard</div>
            </div>
            <div style={{ padding: "2vh 2vw", display: "flex", flexDirection: "column", gap: "1.5vh", flex: 1 }}>
              {d.steps.map((step, i) => (
                <div key={step} style={{ display: "flex", alignItems: "flex-start", gap: "1vw" }}>
                  <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: `${d.color}20`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75vw", fontWeight: 800, color: d.color, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: "0.95vw", color: "#1E3A5F", fontWeight: 500, lineHeight: 1.4 }}>{step}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E2E8F0", paddingTop: "1.5vh", marginTop: "2vh", fontSize: "0.85vw", color: "#94A3B8", fontWeight: 500 }}>
        <div>Shagun Tadka — Restaurant Management System</div>
        <div><span>Slide 8 of 11</span></div>
      </div>
    </div>
  );
}
