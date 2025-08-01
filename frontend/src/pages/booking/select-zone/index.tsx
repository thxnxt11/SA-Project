import React, { useState } from "react";
import type { RadioChangeEvent } from "antd";
import Navbar from "../../../component/navbar";
import { Card, Col, Row } from "antd";
import { Radio } from "antd";
import chart from "../../assets/chart.svg";
import { mockShowDates } from "../../../mock/selectzone";
import { useNavigate } from "react-router-dom";
// Mock data for show dates and zones

const SelectZone: React.FC = () => {
  const [selectedShowDateId, setSelectedShowDateId] = useState<number | null>(
    null
  );
  const navigate = useNavigate(); // Initialize useNavigate

  const onChange = (e: RadioChangeEvent) => {
    setSelectedShowDateId(e.target.value);
  };

  const selectedShowDate = mockShowDates.find(
    (date) => date.id === selectedShowDateId
  );
  const zonesForSelectedDate = selectedShowDate ? selectedShowDate.zones : [];

  const handleZoneCardClick = (zone: (typeof zonesForSelectedDate)[0]) => {
    if (selectedShowDate) {
      navigate("/select-seat", {
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
          height: 650,
          borderColor: "#d3d3d3ff",
          backgroundColor: "#F6F6F8",
          borderRadius: 15,
        }}
      >
        <h2>Concert Chart</h2>
        <img src={chart} alt="chart" style={{ width: "100%" }}></img>
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
          }}
        >
          <h2>Select Date</h2>
          <Radio.Group
            onChange={onChange}
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
                          onClick={() => handleZoneCardClick(zone)}
                          key={zone.id}
                          style={{
                            height: 70,
                            display: "flex",
                            alignItems: "center",
                            margin: 5,
                          }}
                        >
                          <Row
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <div>
                              <h3>
                                {zone.name} <br />
                                {zone.type} - ฿{zone.price.toLocaleString()}
                              </h3>
                            </div>
                            <h4
                              style={{
                                position: "absolute",
                                right: 20,
                                fontSize: 18,
                                color:
                                  zone.availableSeats === 0 ? "red" : "green",
                              }}
                            >
                              {zone.availableSeats} ที่นั่ง
                            </h4>
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
