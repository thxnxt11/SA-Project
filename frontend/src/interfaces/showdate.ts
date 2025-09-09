import type { AssignmentInterface } from "./assignment";
import type { ConcertInterface } from "./concert";
import type { VenueInterface } from "./venue";

export interface ShowDateInterface {
    ID?: number;
    concert_id?: number; 
    venue_id?: number; 
    show_date: string; 
    assignments: AssignmentInterface[];

    concert: ConcertInterface;
    venue: VenueInterface;
}
