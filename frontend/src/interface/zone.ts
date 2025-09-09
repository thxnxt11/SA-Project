export interface ZoneInterface {
  ID?: number;
  zone_name?: string;
  zone_price?: number | string;
  zonetype_id?: number;
  zone_type?: string;
  seat_available?: Array<{ seatavailable_status?: string | null }> | null;
  showdate_id?: number;
  venue_id?: number;
  capacity?: number;
  pending_holds?: number;
  seat_sold?: number;
  availableSeats?: number;
  available_count?: number;
}
