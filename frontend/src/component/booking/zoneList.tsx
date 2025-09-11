import React from "react";
import { Card, Col, Tag } from "antd";
import type { ZoneInterface } from "../../interface/zone";
import type { ShowDatesInterface } from "../../interface/showdate";

const thb = new Intl.NumberFormat("th-TH");

const AVAILABLE_BG = "#22c55e";
const SOLDOUT_BG = "#ef4444";
const StandingColor = "gold";
const SeatingColor = "purple";

const zonePriceNumber = (z: ZoneInterface) => Number(z.zone_price ?? 0);
const zoneNameText = (z: ZoneInterface) => z.zone_name || "Zone";
const zoneTypeText = (z: ZoneInterface) => z.zone_type || "—";

const calcAvailableSeats = (zone: ZoneInterface): number => {
  if (typeof zone.available_count === "number") return zone.available_count;
  if (zone.capacity) {
    const capacity = zone.capacity;
    const sold = zone.seat_sold || 0;
    const holds = zone.pending_holds || 0;
    return Math.max(0, capacity - sold - holds);
  }
  return 0;
};

type ZoneCardProps = {
  zone: ZoneInterface;
  onClick: (zone: ZoneInterface) => void;
};

const ZoneCard: React.FC<ZoneCardProps> = ({ zone, onClick }) => {
  const id = zone.ID;
  const name = zoneNameText(zone);
  const type = zoneTypeText(zone);
  const price = thb.format(zonePriceNumber(zone));
  const available = calcAvailableSeats(zone);
  const disabled = available === 0;

  let zoneTypeColor = AVAILABLE_BG;
  let text = AVAILABLE_BG;
  if (type.toLowerCase().includes("standing")) {
    zoneTypeColor = StandingColor;
    text = "#000000";
  } else if (type.toLowerCase().includes("seating")) {
    zoneTypeColor = SeatingColor;
    text = "#ffffff";
  }

  return (
    <Card
      key={id}
      hoverable={!disabled}
      style={{
        borderRadius: 12,
        margin: "8px 0",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.85 : 1,
      }}
      bodyStyle={{ padding: 12 }}
      onClick={() => !disabled && onClick(zone)}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Zone: {name}</span>
          <span style={{ fontSize: 16, color: "#424242ff", fontWeight: 500 }}>
            <Tag style={{ backgroundColor: zoneTypeColor, color: text }}>
              {type}
            </Tag>{" "}
            - ฿{price}
          </span>
        </div>
        <div
          style={{
            minWidth: 72,
            height: 36,
            padding: "0 12px",
            borderRadius: 10,
            backgroundColor: disabled ? SOLDOUT_BG : AVAILABLE_BG,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "white",
              lineHeight: 1,
            }}
          >
            {available}
          </span>
        </div>
      </div>
    </Card>
  );
};

type Props = {
  zones: ZoneInterface[];
  selectedShowDate?: ShowDatesInterface;
  onZoneClick: (zone: ZoneInterface) => void;
};

const ZoneList: React.FC<Props> = ({
  zones,
  selectedShowDate,
  onZoneClick,
}) => {
  if (!selectedShowDate) {
    return (
      <Card
        style={{
          width: "100%",
          borderColor: "#d3d3d3ff",
          backgroundColor: "#F6F6F8",
          borderRadius: 15,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          maxWidth: 600,
        }}
      >
        กรุณาเลือกวันแสดงก่อน
      </Card>
    );
  }

  return (
    <Card
      style={{
        width: "100%",
        borderColor: "#d3d3d3ff",
        backgroundColor: "#F6F6F8",
        borderRadius: 15,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        maxWidth: 600,
      }}
      bodyStyle={{ padding: 16 }}
    >
      <h1 style={{ textAlign: "center", margin: "4px 0 12px" }}>
        Seat Available
      </h1>
      <div style={{ overflow: "auto", maxHeight: 520 }}>
        <Col>
          <div style={{ maxWidth: 540, margin: "0 auto" }}>
            {zones.length > 0 ? (
              zones.map((z) => (
                <ZoneCard key={z.ID} zone={z} onClick={onZoneClick} />
              ))
            ) : (
              <p style={{ textAlign: "center", color: "#666", marginTop: 16 }}>
                No zones available for this date.
              </p>
            )}
          </div>
        </Col>
      </div>
    </Card>
  );
};

export default ZoneList;
