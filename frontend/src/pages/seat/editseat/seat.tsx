import React from "react";
import { Card, Flex, Button, Tag, Skeleton, Tooltip } from "antd";

type Seat = {
  id: number;
  seat_code?: string;
  seat_name?: string;
};

export type SeatAvailable = {
  id: number;
  zone_id: number;
  seat_id: number;
  seat?: Seat | null;
  seatavailable_status: "available" | "unavailable" | string;
};

type Props = {
  title?: string;
  seats?: SeatAvailable[];
  loading?: boolean;

  onSeatClick?: (seat: SeatAvailable) => void;
  onApply?: () => void;
  onCancel?: () => void;

  columnsPerRow?: number; // default 15
};

const statusColor = (s: string) => {
  const v = (s || "").toLowerCase();
  if (v === "available") return "#6ef47dff";
  if (v === "unavailable") return "#b7b7b7ff";
  return "#dc3a3aff";
};

// seat we want to visually center
const TARGET_SEAT_ID = 285;

// cell sizes (keep in sync with styles below)
const CELL_SIZE = 40;
const CELL_GAP = 8;

const SeatGrid: React.FC<Props> = ({
  title = "Seat Selection",
  seats = [],
  loading = false,
  onSeatClick,
  columnsPerRow = 15,
}) => {
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

  // ----- bulk set via parent -----
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
  const markAvailable = React.useCallback(
    () => bulkSet("available"),
    [bulkSet]
  );
  const markUnavailable = React.useCallback(
    () => bulkSet("unavailable"),
    [bulkSet]
  );

  // ----- drag (box select) -----
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const gridRef = React.useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragRect, setDragRect] = React.useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const dragStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const startSelectedRef = React.useRef<Set<number>>(new Set());
  const additiveRef = React.useRef<boolean>(false);
  const draggedRef = React.useRef<boolean>(false);
  const DRAG_THRESHOLD = 3;

  const intersects = (
    a: DOMRect,
    b: { left: number; top: number; right: number; bottom: number }
  ) =>
    a.right >= b.left &&
    a.left <= b.right &&
    a.bottom >= b.top &&
    a.top <= b.bottom;

  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.button !== 0) return;
    const root = containerRef.current;
    if (!root) return;

    const rootRect = root.getBoundingClientRect();
    const startX = e.clientX - rootRect.left;
    const startY = e.clientY - rootRect.top;

    dragStartRef.current = { x: startX, y: startY };
    setDragRect({ x: startX, y: startY, w: 0, h: 0 });
    setIsDragging(false);
    additiveRef.current = !!(e.metaKey || e.ctrlKey);
    startSelectedRef.current = new Set(selectedIds);
    draggedRef.current = false;

    if (!additiveRef.current) setSelectedIds(new Set());

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

    const grid = gridRef.current;
    const hits = new Set<number>();
    if (grid) {
      const cells = grid.querySelectorAll<HTMLDivElement>("[data-seat-id]");
      cells.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (!intersects(r, box)) return;
        const idAttr = el.getAttribute("data-seat-id");
        if (!idAttr) return;
        hits.add(Number(idAttr));
      });
    }

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
  };

  // ----- keyboard shortcuts -----
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;

      if (e.key === "Escape") clearSelection();
      else if (e.key.toLowerCase() === "a") markAvailable();
      else if (e.key.toLowerCase() === "u") markUnavailable();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clearSelection, markAvailable, markUnavailable]);



  const [leftPad, setLeftPad] = React.useState<number>(0);
  const [highlightTarget, setHighlightTarget] = React.useState<boolean>(false);

  React.useEffect(() => {
    const container = containerRef.current;
    const grid = gridRef.current;
    if (!container || !grid) return;

    const idx = sorted.findIndex((s) => s.seat_id === TARGET_SEAT_ID);
    if (idx < 0) return; // target seat not in this dataset

    // locate the element
    const el = grid.querySelector<HTMLElement>(
      `[data-seat-id="${TARGET_SEAT_ID}"]`
    );
    if (!el) return;

    // ensure any previous padding is cleared before measuring scroll
    setLeftPad(0);

    // after a paint, attempt scrolling
    requestAnimationFrame(() => {
      const canScrollHoriz = grid.scrollWidth > container.clientWidth;

      if (canScrollHoriz) {
        // center by scroll
        const elCenterX = el.offsetLeft + el.offsetWidth / 2;
        const targetScrollLeft = Math.max(
          0,
          elCenterX - container.clientWidth / 2
        );
        container.scrollTo({
          left: targetScrollLeft,
          top: 0,
          behavior: "auto",
        });
      } else {
        // compute padding-left needed to align target seat to container center
        const containerCenter = container.clientWidth / 2;
        const seatCenter = el.offsetLeft + el.offsetWidth / 2;
        const needed = Math.max(0, containerCenter - seatCenter);
        setLeftPad(needed);
      }

      // focus + brief highlight for visibility
      el.focus?.();
      setHighlightTarget(true);
      setTimeout(() => setHighlightTarget(false), 1600);
    });
  }, [sorted]);

  // grid total width (useful for debugging/consistency)
  const gridWidth = columnsPerRow * CELL_SIZE + (columnsPerRow - 1) * CELL_GAP;

  return (
    <Card size="small" style={{ minHeight: 420 }}>
      <Flex justify="space-between" align="left" style={{ marginBottom: 12 }}>
        <strong>{title}</strong>
        <Flex gap={8} align="center">
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
            <Tag color="#b7b7b7ff">Unavailable</Tag>
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
            maxHeight: 560,
            overflow: "auto",
            padding: 4,
            border: "1px solid #f0f0f0",
            borderRadius: 8,
          }}
        >
          <div
            ref={gridRef}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${columnsPerRow}, ${CELL_SIZE}px)`,
              gap: CELL_GAP,
              justifyItems: "center",
              // This is the trick: if we couldn’t scroll, we add padding-left
              // so the target seat’s center aligns with container’s center.
              paddingLeft: leftPad,
              margin: "0 auto",
              width: gridWidth,
            }}
          >
            {sorted.map((s) => {
              const label = s.seat?.seat_code ?? s.seat?.seat_name ?? s.seat_id;
              const bg = statusColor(s.seatavailable_status);
              const isAvail =
                (s.seatavailable_status || "").toLowerCase() === "available";
              const isSelected = selectedIds.has(s.seat_id);
              const isTarget = s.seat_id === TARGET_SEAT_ID;

              return (
                <div
                  key={s.seat_id}
                  data-seat-id={s.seat_id}
                  role="button"
                  aria-label={`Seat ${label} (${s.seatavailable_status})`}
                  onClick={(e) => {
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
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    borderRadius: 8,
                    border: isSelected
                      ? "2px solid #000"
                      : isTarget && highlightTarget
                      ? "2px solid #722ed1"
                      : "1px solid rgba(0,0,0,0.15)",
                    background: bg,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    cursor: "pointer",
                    boxShadow:
                      isTarget && highlightTarget
                        ? "0 0 0 4px rgba(114,46,209,0.15)"
                        : isAvail
                        ? "0 1px 0 rgba(0,0,0,0.05)"
                        : "none",
                    transition:
                      "transform 80ms ease, border 80ms ease, box-shadow 200ms ease",
                    outline: isSelected ? "2px solid rgba(0,0,0,0.2)" : "none",
                  }}
                  onMouseDown={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform =
                      "scale(0.98)";
                  }}
                  onMouseUp={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform =
                      "scale(1)";
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
        Tip: drag to box-select (hold Ctrl/Cmd to add). Ctrl/Cmd-click toggles
        selection without changing status. Press <b>A</b> to mark available,{" "}
        <b>U</b> to mark unavailable, <b>Esc</b> to clear selection.
      </div>
    </Card>
  );
};

export default SeatGrid;
