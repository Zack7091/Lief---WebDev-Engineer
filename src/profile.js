// pages/profile.js
import { useUser } from '@auth0/nextjs-auth0/client';

export default function Profile() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div style={{padding:24}}>Loading...</div>;
  if (error) return <div style={{padding:24}}>Error: {error.message}</div>;
  if (!user) return <div style={{padding:24}}>Not signed in. <a href="/api/auth/login">Sign in</a></div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Profile</h1>
      <pre style={{ background: "#071226", padding: 12, borderRadius: 8 }}>{JSON.stringify(user, null, 2)}</pre>
      <p style={{ marginTop: 12 }}>
        <a className="btn btn--ghost" href="/api/auth/logout">Logout</a>
      </p>
    </div>
  );
}
