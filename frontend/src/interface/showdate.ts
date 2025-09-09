import type { ConcertInterface } from "./concert";
import type { VenueInterface } from "./venue";
import type { ZoneInterface } from "./zone";

export interface ShowDatesInterface {
  ID?: number;
  concert_id?: number;
  concert?: ConcertInterface;
  venue_id?: number;
  venue?: VenueInterface;
  show_date: string;
  Zones?: ZoneInterface[];
}