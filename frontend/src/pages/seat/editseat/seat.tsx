import React from "react";
import { Button, Card, Flex } from "antd";

const letters = (n: number) =>
  Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i));

const SeatSelector: React.FC = () => {

  const rows = 19; 
  const cols = 15; 


  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  // drag state
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number } | null>(null);
  const [dragEnd, setDragEnd] = React.useState<{ x: number; y: number } | null>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);

  const labelsY = letters(rows);
  const labelsX = Array.from({ length: cols }, (_, i) => i + 1);

  const seatId = (r: number, c: number) => `${labelsY[r]}${labelsX[c]}`;


  const handleMouseDown = (e: React.MouseEvent) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragEnd(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStart || !gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    setDragEnd({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseUp = () => {
    if (dragStart && dragEnd && gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();


      const x1 = Math.min(dragStart.x, dragEnd.x);
      const y1 = Math.min(dragStart.y, dragEnd.y);
      const x2 = Math.max(dragStart.x, dragEnd.x);
      const y2 = Math.max(dragStart.y, dragEnd.y);

      const seatDivs = gridRef.current.querySelectorAll<HTMLDivElement>(".seat");
      const next = new Set(selected);

      seatDivs.forEach((div) => {
        const d = div.getBoundingClientRect();
        const gx = d.left - rect.left;
        const gy = d.top - rect.top;
        const gw = d.width;
        const gh = d.height;


        if (gx < x2 && gx + gw > x1 && gy < y2 && gy + gh > y1) {
          const id = div.dataset.id!;
          if (next.has(id)) next.delete(id);
          else next.add(id);
        }
      });

      setSelected(next);
    }
    setDragStart(null);
    setDragEnd(null);
  };

  // selection box style
  const box =
    dragStart && dragEnd
      ? {
          left: Math.min(dragStart.x, dragEnd.x),
          top: Math.min(dragStart.y, dragEnd.y),
          width: Math.abs(dragStart.x - dragEnd.x),
          height: Math.abs(dragStart.y - dragEnd.y),
        }
      : null;



  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 320px", // seats left, graph right
        gap: 16,
        alignItems: "flex-start",
      }}
    >
      {/* LEFT: Seat grid */}
      <Card size="small" style={{ minHeight: 400 }}>
        <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
          <strong>Seat Selection (A–S × 1–15)</strong>
          <Flex gap={8}>
            <Button onClick={() => setSelected(new Set())}>Cancel</Button>
            <Button type="primary" onClick={() => alert(Array.from(selected).join(", "))}>
              Apply
            </Button>
          </Flex>
        </Flex>

        <div
          ref={gridRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: `auto repeat(${cols}, 32px)`,
            gridAutoRows: "32px",
            gap: 6,
            userSelect: "none",
            touchAction: "none",
          }}
        >
          {/* top number labels */}
          <div />
          {labelsX.map((n) => (
            <div key={`x-${n}`} style={{ textAlign: "center", fontSize: 12, opacity: 0.6 }}>
              {n}
            </div>
          ))}

          {/* rows */}
          {labelsY.map((row, r) => (
            <React.Fragment key={row}>
              {/* left row labels */}
              <div style={{ textAlign: "right", paddingRight: 6, fontSize: 12, opacity: 0.6 }}>
                {row}
              </div>
              {/* seats */}
              {labelsX.map((c, ci) => {
                const id = seatId(r, ci);
                const isPicked = selected.has(id);
                return (
                  <div
                    key={id}
                    data-id={id}
                    className="seat"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      border: "1px solid rgba(0,0,0,0.2)",
                      background: isPicked ? "white" : "#1677ff",
                      color: isPicked ? "inherit" : "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      boxShadow: isPicked ? "inset 0 0 0 2px #1677ff" : "none",
                      cursor: "default",
                    }}
                    // click toggle too (besides drag)
                    onClick={() => {
                      const next = new Set(selected);
                      if (next.has(id)) next.delete(id);
                      else next.add(id);
                      setSelected(next);
                    }}
                  >
                    {c}
                  </div>
                );
              })}
            </React.Fragment>
          ))}

          {/* selection box */}
          {box && (
            <div
              style={{
                position: "absolute",
                left: box.left,
                top: box.top,
                width: box.width,
                height: box.height,
                border: "2px dashed #1677ff",
                background: "rgba(22,119,255,0.12)",
                pointerEvents: "none",
              }}
            />
          )}
        </div>
        </Card>



    </div>
  );
};

export default SeatSelector;
