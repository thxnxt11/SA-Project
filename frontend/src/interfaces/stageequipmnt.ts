import type { EquipmentInterface } from "./equipment";
import type { EquipmentStatusInterface } from "./equipmetstatus";

export interface StageEquipmentInterface {
  id: number;
  stage_id: number;
  equipment_id: number;
  quantity: number;
  status_id: number;

  equipment?: EquipmentInterface;
  equipment_status?: EquipmentStatusInterface;

}
