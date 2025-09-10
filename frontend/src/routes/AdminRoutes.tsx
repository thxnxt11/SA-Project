import { Routes, Route, Navigate } from "react-router-dom";
import WarehouseLayout from "../component/layout/WarehouseLayout";

// import Dashboard from "../pages/dashboard";
import DashboardWarehouse from "../pages/warehouse";
import CreateWarehouse from "../pages/warehouse/create";
import EditWarehouse from "../pages/warehouse/edit";
import CheckWarehouse from "../pages/warehouse/balance";

import RequireAuth from "../hook/RequireAuth";
import RequireRole from "../hook/RequireRole";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboardwarehouse" replace />} />
        <Route
          path="dashboardwarehouse"
          element={
            <RequireAuth>
              <RequireRole allow={["admin", 3]}>
                <DashboardWarehouse />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="create"
          element={
            <RequireAuth>
              <RequireRole allow={["admin", 3]}>
                <CreateWarehouse />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="edit"
          element={
            <RequireAuth>
              <RequireRole allow={["admin", 3]}>
                <EditWarehouse />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="balance"
          element={
            <RequireAuth>
              <RequireRole allow={["admin", 3]}>
                <CheckWarehouse />
              </RequireRole>
            </RequireAuth>
          }
        />
         {/* 404 inside /organizer */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}

