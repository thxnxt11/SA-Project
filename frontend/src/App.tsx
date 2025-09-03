import React from "react";
import "antd/dist/reset.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

<<<<<<< Updated upstream
import MemberRoutes from "./routes/memberroutes";
import OrganizerRoutes from "./routes/organizerroutes";
=======
import MemberRoutes from "./routes/memberRoutes";
import OrganizerRoutes from "./routes/organizerRoutes";
>>>>>>> Stashed changes
import { AuthProvider } from "./hook/authContext";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/concerts" replace />} />
          <Route path="/*" element={<MemberRoutes />} />
          <Route path="/organizer/*" element={<OrganizerRoutes />} />
          <Route path="/forbidden" element={<div>403 Not access right</div>} />
          <Route path="*" element={<Navigate to="/concerts" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
