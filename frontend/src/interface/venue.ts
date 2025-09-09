export interface StageInterface {
  id: number;
  stage_name?: string;
  width: number;
  length: number;
  stage_type_id: number;
//   stage_type?: StageTypeInterface;
  venue_id: number;
  venue?: VenueInterface; // optional circular reference
//   equipments?: StageEquipmentInterface[];
}

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
