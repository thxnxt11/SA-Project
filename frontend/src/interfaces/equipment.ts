import type { EquipmentTypeInterface } from "./equipmenttype";
import type { StageEquipmentInterface } from "./stageequipmnt";

export interface EquipmentInterface {
  ID?: number; // สำหรับสร้างใหม่อาจยังไม่มี ID
  equipment_name: string;
  equipment_type: EquipmentTypeInterface;

  total_quantity: number;      // จำนวนทั้งหมด
  remaining_quantity: number;  // จำนวนเหลือใช้งาน
  used_quantity?: number;      // จำนวนที่ถูกใช้ (optional, backend คำนวณ)
  
  // สำหรับ Stage Assignment
  stage_equipments?: StageEquipmentInterface[];
}

