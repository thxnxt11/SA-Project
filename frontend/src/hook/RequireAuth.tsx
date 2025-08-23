// src/auth/RequireAuth.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./authContext";


const RequireAuth: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
};

export default RequireAuth;
