// src/pages/clock-in.tsx
import React, { useState } from "react";
import { Card, Form, Input, Button, Row, Col, message, Checkbox } from "antd";
import { EnvironmentOutlined, ClockCircleOutlined } from "@ant-design/icons";

const { TextArea } = Input;

export default function ClockInPage() {
  const [loading, setLoading] = useState(false);
  const [useManualLoc, setUseManualLoc] = useState(false);
  const [userId, setUserId] = useState("");
  const [manualLat, setManualLat] = useState<string>("");
  const [manualLng, setManualLng] = useState<string>("");

  const [formIn] = Form.useForm();
  const [formOut] = Form.useForm();

  // GraphQL helper
  async function runGraphQL(query: string, variables: any = {}) {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, variables }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.errors) throw new Error(data.errors[0]?.message || "GraphQL error");
      return data.data;
    } catch (err: any) {
      setLoading(false);
      throw err;
    }
  }

  // Browser geolocation
  function getPosition(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported by this browser."));
      } else {
        navigator.geolocation.getCurrentPosition(
          (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    });
  }

  async function onClockIn(values: any) {
    if (!userId) {
      message.error("Please enter User ID (from createUser).");
      return;
    }

    let lat: number | null = null;
    let lng: number | null = null;

    if (useManualLoc) {
      if (!manualLat || !manualLng) {
        message.error("Enter manual lat & lng or disable Manual mode.");
        return;
      }
      lat = parseFloat(manualLat);
      lng = parseFloat(manualLng);
      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        message.error("Manual coordinates are invalid numbers.");
        return;
      }
    } else {
      try {
        const pos = await getPosition();
        lat = pos.lat;
        lng = pos.lng;
      } catch (err: any) {
        message.error("Unable to get browser geolocation: " + (err.message || err));
        return;
      }
    }

    const noteIn = values.noteIn || null;

    const GQL = `
      mutation ClockIn($userId: String!, $lat: Float!, $lng: Float!, $noteIn: String) {
        clockIn(userId: $userId, lat: $lat, lng: $lng, noteIn: $noteIn) {
          id
          clockInAt
          clockInLoc
          user { id email name }
        }
      }
    `;

    try {
      const data = await runGraphQL(GQL, { userId, lat, lng, noteIn });
      message.success("Clocked IN — id: " + data.clockIn.id);
      formIn.resetFields();
    } catch (err: any) {
      message.error("ClockIn failed: " + (err.message || err));
    }
  }

  async function onClockOut(values: any) {
    if (!userId) {
      message.error("Please enter User ID (from createUser).");
      return;
    }

    let lat: number | null = null;
    let lng: number | null = null;

    if (useManualLoc) {
      if (manualLat) {
        lat = parseFloat(manualLat);
        if (Number.isNaN(lat)) {
          message.error("Manual latitude invalid.");
          return;
        }
      }
      if (manualLng) {
        lng = parseFloat(manualLng);
        if (Number.isNaN(lng)) {
          message.error("Manual longitude invalid.");
          return;
        }
      }
    } else {
      try {
        const pos = await getPosition();
        lat = pos.lat;
        lng = pos.lng;
      } catch {
        lat = null;
        lng = null;
      }
    }

    const noteOut = values.noteOut || null;

    const GQL = `
      mutation ClockOut($userId: String!, $lat: Float, $lng: Float, $noteOut: String) {
        clockOut(userId: $userId, lat: $lat, lng: $lng, noteOut: $noteOut) {
          id
          clockInAt
          clockOutAt
          clockOutLoc
        }
      }
    `;

    try {
      const data = await runGraphQL(GQL, { userId, lat: lat !== null ? lat : null, lng: lng !== null ? lng : null, noteOut });
      message.success("Clocked OUT — id: " + data.clockOut.id);
      formOut.resetFields();
    } catch (err: any) {
      message.error("ClockOut failed: " + (err.message || err));
    }
  }

  return (
    <>
      <div className="page-wrap">
        <Card
          className="glass-card"
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ClockCircleOutlined /> <span style={{ fontWeight: 700 }}>Clock In / Clock Out</span>
            </div>
          }
        >
          {/* Top controls */}
          <Row gutter={16} style={{ marginBottom: 8 }}>
            <Col span={14}>
              <Input
                placeholder="Paste user id (from createUser)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </Col>

            <Col span={10} style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <Checkbox checked={useManualLoc} onChange={(e) => setUseManualLoc(e.target.checked)}>
                Manual coords
              </Checkbox>
            </Col>
          </Row>

          {useManualLoc && (
            <Row gutter={16} style={{ marginBottom: 12 }}>
              <Col span={12}>
                <Input
                  placeholder="Manual latitude (e.g. 28.7041)"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                />
              </Col>
              <Col span={12}>
                <Input
                  placeholder="Manual longitude (e.g. 77.1025)"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                />
              </Col>
            </Row>
          )}

          <Row gutter={24}>
            <Col span={12}>
              <Form form={formIn} layout="vertical" onFinish={onClockIn}>
                <Form.Item label="Note (optional)" name="noteIn">
                  <TextArea rows={3} placeholder="Optional note for clock in" />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<EnvironmentOutlined />}
                    className="btn-neon-green"
                  >
                    Clock In
                  </Button>
                </Form.Item>
              </Form>
            </Col>

            <Col span={12}>
              <Form form={formOut} layout="vertical" onFinish={onClockOut}>
                <Form.Item label="Note (optional)" name="noteOut">
                  <TextArea rows={3} placeholder="Optional note for clock out" />
                </Form.Item>

                <Form.Item>
                  <Button danger onClick={() => formOut.submit()} loading={loading} className="btn-neon-pink">
                    Clock Out
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Dark bg + glass card + neon buttons */}
      <style jsx global>{`
        body {
          background:
            radial-gradient(40% 50% at 10% 20%, rgba(0, 255, 136, 0.08), transparent 50%),
            radial-gradient(45% 55% at 90% 10%, rgba(255, 0, 85, 0.08), transparent 50%),
            #0b1220 !important;
          color: #e5e7eb;
        }
      `}</style>

      <style jsx>{`
        .page-wrap {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 28px 16px;
        }
        .glass-card :global(.ant-card-head) {
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .glass-card {
          width: min(980px, 96vw);
          background: rgba(17, 25, 40, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 30px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.04);
          backdrop-filter: blur(8px);
          color: #e5e7eb;
          border-radius: 18px;
        }
        .btn-neon-green {
          background: #00ff88;
          border-color: #00ff88;
          color: #072016;
          font-weight: 700;
          box-shadow: 0 0 10px #00ff88, 0 0 22px rgba(0,255,136,0.55);
        }
        .btn-neon-green:hover {
          filter: brightness(1.04);
        }
        .btn-neon-pink {
          background: #ff0055;
          border-color: #ff0055;
          color: #fff;
          font-weight: 700;
          box-shadow: 0 0 10px #ff0055, 0 0 22px rgba(255,0,85,0.55);
        }
        .btn-neon-pink:hover {
          filter: brightness(1.05);
        }
      `}</style>
    </>
  );
}
