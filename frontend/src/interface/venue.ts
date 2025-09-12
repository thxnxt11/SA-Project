import type { StageInterface } from "./stage";

export interface VenueInterface {
  ID: number;
  venue_name: string;
  location: string;
  venue_capacity: number;
  venue_type_id: number;
  venue_type?: VenueOptions;
  stages?: StageInterface[];
}

export type VenueOptions = {
  id: number;
  venue_name: string;
};
