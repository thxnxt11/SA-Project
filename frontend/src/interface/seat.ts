export interface SeatInterface {
    seat_id?: number;
    zone_id?: number; // Reference to the zone this seat belongs to
    seat_code?: number; // Unique code for the seat
    status?: string; //"availlable","locked","booked"
}