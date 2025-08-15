import React, { useEffect, useState } from "react";
import { Card, Row, Col, Table, Statistic, Button } from "antd";

type User = { id: string; email: string; name?: string };

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [hoursRows, setHoursRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<any>(null);

  async function runGraphQL(q: string) {
    const res = await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q }),
    });
    const json = await res.json();
    return json;
  }

  async function fetchAll() {
    setLoading(true);
    setError(null);
    setRaw(null);
    try {
      // 1) Currently clocked-in logs -> unique users
      const r1 = await runGraphQL(`query {
        getClockedInStaff {
          user { id email name }
        }
      }`);
      if (r1.errors) throw new Error(r1.errors[0]?.message || "getClockedInStaff error");
      const uniq = new Map<string, User>();
      (r1.data?.getClockedInStaff ?? []).forEach((l: any) => {
        const u = l.user;
        if (u && !uniq.has(u.id)) uniq.set(u.id, u);
      });
      const clockedInUsers: User[] = Array.from(uniq.values());
      setUsers(clockedInUsers);
      setRaw((p: any) => ({ ...p, getClockedInStaff: r1 }));

      // 2) Dashboard stats
      const r2 = await runGraphQL(`query {
        dashboardStats {
          avgHoursPerDay
          avgPeoplePerDay
          peoplePerDayByDate { date count }
          totalHoursLast7DaysPerUser { userId totalHours }
        }
      }`);
      if (r2.errors) throw new Error(r2.errors[0]?.message || "dashboardStats error");
      const ds = r2.data?.dashboardStats;
      setStats(ds);
      setRaw((p: any) => ({ ...p, dashboardStats: r2 }));

      // 3) All users (email lookup for hours table)
      const r3 = await runGraphQL(`query { users { id email name } }`);
      if (r3.errors) throw new Error(r3.errors[0]?.message || "users error");
      const userMap: Record<string, { email: string; name?: string }> = {};
      (r3.data?.users ?? []).forEach((u: any) => (userMap[u.id] = { email: u.email, name: u.name }));

      const rows =
        ds?.totalHoursLast7DaysPerUser?.map((x: any) => ({
          userId: x.userId,
          email: userMap[x.userId]?.email || "—",
          hours: x.totalHours,
        })) ?? [];
      setHoursRows(rows);
      setRaw((p: any) => ({ ...p, users: r3 }));
    } catch (e: any) {
      console.error("fetchAll error:", e);
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  return (
    <div style={{ padding: 24, background: "#071226", minHeight: "100vh" }}>
      <Card style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Row gutter={24} style={{ marginBottom: 12 }}>
          <Col span={8}>
            <Statistic title="Avg hours / day" value={stats ? Number(stats.avgHoursPerDay).toFixed(2) : "--"} />
          </Col>
          <Col span={8}>
            <Statistic title="People clocking in / day (avg)" value={stats?.avgPeoplePerDay ?? "--"} />
          </Col>
          <Col span={8}>
            <Statistic title="Currently clocked-in" value={users.length} />
          </Col>
        </Row>

        <div style={{ marginBottom: 12 }}>
          <Button onClick={() => fetchAll()} style={{ marginRight: 8 }}>Refresh</Button>
          <Button onClick={async () => {
            const r = await runGraphQL("{ hello }");
            setRaw((p: any) => ({ ...p, hello: r }));
            alert("hello returned, check Raw response below");
          }}>Run hello</Button>
        </div>

        {loading && <div style={{ color: "#666" }}>Loading...</div>}
        {error && <div style={{ color: "red", marginBottom: 12 }}>Error: {error}</div>}

        <h3>Currently clocked in</h3>
        <Table
          dataSource={users}
          rowKey="id"
          pagination={false}
          columns={[
            { title: "ID", dataIndex: "id", key: "id" },
            { title: "Email", dataIndex: "email", key: "email" },
            { title: "Name", dataIndex: "name", key: "name" },
          ]}
        />

        <h3 style={{ marginTop: 20 }}>Total Hours — last 7 days</h3>
        <Table
          dataSource={hoursRows}
          rowKey="userId"
          pagination={false}
          columns={[
            { title: "User ID", dataIndex: "userId", key: "userId" },
            { title: "Email", dataIndex: "email", key: "email" },
            { title: "Hours", dataIndex: "hours", key: "hours", render: (v) => Number(v).toFixed(2) },
          ]}
        />

        <h3 style={{ marginTop: 20 }}>Raw responses (debug)</h3>
        <pre style={{ maxHeight: 300, overflow: "auto", background: "#0f1724", color: "#c7d2fe", padding: 12 }}>
{JSON.stringify(raw, null, 2)}
        </pre>
      </Card>
    </div>
  );
}
