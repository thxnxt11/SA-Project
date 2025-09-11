import React from "react";
import { Card } from "antd";
import { RxCrossCircled } from "react-icons/rx";
import { FaCircleCheck } from "react-icons/fa6";

type SeatStatus = "available" | "booked" | "locked" | "unavailable";

export type SeatCell = {
  id: string;
  seatId: number;
  seatAvailableId: number;
  seatNumber: string;
  code: string;
  status: SeatStatus;
};

export type SeatRow = {
  row: string;
  seats: SeatCell[];
};

type Props = {
  rows: SeatRow[];
  selectedCodes: string[];
  loading?: boolean;
  apiError?: string | null;
  onSeatClick: (seatCode: string, status: SeatStatus) => void;
};

const COLOR = {
  available: "#2c48ffff",
  selectedBg: "#ffffffff",
  border: "#ffffffff",
  bookedBg: "#ffffff",
  bookedIcon: "#ff0000ff",
  selectedIcon: "#00b60fff",
};

const SeatGrid: React.FC<Props> = ({
  rows,
  selectedCodes,
  loading,
  apiError,
  onSeatClick,
}) => {
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
        Loading...
      </div>
    );
  }

  if (apiError) {
    return <p style={{ textAlign: "center", color: "#c00" }}>{apiError}</p>;
  }

  if (!rows.length) {
    return (
      <p style={{ textAlign: "center", color: "#666" }}>No seats found.</p>
    );
  }

  return (
    <div style={{ overflowY: "auto", paddingRight: 15 }}>
      {rows.map((rowObj) => (
        <div
          key={rowObj.row}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          {/* Left Row Label */}
          <div
            style={{
              width: 30,
              textAlign: "center",
              fontSize: 24,
              fontWeight: "bold",
              marginRight: 30,
              color: "#000",
            }}
          >
            {rowObj.row}
          </div>

          {/* Seats */}
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {rowObj.seats.map((seat) => {
              if (seat.status === "unavailable") {
                return (
                  <div
                    key={seat.id}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      opacity: 0,
                      pointerEvents: "none",
                      border: "2px solid transparent",
                      flexShrink: 0,
                    }}
                  />
                );
              }

              const isSelected = selectedCodes.includes(seat.code);
              const isBookedOrLocked =
                seat.status === "booked" || seat.status === "locked";

              return (
                <Card
                  key={seat.id}
                  onClick={() =>
                    !isBookedOrLocked && onSeatClick(seat.code, seat.status)
                  }
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: isBookedOrLocked ? "not-allowed" : "pointer",
                    backgroundColor: isBookedOrLocked
                      ? COLOR.bookedBg
                      : isSelected
                      ? COLOR.selectedBg
                      : COLOR.available,
                    borderColor: isBookedOrLocked
                      ? "#333"
                      : isSelected
                      ? COLOR.border
                      : COLOR.border,
                    borderWidth: 2,
                    borderStyle: "solid",
                    transition: "all 0.6s ease",
                    flexShrink: 0,
                  }}
                >
                  {isBookedOrLocked ? (
                    <RxCrossCircled
                      style={{
                        fontSize: 40,
                        backgroundColor: "#fff",
                        borderRadius: "50%",
                        color: COLOR.bookedIcon,
                        display: "flex",
                        justifyItems: "center",
                      }}
                    />
                  ) : isSelected ? (
                    <FaCircleCheck
                      style={{
                        fontSize: 40,
                        color: COLOR.selectedIcon,
                        display: "flex",
                        alignItems: "center",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: 14,
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

          {/* Right Row Label */}
          <div
            style={{
              width: 30,
              textAlign: "center",
              fontSize: 24,
              fontWeight: "bold",
              marginLeft: 30,
              color: "#333",
            }}
          >
            {rowObj.row}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SeatGrid;
