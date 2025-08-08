import { Card, Form, Table, Tag } from "antd";
import type { TableProps } from "antd";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";

interface DataType {
  reportid: number;  
  memberid: string;
  type: string;
  topic: string;
  status: string;
  date: Date;
}
const columns: TableProps<DataType>["columns"] = [
  {
    title: "No.",
    dataIndex: "reportid",
    key: "reportid",
  },
  {
    title: "MemberID",
    dataIndex: "memberid",
    key: "memberid",
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
  },
  {
    title: "Topic",
    key: "topic",
    dataIndex: "topic",
  },
  {
    title: "Status",
    key: "status",
    dataIndex: "status",
    render: (status: string) => {
      let color = "";
      switch (status) {
        case "อนุมัติ":
          color = "green";
          break;
        case "รอการตอบกลับ":
          color = "orange";
          break;
        case "ไม่อนุมัติ":
          color = "red";
          break;
        default:
          color = "blue";
      }
      return <Tag color={color}>{status}</Tag>;
    },
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    render: (date: Date) => dayjs(date).format("DD/MM/YYYY"),
  },
];

const data: DataType[] = [
  {
    reportid: 1,
    memberid: "b111111",
    type: "REPORT",
    topic: "ของหาย",
    status: "ตอบแล้ว",
    date: new Date(),
  },
  {
    reportid: 2,
    memberid: "b123232",
    type: "REPORT",
    topic: "ลำโพงบัง",
    status: "รอการตอบกลับ",
    date: new Date(),
  },
  {
    reportid: 3,
    memberid: "b111232",
    type: "FEEDBACK",
    topic: "ห้องน้ำ",
    status: "รอการตอบกลับ",
    date: new Date(),
  },
];

export const ReportHis = () => {
  return (
    <>
      <Form
        onFinish={(values) => {
          console.log("Refund Form Submitted:", values);
        }}
      >
        <div
          style={{
            width: 1300,
            margin: "20px auto 0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title level={2}>History</Title>
        </div>
        <Card
          style={{
            height: 700,
            width: 1300,
            marginTop: 10,
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <Table<DataType> columns={columns} dataSource={data} />
        </Card>
      </Form>
    </>
  );
};