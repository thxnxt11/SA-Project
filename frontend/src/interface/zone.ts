export interface ZoneInterface {
  zone_id?: string;
  show_date_id?: string;
  zone_name?: string;
  zone_type?: string; // "standing", "seated"
  price?: number; // Price of the zone
  available?: number; // Number of available seats in the zone
  capacity?: number; // Maximum number of people allowed in the zone
}