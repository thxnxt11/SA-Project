import { Card, Form, Table, Tag } from "antd";
import type { TableProps } from "antd";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";

interface DataType {
  memberid: string;
  bookingid: string;
  amount: number;
  status: string;
  date: Date;
}
const columns: TableProps<DataType>["columns"] = [
  {
    title: "MemberID",
    dataIndex: "memberid",
    key: "memberid",
  },
  {
    title: "BookingID",
    dataIndex: "bookingid",
    key: "bookingid",
  },
  {
    title: "Amount",
    key: "amount",
    dataIndex: "amount",
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
    render: (date: Date) => dayjs(date).format("DD/MM/YYYY")
  },
];

const data: DataType[] = [
  {
    memberid: "1",
    bookingid: "XXXXXXXXXX",
    amount:  6500,
    status: "ไม่อนุมัติ",
    date: new Date(),
  },
  {
    memberid: "2",
    bookingid: "XXXXXXXXXX",
    amount:  4000,
    status: "อนุมัติ",
    date: new Date(),
  },
  {
    memberid: "3",
    bookingid: "XXXXXXXXXX",
    amount:  1500,
    status: "รอการตอบกลับ",
    date: new Date(),
  },

];

export const RefundHis = () => {
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