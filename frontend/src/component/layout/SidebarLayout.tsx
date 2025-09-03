import React, { useMemo, useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DownOutlined,
} from "@ant-design/icons";
import {
  Button,
  Layout,
  Menu,
  theme,
  Grid,
  Dropdown,
  Avatar,
  Typography,
  Divider,
} from "antd";
import {
  MdOutlineSpaceDashboard,
  MdOutlineLibraryMusic,
  MdEventSeat,
} from "react-icons/md";
import { LuTicketPercent } from "react-icons/lu";
import { FaRegCalendarAlt, FaUserCircle } from "react-icons/fa";
import logo from "../../assets/logo.png";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hook/authContext"; // <- ตรวจ path ให้ตรง

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();

  const { user, logout } = useAuth();

  const isMobile = !screens.lg; // < lg = mobile/tablet

  // เมนูหลัก
  const menuItems = useMemo(
    () => [
      {
        key: "/organizer/dashboard",
        icon: <MdOutlineSpaceDashboard style={{ fontSize: 20 }} />,
        label: <span title="Dashboard">Dashboard</span>,
        onClick: () => navigate("/organizer/dashboard"),
      },
      {
        key: "/organizer/concert",
        icon: <MdOutlineLibraryMusic style={{ fontSize: 20 }} />,
        label: <span title="จัดการคอนเสิร์ต">จัดการคอนเสิร์ต</span>,
        onClick: () => navigate("/organizer/concert"),
      },
      {
        key: "/organizer/chart",
        icon: <MdEventSeat style={{ fontSize: 20 }} />,
        label: <span title="จัดการผังที่นั่ง">จัดการผังที่นั่ง</span>,
        onClick: () => navigate("/organizer/chart"),
      },
      {
        key: "/organizer/promotion",
        icon: <LuTicketPercent style={{ fontSize: 20 }} />,
        label: <span title="จัดการโปรโมชั่น">จัดการโปรโมชั่น</span>,
        onClick: () => navigate("/organizer/promotion"),
      },
      {
        key: "/organizer/venue",
        icon: <FaRegCalendarAlt style={{ fontSize: 20 }} />,
        label: <span title="ปฏิทินสถานที่">ปฏิทินสถานที่</span>,
        onClick: () => navigate("/organizer/venue"),
      },
    ],
    [navigate]
  );

  // เมนูผู้ใช้มุมขวาบน
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

  // ✅ ทำชื่อแสดงผล (firstname lastname > name > email prefix)
  const displayName = user?.name;

  // ✅ ตัวอักษรย่อสำหรับ Avatar
  // const initials = (
  //   [user?.firstname, user?.lastname]
  //     .filter(Boolean)
  //     .map((s) => String(s)[0])
  //     .join("") ||
  //   displayName?.[0] ||
  //   "U"
  // ).toUpperCase();

  return (
    <Layout>
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
        {/* โลโก้ / ชื่อระบบ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            height: 64,
            padding: collapsed ? "0 16px" : "0 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <img
            src={logo}
            alt="Eventix logo"
            style={{ width: 32, height: 32, objectFit: "contain" }}
          />
          {!collapsed && (
            <Typography.Text style={{ color: "white", fontWeight: 700 }}>
              Concert Management
            </Typography.Text>
          )}
        </div>

        {/* เมนู + สกรอลล์ */}
        <div style={{ height: "calc(100vh - 64px - 56px)", overflow: "auto" }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            inlineCollapsed={collapsed}
            style={{
              background: "transparent",
              padding: "12px 8px",
              fontSize: 16,
            }}
            items={menuItems}
            onClick={(info) => {
              const selected = menuItems.find((i) => i.key === info.key);
              selected?.onClick?.();
            }}
          />
        </div>

        {/* Footer ด้านล่างของ Sider */}
        <div
          style={{
            height: 56,
            padding: collapsed ? "0 8px" : "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.7)",
            fontSize: 12,
          }}
        >
          {!collapsed ? (
            <>
              <span>© {new Date().getFullYear()} Eventix</span>
              <a
                href="/support"
                style={{
                  color: "rgba(255,255,255,0.9)",
                  textDecoration: "none",
                }}
              >
                Support
              </a>
            </>
          ) : (
            <a
              href="/support"
              title="Support"
              style={{ color: "rgba(255,255,255,0.9)", textDecoration: "none" }}
            >
              ?
            </a>
          )}
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
            margin: 16,
            padding: 24,
            minHeight: "calc(100vh - 64px - 32px)",
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
