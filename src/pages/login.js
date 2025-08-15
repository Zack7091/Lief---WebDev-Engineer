// pages/login.js
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");

  // build the login URL — we include login_hint so Auth0 can prefill the email
  const loginHref = `/api/auth/login?connection=email${email ? `&login_hint=${encodeURIComponent(email)}` : ""}`;

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div className="center-card" style={{ width: "100%", maxWidth: 540 }}>
        <h2 style={{ margin: 0, fontSize: 28 }}>Sign in with Email</h2>
        <p style={{ color: "#b8cbe6", marginTop: 10 }}>
          Enter your email and we'll send a magic link
        </p>

        <label className="label">Email</label>
        <input
          className="input"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address"
        />

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 6, flexWrap: "wrap" }}>
          <a className="btn btn--primary" href={loginHref}>Send Magic Link</a>
          <a className="btn btn--ghost" href="/">Cancel</a>
        </div>

        <p className="helper" style={{ marginTop: 18 }}>
        
        </p>
      </div>
    </div>
  );
}
