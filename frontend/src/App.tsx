import React from "react";
import "antd/dist/reset.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MemberRoutes from "./routes/memberroutes";
import OrganizerRoutes from "./routes/organizerRoutes";
import { AuthProvider } from "./hook/authContext";
import Loader from "./component/loader/loader";
import { useServerReady } from "./component/loader/preparesever";
import PublicRoute from "./routes/publicRoutes";
import ForgetPassword from "./pages/user/forgotpass";
import ResetPassword from "./pages/user/resetpass";
import AdminRoutes from "./routes/AdminRoutes";
import AccessDenied from "./pages/access/accessdenied";

const App: React.FC = () => {
  const serverReady = useServerReady("http://localhost:8000/healthz");
  if (!serverReady) {
    return <Loader />;
  }
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/Eventix" replace />} />
          <Route
            path="/forget-password"
            element={
              <PublicRoute>
                <ForgetPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/forbidden" element={<AccessDenied />} />
          <Route path="/organizer/*" element={<OrganizerRoutes />} />
          <Route path="/*" element={<MemberRoutes />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
