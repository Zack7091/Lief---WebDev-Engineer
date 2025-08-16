import React, { useEffect, useState } from "react";
import styles from "@/styles/dashboard.module.css";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard-data")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error(err));
  }, []);

  if (!data) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <h1>📊 Admin Dashboard</h1>
        <a href="/" className={styles.backBtn}>← Back to Home</a>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Avg hours / day</h3>
          <p>{data.avgHoursPerDay || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>People clocking in / day (avg)</h3>
          <p>{data.avgPeoplePerDay || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Currently clocked-in</h3>
          <p>{data.currentlyClockedInCount || 0}</p>
        </div>
      </section>

      <section className={styles.tableSection}>
        <h2>Currently Clocked In</h2>
        {data.currentlyClockedIn?.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Name</th>
                <th>Since</th>
              </tr>
            </thead>
            <tbody>
              {data.currentlyClockedIn.map((user: any) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{user.name}</td>
                  <td>{user.since}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No one is clocked in right now.</p>
        )}
      </section>

      <section className={styles.tableSection}>
        <h2>Total Hours — last 7 days</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Email</th>
              <th>Name</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            {data.totalHours?.map((user: any) => (
              <tr key={user.userId}>
                <td>{user.userId}</td>
                <td>{user.email}</td>
                <td>{user.name}</td>
                <td>{user.hours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
