// src/routes.tsx this mix all path
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Promotion from "../pages/promotion";
import AddPromotion from "../pages/promotion/add";
import EditPromotionModal from "../pages/promotion/edit";
import Dashboard from "../pages/dashboard";


import Concert from "../pages/concert/concertdetails";            
import ConcertDetail from "../pages/concert/concertdetails";
import SelectZone from "../pages/booking/select-zone";
import SelectSeat from "../pages/booking/select-seat";
import BookingDetail from "../pages/booking/BookingDetail";
import Payment from "../pages/payment";


import ConcertManagement from "../pages/concert/concertmanagement/ConcertManagement"; // 

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* default redirect */}
      <Route path="/" element={<Navigate to="/organizer/concerts" replace />} />


      <Route path="/organizer/dashboard" element={<Dashboard />} />
      <Route path="/organizer/concerts" element={<ConcertManagement/>} />
      <Route path="/organizer/promotion" element={<Promotion />} />
      <Route path="/organizer/promotion/add" element={<AddPromotion />} />
      <Route
        path="/organizer/promotion/edit/:id"
        element={
          <EditPromotionModal
            visible={false}
            onCancel={() => {}}
            onSuccess={() => {}}
            promotionId={null}
          />
        }
      />

      {/* public */}
      <Route path="/concert" element={<Concert />} />
      <Route path="/concert/:id" element={<ConcertDetail />} />
      <Route path="/concert/:id/selectzone" element={<SelectZone />} />
      <Route path="/selectseat" element={<SelectSeat />} />
      <Route path="/bookingdetail" element={<BookingDetail />} />
      <Route path="/payment" element={<Payment />} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/organizer/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
