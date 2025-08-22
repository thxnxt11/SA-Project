import React, { useMemo, useState } from "react";
import {
  Layout,
  Button,
  Badge,
  Avatar,
  Dropdown,
  Menu,
  Drawer,
  Grid,
  Space,
  Typography,
} from "antd";
import { FaUserCircle, FaBell, FaBars } from "react-icons/fa";
import { DownOutlined } from "@ant-design/icons";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";

const { Header } = Layout;
const { useBreakpoint } = Grid;

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const screens = useBreakpoint();

  const navLinks = useMemo(
    () => [
      { label: "Concert", href: "/concert" },
      { label: "Shopping", href: "/shopping" },
      { label: "Support", href: "/support" },
    ],
    []
  );

  const userMenu = (
    <Menu
      items={[
        { key: "profile", label: <a href="/profile">Profile</a> },
        { key: "orders", label: <a href="/orders">My E-Tickets</a> },
        { type: "divider" as const },
        {
          key: "logout",
          danger: true,
          label: <Link to="/logout">Log out</Link>,
        },
      ]}
    />
  );

  const isMobile = !screens.md;

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
      <a
        href="/"
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
      </a>

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
            <a
              key={link.href}
              href={link.href}
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
            </a>
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

            <Dropdown
              overlay={userMenu}
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
                Tan Thanat
                <DownOutlined style={{ fontSize: 12 }} />
              </Button>
            </Dropdown>
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

      {/* Drawer for mobile */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={logo} alt="Eventix logo" style={{ width: 28 }} />
            <span style={{ fontWeight: 700 }}>Menu</span>
          </div>
        }
        placement="right"
        closable
        onClose={() => setOpen(false)}
        open={open}
        bodyStyle={{ paddingTop: 8, paddingBottom: 16 }}
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          {navLinks.map((link) => (
            <Button
              key={link.href}
              href={link.href}
              type="text"
              size="large"
              style={{
                justifyContent: "flex-start",
                height: 48,
                borderRadius: 10,
                fontWeight: 600,
              }}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Button>
          ))}
          <div style={{ height: 8 }} />
          <Button
            href="/profile"
            size="large"
            style={{
              height: 48,
              borderRadius: 12,
              fontWeight: 700,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,1))",
            }}
            icon={<FaUserCircle style={{ marginRight: 6 }} />}
            onClick={() => setOpen(false)}
          >
            Tan Thanat
          </Button>
          <Button
            href="/orders"
            type="text"
            size="large"
            style={{ height: 44, borderRadius: 10 }}
            onClick={() => setOpen(false)}
          >
            My Tickets
          </Button>
          <Button
            href="/logout"
            type="text"
            danger
            size="large"
            style={{ height: 44, borderRadius: 10 }}
            onClick={() => setOpen(false)}
          >
            Log out
          </Button>
        </Space>
      </Drawer>
    </Header>
  );
};

export default Navbar;
