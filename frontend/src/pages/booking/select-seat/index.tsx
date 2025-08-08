import type React from "react";
import { useState } from "react";
import Navbar from "../../../component/layout/navbar";
import { Button, Card, Col, Divider, Form, Row, Space } from "antd";
import { FaCircleCheck } from "react-icons/fa6"; // ✅ เลือก
import { RxCrossCircled } from "react-icons/rx"; // ❌ จองแล้ว
import { TbTicket } from "react-icons/tb";
import { useLocation, useNavigate } from "react-router-dom";
import { mockSeatMap } from "../../../mock/selectseat";
import Loader from "../../../component/loader/loader";

const SelectSeat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showDate, showTime, zoneName, zonePrice, zoneType } =
    location.state || {}; // Destructure passed state
  const [selectedSeats, setSelectedSeats] = useState<string[]>(() => {
    if (zoneType === "ยืน") {
      return ["Standing"]; // Represents 1 ticket for a standing zone
    }
    return []; // Default for seating zones
  });
  const handleSeatClick = (seatId: string, status: string) => {
    if (status === "available") {
      setSelectedSeats((prevSelected) => {
        if (prevSelected.includes(seatId)) {
          return prevSelected.filter((id) => id !== seatId); // ยกเลิกเลือก
        } else if (prevSelected.length < 2) {
          return [...prevSelected, seatId]; // เลือกใหม่
        } else {
          alert("สามารถเลือกได้สูงสุด 2 ที่นั่ง");
          return prevSelected;
        }
      });
    }
  };
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(false);

  const handleBooking = () => {
    // Step 1: เริ่ม loading ที่ปุ่ม
    setLoadingBooking(true);
    // Step 2: รอสักครู่ให้แสดง loading บนปุ่ม
    setTimeout(() => {
      // ปิดปุ่ม loading แล้วเปิด loader เต็มจอ
      setLoadingBooking(false);
      setShowFullScreenLoader(true);
      // Step 3: รออีกนิดให้ Loader ได้โชว์ (optional)
      setTimeout(() => {
        navigate("/bookingdetail", {
          state: {
            showDate,
            showTime,
            zone: zoneName,
            seatNo: displaySeatNo,
            quantity: displayQuantity,
            unitPrice: zonePrice,
          },
        });
      }, 1500);
    }, 1500);
  };

  const handleCancel = () => {
    navigate(-1);
  };
  const displayQuantity = zoneType === "ยืน" ? 1 : selectedSeats.length;
  const displaySeatNo =
    zoneType === "ยืน" ? "Standing" : selectedSeats.join(", ");
  const totalPrice = (zonePrice || 0) * displayQuantity;

  const textStyle = { fontSize: "18px" };
  const dividerStyle: React.CSSProperties = {
    borderColor: "#d3d3d3ff",
    margin: "10px 0",
  };
  return (
    <>
      <Navbar />
      <div
        style={{ display: "flex", justifyContent: "center", padding: "30px 0" }}
      >
        <Row
          gutter={[24, 24]}
          justify="center"
          style={{ width: "100%", maxWidth: "1200px" }}
        >
          {zoneType !== "ยืน" && (
            <Col>
              <Card
                style={{
                  width: 1200,
                  minHeight: 400, // Use minHeight to allow content to expand
                  borderColor: "#d3d3d3ff",
                  backgroundColor: "#F6F6F8",
                  borderRadius: 15,
                  padding: "20px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                }}
              >
                {zoneType !== "ยืน" ? (
                  <>
                    <div
                      style={{
                        backgroundColor: "#ffffffff",
                        height: "70px",
                        width: "60%",
                        margin: "0 auto 40px auto",
                        borderRadius: "10px 10px 0 0",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "black",
                        fontSize: "20px",
                        fontWeight: "bold",
                        border: "1px solid black",
                      }}
                    >
                      STAGE
                    </div>

                    {/* Seat Grid Container */}
                    <div
                      style={{
                        maxHeight: "400px", // Max height for scrollable seat area
                        overflowY: "auto", // Enable vertical scroll
                        paddingRight: "15px", // Space for scrollbar
                      }}
                    >
                      {mockSeatMap.map((rowObj) => (
                        <div
                          key={rowObj.row}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center", // Center the row of seats
                            marginBottom: "10px", // Space between rows
                          }}
                        >
                          {/* Left Row Label */}
                          <div
                            style={{
                              width: "30px", // Fixed width for label
                              textAlign: "center",
                              fontSize: "18px",
                              fontWeight: "bold",
                              marginRight: "10px",
                              color: "#333",
                            }}
                          >
                            {rowObj.row}
                          </div>

                          {/* Seats in the row */}
                          <div
                            style={{
                              display: "flex",
                              gap: "8px", // Space between seats
                              flexWrap: "wrap", // Allow seats to wrap if needed, though 10 should fit
                              justifyContent: "center", // Center seats within their container
                            }}
                          >
                            {rowObj.seats.map((seat) => {
                              const isSelected = selectedSeats.includes(
                                seat.id
                              );
                              return (
                                <Card
                                  key={seat.id}
                                  onClick={() =>
                                    handleSeatClick(seat.id, seat.status)
                                  }
                                  style={{
                                    width: "40px", // Fixed width for circular shape
                                    height: "40px", // Fixed height for circular shape
                                    borderRadius: "50%", // Make it circular
                                    position: "relative",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    cursor:
                                      seat.status === "available"
                                        ? "pointer"
                                        : "not-allowed",
                                    backgroundColor:
                                      seat.status === "booked"
                                        ? "white" // white  for booked
                                        : isSelected
                                        ? "#ffffffff" // White background for selected
                                        : "#000000ff", // Dark blue/purple for available
                                    borderColor:
                                      seat.status === "booked"
                                        ? "#333" // Keep dark border for booked
                                        : isSelected
                                        ? "#ffffffff" // Match background for selected to hide border
                                        : "#333", // Keep dark border for available
                                    borderWidth: "1px",
                                    borderStyle: "solid",
                                    transition: "background-color 0.2s ease",
                                    flexShrink: 0, // Prevent shrinking
                                  }}
                                  bodyStyle={{ padding: 0 }}
                                >
                                  {seat.status === "booked" ? (
                                    <RxCrossCircled
                                      style={{
                                        fontSize: "46px", // Adjusted to match card size
                                        color: "#ff0000ff",
                                        display: "flex",
                                        justifyItems: "center",
                                      }}
                                    />
                                  ) : isSelected ? (
                                    <FaCircleCheck
                                      style={{
                                        fontSize: "40px", // Adjusted to match card size
                                        color: "#00b60fff",
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    />
                                  ) : (
                                    <span
                                      style={{
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                        color: "white",
                                      }}
                                    >
                                      {seat.seatNumber}
                                    </span>
                                  )}
                                </Card>
                              );
                            })}
                          </div>
                          <div
                            style={{
                              width: "30px", // Fixed width for label
                              textAlign: "center",
                              fontSize: "18px",
                              fontWeight: "bold",
                              marginLeft: "10px",
                              color: "#333",
                            }}
                          >
                            {rowObj.row}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Divider style={{ borderColor: "#d3d3d3ff" }}></Divider>
                    <div style={{ marginTop: "5px", textAlign: "center" }}>
                      <FaCircleCheck
                        style={{
                          color: "#00b60fff",
                          fontSize: "18px",
                          marginRight: "8px",
                          verticalAlign: "middle",
                        }}
                      />{" "}
                      Selected
                      <RxCrossCircled
                        style={{
                          backgroundColor: "#ffffffff",
                          borderRadius: "50%",
                          color: "#ff0000ff",
                          fontSize: "20px",
                          marginLeft: "20px",
                          marginRight: "8px",
                          verticalAlign: "middle",
                        }}
                      />{" "}
                      Booked
                      <span
                        style={{
                          display: "inline-block",
                          width: "20px",
                          height: "20px",
                          backgroundColor: "#000000ff",
                          borderRadius: "50%",
                          marginLeft: "20px",
                          marginRight: "10px",
                          border: "1px solid #333",
                          verticalAlign: "middle",
                        }}
                      ></span>{" "}
                      Available
                    </div>
                  </>
                ) : (
                  <p
                    style={{
                      textAlign: "center",
                      fontSize: "20px",
                      color: "#333",
                      marginTop: "50px",
                    }}
                  >
                    This is a Standing Zone. No seat selection required.
                  </p>
                )}
              </Card>
            </Col>
          )}
          {(zoneType === "ยืน" || selectedSeats.length > 0) && (
            <div>
              <Col xs={24} style={{ marginLeft: "21px" }}>
                <Card
                  style={{
                    width: 1200,
                    marginTop: "24px",
                    borderColor: "#d3d3d3ff",
                    backgroundColor: "#F6F6F8",
                    borderRadius: 15,
                    padding: "15px",
                    textAlign: "left",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  {/* Title */}
                  <h1
                    style={{
                      position: "absolute",
                      top: 15,
                      margin: 0,
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <TbTicket style={{ fontSize: "130%" }} />
                    Ticket Information
                  </h1>
                  {/* Divider under Title */}
                  <Divider
                    style={{
                      borderColor: "#d3d3d3ff",
                      marginTop: "40px",
                      marginBottom: "10px",
                    }}
                  />

                  {/* Row-Based Info like BookingDetail */}
                  <Row
                    gutter={[0, 3]}
                    style={{ fontSize: "24px" }}
                    align="middle"
                  >
                    <Col span={12} style={textStyle}>
                      ShowDate:
                    </Col>
                    <Col span={12} style={{ ...textStyle }}>
                      <strong>{showDate}</strong>
                    </Col>
                    <Divider style={dividerStyle} />

                    <Col span={12} style={textStyle}>
                      ShowTime:
                    </Col>
                    <Col span={12} style={{ ...textStyle }}>
                      <strong>{showTime}</strong>
                    </Col>
                    <Divider style={dividerStyle} />

                    <Col span={12} style={textStyle}>
                      Zone:
                    </Col>
                    <Col span={12} style={{ ...textStyle }}>
                      <strong>{zoneName}</strong>
                    </Col>
                    <Divider style={dividerStyle} />

                    <Col span={12} style={textStyle}>
                      Seat No:
                    </Col>
                    <Col span={12} style={{ ...textStyle }}>
                      <strong>{displaySeatNo}</strong>
                    </Col>
                    <Divider style={dividerStyle} />

                    <Col span={12} style={textStyle}>
                      Quantity:
                    </Col>
                    <Col span={12} style={{ ...textStyle }}>
                      <strong>{displayQuantity}</strong>
                    </Col>
                    <Divider style={dividerStyle} />

                    <Col span={12} style={textStyle}>
                      Unit Price (THB):
                    </Col>
                    <Col span={12} style={{ ...textStyle }}>
                      <strong>฿ {zonePrice?.toLocaleString() || "N/A"}</strong>
                    </Col>
                    <Divider style={dividerStyle} />

                    <Col span={12} style={textStyle}>
                      Total Price (THB):
                    </Col>
                    <Col span={12} style={{ ...textStyle }}>
                      <strong>฿ {totalPrice.toLocaleString()}</strong>
                    </Col>
                    <Divider style={dividerStyle} />
                  </Row>
                </Card>
              </Col>

              <Row
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 30,
                }}
              >
                <Form.Item>
                  <Space size={30}>
                    <Button
                      onClick={handleCancel}
                      type="default"
                      size="large"
                      style={{
                        height: 48,
                        fontSize: 20,
                        padding: "0 24px",
                        borderRadius: 8,
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="primary"
                      onClick={handleBooking}
                      loading={loadingBooking}
                      size="large"
                      style={{
                        height: 48,
                        fontSize: 20,
                        padding: "0 24px",
                        borderRadius: 8,
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                      }}
                    >
                      Booking
                    </Button>
                    {showFullScreenLoader && <Loader />}
                  </Space>
                </Form.Item>
              </Row>
            </div>
          )}
        </Row>
      </div>
    </>
  );
};

export default SelectSeat;
