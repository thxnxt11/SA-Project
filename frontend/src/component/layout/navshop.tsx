// src/components/layout/Navbar.tsx
import React, { Children, useMemo } from "react";
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
import {FaUserCircle} from "react-icons/fa";
import { DownOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import logo from "../../assets/logo.png";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hook/authContext";
import { Content } from "antd/es/layout/layout";

const { Header } = Layout;
const { useBreakpoint } = Grid;
interface NavbarShopProps {
  children?: React.ReactNode;
}
const NavbarShop:  React.FC<NavbarShopProps> = ({ children }) =>{
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
  const displayName = user?.name ;
  const userMenu = {
    items: [
      { key: "profile", label: <Link to="/profile">Profile</Link> },
      { key: "orders", label: <Link to="/orders">My E-Tickets</Link> },
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
    <>
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
                icon={<ShoppingCartOutlined />}
                onClick={() => navigate(`/shopping/cart/${user?.id}`)}
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
            {/* <Badge dot>
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
            /> */}
          </Space>
        )}
      </div>
    </Header>
    <Content
      style={{
        margin: "24px 16px",
        padding: 24,
        minHeight: 617,
        // background: colorBgContainer,
        // borderRadius: borderRadiusLG,
      }}
    >
      {children}
      {/* <Outlet /> */}
    </Content>
</>
  );
};

export default NavbarShop;