import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  // Button styles
  const loginBtnStyle = {
    background: hoveredBtn === "login" ? "linear-gradient(90deg,#2563eb,#1e40af)" : "linear-gradient(90deg,#3b82f6,#2563eb)",
    boxShadow: hoveredBtn === "login" ? "0 4px 24px #2563eb55" : "0 2px 8px #2563eb33",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "14px 32px",
    fontWeight: 700,
    fontSize: "1.1rem",
    letterSpacing: "0.01em",
    cursor: "pointer",
    transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
    outline: "none",
    textDecoration: "none",
    display: "inline-block",
  };

  const dashBtnStyle = {
    background: hoveredBtn === "dashboard" ? "white" : "transparent",
    color: hoveredBtn === "dashboard" ? "#2563eb" : "white",
    border: "2px solid white",
    borderRadius: "10px",
    padding: "14px 32px",
    fontWeight: 700,
    fontSize: "1.1rem",
    letterSpacing: "0.01em",
    cursor: "pointer",
    transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
    outline: "none",
    textDecoration: "none",
    display: "inline-block",
    boxShadow: hoveredBtn === "dashboard" ? "0 4px 24px #fff2" : "0 2px 8px #fff1",
  };

  return (
    <>
      <Head>
        <title>Lief Clock-In</title>
        <meta
          name="description"
          content="Clock your shift with one click — mobile and web friendly."
        />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          width: "100vw",
          background: "radial-gradient(ellipse at top left,#1e293b 60%,#111 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            background: "rgba(17,17,17,0.96)",
            borderRadius: "18px",
            boxShadow: "0 8px 32px #0008",
            padding: "48px 32px",
            maxWidth: "420px",
            width: "100%",
            textAlign: "center",
            border: "1px solid #222",
          }}
        >
          <h1
            style={{
              fontSize: "2.7rem",
              fontWeight: 800,
              marginBottom: "12px",
              background: "linear-gradient(90deg,#3b82f6,#38bdf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
            }}
          >
            Lief Clock-In
          </h1>
          <p style={{ fontSize: "1.15rem", color: "#94a3b8", marginBottom: "36px" }}>
            Clock your shift with one click — mobile and web friendly.
          </p>

          <div style={{ display: "flex", gap: "18px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/api/auth/login"
              style={loginBtnStyle}
              onMouseEnter={() => setHoveredBtn("login")}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              Login with Email
            </Link>
            <Link
              href="/dashboard"
              style={dashBtnStyle}
              onMouseEnter={() => setHoveredBtn("dashboard")}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
        <div style={{ marginTop: "32px", color: "#64748b", fontSize: "0.98rem" }}>
          &copy; {new Date().getFullYear()} Lief. All Riyaz rights reserved.
        </div>
      </div>
    </>
  );
}