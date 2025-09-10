// src/components/layout/Navbar.tsx
import React, { useMemo } from "react";
import {
  Layout,
  Button,
  Avatar,
  Dropdown,
  Grid,
  Space,
  Typography,
  Menu,
} from "antd";
import { FaUserCircle} from "react-icons/fa";
import { DownOutlined } from "@ant-design/icons";
import logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hook/authContext";

const { Header } = Layout;
const { useBreakpoint } = Grid;

type RoleName = "member" | "organizer" | "admin" | "staff";

type AppMenuItem = {
  label: string;
  to: string;
  roles?: RoleName[]; // ถ้าไม่ใส่ แปลว่า “ทุก role เห็นได้”
};

const Navbar: React.FC = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const role = (user?.role ? String(user.role).toLowerCase() : undefined) as
    | RoleName
    | undefined;

  const canSee = (item: AppMenuItem) =>
    !item.roles || (role && item.roles.includes(role));

  const navLinks = useMemo<AppMenuItem[]>(
    () => [
      { label: "Concert", to: "/concerts" }, // ทุก role เห็น
      { label: "Shopping", to: "/shopping" }, // ทุก role เห็น
      { label: "Staff", to: "/assignment", roles: ["staff", "admin"] },
      {
        label: "Organizer",
        to: "/organizer/dashboard",
        roles: ["organizer", "admin"],
      },
      { label: "Admin", to: "/admin/dashboard", roles: ["admin"] },
    ],
    []
  );

  const displayName = user?.name;

  const userMenu = {
    items: [
      { key: "profile", label: <Link to="/user/profile">Profile</Link> },
      { key: "myeticket", label: <Link to="/my-e-ticket">My E-Tickets</Link> },
      { type: "divider" as const },
      {
        key: "logout",
        danger: true,
        label: "Log out",
        onClick: () => logout(),
      },
    ],
  };

  const supportMenu = (
    <Menu
      style={{
        backgroundColor: "#ffffffff",
        fontSize: 26,
        fontWeight: "bold",
        textDecoration: "none",
        width: 120,
        marginTop: -25,
      }}
      items={[
        {
          key: "report",
          label: <Link to="/report">Report</Link>,
          style: { color: "#00306E", fontSize: 15, fontWeight: "bold" },
        },
        {
          key: "refund",
          label: <Link to="/refund">Refund</Link>,
          style: { color: "#00306E", fontSize: 15, fontWeight: "bold" },
        },
      ]}
    />
  );

  return (
    <Header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        height: 80,
        padding: "0 24px",
        background:
          "linear-gradient(90deg,#001a4d 0%, #00306e 50%, #004a8f 100%)",
        boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Left: Brand */}
      <Link
        to="/Eventix"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          textDecoration: "none",
        }}
      >
        <img
          src={logo}
          alt="Eventix logo"
          style={{ width: 40, height: 40, objectFit: "contain" }}
        />
        <Typography.Title
          level={3}
          style={{ margin: 0, color: "white", letterSpacing: 0.5 }}
        >
          Eventix
        </Typography.Title>
      </Link>

      {/* Center: Nav (hidden on mobile) */}
      {!isMobile && (
        <nav
          aria-label="primary"
          style={{
            marginLeft: 40,
            display: "flex",
            gap: 28,
            flex: 1,
            alignItems: "center",
          }}
        >
          {navLinks.filter(canSee).map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                color: "rgba(255,255,255,0.95)",
                fontSize: 18,
                fontWeight: 600,
                textDecoration: "none",
                padding: "8px 0",
                position: "relative",
                transition: "opacity .2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
              }}
            >
              {link.label}
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  height: 2,
                  width: "0%",
                  background: "white",
                  transition: "width .25s ease",
                }}
                className="hover-underline"
              />
            </Link>
          ))}

          {/* Support: ทุก role มองเห็นเสมอ */}
          <Dropdown
            overlay={supportMenu}
            placement="bottomLeft"
            trigger={["hover"]}
          >
            <a
              style={{
                color: "rgba(255,255,255,0.95)",
                fontSize: 18,
                fontWeight: 600,
                textDecoration: "none",
                padding: "8px 0",
                position: "relative",
                transition: "opacity .2s ease",
              }}
            >
              Support
            </a>
          </Dropdown>
        </nav>
      )}

      {/* Right: Actions */}
      <div style={{ marginLeft: "auto" }}>
          <Space size={16} align="center">
            {!user ? (
              <Button
                type="default"
                onClick={() => navigate("/signin")}
                style={{
                  background: "white",
                  height: 48,
                  borderRadius: 999,
                  paddingInline: 14,
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                <Avatar
                  size={24}
                  icon={<FaUserCircle />}
                  style={{ backgroundColor: "#E6F4FF", color: "#00306E" }}
                />
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
                    height: 48,
                    borderRadius: 999,
                    paddingInline: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  <Avatar
                    size={28}
                    icon={<FaUserCircle />}
                    style={{ backgroundColor: "#E6F4FF", color: "#00306E" }}
                  />
                  {displayName || "User"}
                  <DownOutlined style={{ fontSize: 12 }} />
                </Button>
              </Dropdown>
            )}
          </Space>
      </div>
    </Header>
  );
};

export default Navbar;
