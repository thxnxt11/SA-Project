// src/pages/dashboard/index.tsx
import { useEffect, useState, useMemo } from "react";
import { Row, Col, Card, Button, List, Typography, Space, Skeleton, Alert } from "antd";
import { Link } from "react-router-dom";
import { PlusOutlined, GiftOutlined, AppstoreOutlined, DeploymentUnitOutlined } from "@ant-design/icons";
import SidebarLayout from "../../component/layout/SidebarLayout";
import { Concerts } from "../../services/https/concert"; // 👈 your API wrapper
import type { ConcertInterface } from "../../interface/concert";

// --- UI type for the dashboard list ---
type UIConcert = {
  id: string | number;
  title: string;
  artist: string
  venue: string;             // normalized to string for the UI
  date: Date | null;         // real Date for sorting/filtering
  onsaleLabel: string;       // formatted date label
};

// helper to normalize data (handles venue object/string)
function mapConcertToUI(item: ConcertInterface): UIConcert {
  const d = item.onsale_date ? new Date(item.onsale_date as unknown as string) : null;

  const onsaleLabel = d
    ? new Intl.DateTimeFormat("en-GB", {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d)
    : "TBA";

  const venueName =
    typeof (item as any).venue === "string"
      ? ((item as any).venue as string)
      : (item as any).venue?.venue_name ?? "TBA";

  return {
    id: (item as any).ID ?? (item as any).id ?? (item as any)._id,
    title: (item as any).concert_name ?? (item as any).title ?? "Untitled",
    artist: (item as any).artist ??"unknowm",
    venue: venueName,
    date: d,
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
        const data = await Concerts.getAll(); 
        if (alive) setConcerts(data ?? []);
      } catch (e: any) {
        setErr(e?.message || "Failed to load concerts");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const upcoming: UIConcert[] = useMemo(() => {
    const now = new Date();
    return (concerts || [])
      .map(mapConcertToUI)
      .filter((c) => !c.date || c.date >= now)
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
          <Typography.Text type="secondary">quick snapshot & shortcuts</Typography.Text>
        </Col>
        <Col>
          <Space>
            <Link to="/organizer/concerts">
              <Button type="primary" icon={<PlusOutlined />}>New Concert</Button>
            </Link>
            <Link to="/organizer/promotion/add">
              <Button icon={<GiftOutlined />}>New Promo</Button>
            </Link>
          </Space>
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
                      <Link key="manage" to={`/organizer/concerts/${item.id}`}>Manage</Link>,
                    ]}
                  >
                    <List.Item.Meta
                      title={<Typography.Text strong>{item.title}</Typography.Text>}
                      description={`${item.onsaleLabel}   //   ${item.artist} //   ${item.venue}`}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* Quick Actions */}
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
