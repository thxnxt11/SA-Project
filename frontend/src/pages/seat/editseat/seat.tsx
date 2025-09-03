import React from "react";
import { Card, Flex, Button, Tag, Skeleton } from "antd";

type Seat = {
  id: 1; // change to one 1
  seat_code?: "test";//test
};

export type SeatAvailable = {
  id: number;               
  zone_id: number;
  seat_id: number;
  seat?: Seat | null;
  seat_available_status: "available" | "Booked" | "unavailable" | string;
};

type Props = {
  title?: string;
  seats: SeatAvailable[];
  loading?: boolean;

  onSeatClick?: (seat: SeatAvailable) => void;
  onApply?: () => void;
  onCancel?: () => void;
  // layout
  columnsPerRow?: number; // default 15
};

const statusColor = (s: string) => {
  const val = s.toLowerCase();
  if (val === "available") return "#1677ff";
  if (val === "booked") return "#d9d9d9";
  if (val === "unavailable") return "#bfbfbf";
  return "#8c8c8c";
};

const SeatGrid: React.FC<Props> = ({
  title = "Seat Selection",
  seats,
  loading,
  onSeatClick,
  onApply,
  onCancel,
  columnsPerRow = 15,
}) => {
  // sort by seat_code (A1..A15, B1..), fallback to seat_id
  const sorted = React.useMemo(() => {
    const clone = [...seats];
    clone.sort((a, b) => {
      const ac = a.seat?.seat_code ?? String(a.seat_id);
      const bc = b.seat?.seat_code ?? String(b.seat_id);
      // try row letter + number sort if like A10/B3
      const rx = /^([A-Za-z]+)(\d+)$/;
      const am = ac.match(rx);
      const bm = bc.match(rx);
      if (am && bm) {
        const [ , ar, an ] = am;
        const [ , br, bn ] = bm;
        if (ar === br) return Number(an) - Number(bn);
        return ar.localeCompare(br);
      }
      // otherwise plain string
      return ac.localeCompare(bc, undefined, { numeric: true });
    });
    return clone;
  }, [seats]);

  return (
    <Card size="small" style={{ minHeight: 420 }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
        <strong>{title}</strong>
        <Flex gap={8} align="center">
          <Flex gap={8} align="center" style={{ marginRight: 8 }}>
            <Tag color="blue">Available</Tag>
            <Tag>Booked</Tag>
            <Tag color="default">Unavailable</Tag>
          </Flex>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={onApply}>
            Apply
          </Button>
        </Flex>
      </Flex>

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columnsPerRow}, 40px)`,
            gap: 8,
          }}
        >
          {sorted.map((s) => {
            const label = s.seat?.seat_code ?? s.seat_id;
            const bg = statusColor(s.seat_available_status);
            const isAvailable = s.seat_available_status.toLowerCase() === "available";
            return (
              <div
                key={s.id}
                role="button"
                aria-label={`Seat ${label} (${s.seat_available_status})`}
                onClick={() => onSeatClick?.(s)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.15)",
                  background: isAvailable ? bg : "#f0f0f0",
                  color: isAvailable ? "#fff" : "#595959",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  cursor: "pointer",
                  boxShadow: isAvailable ? "0 1px 0 rgba(0,0,0,0.05)" : "none",
                  transition: "transform 80ms ease",
                  userSelect: "none",
                }}
                onMouseDown={(e) => {
                  // lil’ press effect (purely visual)
                  (e.currentTarget as HTMLDivElement).style.transform = "scale(0.98)";
                }}
                onMouseUp={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default SeatGrid;
