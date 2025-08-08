import React, { useState } from "react";
import { Calendar, Card, List, Modal } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import AdminsidebarLayout from "../../components/sidebarLayout";

interface EventItem {
  title: string;
  type: "success" | "default";
  description: string;
  organizer: string;
  location: string;
  time: string;
  participants: number;
}

const eventData: Record<string, EventItem[]> = {
  "2024-02-15": [
    {
      title: "คอนเสิร์ต BNK48",
      type: "success",
      description: "คอนเสิร์ต BNK48",
      organizer: "บริษัท ไอดอล จำกัด",
      location: "Impact Arena",
      time: "15 ก.พ. 2024, 19:00 - 22:00",
      participants: 8000,
    },
  ],
  "2024-02-28": [
    {
      title: "คอนเสิร์ต PUN",
      type: "default",
      description: "แสดงคอนเสิร์ตดนตรีร่วมสมัย",
      organizer: "บริษัท ตัวอย่าง",
      location: "Impact Arena",
      time: "28 ก.พ. 2024, 18:00 - 21:00",
      participants: 6000,
    },
  ],
};

const EventCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs("2024-02-15"));
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const dateCellRender = (value: Dayjs) => {
    const dateKey = value.format("YYYY-MM-DD");
    const listData = eventData[dateKey] || [];
    return (
      <ul>
        {listData.map((item, index) => (
          <li
            key={index}
            onClick={() => handleEventClick(item)}
            style={{ cursor: "pointer" }}
          >
            <p>{item.title}</p>
          </li>
        ))}
      </ul>
    );
  };

  const onSelect = (value: Dayjs) => {
    setSelectedDate(value);
  };

  const handleEventClick = (event: EventItem) => {
    setSelectedEvent(event);
    setIsModalVisible(true);
  };

  const renderEventsForDate = (date: Dayjs) => {
    const key = date.format("YYYY-MM-DD");
    const listData = eventData[key] || [];
    return listData.length > 0 ? (
      <Card>
        <h2> {`รายการการจอง - ${date.format("D MMMM YYYY")}`}</h2>
        <List
          itemLayout="vertical"
          dataSource={listData}
          renderItem={(item) => (
            <List.Item
              onClick={() => handleEventClick(item)}
              style={{ cursor: "pointer" }}
            >
              <List.Item.Meta />
              <h2>{item.title}</h2>
              <h3>ผู้จัด: {item.organizer}</h3>
              <h3>สถานที่: {item.location}</h3>
              <h3>เวลา: {item.time}</h3>
              <h3>จำนวนผู้เข้าร่วม: {item.participants.toLocaleString()} คน</h3>
            </List.Item>
          )}
        />
      </Card>
    ) : (
      <Card title={`ไม่มีข้อมูลในวันที่ ${date.format("D MMMM YYYY")}`} />
    );
  };

  return (
    <AdminsidebarLayout>
      <div style={{ padding: 24 }}>
        <h2 style={{ marginBottom: 16, fontWeight: "Bold" }}>
          ปฏิทินจัดงานคอนเสิร์ต
        </h2>
        <Calendar
          dateCellRender={dateCellRender}
          onSelect={onSelect}
          defaultValue={selectedDate}
        />
        <div style={{ marginTop: 24 }}>{renderEventsForDate(selectedDate)}</div>

        {/* Modal แสดงรายละเอียด */}
        <Modal
          title="รายละเอียดคอนเสิร์ต"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
        >
          {selectedEvent && (
            <div>
              <p>
                <strong>ชื่อคอนเสิร์ต:</strong> {selectedEvent.title}
              </p>
              <p>
                <strong>ผู้จัด:</strong> {selectedEvent.organizer}
              </p>
              <p>
                <strong>สถานที่:</strong> {selectedEvent.location}
              </p>
              <p>
                <strong>วันเวลา:</strong> {selectedEvent.time}
              </p>
              <p>
                <strong>รายละเอียด:</strong> {selectedEvent.description}
              </p>
              <p>
                <strong>จำนวนผู้เข้าร่วม:</strong>{" "}
                {selectedEvent.participants.toLocaleString()} คน
              </p>
            </div>
          )}
        </Modal>
      </div>
    </AdminsidebarLayout>
  );
};

export default EventCalendar;
