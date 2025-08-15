// src/pages/profile.tsx
import { useUser } from '@auth0/nextjs-auth0/client';

export default function Profile() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div style={{padding:20}}>Loading...</div>;
  if (error) return <div style={{padding:20}}>Error: {error.message}</div>;
  if (!user) return <div style={{padding:20}}><a href="/api/auth/login">Login</a></div>;

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h2>Profile</h2>
      <pre style={{ background: '#f6f6f6', padding: 12 }}>{JSON.stringify(user, null, 2)}</pre>
      <p><a href="/api/auth/logout">Logout</a></p>
    </div>
  );
}
