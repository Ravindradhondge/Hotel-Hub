export default function Slide09Features() {
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
        <div style={{ fontSize: "0.95vw", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>Key Features</div>
      </div>

      <div style={{ marginBottom: "3vh" }}>
        <div style={{ fontSize: "1.05vw", fontWeight: 700, color: "#0D9488", marginBottom: "0.8vh", textTransform: "uppercase", letterSpacing: "0.08em" }}>What it does</div>
        <h1 style={{ fontSize: "3.5vw", fontWeight: 900, margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em" }}>Key Features</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "1fr 1fr", gap: "2vw" }}>
        {[
          { title: "Real-Time Orders", desc: "Waiter places order → Kitchen sees it instantly via Socket.IO WebSocket channel", color: "#0D9488" },
          { title: "Mobile-First UI", desc: "Every page optimized for smartphones — sticky bars, scrollable dialogs, touch-safe sizing", color: "#2563EB" },
          { title: "Attendance Tracking", desc: "Staff check-in and check-out with daily history and mobile attendance bar", color: "#7C3AED" },
          { title: "Expense Management", desc: "Log monthly expenses by category with breakdowns, filters, and trend visualization", color: "#D97706" },
          { title: "GST Billing", desc: "Auto-calculated invoices with CGST + SGST, printable receipts, daily payment reports", color: "#DC2626" },
          { title: "Inventory Alerts", desc: "Low-stock warnings on owner dashboard with OpenAPI-driven sync across all clients", color: "#059669" },
        ].map((f) => (
          <div key={f.title} style={{ background: "#FFFFFF", borderRadius: "1vw", border: "1px solid #E2E8F0", padding: "2.5vh 2.5vw", boxShadow: "0 2px 12px rgba(30,58,95,0.06)", display: "flex", flexDirection: "column", gap: "1vh" }}>
            <div style={{ width: "0.8vw", height: "0.8vw", backgroundColor: f.color, borderRadius: "50%" }} />
            <div style={{ fontSize: "1.2vw", fontWeight: 800, color: f.color }}>{f.title}</div>
            <div style={{ fontSize: "1vw", color: "#64748B", lineHeight: 1.5, fontWeight: 400 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E2E8F0", paddingTop: "1.5vh", marginTop: "2vh", fontSize: "0.85vw", color: "#94A3B8", fontWeight: 500 }}>
        <div>Shagun Tadka — Restaurant Management System</div>
        <div><span>Slide 9 of 11</span></div>
      </div>
    </div>
  );
}
