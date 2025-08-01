import React, { useState, type ReactNode } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Layout, Menu, theme } from "antd";
import {
  MdOutlineSpaceDashboard,
  MdOutlineLibraryMusic,
  MdEventSeat,
} from "react-icons/md";
import { LuTicketPercent } from "react-icons/lu";
import { FaRegCalendarAlt, FaUserCircle } from "react-icons/fa";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
// import { useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

interface SidebarLayoutProps {
  children: ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();
  const menuItem = [
    {
      key: "1",
      icon: <MdOutlineSpaceDashboard style={{ fontSize: "20px" }} />,
      label: "Dashboard",
      onClick: () => navigate("/"),
    },
    {
      key: "2",
      icon: <MdOutlineLibraryMusic style={{ fontSize: "20px" }} />,
      label: "จัดการคอนเสิร์ต",
      onClick: () => navigate("/concert"),
    },
    {
      key: "3",
      icon: <MdEventSeat style={{ fontSize: "20px" }} />,
      label: "จัดการผังที่นั่ง",
      onClick: () => navigate("/chart"),
    },
    {
      key: "4",
      icon: <LuTicketPercent style={{ fontSize: "20px" }} />,
      label: "จัดการโปรโมชั่น",
      onClick: () => navigate("/promotion"),
    },
    {
      key: "5",
      icon: <FaRegCalendarAlt style={{ fontSize: "20px" }} />,
      label: "ปฏิทินสถานที่",
      onClick: () => navigate("/venue"),
    },
  ];

  return (
    <Layout>
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
            Concert Management
            <h5>_________________________</h5>
          </h1>
        )}
        <Menu
          theme="dark"
          mode="inline"
          // defaultSelectedKeys={["1"]}
          style={{
            fontSize: "17px", // ปรับขนาด label
            backgroundColor: "#00306E", // ปรับสีพื้นหลัง
            color: "white", // ปรับสีตัวอักษร
          }}
          items={menuItem}
          onClick={(item) => {
            const selected = menuItem.find((i) => i.key === item.key);
            selected?.onClick?.();
          }}
        />
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
            SM TRUE
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
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default SidebarLayout;
