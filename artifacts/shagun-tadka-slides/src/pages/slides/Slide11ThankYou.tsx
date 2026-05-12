export default function Slide11ThankYou() {
  return (
    <div style={{
      width: "100vw", height: "100vh", overflow: "hidden",
      backgroundColor: "#1E3A5F", fontFamily: "'Inter', sans-serif",
      padding: "3vh 4vw", boxSizing: "border-box", position: "relative",
      display: "grid", gridTemplateRows: "auto 1fr auto",
      color: "#F8FAFC"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.12)", paddingBottom: "2vh", marginBottom: "0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
          <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#0D9488", borderRadius: "0.35vw" }} />
          <div style={{ fontSize: "1.2vw", fontWeight: 800, color: "#F8FAFC" }}>Shagun Tadka</div>
        </div>
        <div style={{ fontSize: "0.95vw", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Thank You</div>
      </div>

      {/* Center content */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ width: "8vw", height: "8vw", backgroundColor: "rgba(13,148,136,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "4vh" }}>
          <div style={{ width: "4vw", height: "4vw", backgroundColor: "#0D9488", borderRadius: "50%" }} />
        </div>

        <h1 style={{ fontSize: "7vw", fontWeight: 900, margin: "0 0 1.5vh 0", lineHeight: 1.0, letterSpacing: "-0.03em", color: "#F8FAFC" }}>
          Shagun Tadka
        </h1>
        <p style={{ fontSize: "1.6vw", color: "rgba(255,255,255,0.55)", margin: "0 0 5vh 0", lineHeight: 1.5, fontWeight: 400 }}>
          Built with TypeScript, React, Node.js, PostgreSQL
        </p>

        <div style={{ display: "flex", gap: "2vw", marginBottom: "6vh" }}>
          <div style={{ background: "rgba(13,148,136,0.15)", border: "1px solid rgba(13,148,136,0.3)", borderRadius: "2vw", padding: "1vh 2.5vw", fontSize: "1.1vw", fontWeight: 700, color: "#0D9488" }}>Role-based</div>
          <div style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "2vw", padding: "1vh 2.5vw", fontSize: "1.1vw", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Real-time</div>
          <div style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "2vw", padding: "1vh 2.5vw", fontSize: "1.1vw", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Mobile-first</div>
        </div>

        <div style={{ display: "flex", gap: "3vw", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1.2vw", padding: "3vh 5vw" }}>
          {[
            { label: "Owner", email: "owner@hotel.com" },
            { label: "Waiter", email: "waiter@hotel.com" },
            { label: "Kitchen", email: "kitchen@hotel.com" },
            { label: "Accountant", email: "accountant@hotel.com" },
          ].map((cred, i) => (
            <div key={cred.label} style={{ display: "flex", alignItems: "center", gap: "3vw" }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.85vw", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4vh" }}>{cred.label}</div>
                <div style={{ fontSize: "1.05vw", fontWeight: 600, color: "#0D9488" }}>{cred.email}</div>
              </div>
              {i < 3 && <div style={{ width: "1px", height: "4vh", backgroundColor: "rgba(255,255,255,0.1)" }} />}
            </div>
          ))}
        </div>
        <div style={{ marginTop: "2vh", fontSize: "1vw", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>All passwords: password123</div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.5vh", fontSize: "0.85vw", color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>
        <div>Shagun Tadka — Restaurant Management System</div>
        <div><span>Slide 11 of 11</span></div>
      </div>
    </div>
  );
}
