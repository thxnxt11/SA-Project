// src/components/layout/Navbar.tsx
import React, { useMemo, useState } from "react";
import {
  Layout,
  Button,
  Badge,
  Avatar,
  Dropdown,
  Grid,
  Space,
  Typography,
} from "antd";
import { FaUserCircle, FaBell, FaBars } from "react-icons/fa";
import { DownOutlined } from "@ant-design/icons";
import logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hook/authContext"; // <-- ตรวจ path ให้ถูก

const { Header } = Layout;
const { useBreakpoint } = Grid;

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const navLinks = useMemo(
    () => [
      { label: "Concert", to: "/concert" },
      { label: "Shopping", to: "/shopping" },
      { label: "Support", to: "/support" },
    ],
    []
  );

  // ✅ สร้างชื่อแสดงผลจาก firstname + lastname > name > email prefix
  const displayName = user?.name ;

  // ตัวอักษรย่อใน Avatar
  // const initials = (
  //   [user?.firstname, user?.lastname]
  //     .filter(Boolean)
  //     .map((s) => String(s)[0])
  //     .join("") ||
  //   displayName?.[0] ||
  //   "U"
  // ).toUpperCase();

  const userMenu = {
    items: [
      { key: "profile", label: <Link to="/profile">Profile</Link> },
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
        to="/"
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
          }}
        >
          {navLinks.map((link) => (
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
        </nav>
      )}

      {/* Right: Actions */}
      <div style={{ marginLeft: "auto" }}>
        {!isMobile ? (
          <Space size={16} align="center">
            <Badge dot offset={[-2, 2]}>
              <Button
                type="text"
                aria-label="Notifications"
                icon={<FaBell />}
                style={{
                  color: "white",
                  fontSize: 18,
                  height: 44,
                }}
              />
            </Badge>

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
                  >
                    {/* {displayName ? initials : null} */}
                  </Avatar>
                  {displayName || "User"}
                  <DownOutlined style={{ fontSize: 12 }} />
                </Button>
              </Dropdown>
            )}
          </Space>
        ) : (
          <Space>
            <Badge dot>
              <Button
                type="text"
                aria-label="Notifications"
                icon={<FaBell />}
                style={{ color: "white", fontSize: 18, height: 44 }}
              />
            </Badge>
            <Button
              type="text"
              aria-label="Open menu"
              icon={<FaBars />}
              onClick={() => setOpen(true)}
              style={{ color: "white", fontSize: 20, height: 44 }}
            />
          </Space>
        )}
      </div>
    </Header>
  );
};

export default Navbar;
