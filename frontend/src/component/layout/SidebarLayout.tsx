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
import logo from "../../assets/logo.png";
import { useLocation, useNavigate } from "react-router-dom";

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
  const location = useLocation();

  const menuItem = [
    {
      key: "/organizer/dashboard",
      icon: <MdOutlineSpaceDashboard style={{ fontSize: "20px" }} />,
      label: "Dashboard",
      onClick: () => navigate("/organizer/dashboard"),
    },
    {
      key: "/organizer/concerts",
      icon: <MdOutlineLibraryMusic style={{ fontSize: "20px" }} />,
      label: "จัดการคอนเสิร์ต",
      onClick: () => navigate("/organizer/concerts"),
    },
    {
      key: "/organizer/chart",
      icon: <MdEventSeat style={{ fontSize: "20px" }} />,
      label: "จัดการผังที่นั่ง",
      onClick: () => navigate("/organizer/chart"),
    },
    {
      key: "/organizer/promotion",
      icon: <LuTicketPercent style={{ fontSize: "20px" }} />,
      label: "จัดการโปรโมชั่น",
      onClick: () => navigate("/organizer/promotion"),
    },
    {
      key: "/organizer/venue",
      icon: <FaRegCalendarAlt style={{ fontSize: "20px" }} />,
      label: "ปฏิทินสถานที่",
      onClick: () => navigate("/organizer/venue"),
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
          <div style={{ color: "white", margin: "16px", textAlign: "center" }}>
            <h1 style={{ fontSize: "18px", margin: 0 }}>Concert Management</h1>
            <div style={{ height: 1, background: "rgba(255,255,255,0.5)", marginTop: 8 }} />
          </div>
        )}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
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
              src="https://media.audi.com/is/image/audi/microsites/audi-com/assets/sport/motorsport/formula-1/overview/2024/1920x1080_Audi_F1_Header.jpg?width=1920"
              style={{ width: "48px", height: "48px" }}
              referrerPolicy="no-referrer"
              onError={(e) => {
              console.error("FAILED:", e.currentTarget.src);
              e.currentTarget.src = "https://via.placeholder.com/48";
            }}
          />
          {/* <img
            alt="logo"
            src={logo}
            style={{ width: "2%", marginLeft: 0, marginTop: -12 }}
            className="images-logo"
          /> */}
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
