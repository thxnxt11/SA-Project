import React from "react";
import AdminsidebarLayout from "../../../components/sidebarLayout";
import { Button, Form, Input, Radio, Row, Col, Select, Card } from 'antd';
const { Option } = Select;
const Addstaff: React.FC = () =>{
    const [form] = Form.useForm();

  const handleSubmit = (values: unknown) => {
  console.log('Form Submitted:', values);
    // TODO: ส่งข้อมูลไปยัง backend หรือ API
  };
    return (
    <AdminsidebarLayout>
    <div >
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '1rem' }}>เพิ่มข้อมูลทีมงาน</h1>

      <Card bordered style={{ borderRadius: 8 }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="First name" name="firstName" rules={[{ required: true }]}>
                <Input placeholder="Enter first name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Last name" name="lastName" rules={[{ required: true }]}>
                <Input placeholder="Enter last name" type="text"/>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Age" name="age" rules={[{ required: true }]}>
                <Input placeholder="Enter Age" type="number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Address" name="address" rules={[{ required: true }]}>
                <Input.TextArea placeholder="Enter Address" autoSize />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Gender" name="gender" rules={[{ required: true }]}>
                <Radio.Group>
                  <Radio value="male">Male</Radio>
                  <Radio value="female">Female</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Email" name="email" rules={[{ type: 'email', required: true }]}>
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Phone" name="phone" >
                <Input placeholder="Enter phone" type="number" />
              </Form.Item>
            </Col>

               <Col span={12}>
              <Form.Item label="Role" name="role">
                <Select placeholder="Select Role">
                  <Option value="admin">Admin</Option>
                  <Option value="leader">Leader</Option>
                  <Option value="user">User</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Department" name="department">
                <Select placeholder="Select Department">
                  <Option value="marketing">Marketing</Option>
                  <Option value="technical">Technical</Option>
                  <Option value="logistics">Logistics</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Position" name="position">
                <Select placeholder="Select Position">
                  <Option value="staff">Staff</Option>
                  <Option value="leader">Leader</Option>
                  <Option value="manager">Manager</Option>
                </Select>
              </Form.Item>
            </Col>

          </Row>

          <Row justify="end" gutter={12}>
            <Col>
              <Button type="primary" htmlType="submit">บันทึก</Button>
            </Col>
            <Col>
              <Button htmlType="button">ยกเลิก</Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
    </AdminsidebarLayout>
    )
}
export default Addstaff;