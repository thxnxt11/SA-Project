import React from "react";
import { Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

type ArrowButtonProps = {
  direction: "left" | "right";
  onClick?: () => void;
  /** CSS top position (e.g., "40%" หรือ number) */
  top?: string | number;
  /** ระยะห่างจากขอบซ้าย/ขวา (px) */
  offset?: number;
  /** zIndex */
  zIndex?: number;
  /** override style เพิ่มเติมถ้าต้องการ */
  style?: React.CSSProperties;
  /** aria-label สำหรับ a11y */
  ariaLabel?: string;
  /** ขนาดปุ่ม antd */
  size?: "large" | "middle" | "small";
};

const ArrowButton: React.FC<ArrowButtonProps> = ({
  direction,
  onClick,
  top = "40%",
  offset = 20,
  zIndex = 10,
  style,
  ariaLabel,
  size = "large",
}) => {
  const isLeft = direction === "left";
  return (
    <Button
      aria-label={ariaLabel ?? (isLeft ? "Previous" : "Next")}
      shape="circle"
      size={size}
      icon={isLeft ? <LeftOutlined /> : <RightOutlined />}
      onClick={onClick}
      style={{
        position: "absolute",
        top,
        ...(isLeft ? { left: `${offset}px` } : { right: `${offset}px` }),
        zIndex,
        background: "rgba(0,0,0,0.6)",
        borderColor: "transparent",
        color: "#fff",
        ...style,
      }}
    />
  );
};

export default ArrowButton;
