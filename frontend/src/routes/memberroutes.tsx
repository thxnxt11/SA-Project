import { Routes, Route, Navigate } from "react-router-dom";

import SignIn from "../pages/user/login";
import SignUp from "../pages/user/register";

// import Concert from "../pages/concert";
// import ConcertDetail from "../pages/concert/concertdetails";
// import SelectZone from "../pages/booking/select-zone";
// import SelectSeat from "../pages/booking/select-seat";
// import BookingDetail from "../pages/booking/BookingDetail";
// import Payment from "../pages/payment";

import NavbarShop from "../component/layout/navshop";
import LandingPage from "../pages/land";
import Navbar from "../component/layout/navbar";
import ShoppingPage from "../pages/shoppy";
import ProductDetailPage from "../pages/shoppy/detail";
import CartPages from "../pages/shoppy/cart";
import PaymentOrderPage from "../pages/shoppy/payment";

import RequireAuth from "../hook/RequireAuth";
import PublicRoute from "./publicRoutes";
// import ETicketCard from "../pages/e-ticket";

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

      public
      <Route path="/land" element={<LandingPage />} />

      {/* <Route path="/concerts" element={<Concert />} /> */}
      {/* <Route path="/concert/:id" element={<ConcertDetail />} /> */}

      {/* protected */}
      <Route
        path="/concert/:id/selectzone"
        element={
          <RequireAuth>
            {/* <SelectZone /> */}
          </RequireAuth>
        }
      />
      <Route
        path="/selectseat"
        element={
          <RequireAuth>
            {/* <SelectSeat /> */}
          </RequireAuth>
        }
      />
      <Route
        path="/bookingdetail"
        element={
          <RequireAuth>
            {/* <BookingDetail /> */}
          </RequireAuth>
        }
      />
      <Route
        path="/payment"
        element={
          <RequireAuth>
            {/* <Payment /> */}
          </RequireAuth>
        }
      />
      {/* <Route
        path="/e-ticket/:uuid"
        element={
          <RequireAuth>
            <ETicketCard />
          </RequireAuth>
        }
      /> */}
      {/* shoppy (public) */}
      <Route path="shopping" element={<NavbarShop />}>
        <Route index element={<ShoppingPage />} />
        <Route path="productdetail/:id" element={<ProductDetailPage />} />
        <Route path="cart/:id" element={<CartPages />} />
        <Route path="payment-orders/:id" element={<PaymentOrderPage />} />
        <Route path="*" element={<Navigate to="/shopping" replace />} />

      </Route>

      {/* 404 fallback for public */}
      <Route path="*" element={<Navigate to="/concerts" replace />} />
    </Routes>
  );
}