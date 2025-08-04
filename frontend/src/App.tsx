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
import ETickets from "./pages/payment/e-ticket";
// import { Card, message } from "antd";
// import "./App.css";

// import SignUp from "./auth/register";
// import SignIn from "./auth/login";
// import { signUp, signIn } from "./api/auth";

// const App: React.FC = () => {
//   const [isSignup, setIsSignup] = useState(true);
//   const [msgApi, contextHolder] = message.useMessage();

//   const onFinish = async (values: any) => {
//     try {
//       if (isSignup) {
//         await signUp(values);
//         msgApi.success("Signup successful!");
//       } else {
//         const data = await signIn(values);
//         msgApi.success(`Token: ${data.token}`);
//       }
//     } catch (err: any) {
//       msgApi.error(err.message || "Something went wrong");
//     }
//   };

//   return (
//     <>
//       <div className="container">
//         {contextHolder}
//         <Card className="card">
//           <h2 className="title">{isSignup ? "Sign Up" : "Sign In"}</h2>

//           {isSignup ? (
//             <SignUp onFinish={onFinish} />
//           ) : (
//             <SignIn onFinish={onFinish} />
//           )}

//           <div className="switch">
//             {isSignup ? "Already have an account? " : "Don't have an account? "}
//             <a
//               onClick={() => {
//                 setIsSignup(!isSignup);
//                 msgApi.destroy();
//               }}
//             >
//               {isSignup ? "Sign In" : "Sign Up"}
//             </a>
//           </div>
//         </Card>
//       </div>
//     </>
//   );
// };

// export default App;

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
        <Route path="/selectzone" element={<SelectZone />} />

        <Route path="/selectseat" element={<SelectSeat />} />
        <Route path="/bookingdetail" element={<BookingDetail />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </Router>
  );
};
export default App;
