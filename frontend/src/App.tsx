import React, { useState } from "react";
import "antd/dist/reset.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Promotion from "./pages/promotion";
import AddPromotion from "./pages/promotion/add";
import EditPromotionModal from "./pages/promotion/edit";
import SelectZone from "./pages/booking/select-zone";
import Dashboard from "./pages/dashboard";
import SelectSeat from "./pages/booking/select-seat";
import BookingDetail from "./pages/booking/BookingDetail";
import Payment from "./pages/payment";
import Concert from "./pages/concert";
import ConcertDetail from "./pages/concert/concertdetails";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/organizer/promotion" element={<Promotion />} />
        <Route path="/organizer/promotion/add" element={<AddPromotion />} />
        <Route
          path="/organizer/promotion/edit/:id"
          element={
            <EditPromotionModal
              visible={false}
              onCancel={function (): void {
                throw new Error("Function not implemented.");
              }}
              onSuccess={function (): void {
                throw new Error("Function not implemented.");
              }}
              promotionId={null}
            />
          }
        />
        <Route path="/organizer/dashboard" element={<Dashboard />} />

        <Route path="/selectseat" element={<SelectSeat />} />
        <Route path="/bookingdetail" element={<BookingDetail />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/concert" element={<Concert />} />
        <Route path="/concert/:id" element={<ConcertDetail />} />
        <Route path="/concert/:id/selectzone" element={<SelectZone />} />
      </Routes>
    </Router>
  );
};
export default App;
