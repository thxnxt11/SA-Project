// src/pages/dashboard/index.tsx
import { useEffect, useState, useMemo } from "react";
import { Row, Col, Card, Button, List, Typography, Space, Skeleton, Alert } from "antd";
import { Link } from "react-router-dom";
import { PlusOutlined, GiftOutlined, AppstoreOutlined, DeploymentUnitOutlined } from "@ant-design/icons";
import SidebarLayout from "../../component/layout/SidebarLayout";

import { concertAPI } from "../../services/https/index";
import type { ConcertInterface } from "../../interface/concert";

// ---- UI type for the list ----
type UIConcert = {
  id: string | number;
  title: string;
  artist: string;
  venue: string;       // normalized to string
  date: Date | null;   // real Date for sorting
  onsaleLabel: string; // formatted label for display
};

// ---- helpers ----
const toDate = (v: unknown): Date | null => {
  if (!v) return null;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
};

function mapConcertToUI(item: ConcertInterface): UIConcert {
  // try common keys; tweak if your interface differs
  const date = toDate(
    (item as any).onsale_date ??
      (item as any).start_at ??
      (item as any).date
  );

  const onsaleLabel = date
    ? new Intl.DateTimeFormat("en-GB", {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    : "TBA";

  const rawVenue = (item as any).venue;
  const venueName =
    typeof rawVenue === "string"
      ? rawVenue
      : rawVenue?.venue_name ?? rawVenue?.name ?? "TBA";

  const artistName =
    (item as any).artist ??"Unknown";

  return {
    id: (item as any).ID ?? (item as any).id ?? (item as any)._id,
    title: (item as any).concert_name ?? (item as any).title ?? "Untitled",
    artist: artistName,
    venue: venueName,
    date,
    onsaleLabel,
  };
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [concerts, setConcerts] = useState<ConcertInterface[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await concertAPI.getAll();

        // 👇 make sure we always store an array
        const arr =
          Array.isArray(res) ? res :
          Array.isArray((res as any)?.data) ? (res as any).data :
          Array.isArray((res as any)?.results) ? (res as any).results :
          [];

        if (alive) setConcerts(arr as ConcertInterface[]);
      } catch (e: any) {
        setErr(e?.message || "Failed to load concerts");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const upcoming: UIConcert[] = useMemo(() => {
    const now = new Date();
    return (concerts ?? [])
      .map(mapConcertToUI)
      .filter((c) => !c.date || c.date >= now) // keep TBA or future
      .sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date.getTime() - b.date.getTime();
      })
      .slice(0, 3);
  }, [concerts]);

  return (
    <SidebarLayout>
      <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
        <Col>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Organizer Dashboard
          </Typography.Title>
          <Typography.Text type="secondary">idk im gonna yapping here so no one gonna stop me</Typography.Text>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} md={16}>
          <Card title="Upcoming Shows" extra={<Link to="/organizer/concerts">View all</Link>}>
            {err && <Alert message={err} type="error" showIcon style={{ marginBottom: 8 }} />}
            {loading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
              <List<UIConcert>
                dataSource={upcoming}
                rowKey={(i) => String(i.id)}
                locale={{ emptyText: "No upcoming shows" }}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Link key="manage" to={`/concerts/${item.id}`}>go to shop page</Link>,
                    ]}
                  >
                    <List.Item.Meta
                      title={<Typography.Text strong>{item.title}</Typography.Text>}
                      description={[
                        item.onsaleLabel,
                        item.artist,
                        item.venue,
                      ].filter(Boolean).join("    //    ")}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>


        <Col xs={24} md={8}>
          <Card title="Quick Actions">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Link to="/organizer/concerts"><Button block icon={<AppstoreOutlined />}>Manage Concerts</Button></Link>
              <Link to="/organizer/seatmanagement"><Button block icon={<DeploymentUnitOutlined />}>Manage Seat Zones</Button></Link>
              <Link to="/organizer/promotion"><Button block icon={<GiftOutlined />}>Manage Promotions</Button></Link>
            </Space>
          </Card>
        </Col>
      </Row>
    </SidebarLayout>
  );
}
