/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Table, Button, Tag, message, Spin } from "antd";
import type { StaffAssignmentInterface } from "../../interfaces/staff_assignment";
import { staffAssignmentAPI } from "../../services/https/index";

const statusMap: Record<number, { label: string; color: string }> = {
  1: { label: "Pending", color: "default" },
  2: { label: "In Progress", color: "blue" },
  3: { label: "Completed", color: "green" },
  4: { label: "Cancelled", color: "red" },
};

const MyAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<StaffAssignmentInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await staffAssignmentAPI.getMyAssignments();
      setAssignments(res.data);
    } catch (err) {
      console.error(err);
      message.error("โหลดงานไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id?: number) => {
    if (!id) return;
    try {
      setUpdating(true);
      await staffAssignmentAPI.acceptAssignment(id);
      message.success("รับงานเรียบร้อยแล้ว");
      fetchAssignments();
    } catch (err) {
      console.error(err);
      message.error("รับงานไม่สำเร็จ");
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (id?: number, statusId?: number) => {
    if (!id || !statusId) return;
    try {
      setUpdating(true);
      await staffAssignmentAPI.updateStatus(id, statusId);
      message.success("อัปเดตสถานะเรียบร้อย");
      fetchAssignments();
    } catch (err) {
      console.error(err);
      message.error("อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const columns = [
    {
      title: "Task",
      dataIndex: ["assignment", "task"],
      key: "task",
    },
    {
      title: "Description",
      dataIndex: ["assignment", "description"],
      key: "description",
    },
    {
      title: "Status",
      dataIndex: "assignment_status_id",
      key: "status",
      render: (statusId: number) => (
        <Tag color={statusMap[statusId]?.color}>{statusMap[statusId]?.label}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: StaffAssignmentInterface) => {
        const statusId = record.assignment_status_id;

        return (
          <div style={{ display: "flex", gap: 8 }}>
            {statusId === 1 && (
              <Button
                type="primary"
                loading={updating}
                onClick={() => handleAccept(record.ID)}
              >
                รับงาน
              </Button>
            )}

            {statusId === 2 && (
              <Button
                type="default"
                loading={updating}
                onClick={() => handleStatusChange(record.ID, 3)}
              >
                ทำงานเสร็จแล้ว
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Spin spinning={loading}>
      <Table
        rowKey="ID"
        columns={columns}
        dataSource={assignments}
        pagination={{ pageSize: 5 }}
      />
    </Spin>
  );
};

export default MyAssignments;
