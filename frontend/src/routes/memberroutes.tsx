import { Routes, Route, Navigate } from "react-router-dom";

import SignIn from "../pages/user/login";
import SignUp from "../pages/user/register";

import Concert from "../pages/concert/index.tsx";
import ConcertDetail from "../pages/concert/concertdetails";
import SelectZone from "../pages/booking/select-zone";
import SelectSeat from "../pages/booking/select-seat";
import BookingDetail from "../pages/booking/BookingDetail";
import Payment from "../pages/payment";
import RequireAuth from "../hook/RequireAuth.tsx";

export default function MemberRoutes() {
  return (
    <Routes>
      {/* auth */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* public */}
      <Route path="/concerts" element={<Concert />} />
      <Route path="/concert/:id" element={<ConcertDetail />} />
      <Route
        path="/concert/:id/selectzone"
        element={
          <RequireAuth>
            <SelectZone />
          </RequireAuth>
        }
      ></Route>
      <Route path="/selectseat" element={<RequireAuth><SelectSeat /></RequireAuth>} />
      <Route path="/bookingdetail" element={<RequireAuth><BookingDetail /></RequireAuth>} />
      <Route path="/payment" element={<RequireAuth><Payment /></RequireAuth>} />

      {/* 404 fallback for public */}
      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  );
}
