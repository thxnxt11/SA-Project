// mock/select-seat.ts
export const mockSeatMap = [
  {
    row: "A",
    seats: Array.from({ length: 10 }, (_, i) => ({
      id: `A${i + 1}`,
      seatNumber: i + 1,
      status: [2, 3, 5, 8].includes(i + 1) ? "booked" : "available", // Example booked seats
    })),
  },
  {
    row: "B",
    seats: Array.from({ length: 10 }, (_, i) => ({
      id: `B${i + 1}`,
      seatNumber: i + 1,
      status: [1, 6, 9].includes(i + 1) ? "booked" : "available",
    })),
  },
  {
    row: "C",
    seats: Array.from({ length: 10 }, (_, i) => ({
      id: `C${i + 1}`,
      seatNumber: i + 1,
      status: [4, 7, 10].includes(i + 1) ? "booked" : "available",
    })),
  },
  {
    row: "D",
    seats: Array.from({ length: 10 }, (_, i) => ({
      id: `D${i + 1}`,
      seatNumber: i + 1,
      status: [2, 5, 8].includes(i + 1) ? "booked" : "available",
    })),
  },
  {
    row: "E",
    seats: Array.from({ length: 10 }, (_, i) => ({
      id: `E${i + 1}`,
      seatNumber: i + 1,
      status: [1, 4, 7].includes(i + 1) ? "booked" : "available",
    })),
  },
];
