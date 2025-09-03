// minimal nested shapes (kept simple)
type ShowDateRef = { ID?: number; id?: number; show_date?: string };
type VenueRef    = { ID?: number; id?: number; venue_name?: string };
type ZoneTypeRef = { ID?: number; id?: number; zone_type?: string };
type SeatRef     = { ID?: number; id?: number; seat_code?: string; seat_name?: string };

// extended seat item (kept your existing keys; just added more optional data)
type SeatAvailableItem =
  | { seatavailable_status?: string | null } // your original lightweight item
  | {
      ID?: number;
      id?: number;
      zone_id?: number;
      seat_id?: number;
      seat?: SeatRef | null;
      seatavailable_status?: string | null;
    };

// ⬇️ your interface, unchanged keys + added fields
export interface ZoneInterface {
  ID?: number;
  id?: number;

  // added from backend
  showdate_id?: number;
  show_date?: ShowDateRef | null;

  venue_id?: number;
  venue?: VenueRef | null;

  zone_name?: string;

  zonePrice?: number | string;
  zone_price?: number | string;

  type?: string; // เผื่อส่งมาด้วย
  ZoneType?: { zone_type?: string } | ZoneTypeRef | null;
  zone_type?: { zone_type?: string } | ZoneTypeRef | null;

 
  zonetype_id?: number;

  
  capacity?: number;
  seat_sold?: number;
  pending_hold?: number;


  seat_available?: Array<SeatAvailableItem> | null;
  SeatAvailable?: Array<{ SeatAvailableStatus?: string | null }> | null;

  availableSeats?: number;
}
