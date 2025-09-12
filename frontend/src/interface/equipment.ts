import type { StageInterface } from "./stage";


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

export interface EquipmentTypeInterface {
  ID: number;
  equipment_type: string; // เช่น Sound, Light, Stage
}

export interface StageEquipmentInterface {
  stage_id: number;
  equipment_id: number;
  stage_quantity: number;
  equipment: EquipmentInterface;
  stage: StageInterface;
}




