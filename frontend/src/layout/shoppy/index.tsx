import React from "react";
import { Layout, Button, theme } from "antd";
import { FaUserCircle, FaBell } from "react-icons/fa";
import logo from "../../assets/logo.png";

const { Header } = Layout;

import { Menu, Dropdown } from "antd";
import { Link, Outlet} from "react-router-dom";
import { Content } from "antd/es/layout/layout";
import { ShoppingCartOutlined } from "@ant-design/icons";

const NavbarShop: React.FC = () => {
  const navLinks = [
    { label: "HOME", href: "/" },
  ];
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const Merchandise = (
    <Menu
      style={{
        backgroundColor: "#00306E",
        fontSize: 26,
        fontWeight: "bold",
        textDecoration: "none",
      }}
    >
      <Menu.Item
        key="shirt"
        style={{ color: "white", fontSize: 18, fontWeight: "bold" }}
      >
        <Link to="/shoppy/shirt">Shirt</Link>
      </Menu.Item>
      <Menu.Item
        key="Bong"
        style={{ color: "white", fontSize: 18, fontWeight: "bold" }}
      >
        <Link to="/shoppy/bong">Bong</Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout>

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
      {/* {loco+text} */}
      <div style={{ display: "flex", alignItems: "center" }}>
        
        <img src={logo} alt="logo" style={{ width: 40, marginRight: 12 }} />
        <a
          href="/shoppy"
          style={{ color: "white", fontSize: 28, fontWeight: "bold" }}
          >
          Shopping
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
        {/* {MerchandiseMenu} */}
        <Dropdown
          overlay={Merchandise}
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
            Merchandise
          </a>
        </Dropdown>
      </div>
      
      {/* {cart+user} */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Link to="/shoppy/cart">
          <ShoppingCartOutlined style={{ fontSize: 24, color: "white", cursor: "pointer" }} />
        </Link>
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
          href="/login"
        >
          <FaUserCircle />
          Admin NongMos
        </Button>
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
  );
};

export default NavbarShop;