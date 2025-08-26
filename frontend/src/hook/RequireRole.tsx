import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./authContext";

type Props = { allow: Array<string | number> };

const RequireRole: React.FC<React.PropsWithChildren<Props>> = ({
  allow,
  children,
}) => {
  const { user } = useAuth();
  const roleName = String(user?.role ?? "").toLowerCase();
  const allowed = allow.map((r) => String(r).toLowerCase());

  if (!allowed.includes(roleName)) {
    return <Navigate to="/forbidden" replace />;
  }
  return <>{children}</>;
};

export default RequireRole;