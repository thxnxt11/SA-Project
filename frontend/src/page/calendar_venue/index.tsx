import React, { useState, useEffect } from "react";
import { Calendar, Card, List, Modal, message } from "antd";
import dayjs, { Dayjs } from "dayjs";
import AdminsidebarLayout from "../../components/sidebarLayout";
import type { ShowDateInterface } from "../../interfaces/showdate";
import { assignmentAPI } from "../../services/https";

const EventCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedShow, setSelectedShow] = useState<ShowDateInterface | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showData, setShowData] = useState<Record<string, ShowDateInterface[]>>({});

  useEffect(() => {
    assignmentAPI.getShowDates()
      .then((res) => {
        if (res.status === 200) {
          const data: Record<string, ShowDateInterface[]> = {};
          res.data.forEach((item: ShowDateInterface) => {
            const key = item.show_date;
            if (!data[key]) data[key] = [];
            data[key].push(item);
          });
          setShowData(data);
        } else {
          message.error("Failed to fetch showdates");
        }
      })
      .catch((err) => {
        console.error(err);
        message.error("Error fetching showdates");
      });
  }, []);

  const dateCellRender = (value: Dayjs) => {
    const listData = showData[value.format("YYYY-MM-DD")] || [];
    return (
      <ul>
        {listData.map((item) => (
          <li
            key={item.ID}
            onClick={() => handleShowClick(item)}
            style={{ cursor: "pointer" }}
          >
            {item.concert?.concert_name}
          </li>
        ))}
      </ul>
    );
  };

  const handleShowClick = (show: ShowDateInterface) => {
    setSelectedShow(show);
    setIsModalVisible(true);
  };

  const renderShowsForDate = (date: Dayjs) => {
    const listData = showData[date.format("YYYY-MM-DD")] || [];
    if (!listData.length) {
      return <Card>No shows on {date.format("D MMMM YYYY")}</Card>;
    }
    return (
      <Card>
        <h2>Shows on {date.format("D MMMM YYYY")}</h2>
        <List
          dataSource={listData}
          renderItem={(item) => (
            <List.Item
              key={item.ID}
              onClick={() => handleShowClick(item)}
              style={{ cursor: "pointer" }}
            >
              <h3>คอนเสิร์ต: {item.concert?.concert_name}</h3>
              <h4>สถานที่: {item.venue?.venue_name}</h4>
              <h4>จำนวนงานที่มอบหมาย: {item.assignments?.length}</h4>
            </List.Item>
          )}
        />
      </Card>
    );
  };

  return (
    <AdminsidebarLayout>
      <div style={{ padding: 24 }}>
        <h2 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 16 }}>
          Show Calendar
        </h2>
        <Calendar
          dateCellRender={dateCellRender}
          onSelect={setSelectedDate}
          defaultValue={selectedDate}
        />
        <div style={{ marginTop: 24 }}>{renderShowsForDate(selectedDate)}</div>

        <Modal
          title="Show Details"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
        >
          {selectedShow && (
            <div>
              <p><strong>คอนเสิร์ต:</strong> {selectedShow.concert?.concert_name}</p>
              <p><strong>สถานที่:</strong> {selectedShow.venue?.venue_name}</p>
              <p><strong>วันเวลา:</strong> {selectedShow.show_date}</p>
              <p><strong>จำนวนงานที่มอบหมาย:</strong> {selectedShow.assignments?.length}</p>
            </div>
          )}
        </Modal>
      </div>
    </AdminsidebarLayout>
  );
};

export default EventCalendar;
