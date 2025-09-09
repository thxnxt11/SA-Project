/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Space,
  Button,
  Typography,
  Select,
  message,
  Popconfirm,
  Modal,
  Result,
  Tag,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import AdminsidebarLayout from "../../components/sidebarLayout";
import AddTaskAssignment from "./addassignment/index";
import EditTaskAssignment from "./editassignment/index";
import { assignmentAPI } from "../../services/https/index";
import type { AssignmentInterface } from "../../interfaces/assignment";
import type { ConcertInterface } from "../../interfaces/concert";
import type { AssignmentStatusInterface } from "../../interfaces";
import type { ShowDateInterface } from "../../interfaces/showdate";

const { Text } = Typography;
const { Option } = Select;

const TaskAssignment: React.FC = () => {
  const [assignments, setAssignments] = useState<AssignmentInterface[]>([]);
  const [statuses, setStatuses] = useState<AssignmentStatusInterface[]>([]);
  const [concerts, setConcerts] = useState<ConcertInterface[]>([]);
  const [, setShowDates] = useState<ShowDateInterface[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedConcert, setSelectedConcert] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);

  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editAssignment, setEditAssignment] =
    useState<AssignmentInterface | null>(null);

  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const [loadingShowDates, setLoadingShowDates] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
    fetchStatuses();
    fetchShowDates();
  }, []);

  /** Format datetime จาก ISO string ให้สวยงาม */
  const formatDateTime = (dateStr?: string, format: string = "DD/MM/YYYY") => {
    if (!dateStr || dateStr === "0001-01-01T00:00:00Z") return "-";
    return dayjs(dateStr).format(format);
  };

  /** Fetch Assignments */
  const fetchAssignments = async () => {
    setLoadingAssignments(true);
    try {
      const res: any = await assignmentAPI.getAll();
      const data = Array.isArray(res) ? res : res?.data ?? [];

      const mapped: AssignmentInterface[] = data.map((item: any) => {
        const seen = new Set<number>();
        const uniqueStaffAssignments = (item.staff_assignments ?? []).filter(
          (sa: any) => {
            if (seen.has(sa.user_id)) return false;
            seen.add(sa.user_id);
            return true;
          }
        );

        return {
          ID: item.ID,
          task: item.task ?? "",
          description: item.description ?? "",
          assignment_date_start: item.assignment_date_start ?? "",
          assignment_date_end: item.assignment_date_end ?? "",
          assignment_status_id: item.AssignmentStatusID ?? 0,
          assignment_status: item.assignment_status ?? null,
          show_date_id: item.ShowDateID ?? 0,
          show_date: item.show_date ?? null,
          staff_assignments: uniqueStaffAssignments,
          staff_ids: item.staff_ids ?? [],
        };
      });

      setAssignments(mapped);
    } catch (err) {
      console.error(err);
      message.error("Failed to load assignments");
    } finally {
      setLoadingAssignments(false);
    }
  };

  /** Fetch Statuses */
  const fetchStatuses = async () => {
    setLoadingStatuses(true);
    try {
      const res: any = await assignmentAPI.getStatuses();
      const data = Array.isArray(res) ? res : res?.data || [];
      setStatuses(data);
    } catch (err) {
      console.error(err);
      message.error("Failed to load statuses");
    } finally {
      setLoadingStatuses(false);
    }
  };

  /** Fetch ShowDates */
  const fetchShowDates = async () => {
    setLoadingShowDates(true);
    try {
      const res: any = await assignmentAPI.getShowDates();
      const data: ShowDateInterface[] = Array.isArray(res)
        ? res
        : res?.data || [];
      setShowDates(data);

      // Map concert dropdown unique
      const concertMap = new Map<number, string>();
      data.forEach((sd) => {
        const concert = sd.concert;
        if (concert && !concertMap.has(concert.ID)) {
          concertMap.set(concert.ID, concert.concert_name);
        }
      });

      const concertOptions: ConcertInterface[] = Array.from(
        concertMap,
        ([ID, concert_name]) => ({
          ID,
          concert_name,
          concert_poster_url: "",
          chart_image: "",
        })
      );
      setConcerts(concertOptions);
    } catch (err) {
      console.error(err);
      setShowDates([]);
      setConcerts([]);
    } finally {
      setLoadingShowDates(false);
    }
  };

  /** Get Tag color by staff assignment status */
  const getStaffStatusTag = (statusID?: number) => {
    switch (statusID) {
      case 1:
        return { color: "default", text: "Not Started" };
      case 2:
        return { color: "blue", text: "In Progress" };
      case 3:
        return { color: "green", text: "Completed" };
      default:
        return { color: "default", text: "-" };
    }
  };

  /** Edit handler */
  const handleEdit = (record: AssignmentInterface) => {
    setEditAssignment(record);
    setEditVisible(true);
  };

  /** Delete handler */
  const handleDelete = async (id: number) => {
    try {
      await assignmentAPI.delete(id);
      fetchAssignments();
      setSuccessMessage("Task assignment has been successfully deleted!");
    } catch (err) {
      console.error(err);
      message.error("Failed to delete.");
      console.log("delete",id)
    }
  };
  /** Table Columns */
  const columns = [
    {
      title: "Task",
      key: "task",
      render: (record: AssignmentInterface) => (
        <Space direction="vertical" size="small">
          <Text strong>{record.task}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.description}
          </Text>
        </Space>
      ),
    },
    {
      title: "Concert & Show Date",
      key: "concertShowDate",
      render: (record: AssignmentInterface) => {
        const concertName = record.show_date?.concert?.concert_name || "-";
        const venueName = record.show_date?.venue?.venue_name || "-";

        const showDateStr = record.show_date?.show_date;
        const showDateFormatted = showDateStr
          ? dayjs(showDateStr).format("DD/MM/YYYY")
          : "-";

        const showTimeFormatted = showDateStr
          ? dayjs(showDateStr).format("HH:mm")
          : "-";

        return (
          <Space direction="vertical" size="small">
            <Text strong>{concertName}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {venueName}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {showDateFormatted}{" "}
              {showTimeFormatted !== "00:00" ? `(${showTimeFormatted})` : ""}
            </Text>
          </Space>
        );
      },
    },

    {
      title: "Assigned Staff",
      key: "assignedStaff",
      render: (_: any, record: AssignmentInterface) => (
        <Space wrap>
          {record.staff_assignments?.length
            ? record.staff_assignments.map((s, idx) => {
                const { color, text } = getStaffStatusTag(
                  s.assignment_status?.ID
                );
                const name = `${s.user?.first_name} ${s.user?.last_name}`;
                return (
                  <Space key={idx} size="small">
                    {/* Tag แสดงชื่อ staff */}
                    <Tag color="geekblue" style={{ fontSize: 12 }}>
                      {name}
                    </Tag>
                    {/* Tag แสดง status */}
                    <Tag color={color} style={{ fontSize: 12 }}>
                      {text}
                    </Tag>
                  </Space>
                );
              })
            : "-"}
        </Space>
      ),
    },
    {
      title: "Date & Time",
      key: "datetime",
      render: (record: AssignmentInterface) => (
        <Space direction="vertical" size="small">
          <Space>
            <CalendarOutlined />
            <Text style={{ fontSize: 12 }}>
              {formatDateTime(record.assignment_date_start, "DD/MM/YYYY")}{" "}
              {record.assignment_date_end &&
                record.assignment_date_start !== record.assignment_date_end &&
                `- ${formatDateTime(record.assignment_date_end, "DD/MM/YYYY")}`}
            </Text>
          </Space>
          <Space>
            <ClockCircleOutlined />
            <Text style={{ fontSize: 12 }}>
              {formatDateTime(record.assignment_date_start, "HH:mm")} -{" "}
              {formatDateTime(record.assignment_date_end, "HH:mm")}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (record: AssignmentInterface) => (
        <Tag color={record.assignment_status?.ID === 3 ? "green" : "blue"}>
          {record.assignment_status?.assignment_status || "-"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: AssignmentInterface) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure to delete this assignment?"
            onConfirm={() => handleDelete(record.ID!)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /** Filtered Assignments */
  const filteredAssignments = assignments.filter((a) => {
    const matchTask = a.task?.toLowerCase().includes(searchText.toLowerCase());
    const matchConcert =
      !selectedConcert || a.show_date?.concert?.ID === selectedConcert;
    const matchStatus =
      !selectedStatus || a.assignment_status?.ID === selectedStatus;
    return matchTask && matchConcert && matchStatus;
  });

  return (
    <AdminsidebarLayout>
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontWeight: "bold", marginBottom: 4 }}>
            Task Assignment
          </h1>
          <Text type="secondary">Manage and assign tasks to the team.</Text>
        </div>

        <Space
          direction="horizontal"
          size="middle"
          wrap
          style={{ marginBottom: 20 }}
        >
          <Input
            placeholder="Search assignments"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250, borderRadius: 8 }}
          />
          <Select
            placeholder="Filter by Concert"
            allowClear
            style={{ width: 280, borderRadius: 8 }}
            value={selectedConcert || undefined}
            onChange={(val) => setSelectedConcert(val || null)}
            loading={loadingShowDates}
          >
            {concerts.map((c) => (
              <Option key={c.ID} value={c.ID}>
                {c.concert_name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Filter by Status"
            allowClear
            style={{ width: 220, borderRadius: 8 }}
            value={selectedStatus || undefined}
            onChange={(val) => setSelectedStatus(val || null)}
            loading={loadingStatuses}
          >
            {statuses.map((s) => (
              <Option key={s.ID} value={s.ID}>
                {s.assignment_status}
              </Option>
            ))}
          </Select>
          <Button type="primary" onClick={() => setAddVisible(true)}>
            + Assign New Task
          </Button>
        </Space>

        <Table
          loading={loadingAssignments}
          columns={columns}
          dataSource={filteredAssignments}
          rowKey="ID"
          bordered
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "No assignments found." }}
        />

        <AddTaskAssignment
          visible={addVisible}
          onCancel={() => setAddVisible(false)}
          onSave={() => {
            fetchAssignments();
            setAddVisible(false);
            setSuccessMessage("Task assignment has been successfully added!");
          }}
        />

        {editAssignment && (
          <EditTaskAssignment
            visible={editVisible}
            onCancel={() => {
              setEditVisible(false);
              setEditAssignment(null);
            }}
            onSave={() => {
              fetchAssignments();
              setEditVisible(false);
              setEditAssignment(null);
              setSuccessMessage(
                "Task assignment has been successfully updated!"
              );
            }}
            assignmentId={editAssignment?.ID}
          />
        )}

        <Modal
          open={!!successMessage}
          footer={null}
          onCancel={() => setSuccessMessage(null)}
        >
          <Result
            status="success"
            title="Success!"
            subTitle={successMessage || ""}
            extra={[
              <Button
                key="ok"
                type="primary"
                onClick={() => setSuccessMessage(null)}
              >
                OK
              </Button>,
            ]}
          />
        </Modal>
      </div>
    </AdminsidebarLayout>
  );
};

export default TaskAssignment;
