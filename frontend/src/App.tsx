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
          <Route path="/*" element={<MemberRoutes />} />
          <Route path="/organizer/*" element={<OrganizerRoutes />} />
          <Route path="/forbidden" element={<div>403 Not access right</div>} />
          <Route path="*" element={<Navigate to="/Eventix" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
