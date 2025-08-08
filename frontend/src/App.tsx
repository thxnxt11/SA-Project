// src/App.tsx
// import React, { useState } from 'react'
// import { Card, message } from 'antd'
// import './App.css'
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

import React from "react";
import 'antd/dist/reset.css'
import { BrowserRouter as Router, Routes , Route} from 'react-router-dom';
import Venue from './page/venue';
import Staff from './page/staff';
import Dashboard from './page/dashboard';
import Addvenue from './page/venue/addvenue';
import Addstaff from './page/staff/addstaff';
import CalendarVenue from './page/calendar_venue';
import Assignment from './page/assignment';
import WorkSchedlue from "./page/work_schedule";
import TimeTableStep from "./page/work_schedule/add_workschedule";


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
         <Route path="/" element={<Dashboard />} />
          <Route path="venue" element={<Venue />} />
          <Route path="addvenue" element={<Addvenue/>}/>
          <Route path="staff" element={<Staff />} />
          <Route path="addstaff" element={<Addstaff/>}/>
          <Route path="calendarvenue" element={<CalendarVenue/>}/>
          <Route path="assignment" element = {<Assignment/>}/>
          <Route path="workschedule" element={<WorkSchedlue/>}/>
          <Route path="time_schedule" element={<TimeTableStep/>}/>
          
      </Routes>
    </Router>

  );
};

export default App;
