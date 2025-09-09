import React, { useEffect, useState } from "react";
import {
  Button,
  Typography,
  InputNumber,
  Popconfirm,
  Row,
  Col,
  message,
  Card,
  Checkbox,
  Divider,
  Input,
  Space,
} from "antd";
import { CheckCircle } from "lucide-react";
import { DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { cartAPI, paymentOrderAPI, promotionAPI } from "../../../services/https";  
import { useAuth } from "../../../hook/authContext"; 
import type { CartItemInterface } from "../../../interface/cartitem";
import { RxCrossCircled } from "react-icons/rx";

const { Title } = Typography;

const CartPages: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItemInterface[]>([]); 
  const [cartID , setCartID]=useState<CartItemInterface[]>([]); 
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [discountCode, setDiscountCode] = useState<string>("");
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [appliedDiscount, setAppliedDiscount] = useState<{
    amount: number;
    message: string;
    code: string;
    promotionID?: number;
  } | null>(null);

  useEffect(() => {
  if (!user?.id) return;

  cartAPI.getCartByUserID(Number(user.id))
  .then(res => {
      if (res.data && Array.isArray(res.data.items)) {
        const cartId =  res.data.id;
        const mapped: CartItemInterface[] = res.data.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          color: item.color,
          size: item.size,
          price: item.price,
          quantity: item.quantity,
          picture: item.picture,
          selected: item.selected,
        }));
        setCartItems(mapped);
        setCartID(cartId);
        setSelectedRowKeys(mapped.filter(i => i.selected).map(i => i.id));

        console.log("cart",res.data);
        
      } else {
        setCartItems([]);
      }
    })
    .catch(() => {
      message.error("โหลดตะกร้าไม่สำเร็จ");
    });
  }, [user]);
  
  const updateQuantity = (item_id: number, quantity: number) => {
    cartAPI.updateCartItem(item_id, quantity)
      .then(() => {
        setCartItems(prev =>
          prev.map(item =>
            item.id === item_id ? { ...item, quantity } : item
          )
        );
      })
      .catch(() => message.error("อัปเดตจำนวนไม่สำเร็จ"));
  };

  const removeItem = (item_id: number) => {
    cartAPI.removeCartItem(item_id)
      .then(() => {
        setCartItems(prev => prev.filter(item => item.id !== item_id));
        setSelectedRowKeys(prev => prev.filter(key => key !== item_id));
        message.success("ลบสินค้าแล้ว");
      })
      .catch(() => message.error("ลบสินค้าไม่สำเร็จ"));
  };

  
  const removeAllItems = () => {
    setCartItems([]);
    setSelectedRowKeys([]);
    message.success("เคลียร์ตะกร้าเรียบร้อยแล้ว");
  };
  
  const handleSelectAll = async (checked: boolean) => {
    setSelectedRowKeys(checked ? cartItems.map(item => item.id) : []);
    
    try {
      if (checked) {
        await Promise.all(cartItems.map(item => cartAPI.updateCartItemSelected(item.id, true)));
      } else {
        await Promise.all(cartItems.map(item => cartAPI.updateCartItemSelected(item.id, false)));
      }
      // message.success("อัปเดตสถานะการเลือกเรียบร้อย");
    } catch (err) {
      message.error("ไม่สามารถอัปเดตสถานะการเลือกได้");
    }
  };
  
  const isAllSelected = selectedRowKeys.length === cartItems.length && cartItems.length > 0;
  
  const selectedItems = cartItems.filter((item) =>
    selectedRowKeys.includes(item.id)
  );

  const toggleSelect = (id: number) => {
    const isSelected = selectedRowKeys.includes(id);
    
    cartAPI.updateCartItemSelected(id, !isSelected)
    .then(() => {
      setSelectedRowKeys(prev =>
        prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
      );
    })
    .catch(() => message.error("อัปเดตสถานะสินค้าไม่สำเร็จ"));
  };
    
  const handleApplyDiscount = async () => {
    try {
      const payload = {
        code: discountCode,
        target:"product",
      };

      console.log("validate send", payload);
      const res = await promotionAPI.validateCode(payload);
      console.log("validate response", res?.data);

  
      if (res?.data?.valid) {
        const pct = res.data.data.discount_percent ?? 0;
        setDiscountRate(pct/100);
        const promotionID = res?.data?.data?.promotion_id;
  
        const basePrice = selectedItems.reduce(
          (t, i) => t + i.price * i.quantity,
          0
        );
        const amount = Math.round((basePrice * pct) / 100);
  
        setAppliedDiscount({
          amount,
          message: `Applied ${pct}% discount`,
          code: res.data.data.code,
          promotionID: promotionID,
        });
  
        message.success(`ใช้โค้ดแล้ว ลด ${pct}%`);
      } else {
        setAppliedDiscount({
          amount: 0,
          message: res?.data?.error || "The discount code is invalid",
          code: "",
          promotionID: undefined,
        });
        message.error("โค้ดส่วนลดไม่ถูกต้อง");
      }
    } catch (err: any) {
      setAppliedDiscount({
        amount: 0,
        message: "Cannot validate the code",
        code: "",
        promotionID: undefined,
      });
      console.error("validate error", err.response?.data || err.message);
      message.error("ตรวจสอบโค้ดไม่สำเร็จ");
    }
  };

  const handleConfirmOrder = async () => {
    try {
      const basePrice = selectedItems.reduce((t, i) => t + i.price * i.quantity, 0);
      const discountAmount = appliedDiscount?.amount || 0;
      const totalPrice = basePrice - discountAmount;
      
      const res = await paymentOrderAPI.createPaymentOrder({
        cart_id: cartID,
        promotion_id: appliedDiscount?.promotionID ?? null,
        method_id: null, 
        base_price: basePrice,
        discount: discountAmount,
        total_price: totalPrice,
      });
      
      const paymentOrderId = res.data.payment_order.ID;
      console.log("Orders:",selectedItems);
      navigate(`/shopping/payment-orders/${paymentOrderId}`, {
        state: { selectedItems },
      });
    } catch (err) {
      message.error("ไม่สามารถสร้างคำสั่งซื้อได้");
    }
  };

  return (
    <div style={{ width:"70%", margin: "20px auto", 
    }}>
      <Row gutter={80}>
        <Col span={15} >
          {/*  เลือกทั้งหมด + เคลียร์ตะกร้า */}
          <Card style={{ marginBottom:12 ,padding:1 , background:"#F6F6F8"}}>
            <Row justify="space-between" align="middle">
              <Col>
                <Checkbox
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                >
                  Select All
                </Checkbox>
              </Col>
              <Col  style={{margin  : 2 ,gap: 8}}>
                <Popconfirm
                  title="ต้องการล้างตะกร้าทั้งหมดใช่หรือไม่?"
                  onConfirm={removeAllItems}
                  okText="ใช่"
                  cancelText="ยกเลิก"
                >
                 <Button 
                  danger icon={<DeleteOutlined/>}
                  disabled={cartItems.length === 0}
                >
                  Clear Cart
                </Button>
                </Popconfirm>
              </Col>
            </Row>
          </Card>

          {/* Table รายการสินค้า */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {cartItems.map((item) => (
            <Card key={item.id} style={{ marginBottom: 12,  background:"#F6F6F8"}}>
              <Row gutter={16} style={{ alignItems: "stretch" }}>

                {/* ✅ Checkbox เลือกรายการ */}
                <Col span={1}>
                  <div 
                    style={{
                      display: "flex",          
                      alignItems: "center",     
                      justifyContent: "center",  
                      height: "100%",   
                    }}>
                    <Checkbox
                      checked={selectedRowKeys.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </div>
                </Col>

                {/* รูปภาพ */}
                <Col span={6}>
                  <div
                    style={{
                      border: "1px solid #d9d9d9",
                      borderRadius: 8,
                      padding: 4,
                      width: "100%",
                      height: 200,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <img
                      src={item.picture}
                      alt={item.name}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </Col>

                {/* รายละเอียดสินค้า */}
                <Col span={12}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ fontWeight: "bold", fontSize: 16 }}>{item.name}</div>
                    <div>{item.color} | {item.size}</div>
                    <div>THB {item.price.toLocaleString()}</div>
                  </div>
                </Col>

                {/* จำนวน + ปุ่มลบ */}
                <Col span={5}>
                  <div style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    alignItems: "flex-end"
                  }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <InputNumber
                        min={1}
                        value={item.quantity}
                        onChange={(value) => updateQuantity(item.id, value || 1)}
                      />
                      <Popconfirm
                        title="ลบสินค้านี้หรือไม่?"
                        onConfirm={() => removeItem(item.id)}
                      >
                        <Button danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
            ))}
          </div>
        </Col>

        {/* Sidebar สรุปยอด */}
        <Col span={7}>
          <Card style={{background:"#F6F6F8"}}>
            <div>{/* ช่องใส่รหัสส่วนลด */}
              <Title level={4}>Discount Code</Title>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder="ใส่รหัสส่วนลด"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  style={{ marginBottom: 8 ,width:"80%"}}
                  />
                <Button onClick={handleApplyDiscount} block type="primary" style={{width:"20%"}}>
                  Use
                </Button>
              </Space.Compact>
              {appliedDiscount && (
                    <div
                      style={{
                        marginTop: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        color: appliedDiscount.code ? "#00c50aff" : "red",
                      }}
                    >
                      {appliedDiscount.code ? (
                        <>
                          <CheckCircle size={16} /> {appliedDiscount.message}
                        </>
                      ) : (
                        <>
                          <RxCrossCircled size={16} /> {appliedDiscount.message}
                        </>
                      )}
                    </div>
                  )}
            </div>
            <Divider />
            <Title level={4}>Order Summary</Title>
              {/* <Divider /> */}
            {/* รายการสินค้า */}
            {selectedItems.map((item) => {
              const itemTotal = item.price * item.quantity;
              const discounted = itemTotal * (1 - discountRate);
              return (
                <div key={item.id}>
                  <div>
                    {item.name} x {item.quantity}
                  </div>
                  <div style={{ fontSize: 12, color: "gray" }}>
                    ราคาปกติ: THB {itemTotal.toLocaleString()}
                    {discountRate > 0 && (
                      <>
                        <br />
                        ราคาหลังหักส่วนลด:{" "}
                        <strong>THB {discounted.toLocaleString()}</strong>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* ราคารวม */}
            <Divider />
            <Title level={5}>
              ราคารวมหลังหักส่วนลด:
              <br />
              <span style={{ color: "#d4380d" }}>
                THB{" "}
                {selectedItems
                  .reduce(
                    (total, item) =>
                      total + item.price * item.quantity * (1 - discountRate),0)
                  .toLocaleString()}
              </span>
            </Title>
            <Button
              type="primary"
              disabled={selectedItems.length === 0}
              onClick={handleConfirmOrder}
              block
            >
              ยืนยันการสั่งซื้อ ({selectedItems.length} รายการ)
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CartPages;