// // src/App.tsx
// import React, { useState } from 'react'
// import { Card, message } from 'antd'
// import './App.css'
// import 'antd/dist/reset.css'
// import SignUp from './auth/signin'
// import SignIn from './auth/login'
// import { signUp, signIn } from './api/auth'

// const App: React.FC = () => {
//   const [isSignup, setIsSignup] = useState(true)
//   const [msgApi, contextHolder] = message.useMessage()

//   const onFinish = async (values: any) => {
//     try {
//       if (isSignup) {
//         await signUp(values)
//         msgApi.success('Signup successful!')
//       } else {
//         const data = await signIn(values)
//         msgApi.success(`Token: ${data.token}`)
//       }
//     } catch (err: any) {
//       msgApi.error(err.message || 'Something went wrong')
//     }
//   }

//   return (
//     <div className="container">
//       {contextHolder}
//       <Card className="card">
//         <h2 className="title">{isSignup ? 'Sign Up' : 'Sign In'}</h2>

//         {isSignup ? <SignUp onFinish={onFinish} /> : <SignIn onFinish={onFinish} />}

//         <div className="switch">
//           {isSignup ? 'Already have an account? ' : "Don't have an account? "}
//           <a
//             onClick={() => {
//               setIsSignup(!isSignup)
//               msgApi.destroy()
//             }}
//           >
//             {isSignup ? 'Sign In' : 'Sign Up'}
//           </a>
//         </div>
//       </Card>
//     </div>
//   )
// }

// export default App




// // src/App.tsx
// import React from "react";
// //import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import WarehousePage from "./page/warehouse/insert"; // ชี้มาที่ index.tsx

// const WarehousePageProp: React.FC = () => {
//   return (
//     <>
//       <WarehousePage>
//         <></>
        
//       </WarehousePage>
//     </>
//   );
// };

// // refer
// import React from "react";
// //import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import SidebarLayout from "./page/refer"; // ชี้มาที่ index.tsx

// const SidebarLayoutProps: React.FC = () => {
//   return (
//     <>
//       <SidebarLayout>
//         <></>
        
//       </SidebarLayout>
//     </>
//   );
// };



import { useRoutes } from "react-router-dom";
import AdminRoutes from "./routes/AdminRoutes"; // ถูกต้องตาม path

function App() {
  const routes = useRoutes([AdminRoutes]); // << ถูกต้องแล้ว
  return routes;
}

export default App;
