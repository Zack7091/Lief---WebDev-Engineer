import Link from "next/link";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div className="center-card" style={{ width: "100%", maxWidth: 900 }}>
        <h1 style={{ margin: 0, fontSize: 36, letterSpacing: "-0.02em" }}>Lief Clock-In</h1>
        <p style={{ color: "#b8cbe6", marginTop: 12 }}>
          Clock your shift with one click — mobile and web friendly.
        </p>

        <div style={{ marginTop: 28, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login" legacyBehavior><a className="btn btn--primary">Login with Email</a></Link>
          <Link href="/admin/dashboard" legacyBehavior><a className="btn btn--ghost">Go to Dashboard</a></Link>
        </div>

        <p className="helper" style={{ marginTop: 22 }}>
          
        </p>
      </div>
    </div>
  );
}