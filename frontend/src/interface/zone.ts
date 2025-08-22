export interface ZoneInterface {
  ID?: number;
  id?: number;
  zone_name?: string;
  zonePrice?: number | string;
  zone_price?: number | string;
  type?: string; // เผื่อส่งมาด้วย
  zone_type?: { zone_type?: string } | null;
  seat_available?: Array<{ seatavailable_status?: string | null }> | null;
  availableSeats?: number;
}

export interface SeatAvailable {
  ID?: number;
  zone_id?: number;
  zone?: string;
  seat_id: number;
  seat?: string;
  seatavailable_status?: string;
}
