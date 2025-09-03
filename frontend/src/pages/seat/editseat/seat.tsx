import React from "react";
import { Card, Flex, Button, Tag, Skeleton, Tooltip } from "antd";

type Seat = {
  id: number;
  seat_code?: string;
  seat_name?: string;
};

export type SeatAvailable = {
  id: number; // seat_available row id (may not be unique across API variants)
  zone_id: number;
  seat_id: number; // UNIQUE per seat — we’ll use this for keys and selection
  seat?: Seat | null;
  seatavailable_status: "available" | "unavailable" | string;
};

type Props = {
  title?: string;
  seats?: SeatAvailable[];
  loading?: boolean;

  // parent will toggle a single seat’s status
  onSeatClick?: (seat: SeatAvailable) => void;

  onApply?: () => void;
  onCancel?: () => void;

  columnsPerRow?: number; // default 15
};

const statusColor = (s: string) => {
  const v = (s || "").toLowerCase();
  if (v === "available") return "#6ef47dff";
  if (v === "unavailable") return "#5d57fbff";
  return "#dc3a3aff";
};

const SeatGrid: React.FC<Props> = ({
  title = "Seat Selection",
  seats = [],
  loading = false,
  onSeatClick,
  onApply,
  onCancel,
  columnsPerRow = 15,
}) => {
  // ----- stable sort for grid -------
  const sorted = React.useMemo(() => {
    const clone = [...seats];
    clone.sort((a, b) => {
      const ac = a.seat?.seat_code ?? a.seat?.seat_name ?? String(a.seat_id);
      const bc = b.seat?.seat_code ?? b.seat?.seat_name ?? String(b.seat_id);

      const rx = /^([A-Za-z]+)(\d+)$/;
      const am = ac.match(rx);
      const bm = bc.match(rx);
      if (am && bm) {
        const [, ar, an] = am;
        const [, br, bn] = bm;
        if (ar === br) return Number(an) - Number(bn);
        return ar.localeCompare(br);
      }
      return ac.localeCompare(bc, undefined, { numeric: true });
    });
    return clone;
  }, [seats]);

  // ----- selection (by seat_id) -----
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());

  const clearSelection = React.useCallback(() => setSelectedIds(new Set()), []);

  const toggleSelectOne = React.useCallback((seatId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(seatId)) next.delete(seatId);
      else next.add(seatId);
      return next;
    });
  }, []);

  // ----- bulk set (uses parent onSeatClick to toggle only when needed) -----
  const bulkSet = React.useCallback(
    (to: "available" | "unavailable") => {
      if (!onSeatClick || selectedIds.size === 0) return;
      const want = to.toLowerCase();
      for (const s of sorted) {
        if (selectedIds.has(s.seat_id)) {
          const cur = (s.seatavailable_status || "").toLowerCase();
          if (cur !== want) onSeatClick(s);
        }
      }
    },
    [onSeatClick, selectedIds, sorted]
  );

  const markAvailable = React.useCallback(() => bulkSet("available"), [bulkSet]);
  const markUnavailable = React.useCallback(() => bulkSet("unavailable"), [bulkSet]);

  // ----- drag (box select) -----
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragRect, setDragRect] = React.useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const dragStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const startSelectedRef = React.useRef<Set<number>>(new Set());
  const additiveRef = React.useRef<boolean>(false);
  const draggedRef = React.useRef<boolean>(false); // to suppress click after a drag
  const DRAG_THRESHOLD = 3;

  const intersects = (a: DOMRect, b: { left: number; top: number; right: number; bottom: number }) =>
    a.right >= b.left && a.left <= b.right && a.bottom >= b.top && a.top <= b.bottom;

  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.button !== 0) return;
    const root = containerRef.current;
    if (!root) return;

    const rootRect = root.getBoundingClientRect();
    const startX = e.clientX - rootRect.left;
    const startY = e.clientY - rootRect.top;

    dragStartRef.current = { x: startX, y: startY };
    setDragRect({ x: startX, y: startY, w: 0, h: 0 });
    setIsDragging(false); // will become true after threshold passed
    additiveRef.current = !!(e.metaKey || e.ctrlKey);
    startSelectedRef.current = new Set(selectedIds);
    draggedRef.current = false;

    if (!additiveRef.current) {
      // starting a fresh selection; we’ll compute exact hits as we drag
      setSelectedIds(new Set());
    }

    // prevent text selection
    e.preventDefault();
  };

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const root = containerRef.current;
    const start = dragStartRef.current;
    if (!root || !start) return;

    const rootRect = root.getBoundingClientRect();
    const curX = e.clientX - rootRect.left;
    const curY = e.clientY - rootRect.top;

    const dx = curX - start.x;
    const dy = curY - start.y;

    // only enter "dragging" state after a small threshold to avoid accidental drags
    if (!isDragging && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      setIsDragging(true);
      draggedRef.current = true;
    }

    if (!isDragging) return;

    const x1 = Math.min(start.x, curX);
    const y1 = Math.min(start.y, curY);
    const x2 = Math.max(start.x, curX);
    const y2 = Math.max(start.y, curY);

    const box = {
      left: x1 + rootRect.left,
      top: y1 + rootRect.top,
      right: x2 + rootRect.left,
      bottom: y2 + rootRect.top,
    };

    // compute hits
    const cells = root.querySelectorAll<HTMLDivElement>("[data-seat-id]");
    const hits = new Set<number>();
    cells.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!intersects(r, box)) return;
      const idAttr = el.getAttribute("data-seat-id");
      if (!idAttr) return;
      hits.add(Number(idAttr));
    });

    // if additive, union(startSelection, hits); else just hits
    if (additiveRef.current) {
      const union = new Set<number>(startSelectedRef.current);
      hits.forEach((id) => union.add(id));
      setSelectedIds(union);
    } else {
      setSelectedIds(hits);
    }

    setDragRect({ x: start.x, y: start.y, w: dx, h: dy });
    e.preventDefault();
  };

  const handleMouseUp: React.MouseEventHandler<HTMLDivElement> = () => {
    dragStartRef.current = null;
    setIsDragging(false);
    setDragRect(null);
    // keep draggedRef.current = true if we actually dragged; it’s reset on first click handler
  };

  // ----- keyboard shortcuts -----
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ignore when typing in inputs
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;

      if (e.key === "Escape") {
        clearSelection();
      } else if (e.key.toLowerCase() === "a") {
        markAvailable();
      } else if (e.key.toLowerCase() === "u") {
        markUnavailable();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clearSelection, markAvailable, markUnavailable]);

  return (
    <Card size="small" style={{ minHeight: 420 }}>
      <Flex justify="space-between" align="left" style={{ marginBottom: 12 }}>
        <strong>{title}</strong>
        <Flex gap={8} align="center">


          {/* bulk controls */}
          <Tooltip title="A">
            <Button onClick={markAvailable}>Mark Available</Button>
          </Tooltip>
          <Tooltip title="U">
            <Button onClick={markUnavailable}>Mark Unavailable</Button>
          </Tooltip>
          <Tooltip title="Esc">
            <Button onClick={clearSelection}>Clear Selection</Button>
          </Tooltip>

          <Flex gap={8} align="right" style={{ marginRight: 8 }}>
            <Tag color="green">Available</Tag>
            <Tag color="blue">Unavailable</Tag>
          </Flex>

        </Flex>
      </Flex>

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            position: "relative",
            userSelect: "none",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${columnsPerRow}, 40px)`,
              gap: 8,
            }}
          >
            {sorted.map((s) => {
              const label = s.seat?.seat_code ?? s.seat?.seat_name ?? s.seat_id;
              const bg = statusColor(s.seatavailable_status);
              const isAvail = (s.seatavailable_status || "").toLowerCase() === "available";
              const isSelected = selectedIds.has(s.seat_id);

              return (
                <div
                  key={s.seat_id}                 // *** use seat_id for key ***
                  data-seat-id={s.seat_id}        // *** and for dataset ***
                  role="button"
                  aria-label={`Seat ${label} (${s.seatavailable_status})`}
                  onClick={(e) => {
                    // suppress click that follows a drag
                    if (draggedRef.current) {
                      draggedRef.current = false;
                      return;
                    }
                    if (e.metaKey || e.ctrlKey) {
                      toggleSelectOne(s.seat_id);
                    } else {
                      onSeatClick?.(s);
                    }
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    border: isSelected ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)",
                    background: bg,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    cursor: "pointer",
                    boxShadow: isAvail ? "0 1px 0 rgba(0,0,0,0.05)" : "none",
                    transition: "transform 80ms ease, border 80ms ease",
                    outline: isSelected ? "2px solid rgba(0,0,0,0.2)" : "none",
                  }}
                  onMouseDown={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "scale(0.98)";
                  }}
                  onMouseUp={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSeatClick?.(s);
                    }
                  }}
                  tabIndex={0}
                >
                  {label}
                </div>
              );
            })}
          </div>

          {/* selection rectangle overlay */}
          {isDragging && dragRect && (
            <div
              style={{
                position: "absolute",
                left: Math.min(dragRect.x, dragRect.x + dragRect.w),
                top: Math.min(dragRect.y, dragRect.y + dragRect.h),
                width: Math.abs(dragRect.w),
                height: Math.abs(dragRect.h),
                border: "1px dashed #1677ff",
                background: "rgba(22, 119, 255, 0.1)",
                pointerEvents: "none",
              }}
            />
          )}
        </div>
      )}

      <div style={{ marginTop: 8, fontSize: 12, color: "rgba(0,0,0,0.55)" }}>
        Tip: drag to box-select (hold Ctrl/Cmd to add). Ctrl/Cmd-click toggles selection without changing status.
        Press <b>A</b> to mark available, <b>U</b> to mark unavailable, <b>Esc</b> to clear selection.
      </div>
    </Card>
  );
};

export default SeatGrid;
