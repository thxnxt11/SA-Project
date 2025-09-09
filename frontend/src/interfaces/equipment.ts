import type { EquipmentTypeInterface } from "./equipmenttype";

export interface EquipmentInterface {
  id: number;
  equipment_name: string;
  description?: string;
  equipment_type: EquipmentTypeInterface;
}
