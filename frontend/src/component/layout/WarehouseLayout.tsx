import React, { useState,useMemo } from "react";
import { 
  DownOutlined, 
  EditOutlined, 
  FallOutlined, 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  MessageOutlined, 
  PlusOutlined, 
  PlusSquareOutlined 
} from "@ant-design/icons";
import { 
  Avatar, 
  Badge, 
  Button, 
  Divider, 
  Dropdown, 
  Grid, 
  Layout, 
  Menu, 
  theme, 
  Typography 
} from "antd";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { LuTicketPercent } from "react-icons/lu";
import { FaBell, FaRegCalendarAlt, FaUserCircle } from "react-icons/fa";
import logo from "../../assets/logo.png";
import { useLocation, useNavigate, Link, Outlet } from "react-router-dom";
import { useAuth } from "../../hook/authContext"; // <- ตรวจ path ให้ตรง
const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

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
  const screens = useBreakpoint();
  const { user, logout } = useAuth();
  const isMobile = !screens.lg; // < lg = mobile/tablet
  //  Map path ให้ key ตรงกับเมนู
  const menuKeyMap: { [key: string]: string } = {
    "/warehouse/dashboardwarehouse": "1",
    "/warehouse/create": "2",
    "/warehouse/edit": "3",
    "/warehouse/balance": "4",
  };
  const userMenu = {
    items: [
      { key: "profile", label: <Link to="/profile">Profile</Link> },
      { type: "divider" as const },
      {
        key: "logout",
        danger: true,
        label: "Log out",
        onClick: () => logout(),
      },
    ],
  };
  const displayName = user?.name;

  return (
    <Layout style={{ minHeight: "100vh", width: "100vw" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        collapsedWidth={isMobile ? 0 : 72}
        width={240}
        theme="dark"
        breakpoint="lg"
        onBreakpoint={(broken) => setCollapsed(broken)} // auto-collapse เมื่อจอเล็ก
        style={{
          background:
            "linear-gradient(180deg,#002451 0%, #00306E 60%, #004a8f 100%)",
          boxShadow: "2px 0 14px rgba(0,0,0,0.18)",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}
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
              "1": "/warehouse/dashboardwarehouse",
              "2": "/warehouse/create",
              "3": "/warehouse/edit",
              "4": "/warehouse/balance",
            };
            const path = pathMap[e.key];
            console.log("Menu Path :",path)
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
        <Header
          style={{
            paddingInline: 16,
            background: colorBgContainer,
            position: "sticky",
            top: 0,
            zIndex: 900,
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 2px 14px rgba(0,0,0,0.08)",
            height: 64,
          }}
        >
          <Button
            type="text"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            icon={
              collapsed ? (
                <MenuUnfoldOutlined style={{ fontSize: 18 }} />
              ) : (
                <MenuFoldOutlined style={{ fontSize: 18 }} />
              )
            }
            onClick={() => setCollapsed(!collapsed)}
            style={{ width: 44, height: 44 }}
          />

          {/* แบรนด์ (แสดงเฉพาะตอนจอเล็กหรือ sidebar ปิด) */}
          {(isMobile || collapsed) && (
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
              }}
            >
              <img
                alt="logo"
                src={logo}
                style={{ width: 28, height: 28, objectFit: "contain" }}
              />
              <Typography.Title
                level={4}
                style={{ margin: 0, color: "#00306E" }}
              >
                Eventix
              </Typography.Title>
            </Link>
          )}

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Badge dot offset={[-2, 2]}>
              <Button
                type="text"
                aria-label="Notifications"
                icon={<FaBell />}
                style={{ width: 40, height: 40, fontSize: 18 }}
              />
            </Badge>

            <Divider type="vertical" style={{ height: 24, marginInline: 8 }} />

            {!user ? (
              <Button
                type="default"
                onClick={() => navigate("/signin")}
                style={{
                  background: "white",
                  height: 44,
                  borderRadius: 999,
                  paddingInline: 14,
                  fontWeight: 600,
                }}
              >
                <Avatar
                  size={24}
                  icon={<FaUserCircle />}
                  style={{ backgroundColor: "#E6F4FF", color: "#00306E" }}
                ></Avatar>
                  Sign in
              </Button>
            ) : (
              <Dropdown
                menu={userMenu}
                placement="bottomRight"
                trigger={["click"]}
              >
                <Button
                  type="default"
                  style={{
                    background: "white",
                    height: 44,
                    borderRadius: 999,
                    paddingInline: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 15,
                    fontWeight: 600,
                  }}
                >
                  <Avatar
                    size={24}
                    icon={<FaUserCircle />}
                    style={{ backgroundColor: "#E6F4FF", color: "#00306E" }}
                  >
                    {/* {displayName ? initials : null} */}
                  </Avatar>

                  <Typography.Text
                    style={{ maxWidth: 140 }}
                    ellipsis={{ tooltip: displayName }}
                  >
                    {displayName || "User"}
                  </Typography.Text>

                  <DownOutlined style={{ fontSize: 10 }} />
                </Button>
              </Dropdown>
            )}
          </div>
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