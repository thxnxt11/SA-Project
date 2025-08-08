import React, { useState } from "react";
import { Button, Card, Col, Row, Space, Typography, Tag, Select } from "antd";

import { DeleteOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import duration from "dayjs/plugin/duration";
import AdminsidebarLayout from "../../../components/sidebarLayout";
import AddHour from "./add_hour";
import AddTask from "./add_work";
dayjs.extend(duration);

const { Title, Text } = Typography;

interface Task {
  name: string;
  description: string;
  duration: string;
  people: number;
}

interface WorkSlot {
  title: string;
  start: Dayjs;
  end: Dayjs;
  description: string;
  tasks: Task[];
}

const TimeTableStep: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [taskModalVisibleIndex, setTaskModalVisibleIndex] = useState<
    number | null
  >(null);
  const [slots, setSlots] = useState<WorkSlot[]>([
    {
      title: "เตรียมงาน",
      start: dayjs("06:00", "HH:mm"),
      end: dayjs("12:00", "HH:mm"),
      description: "ติดตั้งอุปกรณ์และเตรียมความพร้อม",
      tasks: [],
    },
    {
      title: "ช่วงคอนเสิร์ต",
      start: dayjs("18:00", "HH:mm"),
      end: dayjs("23:00", "HH:mm"),
      description: "",
      tasks: [],
    },
    {
      title: "ช่วงเก็บงาน",
      start: dayjs("7:00", "HH:mm"),
      end: dayjs("13:00", "HH:mm"),
      description: "",
      tasks: [],
    },
  ]);

  const removeTask = (slotIndex: number, taskIndex: number) => {
    const newSlots = [...slots];
    newSlots[slotIndex].tasks.splice(taskIndex, 1);
    setSlots(newSlots);
  };

  const removeSlot = (index: number) => {
    const newSlots = [...slots];
    newSlots.splice(index, 1);
    setSlots(newSlots);
  };

  const formatDuration = (start: Dayjs, end: Dayjs) => {
    const diff = end.diff(start, "hour", true);
    return `${diff} ชั่วโมง`;
  };

  const [selectedConcert, setSelectedConcert] = useState<string | null>(null);

  const concertOptions = [
    { label: "Concert A", value: "concert_a" },
    { label: "Concert B", value: "concert_b" },
    { label: "Concert C", value: "concert_c" },
  ];

  const handleAddTask = (slotIndex: number, task: Task) => {
    const newSlots = [...slots];
    newSlots[slotIndex].tasks.push(task);
    setSlots(newSlots);
    setTaskModalVisibleIndex(null);
  };

  return (
    <AdminsidebarLayout>
      <div style={{ padding: 24 }}>
        <h1 style={{ fontWeight: "bold" }}>ช่วงเวลาการทำงาน</h1>
        <Text type="secondary">กำหนดช่วงเวลาต่างๆ ของการทำงาน</Text>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col>
            <h2 style={{ fontWeight: "bold", marginBottom: 8 }}>
              เลือกคอนเสิร์ต
            </h2>
            <Select
              style={{ width: 300 }}
              placeholder="เลือกคอนเสิร์ต"
              onChange={(value) => setSelectedConcert(value)}
              value={selectedConcert}
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={concertOptions}
            />
          </Col>

          <Col>
            <Button
              type="primary"
              onClick={() => setVisible(true)}
              style={{ marginTop: 30 }} // ปรับให้ปุ่มตรงแนวกับ Select
            >
              + เพิ่มช่วงเวลาใหม่
            </Button>
          </Col>
        </Row>

        <AddHour
          visible={visible}
          onCancel={() => setVisible(false)}
          onAdd={(data) => {
            setSlots([
              ...slots,
              {
                title: data.title,
                start: data.start,
                end: data.end,
                description: data.description,
                tasks: [],
              },
            ]);
            setVisible(false);
          }}
        />

        {slots.map((slot, index) => (
          <Card
            key={index}
            style={{ borderLeft: "4px solid #1677ff", marginTop: 16 }}
          >
            <Row justify="space-between" align="middle">
              <Col>
                <Space direction="vertical" size={4}>
                  <Title level={5} style={{ margin: 0 }}>
                    {slot.title}
                  </Title>
                  {slot.description && (
                    <Text type="secondary">{slot.description}</Text>
                  )}
                  <Text>
                    {slot.start.format("HH:mm")} - {slot.end.format("HH:mm")} (
                    {formatDuration(slot.start, slot.end)})
                  </Text>
                  <Text>งาน: {slot.tasks.length} รายการ</Text>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button onClick={() => setTaskModalVisibleIndex(index)}>
                    + เพิ่มงาน
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeSlot(index)}
                  />
                </Space>
              </Col>
            </Row>

            {slot.tasks.map((task, taskIndex) => (
              <Card
                key={taskIndex}
                style={{ marginTop: 12, backgroundColor: "#fafafa" }}
                size="small"
              >
                <Row justify="space-between">
                  <Col>
                    <Space direction="vertical" size={0}>
                      <Text strong>{task.name}</Text>

                      {/* แสดง description ถ้ามี */}
                      {task.description && (
                        <Text type="secondary">{task.description}</Text>
                      )}

                      <Space>
                        <Tag color="gold">{task.duration}</Tag>
                        <Text type="secondary">{task.people} คน</Text>
                      </Space>
                    </Space>
                  </Col>
                  <Col>
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => removeTask(index, taskIndex)}
                    />
                  </Col>
                </Row>
              </Card>
            ))}
            <AddTask
              visible={taskModalVisibleIndex === index}
              onCancel={() => setTaskModalVisibleIndex(null)}
              onAdd={(data) =>
                handleAddTask(index, {
                  name: data.task_concert,
                  description: data.description,
                  duration: `${data.assignment_hour} ชั่วโมง`,
                  people: data.staff_ids.length,
                })
              }
            />
          </Card>
        ))}

        <div style={{ marginTop: 32, textAlign: "right" }}>
          <Space>
            <Button onClick={() => window.history.back()}>ยกเลิก</Button>
            <Button type="primary">บันทึกตารางงาน</Button>
          </Space>
        </div>
      </div>
    </AdminsidebarLayout>
  );
};

export default TimeTableStep;
