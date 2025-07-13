import React, { useState } from 'react'
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Button,
  Card,
  message,
  Row,
  Col,
} from 'antd'
import 'antd/dist/reset.css'  // or 'antd/dist/antd.css'
import { signUp, signIn } from './api/auth'
import './App.css'            // create for any extra custom styles

const { Option } = Select

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

        <Form
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ age: 18, gender_id: 1 }}
          requiredMark={false}
        >
          {isSignup && (
          <>
            <Form.Item
              label="First Name"
              name="first_name"
              rules={[{ required: true, message: 'Please enter your first name' }]}
            >
              <Input placeholder="First Name" />
            </Form.Item>

            <Form.Item
              label="Last Name"
              name="last_name"
              rules={[{ required: true, message: 'Please enter your last name' }]}
            >
              <Input placeholder="Last Name" />
            </Form.Item>
          </>
        )}

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { type: 'email', message: 'Invalid email' },
              { pattern: /.+@.+\.com$/, message: 'Must end with .com' },
              { required: true, message: 'Please enter your email' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            hasFeedback
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password />
          </Form.Item>

          {isSignup && (
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Passwords do not match'))
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}

          {isSignup && (
            <>
              <Form.Item
                label="Birthday"
                name="birthday"
                rules={[{ required: true, message: 'Please select your birthday' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>

              <Form.Item
                label="Age"
                name="age"
                rules={[{ required: true, message: 'Please enter your age' }]}
              >
                <InputNumber min={0} max={120} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                label="Phone Number"
                name="phonenum"
                rules={[{ required: true, message: 'Please enter your phone number' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Gender"
                name="gender_id"
                rules={[{ required: true, message: 'Please select your gender' }]}
              >
                <Select>
                  <Option value={1}>Male</Option>
                  <Option value={0}>Female</Option>
                </Select>
              </Form.Item>
            </>
          )}

          <Form.Item style={{ textAlign: 'center', marginTop: 24 }}>
            <Button type="primary" htmlType="submit" block size="large">
              {isSignup ? 'Sign Up' : 'Sign In'}
            </Button>
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
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default App
