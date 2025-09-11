
import type { EquipmentInterface } from "./equipment";
import type { StageInterface } from "./stage";

export interface StageEquipmentInterface {
  stage_id: number;
  equipment_id: number;
  stage_quantity: number;
  equipment:EquipmentInterface
  stage : StageInterface
 
}
