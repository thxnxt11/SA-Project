// src/pages/dashboard/index.tsx
import { useEffect, useState, useMemo } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  List,
  Typography,
  Space,
  Skeleton,
  Alert,
  Statistic,

  Tag,
} from "antd";
import { Link } from "react-router-dom";
import {

  GiftOutlined,
  AppstoreOutlined,
  DeploymentUnitOutlined,
  DollarCircleOutlined,
  CalendarOutlined,
  BarChartOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import SidebarLayout from "../../component/layout/SidebarLayout";

import { concertAPI, payApi } from "../../services/https/index";
import type { ConcertInterface } from "../../interface/concert";

// ---- styles (match navbar energy) ----
// ---- styles (match navbar energy, smaller & centered) ----
const gradientBlue =
  "linear-gradient(135deg,#001a4d 0%,#00306e 50%,#004a8f 100%)";
const cardShadow = "0 10px 20px rgba(0,0,0,.16)";

const kpiBoxStyle: React.CSSProperties = {
  background: gradientBlue,
  borderRadius: 14,
  padding: 12,

  color: "#fff",
  minHeight: 110,            // smaller height
  display: "flex",
  flexDirection: "column",   // stack title/value
  alignItems: "center",      // center horizontally
  justifyContent: "center",  // center vertically
  textAlign: "center",
};  

const kpiTitleStyle: React.CSSProperties = {
  color: "rgba(255,255,255,.85)",
  fontWeight: 700,
  fontSize: 22,              // slightly smaller
  lineHeight: 1.2,
};

const kpiValueStyle: React.CSSProperties = {
  color: "#f2c83dff",
  fontWeight: 550,
  fontSize: 20,              // smaller than before
  lineHeight: 1.1,
  marginTop: 8 ,
};

const cardOuterStyle: React.CSSProperties = {
  borderRadius: 14,
  boxShadow: cardShadow,
  overflow: "hidden",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  letterSpacing: 0.3,
};


// ---- UI type for the list ----
type UIConcert = {
  id: string | number;
  title: string;
  artist: string;
  venue: string;
  date: Date | null;
  onsaleLabel: string;
};

// ---- helpers ----
const toDate = (v: unknown): Date | null => {
  if (!v) return null;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
};

function mapConcertToUI(item: ConcertInterface): UIConcert {
  const date = toDate(
    (item as any).onsale_date ?? (item as any).start_at ?? (item as any).date
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

  const artistName = (item as any).artist ?? "Unknown";

  return {
    id: (item as any).ID ?? (item as any).id ?? (item as any)._id,
    title: (item as any).concert_name ?? (item as any).title ?? "Untitled",
    artist: artistName,
    venue: venueName,
    date,
    onsaleLabel,
  };
}

const CURRENCY = "THB";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [concerts, setConcerts] = useState<ConcertInterface[]>([]);
  const [totalMoney, setTotalMoney] = useState(0);

  useEffect(() => {
    let alive = true;

    // load concerts
    (async () => {
      try {
        setLoading(true);
        const res = await concertAPI.getAll();
        const arr = Array.isArray(res)
          ? res
          : Array.isArray((res as any)?.data)
          ? (res as any).data
          : Array.isArray((res as any)?.results)
          ? (res as any).results
          : [];
        if (alive) setConcerts(arr as ConcertInterface[]);
      } catch (e: any) {
        setErr(e?.message || "Failed to load concerts");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    // load payments (only sold/paid)
    (async () => {
      try {
        const res = await payApi.getallpayment();
        const payments = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.results)
          ? res.results
          : [];

        const isPaid = (p: any) => {
          const name = p?.payment_status?.name?.toLowerCase?.();
          if (name) return name === "paid";
          if (typeof p?.payment_status_id === "number")
            return p.payment_status_id === 2;
          const s = String(p?.paid_at || "");
          return !!s && !s.startsWith("0001-01-01");
        };

        const sum = (payments || [])
          .filter(isPaid)
          .reduce((acc: number, p: any) => acc + Number(p.total_price || 0), 0);

        if (alive) setTotalMoney(sum);
      } catch {
        if (alive) setTotalMoney(0);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const normalized = useMemo(() => (concerts ?? []).map(mapConcertToUI), [concerts]);
  const now = new Date();

  const upcomingAll = useMemo(
    () =>
      normalized
        .filter((c) => !c.date || c.date >= now)
        .sort((a, b) => {
          if (!a.date && !b.date) return 0;
          if (!a.date) return 1;
          if (!b.date) return -1;
          return a.date.getTime() - b.date.getTime();
        }),
    [normalized]
  );

  const upcoming: UIConcert[] = useMemo(() => upcomingAll.slice(0, 3), [upcomingAll]);

  const pastCount = useMemo(
    () => normalized.filter((c) => c.date && c.date < now).length,
    [normalized]
  );

  const uniqueVenues = useMemo(() => {
    const s = new Set(normalized.map((c) => c.venue).filter(Boolean));
    return s.size;
  }, [normalized]);

  const nextShowDate = upcomingAll.find((c) => !!c.date)?.date ?? null;

  const moneyFmt = (n: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: CURRENCY,
      maximumFractionDigits: 0,
    }).format(n || 0);

  // src/pages/dashboard/index.tsx
// (unchanged imports & logic above...)

  return (
    <SidebarLayout>
      {/* Page header bar */}
      <Card
        style={{ ...cardOuterStyle, background: gradientBlue, marginBottom: 16 }}
        bodyStyle={{ padding: 20 }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Typography.Title level={3} style={{ ...sectionTitleStyle, color: "#fff" }}>
              Organizer Dashboard
            </Typography.Title>
            <Typography.Text style={{ color: "rgba(255,255,255,.85)" }}>
              Overview of your concerts and sales performance
            </Typography.Text>
          </Col>
        </Row>
      </Card>

      {/* -------- TOP KPIs: 2 rows × 3 tiles, centered -------- */}
      {/* Row 1: Total Concerts, Total Money, Upcoming */}
      <Row justify="center" gutter={[16, 16]} style={{ marginBottom: 12 }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={cardOuterStyle} bodyStyle={{ padding: 0 }}>
            <div style={kpiBoxStyle}>
              {loading ? (
                <Skeleton active paragraph={false} />
              ) : (
                <Statistic
                  title={
                    <Space style={kpiTitleStyle}>
                      <BarChartOutlined /> Total Concerts
                    </Space>
                  }
                  value={normalized.length}
                  valueStyle={kpiValueStyle}
                />
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={cardOuterStyle} bodyStyle={{ padding: 0 }}>
            <div style={kpiBoxStyle}>
              {loading ? (
                <Skeleton active paragraph={false} />
              ) : (
                <Statistic
                  title={
                    <Space style={kpiTitleStyle}>
                      <DollarCircleOutlined /> Total Money (Sold)
                    </Space>
                  }
                  value={moneyFmt(totalMoney)}
                  valueStyle={kpiValueStyle}
                />
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={cardOuterStyle} bodyStyle={{ padding: 0 }}>
            <div style={kpiBoxStyle}>
              {loading ? (
                <Skeleton active paragraph={false} />
              ) : (
                <Statistic
                  title={
                    <Space style={kpiTitleStyle}>
                      <CalendarOutlined /> Upcoming
                    </Space>
                  }
                  value={upcomingAll.length}
                  valueStyle={kpiValueStyle}
                />
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Row 2: Past, Venues, Next Show */}
      <Row justify="center" gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={cardOuterStyle} bodyStyle={{ padding: 0 }}>
            <div style={kpiBoxStyle}>
              {loading ? (
                <Skeleton active paragraph={false} />
              ) : (
                <Statistic
                  title={
                    <Space style={kpiTitleStyle}>
                      <CalendarOutlined /> Past
                    </Space>
                  }
                  value={pastCount}
                  valueStyle={kpiValueStyle}
                />
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={cardOuterStyle} bodyStyle={{ padding: 0 }}>
            <div style={kpiBoxStyle}>
              {loading ? (
                <Skeleton active paragraph={false} />
              ) : (
                <Statistic
                  title={
                    <Space style={kpiTitleStyle}>
                      <EnvironmentOutlined /> Venues
                    </Space>
                  }
                  value={uniqueVenues}
                  valueStyle={kpiValueStyle}
                />
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={cardOuterStyle} bodyStyle={{ padding: 0 }}>
            <div style={kpiBoxStyle}>
              {loading ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <Statistic
                  title={<span style={kpiTitleStyle}>Next Show</span>}
                  valueRender={() =>
                    nextShowDate ? (
                      <Space style={kpiValueStyle}>
                        {new Intl.DateTimeFormat("en-GB", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(nextShowDate)}
                      </Space>
                    ) : (
                      <Tag>—</Tag>
                    )
                  }
                  valueStyle={kpiValueStyle}
                />
              )}
            </div>
          </Card>
        </Col>
      </Row>
      {/* -------- /TOP KPIs -------- */}

      {/* Lists + Quick Actions (unchanged) */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <Card
            style={cardOuterStyle}
            title={
              <Space>
                <CalendarOutlined /> <span>Upcoming Shows</span>
              </Space>
            }
            extra={<Link to="/organizer/concerts">View all</Link>}
          >
            {err && (
              <Alert
                message={err}
                type="error"
                showIcon
                style={{ marginBottom: 8 }}
              />
            )}
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
                      <Link key="manage" to={`/concerts/${item.id}`}>
                        go to shop page
                      </Link>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Typography.Text strong>{item.title}</Typography.Text>
                      }
                      description={
                        <span style={{ color: "rgba(0,0,0,.65)" }}>
                          {[item.onsaleLabel, item.artist, item.venue]
                            .filter(Boolean)
                            .join("    //    ")}
                        </span>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card style={cardOuterStyle} title="Quick Actions">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Link to="/organizer/concerts">
                <Button block icon={<AppstoreOutlined />} size="large">
                  Manage Concerts
                </Button>
              </Link>
              <Link to="/organizer/seatmanagement">
                <Button block icon={<DeploymentUnitOutlined />} size="large">
                  Manage Seat Zones
                </Button>
              </Link>
              <Link to="/organizer/promotion">
                <Button block icon={<GiftOutlined />} size="large">
                  Manage Promotions
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>
      </Row>
    </SidebarLayout>
  );
}
