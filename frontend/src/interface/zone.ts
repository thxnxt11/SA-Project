export interface ZoneInterface {
  ID?: number;
  zone_name?: string;
  zone_price?: number | string;
  zone_type?:string ;
  seat_available?: Array<{ seatavailable_status?: string | null }> | null;
  capacity?: number;
  pending_holds?: number;
  seat_sold?: number;
  availableSeats?: number;
  available_count?: number;
}

export interface SeatAvailable {
  ID?: number;
  zone_id?: number;
  zone?: string;
  seat_id: number;
  seat?: string;
  seatavailable_status?: string;
}