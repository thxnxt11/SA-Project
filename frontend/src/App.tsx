// src/App.tsx
import React, { useState } from 'react'
import {Layout, message } from 'antd'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import './App.css'
import 'antd/dist/reset.css'
import { signUp, signIn } from './api/auth'
import Report from './pages/report/reportt'
import { Refund } from './pages/refund/refundd'
import { RefundHis } from './pages/refund/historyrefund'
import { ReportHis } from './pages/report/historyreport'
import Navbar from './components/navbar';
import SignInForm from './pages/signin/signin';
import SignUpForm from './pages/signup/signup';

const App: React.FC = () => {
  const [isSignup, setIsSignup] = useState(true)
  const [msgApi, contextHolder] = message.useMessage()

  const onFinish = async (values: any) => {
    try {
      if (isSignup) {
        await signUp(values)
        msgApi.success('Signup successful!')
      } else {
        const data = await signIn(values)
        msgApi.success(`Token: ${data.token}`)
      }
    } catch (err: any) {
      msgApi.error(err.message || 'Something went wrong')
    }
  }

  return (
     <Router>
      <Layout>
        <Navbar />
        <Routes>
          <Route path="/report" element={<Report />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/login" element={<SignInForm onFinish={function (values: any): void {
            throw new Error('Function not implemented.');
          } } />} />
          <Route path="/signup" element={<SignUpForm onFinish={function (values: any): void {
            throw new Error('Function not implemented.');
          } } />} />
          <Route path="/historyreport" element={<ReportHis />} />
          <Route path="/historyrefund" element={<RefundHis />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
