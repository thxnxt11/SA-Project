import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "../page/user/login";
import SignUp from "../page/user/register";

import PublicRoute from "./publicRoutes";

export default function MemberRoutes() {
  return (
    <Routes>
      {/* auth */}
      <Route
        path="/signin"
        element={
          <PublicRoute>
            <SignIn />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>

        }
      />
      

      {/* 404 fallback for public */}
      <Route path="*" element={<Navigate to="/Eventix" replace />} />
    </Routes>
  );
}