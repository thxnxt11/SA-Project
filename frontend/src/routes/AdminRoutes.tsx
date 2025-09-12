import { Routes, Route, Navigate } from "react-router-dom";

// import Dashboard from "../pages/dashboard";
import DashboardWarehouse from "../pages/warehouse";
import CreateWarehouse from "../pages/warehouse/create";
import EditWarehouse from "../pages/warehouse/edit";
import CheckWarehouse from "../pages/warehouse/balance";

import RequireAuth from "../hook/RequireAuth";
import RequireRole from "../hook/RequireRole";
import Dashboard from "../pages/dashboard/admin";
import Venue from "../pages/venue";
import Addvenue from "../pages/venue/addvenue";
import Editvenue from "../pages/venue/editvenue";
import Equipment from "../pages/equipment";
import EditStaff from "../pages/register_staff/editstaff";
import Addstaff from "../pages/register_staff/addstaff";
import Assignment from "../pages/assignment";
import AllStaff from "../pages/register_staff";

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
      <Route
        path="dashboard"
        element={
          <RequireAuth>
            <RequireRole allow={["admin", 3]}>
              <Dashboard />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="venue"
        element={
          <RequireAuth>
            <RequireRole allow={["admin", 3]}>
              <Venue />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="addvenue"
        element={
          <RequireAuth>
            <RequireRole allow={["admin", 3]}>
              <Addvenue />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="editvenue"
        element={
          <RequireAuth>
            <RequireRole allow={["admin", 3]}>
              <Editvenue />
            </RequireRole>
          </RequireAuth>
        }
      />

      <Route
        path="equipment"
        element={
          <RequireAuth>
            <RequireRole allow={["admin", 3]}>
              <Equipment />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="editstaff/:id"
        element={
          <RequireAuth>
            <RequireRole allow={["admin", 3]}>
              <EditStaff />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="staff"
        element={
          <RequireAuth>
            <RequireRole allow={["admin", 3]}>
              <AllStaff />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="addstaff"
        element={
          <RequireAuth>
            <RequireRole allow={["admin", 3]}>
              <Addstaff />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="assignment"
        element={
          <RequireAuth>
            <RequireRole allow={["admin", 3]}>
              <Assignment />
            </RequireRole>
          </RequireAuth>
        }
      />
      {/* 404 inside /organizer */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
