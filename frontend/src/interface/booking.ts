export interface bookingInterface {
    booking_id?: number;    
    member_id?: number; // Reference to the member making the booking
    concert_id?: number; // Reference to the concert being booked
    zone_id?: number; // Reference to the zone being booked
    queue_number?: number; // Queue number for the booking
    prmotion_id?: number; // Reference to any promotion applied
    status?: string; // "pending", "confirmed", "cancelled"
}