import React, { useEffect, useState } from "react";
import { Table, Button, Tag, message, Spin } from "antd";
import { staffAssignmentAPI } from "../../services/https";
import SidebarLayout from "../../component/layout/SidebarLayout";
import { useAuth } from "../../hook/authContext";

const statusMap: Record<number, { label: string; color: string }> = {
  1: { label: "Pending", color: "default" },
  2: { label: "In Progress", color: "blue" },
  3: { label: "Completed", color: "green" },
  4: { label: "Cancelled", color: "red" },
};

const MyAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();

  const fetchAssignments = async () => {
    try {
      if (!user?.id) return;
      setLoading(true);

      const res = await staffAssignmentAPI.getMyAssignments(user.id);

      const rows = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

      // แปลง Assignment + staff_assignments[] -> 1 แถวต่อ staff_assignment
      const normalized = rows.flatMap((a: any) => {
        const items = Array.isArray(a.staff_assignments)
          ? a.staff_assignments
          : [];
        if (items.length === 0) {
          // ไม่มี staff_assignments ให้ขึ้นแถวว่าง ๆ อย่างน้อย 1 แถว
          return [
            {
              ID: `${a.ID ?? a.id}_new`, // unique key สำหรับ table
              assignmentId: a.ID ?? a.id, // ID ของ assignment จริง
              task: a.task ?? "-",
              description: a.description ?? "-",
              assignment_status_id: 1, // map เป็น Pending
              raw: a,
            },
          ];
        }
        // แตกเป็นหลายแถวตาม staff_assignments
        return items.map((sa: any, index: number) => ({
          ID: sa.ID ?? sa.id ?? `${a.ID ?? a.id}_${index}`, // unique key สำหรับ table
          assignmentId: a.ID ?? a.id, // ID ของ assignment จริง (ใช้สำหรับ API call)
          task: a.task ?? "-",
          description: a.description ?? "-",
          assignment_status_id: sa.assignment_status_id ?? 1,
          raw: { assignment: a, staff_assignment: sa },
        }));
      });

      setAssignments(normalized);
    } catch (err) {
      console.error(err);
      message.error("โหลดงานไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (assignmentId?: number) => {
    if (!assignmentId || !user?.id) return;
    try {
      setUpdating(true);
      // ส่ง assignmentId ที่ถูกต้อง
      await staffAssignmentAPI.acceptAssignment(assignmentId, user.id);
      message.success("รับงานเรียบร้อยแล้ว");
      fetchAssignments();
    } catch (err) {
      console.error(err);
      message.error("รับงานไม่สำเร็จ");
    } finally {
      setUpdating(false);
    }
  };

  const handleInject = async (assignmentId?: number) => {
    if (!assignmentId || !user?.id) return;
    try {
      setUpdating(true);
      // ส่ง assignmentId ที่ถูกต้อง
      await staffAssignmentAPI.InjectAssignment(assignmentId, user.id);
      message.success("ยกเลิกงานเรียบร้อย"); // แก้ข้อความให้ถูกต้อง
      fetchAssignments();
    } catch (err) {
      console.log(err);
      message.error("ยกเลิกงานไม่สำเร็จ");
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (assignmentId?: number) => {
    if (!assignmentId || !user?.id) return;
    try {
      setUpdating(true);
      // ส่ง assignmentId ที่ถูกต้อง
      await staffAssignmentAPI.CompleteAssignment(assignmentId, user.id);
      message.success("อัปเดตสถานะทำงานเสร็จเรียบร้อย");
      fetchAssignments();
    } catch (err) {
      console.error(err);
      message.error("อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchAssignments();
  }, [user?.id]);

  const columns = [
    { title: "Task", dataIndex: "task", key: "task" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Status",
      dataIndex: "assignment_status_id",
      key: "status",
      render: (statusId?: number) => {
        const sid = statusId && statusId > 0 ? statusId : 1;
        return (
          <Tag color={statusMap[sid]?.color}>
            {statusMap[sid]?.label ?? "Pending"}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => {
        const statusId = record.assignment_status_id ?? 1;
        return (
          <div style={{ display: "flex", gap: 8 }}>
            {statusId === 1 && (
              <div>
                <Button
                  type="primary"
                  loading={updating}
                  onClick={() => handleAccept(record.assignmentId)} // ใช้ assignmentId แทน ID
                >
                  รับงาน
                </Button>
                <Button
                  type="default"
                  loading={updating}
                  style={{ marginLeft: 10 }}
                  onClick={() => handleInject(record.assignmentId)} // ใช้ assignmentId แทน ID
                >
                  ไม่รับงาน
                </Button>
              </div>
            )}
            {statusId === 2 && (
              <Button
                type="default"
                loading={updating}
                onClick={() => handleStatusChange(record.assignmentId)} // ใช้ assignmentId แทน ID
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
    <SidebarLayout>
      <Spin spinning={loading}>
        <Table
          rowKey={(r: any) => r.ID ?? r.id}
          columns={columns}
          dataSource={Array.isArray(assignments) ? assignments : []}
          pagination={{ pageSize: 5 }}
        />
      </Spin>
    </SidebarLayout>
  );
};

export default MyAssignments;
