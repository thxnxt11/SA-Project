import { Routes, Route, Navigate } from "react-router-dom";

import Promotion from "../pages/promotion";
import AddPromotion from "../pages/promotion/add";
import EditPromotionModal from "../pages/promotion/edit";
import Dashboard from "../pages/dashboard";
import RequireAuth from "../hook/RequireAuth";
// import ConcertManagement from "../pages/concert/concertmanagement/ConcertManagement";

export default function OrganizerRoutes() {
  return (
    <Routes>
      {/* /organizer -> concerts */}
      <Route index element={<Navigate to="concerts" replace />} />

      {/* NOTE: all paths are RELATIVE (no leading /) */}
      <Route
        path="dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      {/* <Route path="concerts" element={<ConcertManagement />} /> */}
      <Route
        path="promotion"
        element={
          <RequireAuth>
            <Promotion />
          </RequireAuth>
        }
      />
      <Route
        path="promotion/add"
        element={
          <RequireAuth>
            <AddPromotion />
          </RequireAuth>
        }
      />

      <Route
        path="promotion/edit/:id"
        element={
          <RequireAuth>
            <EditPromotionModal
              visible={false}
              onCancel={() => {}}
              onSuccess={() => {}}
              promotionId={null}
            />
          </RequireAuth>
        }
      />

      {/* 404 inside /organizer */}
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}
