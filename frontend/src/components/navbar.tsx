import React from "react";
import { Layout, Button } from "antd";
import { FaUserCircle, FaBell } from "react-icons/fa";
import logo from "../assets/logo.png";

const { Header } = Layout;

import { Menu, Dropdown } from "antd";
import { Link} from "react-router-dom";

const Navbar: React.FC = () => {
  const navLinks = [
    { label: "Concert", to: "/concert" },
    { label: "Shopping", to: "/shopping" },
  ];
  const supportMenu = (
    <Menu
      style={{
        backgroundColor: "#00306E",
        fontSize: 26,
        fontWeight: "bold",
        textDecoration: "none",
        width:120
      }}
    >
      <Menu.Item
        key="report"
        style={{ color: "white", fontSize: 18, fontWeight: "bold" }}
      >
        <Link to="/report">Report</Link>
      </Menu.Item>
      <Menu.Item
        key="refund"
        style={{ color: "white", fontSize: 18, fontWeight: "bold" }}
      >
        <Link to="/refund">Refund</Link>
      </Menu.Item>
    </Menu>
  );

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
            key={link.to}
            href={link.to}
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
        <Dropdown
          overlay={supportMenu}
          placement="bottomLeft"
          trigger={["hover"]}
        >
          <a
            style={{
              color: "white",
              fontSize: 26,
              fontWeight: "bold",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            Support
          </a>
        </Dropdown>
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
          }}
          href="/login"
        >
          <FaUserCircle />
          Sign In
        </Button>
      </div>
    </Header>
  );
};

export default Navbar;
