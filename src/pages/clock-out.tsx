import React from "react";

export default function ClockOut() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "linear-gradient(180deg, #071226 0%, #050813 100%)",
      color: "#fff"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.05)",
        padding: "30px",
        borderRadius: "12px",
        textAlign: "center"
      }}>
        <h1>Clock Out</h1>
        <p>This is the Clock Out page.</p>
        <a href="/" style={{
          display: "inline-block",
          marginTop: "15px",
          padding: "10px 16px",
          borderRadius: "8px",
          background: "#4f46e5",
          color: "#fff",
          textDecoration: "none"
        }}>Back Home</a>
      </div>
    </main>
  );
}
