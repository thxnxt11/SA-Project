import { Routes, Route, Navigate } from "react-router-dom";

import SignIn from "../pages/user/login";
import SignUp from "../pages/user/register";

import Concert from "../pages/concert";
import ConcertDetail from "../pages/concert/concertdetails";
import SelectZone from "../pages/booking/select-zone";
import SelectSeat from "../pages/booking/select-seat";
import BookingDetail from "../pages/booking/BookingDetail";
import Payment from "../pages/payment";

import RequireAuth from "../hook/RequireAuth";
import PublicRoute from "./publicRoutes";
import ReportForm from "../pages/report/report";
import { ReportHis } from "../pages/report/historyreport";
import { Refund } from "../pages/refund/refund";
import { RefundHis } from "../pages/refund/historyrefund";

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

      {/* public */}
      <Route path="/concerts" element={<Concert />} />
      <Route path="/concert/:id" element={<ConcertDetail />} />

      {/* protected */}
      <Route
        path="/concert/:id/selectzone"
        element={
          <RequireAuth>
            <SelectZone />
          </RequireAuth>
        }
      />
      <Route
        path="/selectseat"
        element={
          <RequireAuth>
            <SelectSeat />
          </RequireAuth>
        }
      />
      <Route
        path="/bookingdetail"
        element={
          <RequireAuth>
            <BookingDetail />
          </RequireAuth>
        }
      />
      <Route
        path="/payment"
        element={
          <RequireAuth>
            <Payment />
          </RequireAuth>
        }
      />
      <Route
        path="/report"
        element={
          <RequireAuth>
            <ReportForm />
          </RequireAuth>
        }
      />
      <Route
        path="/historyreport"
        element={
          <RequireAuth>
            <ReportHis />
          </RequireAuth>
        }
      />
      <Route
        path="/refund"
        element={
          <RequireAuth>
            <Refund />
          </RequireAuth>
        }
      />
      <Route
        path="/historyrefund"
        element={
          <RequireAuth>
            <RefundHis />
          </RequireAuth>
        }
      />
      {/* 404 fallback for public */}
      <Route path="*" element={<Navigate to="/concerts" replace />} />
    </Routes>
  );
}
