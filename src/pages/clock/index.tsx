import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';
import { Button, Input, Typography, message } from 'antd';

export default function ClockInPage() {
  const { user, isLoading } = useUser();
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
      setLocation(coords);
    });
  }, []);

  const handleClockIn = async () => {
    const res = await fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation {
            clockIn(
              userId: "${user?.sub}",
              location: "${location}",
              noteIn: "${note}"
            ) {
              id
            }
          }
        `,
      }),
    });

    const data = await res.json();
    if (data.data?.clockIn?.id) {
      message.success('✅ Clocked in successfully!');
    } else {
      message.error('❌ Failed to clock in.');
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (!user) return <a href="/api/auth/login">Login to continue</a>;

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={2}>Clock In</Typography.Title>
      <p>📍 Location: {location}</p>
      <Input.TextArea
        placeholder="Optional note"
        rows={2}
        onChange={(e) => setNote(e.target.value)}
      />
      <br /><br />
      <Button type="primary" onClick={handleClockIn}>Clock In</Button>
    </div>
  );
}
