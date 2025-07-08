import React, { useState } from "react";
import { Card, Form, Input, Button, Alert, Typography } from 'antd';


const { Paragraph } = Typography;

// Define the type for the current view
type AuthView = 'signup' | 'login';

const App: React.FC = () => {

  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupNickname, setSignupNickname] = useState("");
  const [signupResponse, setSignupResponse] = useState("");


  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginResponse, setLoginResponse] = useState("");


  const [currentView, setCurrentView] = useState<AuthView>('signup');

 
  const handleSignUp = async () => {
    const payload = { 
      username: signupUsername, 
      password: signupPassword, 
      nickname: signupNickname 
    };
    console.log("Sending signup payload:", payload);

    try {
      const res = await fetch("http://localhost:8000/api/sendsign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log("Server responded (signup):", res.status, text);
      setSignupResponse(text);
      // Optionally, if signup is successful, switch to login view
      if (res.ok && text.includes("successfuly")) {
        setCurrentView('login');
        setLoginUsername(signupUsername); // Pre-fill username for convenience
        setSignupUsername(''); // Clear signup form
        setSignupPassword('');
        setSignupNickname('');
      }
    } catch (err: any) {
      console.error("Network error (signup):", err);
      setSignupResponse("Network error: " + err.message);
    }
  };

  // --- Log In Logic ---
  const handleLogin = async () => {
    const payload = { 
      username: loginUsername, 
      password: loginPassword 
    };
    console.log("Sending login payload:", payload);

    try {
      const res = await fetch("http://localhost:8000/api/sendlog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log("Server responded (login):", res.status, text);
      setLoginResponse(text);
      // You might want to do something more here on successful login,
      // like redirecting the user to a dashboard.
    } catch (err: any) {
      console.error("Network error (login):", err);
      setLoginResponse("Network error: " + err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
      {currentView === 'signup' ? (
        // Sign Up Form
        <Card
          title="Sign Up"
          className="max-w-md w-full shadow-lg rounded-lg p-6" // Tailwind classes for card styling
          headStyle={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 'bold', borderBottom: 'none' }}
          bodyStyle={{ padding: '24px' }}
        >
          <Form
            layout="vertical"
            onFinish={handleSignUp}
            initialValues={{ username: signupUsername, password: signupPassword, nickname: signupNickname }}
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input
                placeholder="Enter username"
                onChange={e => setSignupUsername(e.target.value)}
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                placeholder="Enter password"
                onChange={e => setSignupPassword(e.target.value)}
              />
            </Form.Item>

            <Form.Item
              label="Nickname"
              name="nickname"
              rules={[{ required: true, message: 'Give yourself a nickname!' }]}
            >
              <Input
                placeholder="What should we call you?"
                onChange={e => setSignupNickname(e.target.value)}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Submit
              </Button>
            </Form.Item>
          </Form>

          <Paragraph className="text-center mt-4">
            Already have an account?{' '}
            <a href="#" onClick={() => setCurrentView('login')}>
              Log In
            </a>
          </Paragraph>

          {signupResponse && (
            <Alert
              className="mt-4"
              message={signupResponse}
              type={signupResponse.includes("successfuly") ? "success" : "error"}
              showIcon
            />
          )}
        </Card>
      ) : (
        // Log In Form
        <Card
          title="Log In"
          className="max-w-md w-full shadow-lg rounded-lg p-6" // Tailwind classes for card styling
          headStyle={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 'bold', borderBottom: 'none' }}
          bodyStyle={{ padding: '24px' }}
        >
          <Form
            layout="vertical"
            onFinish={handleLogin}
            initialValues={{ username: loginUsername, password: loginPassword }}
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input
                placeholder="Enter username"
                onChange={e => setLoginUsername(e.target.value)}
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                placeholder="Enter password"
                onChange={e => setLoginPassword(e.target.value)}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Log In
              </Button>
            </Form.Item>
          </Form>

          <Paragraph className="text-center mt-4">
            Don't have an account?{' '}
            <a href="#" onClick={() => setCurrentView('signup')}>
              Sign Up
            </a>
          </Paragraph>

          {loginResponse && (
            <Alert
              className="mt-4"
              message={loginResponse}
              type={loginResponse.includes("successful") ? "success" : "error"}
              showIcon
            />
          )}
        </Card>
      )}
    </div>
  );
};

export default App;
