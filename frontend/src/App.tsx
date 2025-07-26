// src/App.tsx
import React, { useState } from 'react'
import { Card, message } from 'antd'
import './App.css'
import 'antd/dist/reset.css'
import SignUp from './auth/signin'
import SignIn from './auth/login'
import { signUp, signIn } from './api/auth'

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
    <div className="container">
      {contextHolder}
      <Card className="card">
        <h2 className="title">{isSignup ? 'Sign Up' : 'Sign In'}</h2>

        {isSignup ? <SignUp onFinish={onFinish} /> : <SignIn onFinish={onFinish} />}

        <div className="switch">
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <a
            onClick={() => {
              setIsSignup(!isSignup)
              msgApi.destroy()
            }}
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </a>
        </div>
      </Card>
    </div>
  )
}

export default App
