// src/SignIn.tsx
import React from 'react'
import { Form, Input, Button } from 'antd'

const SignInForm: React.FC<{ onFinish: (values: any) => void }> = ({ onFinish }) => {
  return (
    <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
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

      <Form.Item>
        <Button type="primary" htmlType="submit" block size="large">
          Sign In
        </Button>
      </Form.Item>
    </Form>
  )
}

export default SignInForm
