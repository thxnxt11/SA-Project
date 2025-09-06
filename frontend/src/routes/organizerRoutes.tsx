import { Routes, Route, Navigate } from "react-router-dom";

import Promotion from "../pages/promotion";
import AddPromotion from "../pages/promotion/add";
import EditPromotionModal from "../pages/promotion/edit";
import Dashboard from "../pages/dashboard";

import RequireAuth from "../hook/RequireAuth";
import RequireRole from "../hook/RequireRole";
import ConcertManagement from "../pages/concert/concertmanagement/ConcertManagement";
import ZoneBrowser from "../pages/seat/Seatmanagement";

export default function OrganizerRoutes() {
  return (
    <Routes>
      {/* /organizer -> dashboard */}
      <Route index element={<Navigate to="dashboard" replace />} />

      {/* ทั้งหมดต้องล็อกอิน + role organizer */}
      <Route
        path="dashboard"
        element={
          <RequireAuth>
            <RequireRole allow={["organizer"]}>
              {" "}
              {/*สามารถเพิ่ม role อื่นได้ */}
              <Dashboard />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="promotion"
        element={
          <RequireAuth>
            <RequireRole allow={["organizer"]}>
              <Promotion />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="promotion/add"
        element={
          <RequireAuth>
            <RequireRole allow={["organizer"]}>
              <AddPromotion />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="promotion/edit/:id"
        element={
          <RequireAuth>
            <RequireRole allow={["organizer"]}>
              <EditPromotionModal
                visible={false}
                onCancel={() => {}}
                onSuccess={() => {}}
                promotionId={null}
              />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="concerts"
        element={
          <RequireAuth>
            <RequireRole allow={["organizer"]}>
              <ConcertManagement />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="seatmanagement"
        element={
          <RequireAuth>
            <RequireRole allow={["organizer"]}>
              <ZoneBrowser />
            </RequireRole>
          </RequireAuth>
        }
      />

      {/* 404 inside /organizer */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
