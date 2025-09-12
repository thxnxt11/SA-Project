import type { StageInterface } from "./stage";
import type { VenueTypeInterface } from "./venuetype";

export interface VenueInterface {
 ID: number;
 
venue_id:number;
  venue_name: string;
  location: string;
  venue_capacity: number;
  venue_type_id: number;
  
  venue_type?: VenueTypeInterface;
  stages?: StageInterface[];
  


}
