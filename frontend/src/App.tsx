import { Routes, Route, Navigate } from "react-router-dom";
import MemberRoutes from "./routes/memberroutes";
import OrganizerRoutes from "./routes/organizerroutes";
import type { ReactElement, FC } from "react";
import {useServerReady} from "./component/loader/preparesever";
import Loader from "./component/loader/loader";

function RequireAuth({ children }: { children: ReactElement }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/signin" replace />;
}

const Runroute: FC = () => {
  console.log("member = t@gmail.com password = 123")
  console.log("organizer = m@gmail.com password = 12345")

  const serverReady = useServerReady("http://localhost:8000/healthz");

  if (!serverReady) {

    return <Loader />;
  }
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
