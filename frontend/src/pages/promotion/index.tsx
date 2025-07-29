import SidebarLayout from "../../component/SidebarLayout";
import React from "react";
import { Button, Flex, Space, Table, Tag } from "antd";
import type { TableProps } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const columns: TableProps<DataType>["columns"] = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Age",
    dataIndex: "age",
    key: "age",
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
  },
  {
    title: "Tags",
    key: "tags",
    dataIndex: "tags",
    render: (_, { tags }) => (
      <>
        {tags.map((tag) => {
          let color = tag.length > 5 ? "geekblue" : "green";
          if (tag === "loser") {
            color = "volcano";
          }
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </>
    ),
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) => (
      <Space size="middle">
        <a>Invite {record.name}</a>
        <a>Delete</a>
      </Space>
    ),
  },
];

const data: DataType[] = [
  {
    key: "1",
    name: "John Brown",
    age: 32,
    address: "New York No. 1 Lake Park",
    tags: ["nice", "developer"],
  },
  {
    key: "2",
    name: "Jim Green",
    age: 42,
    address: "London No. 1 Lake Park",
    tags: ["loser"],
  },
  {
    key: "3",
    name: "Joe Black",
    age: 32,
    address: "Sydney No. 1 Lake Park",
    tags: ["cool", "teacher"],
  },
];
const Promotion: React.FC = () => {
  return (
    <>
      <SidebarLayout>
        <div
          style={{
            display: "flex",
            alignContent: "center",
          }}
        >
          <h1>Promotion </h1>
          <Button
            style={{ position: "fixed", right: 40, height: 45, fontSize: 17 }}
            type="primary"
          >
            <a href="/promotion/create">+ New Promotion</a>
          </Button>
        </div>
        <Flex gap="small" vertical>
          <Button
            icon={<SearchOutlined />}
            style={{
              display: "flex",
              justifyContent: "left",
              height: 45,
              fontSize: 17,
              marginTop: 20,
            }}
          >
            Search
          </Button>
        </Flex>
      </SidebarLayout>
    </>
  );
};
export default Promotion;
