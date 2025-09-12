
import type { StageEquipmentInterface } from "./equipment";
import type { VenueInterface } from "./venue";

export interface StageInterface {
  ID: number;
  stage_name?: string;
  width: number;
  length: number;
  stage_type_id: number;
  stage_type?: StageTypeInterface;
  venue_id: number;
  venue?: VenueInterface; // optional circular reference
  equipments?: StageEquipmentInterface[];

}

export interface StageTypeInterface {
  ID: number;
  stage_type: string;
}