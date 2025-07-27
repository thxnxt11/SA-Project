import type { ZoneInterface } from "./zone";

export interface ShowDatesInterface {
    show_date_id?: string;
    concert_id?: string; // Reference to the concert this date belongs to
    date?: string; // Date of the show in ISO format (YYYY-MM-DD)
    time?: string; // Time of the show in HH:MM format
    zones?: ZoneInterface[]; // List of zone IDs available for this show date
}