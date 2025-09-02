import React, { useState, type ReactNode } from "react";

import { EditOutlined, FallOutlined, MenuFoldOutlined, MenuUnfoldOutlined, MessageOutlined, PlusOutlined, PlusSquareOutlined } from "@ant-design/icons";
import { Button, Layout, Menu, theme } from "antd";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { LuTicketPercent } from "react-icons/lu";
import { FaRegCalendarAlt, FaUserCircle } from "react-icons/fa";
import logo from "../../assets/logo.png";
import { Outlet, useLocation, useNavigate } from "react-router-dom"; //  เพิ่ม
const { Header, Sider, Content } = Layout;

// interface WarehouseLayoutProps {
//   children: ReactNode;
// }

// const WarehouseLayout: React.FC<WarehouseLayoutProps> = () => {
const WarehouseLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const navigate = useNavigate(); 
  const location = useLocation(); 

  //  Map path ให้ key ตรงกับเมนู
  const menuKeyMap: { [key: string]: string } = {
    "/warehouse": "1",
    "/warehouse/create": "2",
    "/warehouse/edit": "3",
    "/warehouse/balance": "4",
  };

  return (
    <Layout style={{ minHeight: "100vh", width: "100vw" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{ backgroundColor: "#00306E" }}
      >
        <div className="demo-logo-vertical" />
        {!collapsed && (
          <h1
            style={{
              color: "white",
              margin: "16px",
              fontSize: "18px",
              textAlign: "center",
            }}
          >
            Warehouse Management
            <div>_________________________</div>
          </h1>
        )}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[menuKeyMap[location.pathname] || "1"]} //  เมนู active ตาม path
          defaultSelectedKeys={["1"]}
          style={{
            fontSize: "17px", // ปรับขนาด label
            backgroundColor: "#00306E", // ปรับสีพื้นหลัง
            color: "white", // ปรับสีตัวอักษร
          }}
          onClick={(e) => {
            //  นำ key ไป map กับ path แล้ว navigate
            const pathMap: { [key: string]: string } = {
              "1": "/warehouse",
              "2": "/warehouse/create",
              "3": "/warehouse/edit",
              "4": "/warehouse/balance",
            };
            const path = pathMap[e.key];
            if (path) navigate(path);
          }}
          items={[
            {
              key: "1",
              icon: <MdOutlineSpaceDashboard style={{ fontSize: "20px" }} />,
              label: "Dashboard",
            },
            {
              key: "2",
              icon: <PlusSquareOutlined style={{ fontSize: "20px" }}/>,
              label: "Add products",
            },
            {
              key: "3",
              icon: <EditOutlined style={{ fontSize: "20px" }} />,
              label: "Edit product info",
            },
            {
              key: "4",
              icon: <FallOutlined style={{ fontSize: "20px" }} />,
              label: "Check balance ",
            },
          ]}
        />
        <div style={{ position: "absolute", bottom: 20, width: "100%", textAlign: "center" }}>
          <Button
            type="default"
            style={{ width: "90%", backgroundColor: "#7d979bff", fontWeight: "regula" }}
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </Button>
        </div>
      </Sider>
      
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={
              collapsed ? (
                <MenuUnfoldOutlined style={{ fontSize: 20 }} />
              ) : (
                <MenuFoldOutlined style={{ fontSize: 20 }} />
              )
            }
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
          <img
            alt="logo"
            src={logo}
            style={{ width: "2%", marginLeft: 0, marginTop: -12 }}
            className="images-logo"
          />
          <a
            href="/"
            style={{
              color: "black",
              fontSize: 28,
              fontWeight: "bold",
              marginLeft: 10,
            }}
          >
            Eventix
          </a>
          <Button
            style={{
              position: "absolute",
              top: 10,
              right: 20,
              marginLeft: "auto",
              width: "auto",
              height: 45,
              backgroundColor: "#00306E",
              fontSize: 17,
              color: "white",
              borderRadius: 15,
            }}
          >
            <FaUserCircle />
            Admin NongMos
          </Button>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 617,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {/* 👇 แก้จาก {children} เป็น <Outlet /> */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default WarehouseLayout;