import React from "react";
import "antd/dist/reset.css";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/organizerroutes"
import ConcertManagement from "./pages/concert";

const App: React.FC = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;