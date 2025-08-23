import React from "react";
import "antd/dist/reset.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import type { ReactElement } from "react";
import MemberRoutes from "./routes/memberroutes";
import OrganizerRoutes from "./routes/organizerroutes";
import { AuthProvider } from "./hook/authContext";

function RequireAuth({ children }: { children: ReactElement }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/signin" replace />;
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
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
      </Router>
    </AuthProvider>
  );
};
export default App;
