// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import MemberRoutes from "./memberroutes";
import OrganizerRoutes from "./organizerroutes";
import type { ReactElement, FC } from "react";

function RequireAuth({ children }: { children: ReactElement }) {
  const token = localStorage.getItem("token"); 
  return token ? children : <Navigate to="/signin" replace />;
}

const Runroute: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />
      <Route path="/*" element={<MemberRoutes />} />
      <Route
        path="/organizer/*"
        element={
          <RequireAuth>
            <OrganizerRoutes />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  );
};

export default Runroute;
