import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hook/authContext";

const PublicRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user, authReady } = useAuth(); // หรือ loading
  const location = useLocation();

  if (!authReady) return null;

  if (user) {
    const fromState = (location.state as any)?.from?.pathname;
    const fromQuery = new URLSearchParams(location.search).get("redirect");
    const redirectTo = fromState || fromQuery;

    if (redirectTo && redirectTo !== "/signin") {
      return <Navigate to={redirectTo} replace />;
    }
    return <Navigate to="/concerts" replace />; // ค่า default ของคุณ
  }

  return <>{children}</>;
};

export default PublicRoute;