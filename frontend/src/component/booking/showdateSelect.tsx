import React from "react";
import { Card, Radio } from "antd";
import type { RadioChangeEvent } from "antd";
import type { ShowDatesInterface } from "../../interface/showdate";

type Props = {
  showDates: ShowDatesInterface[];
  selectedShowDateId: number | null;
  onChange: (e: RadioChangeEvent) => void;
};

const ShowDateSelector: React.FC<Props> = ({
  showDates,
  selectedShowDateId,
  onChange,
}) => {
  const formatDateLong = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d
      .toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      .toUpperCase();
  };

  const extractTime = (raw?: string): string => {
    if (!raw) return "—";
    const iso = raw.includes("T") ? raw : raw.replace(" ", "T");
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

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
      <h2 style={{ marginTop: -8 }}>Select Date</h2>
      <Radio.Group
        onChange={onChange}
        value={selectedShowDateId}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginTop: 12,
        }}
      >
        {showDates.map((d) => (
          <Radio key={`showdate-${d.ID}`} value={d.ID} style={{ fontSize: 18 }}>
            Show Date: {formatDateLong(d.show_date)} {extractTime(d.show_date)}
          </Radio>
        ))}
      </Radio.Group>
    </Card>
  );
};

export default ShowDateSelector;
