// src/auth/RequireAuth.tsx
import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { Spin } from "antd";
import { useAuth } from "./authContext";

const RequireAuth: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user, authReady } = useAuth();
  const location = useLocation();

  if (!authReady) {
    return (
      <div style={{ minHeight: "40vh", display: "grid", placeItems: "center" }}>
        <Spin size="large" />{" "}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default RequireAuth;
