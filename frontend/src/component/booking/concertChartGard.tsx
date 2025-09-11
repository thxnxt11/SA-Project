import React from "react";
import { Card } from "antd";

type Props = {
  chartImage?: string | null;
  fallbackSrc: string;
};

const ConcertChartCard: React.FC<Props> = ({ chartImage, fallbackSrc }) => {
  const src = chartImage ? `http://localhost:8000${chartImage}` : fallbackSrc;

  return (
    <Card
      style={{
        width: "100%",
        borderColor: "#d3d3d3ff",
        backgroundColor: "#F6F6F8",
        borderRadius: 15,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      }}
    >
      <h2 style={{ marginTop: -8, textAlign: "center" }}>Concert Chart</h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <img src={src} alt="chart" style={{ width: "100%", borderRadius: 8 }} />
      </div>
    </Card>
  );
};

export default ConcertChartCard;
