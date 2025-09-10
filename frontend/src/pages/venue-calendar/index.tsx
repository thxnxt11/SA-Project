import React, { useState, useEffect, useMemo } from "react";
import {
  Badge,
  Calendar,
  Card,
  Divider,
  List,
  Modal,
  Select,
  message,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import type { ShowDatesInterface } from "../../interface/showdate";
import { ShowDateAPI } from "../../services/https";
import SidebarLayout from "../../component/layout/SidebarLayout";

type VenueOption = { id: number | null; name: string };

const COLORS = [
  "blue",
  "purple",
  "pink",
  "green",
  "volcano",
  "orange",
  "gold",
  "red",
  "cyan",
];

const EventCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedShow, setSelectedShow] = useState<ShowDatesInterface | null>(
    null
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [allShows, setAllShows] = useState<ShowDatesInterface[]>([]);
  const [showData, setShowData] = useState<
    Record<string, ShowDatesInterface[]>
  >({});
  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<number | "all">("all");
  const [loading, setLoading] = useState<boolean>(false);

  // ---- Fetch shows ----
  useEffect(() => {
    const fetchShowDates = async () => {
      setLoading(true);
      try {
        const res = await ShowDateAPI.getAllShowdate(); // ใช้ชื่อฟังก์ชันตาม service ของคุณ
        const items: ShowDatesInterface[] = Array.isArray((res as any)?.data)
          ? (res as any).data
          : (res as any);

        setAllShows(items);
        const uniqMap = new Map<number | null, string>();
        for (const it of items) {
          const id = it.venue_id ?? null;
          const name = it.venue?.venue_name ?? `Venue #${id ?? "-"}`;
          if (!uniqMap.has(id)) uniqMap.set(id, name);
        }
        const opts: VenueOption[] = Array.from(uniqMap.entries())
          .map(([id, name]) => ({ id, name }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setVenues(opts);
      } catch (err) {
        console.error(err);
        message.error("ไม่สามารถโหลดรายการรอบการแสดงได้");
      } finally {
        setLoading(false);
      }
    };

    fetchShowDates();
  }, []);

  // ---- สร้างกลุ่มตามวันที่ จากชุดข้อมูลที่กรองแล้ว ----
  const filteredShows = useMemo(() => {
    if (selectedVenueId === "all") return allShows;
    return allShows.filter((s) => (s.venue_id ?? null) === selectedVenueId);
  }, [allShows, selectedVenueId]);

  useEffect(() => {
    const grouped = filteredShows.reduce((acc, item) => {
      const key = dayjs(item.show_date).format("YYYY-MM-DD");
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, ShowDatesInterface[]>);

    // เรียงในแต่ละวันตามเวลา
    Object.keys(grouped).forEach((k) => {
      grouped[k].sort(
        (a, b) => dayjs(a.show_date).valueOf() - dayjs(b.show_date).valueOf()
      );
    });

    setShowData(grouped);
  }, [filteredShows]);

  // ---- UI helpers ----
  const handleShowClick = (show: ShowDatesInterface) => {
    setSelectedShow(show);
    setIsModalVisible(true);
  };

  const getColor = (concertName?: string) => {
    if (!concertName) return "default";
    let hash = 0;
    for (let i = 0; i < concertName.length; i++) {
      hash = concertName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return COLORS[Math.abs(hash) % COLORS.length];
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = showData[value.format("YYYY-MM-DD")] || [];
    if (!listData.length) return null;

    return (
      <ul style={{ margin: 0, paddingLeft: 16 }}>
        {listData.map((item) => (
          <li
            key={item.ID}
            onClick={() => handleShowClick(item)}
            style={{
              cursor: "pointer",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={item.concert?.concert_name}
          >
            <Badge
              color={getColor(item.concert?.concert_name)}
              text={`${item.concert?.concert_name ?? "—"} • ${dayjs(
                item.show_date
              ).format("HH:mm")}`}
            />
          </li>
        ))}
      </ul>
    );
  };

  const renderShowsForDate = (date: Dayjs) => {
    const listData = showData[date.format("YYYY-MM-DD")] || [];
    if (!listData.length) {
      return (
        <Card loading={loading}>No shows on {date.format("D MMMM YYYY")}</Card>
      );
    }
    return (
      <Card
        loading={loading}
        style={{
          borderRadius: 16,
          boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
          border: "1px solid #f0f0f0",
        }}
        bodyStyle={{ padding: 16 }}
      >
        <List
          itemLayout="horizontal"
          dataSource={listData}
          split={false}
          renderItem={(item) => (
            <List.Item
              key={item.ID}
              className="show-item"
              onClick={() => handleShowClick(item)}
              style={{ cursor: "pointer", borderRadius: 12, padding: 12 }}
            >
              {/* โพสเตอร์/อวาตาร์เล็กทางซ้าย */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  width: "100%",
                  alignItems: "flex-start",
                }}
              >
                {item.concert?.concert_poster_url ? (
                  <img
                    src={`http://localhost:8000${item.concert.concert_poster_url}`}
                    alt={item.concert?.concert_name}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 10,
                      objectFit: "cover",
                      flex: "0 0 56px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 10,
                      background: "#f0f5ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      flex: "0 0 56px",
                    }}
                  >
                    {(item.concert?.concert_name ?? "C").slice(0, 1)}
                  </div>
                )}

                {/* เนื้อหา */}
                <div style={{ width: "100%" }}>
                  <h2 style={{ marginBottom: 4 }}>
                    คอนเสิร์ต: {item.concert?.concert_name}
                  </h2>

                  <h3 style={{ margin: 0, fontWeight: 400 }}>
                    สถานที่:{" "}
                    {item.venue?.venue_name ?? `Venue #${item.venue_id ?? "-"}`}
                  </h3>

                  <div style={{ opacity: 0.85, marginTop: 4 }}>
                    เวลา: {dayjs(item.show_date).format("D MMMM YYYY HH:mm")}
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>
    );
  };

  return (
    <SidebarLayout>
      <div style={{ padding: 8 }}>
        <h2 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 16 }}>
          Show Calendar
        </h2>

        {/* Dropdown เลือกสถานที่ */}
        <div style={{ marginBottom: 16, display: "flex", gap: 12 }}>
          <Select
            style={{ minWidth: 260 }}
            value={selectedVenueId === "all" ? "all" : String(selectedVenueId)}
            onChange={(val) => {
              if (val === "all") setSelectedVenueId("all");
              else setSelectedVenueId(Number(val));
              setSelectedDate(dayjs());
            }}
            options={[
              { label: "All Venue", value: "all" },
              ...venues.map((v) => ({
                label: v.name,
                value: String(v.id), // Select ต้องการ string|number ก็ได้
              })),
            ]}
            placeholder="เลือกสถานที่"
          />
        </div>

        <Calendar
          dateCellRender={dateCellRender}
          onSelect={(val) => setSelectedDate(val)}
          defaultValue={selectedDate}
        />

        <div style={{ marginTop: 24 }}>{renderShowsForDate(selectedDate)}</div>

        <Modal
          title="Show Details"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          bodyStyle={{ padding: 0 }} // ปรับ padding ให้น้อยลง ดูพรีเมียมขึ้น
        >
          {selectedShow && (
            <div>
              {/* ส่วนแสดงภาพ */}
              {selectedShow.concert?.concert_poster_url && (
                <div
                  style={{
                    width: "100%",
                    textAlign: "center",
                    background: "#fafafa",
                  }}
                >
                  <img
                    src={`http://localhost:8000${selectedShow.concert.concert_poster_url}`}
                    alt={selectedShow.concert?.concert_name}
                    style={{
                      width: "100%",
                      maxHeight: 250,
                      objectFit: "cover",
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                    }}
                  />
                </div>
              )}

              {/* เนื้อหาหลัก */}
              <div style={{ padding: 16 }}>
                <Divider style={{ marginTop: 10, marginBottom: 16 }} />
                <p>
                  <strong>คอนเสิร์ต:</strong>{" "}
                  {selectedShow.concert?.concert_name}
                </p>
                <p>
                  <strong>สถานที่:</strong>{" "}
                  {selectedShow.venue?.venue_name ??
                    `Venue #${selectedShow.venue_id ?? "-"}`}
                </p>
                <p>
                  <strong>วันเวลา:</strong>{" "}
                  {dayjs(selectedShow.show_date).format("D MMMM YYYY HH:mm")}
                </p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </SidebarLayout>
  );
};

export default EventCalendar;
