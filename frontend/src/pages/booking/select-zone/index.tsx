import React, { useState } from "react";
import type { RadioChangeEvent } from "antd";
import Navbar from "../../../component/layout/navbar";
import { Card, Col, Row } from "antd";
import { Radio } from "antd";
import chart from "../../../assets/chart.svg";
import { mockShowDates } from "../../../mock/selectzone";
import { useNavigate } from "react-router-dom";

const SelectZone: React.FC = () => {
  const [selectedShowDateId, setSelectedShowDateId] = useState<number | null>(
    null
  );
  const navigate = useNavigate();

  const onShowDateChange = (e: RadioChangeEvent) => {
    setSelectedShowDateId(e.target.value);
  };

  const selectedShowDate = mockShowDates.find(
    (date) => date.id === selectedShowDateId
  );
  const zonesForSelectedDate = selectedShowDate ? selectedShowDate.zones : [];

  const handleZoneCardClick = (zone: (typeof zonesForSelectedDate)[0]) => {
    if (selectedShowDate && zone.availableSeats > 0) {
      navigate("/selectseat", {
        state: {
          showDateId: selectedShowDate.id,
          showDate: selectedShowDate.date,
          showTime: selectedShowDate.time,
          zoneId: zone.id,
          zoneName: zone.zname,
          zoneType: zone.type,
          zonePrice: zone.price,
        },
      });
    }
  };
  return (
    <>
      <Navbar />

      <Card
        style={{
          position: "absolute",
          left: 100,
          marginTop: 30,
          width: 600,
          height: 600,
          borderColor: "#d3d3d3ff",
          backgroundColor: "#F6F6F8",
          borderRadius: 15,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        }}
      >
        <h2 style={{ marginTop: -8 }}>Concert Chart</h2>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img src={chart} alt="chart" style={{ width: "90%" }} />
        </div>
      </Card>
      <Col
        style={{
          position: "absolute",
          right: 120,
        }}
      >
        <Card
          style={{
            marginTop: 30,
            width: 600,
            height: 150,
            borderColor: "#d3d3d3ff",
            backgroundColor: "#F6F6F8",
            borderRadius: 15,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          }}
        >
          <h2 style={{ marginTop: -8 }}>Select Date</h2>
          <Radio.Group
            onChange={onShowDateChange}
            value={selectedShowDateId}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginLeft: 30,
            }}
          >
            {mockShowDates.map((date) => (
              <Radio
                key={date.id}
                value={date.id}
                className="text-lg cursor-pointer"
                style={{ fontSize: "18px" }}
              >
                Show Date: {date.date} {date.time}
              </Radio>
            ))}
          </Radio.Group>
        </Card>
        {selectedShowDateId && (
          <Card
            style={{
              marginTop: 30,
              width: 600,
              height: 600,
              marginBottom: 30,
              borderColor: "#d3d3d3ff",
              backgroundColor: "#F6F6F8",
              borderRadius: 15,
              display: "flex",
              justifyContent: "center",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            <h1 style={{ display: "flex", justifyContent: "center" }}>
              Seat Available
            </h1>
            <div style={{ overflow: "auto", height: "90%" }}>
              <Col>
                <div style={{ width: 500 }}>
                  {zonesForSelectedDate.length > 0 ? (
                    zonesForSelectedDate.map((zone) => (
                      <React.Fragment key={zone.id}>
                        <Card
                          key={zone.id}
                          style={{
                            height: 70,
                            display: "flex",
                            alignItems: "center",
                            margin: 5,
                            cursor:
                              zone.availableSeats === 0
                                ? "not-allowed"
                                : "pointer",
                          }}
                          onClick={() => handleZoneCardClick(zone)}
                        >
                          <Row
                            style={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <h3>
                                {zone.name} <br />
                                {zone.type} - ฿{zone.price.toLocaleString()}
                              </h3>
                            </div>
                            <div
                              style={{
                                width: 100,
                                height: 40,
                                borderRadius: 8,
                                backgroundColor:
                                  zone.availableSeats === 0
                                    ? "#ef4444"
                                    : "#22c55e", 
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                marginLeft: 256, // Space between zone card and available seats box
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 18,
                                  fontWeight: "bold",
                                  color: "white",
                                }}
                              >
                                {zone.availableSeats}
                              </span>
                            </div>
                          </Row>
                        </Card>
                      </React.Fragment>
                    ))
                  ) : (
                    <p className="text-center text-gray-600">
                      No zones available for this date.
                    </p>
                  )}
                </div>
              </Col>
            </div>
          </Card>
        )}
      </Col>
    </>
  );
};

export default SelectZone;
