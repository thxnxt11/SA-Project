import type { StageEquipmentInterface } from "./stageequipmnt";
import type { StageTypeInterface } from "./stagetype";
import type { VenueInterface } from "./venue";

export interface StageInterface {
  id: number;
  stage_name?: string;
  width: number;
  length: number;
  stage_type_id: number;
  stage_type?: StageTypeInterface;
  venue_id: number;
  venue?: VenueInterface; // optional circular reference
  equipments?: StageEquipmentInterface[];

}