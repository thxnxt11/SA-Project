import React from "react";
import { Layout, Button } from "antd";
import { FaUserCircle, FaBell } from "react-icons/fa";
import logo from "../../assets/logo.png";

const { Header } = Layout;

const Navbar: React.FC = () => {
  const navLinks = [
    { label: "Concert", href: "/concert" },
    { label: "Shopping", href: "/shopping" },
    { label: "Support", href: "/support" },
  ];

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#00306E",
        height: 90,
        padding: "0 30px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src={logo} alt="logo" style={{ width: 40, marginRight: 12 }} />
        <a
          href="/"
          style={{ color: "white", fontSize: 28, fontWeight: "bold" }}
        >
          Eventix
        </a>
      </div>

      <div
        style={{ display: "flex", gap: 50, position: "absolute", left: "15%" }}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            style={{
              color: "white",
              fontSize: 26,
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            {link.label}
          </a>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <FaBell style={{ fontSize: 24, color: "white", cursor: "pointer" }} />
        <Button
          type="default"
          style={{
            backgroundColor: "white",
            fontSize: 22,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 16px",
            height: 50,
            fontWeight: "bold",
            borderRadius: 15,
          }}
          href="/signin"
        >
          <FaUserCircle />
          Tan Thanat
        </Button>
      </div>
    </Header>
  );
};

export default Navbar;
