export interface VariantForm {
  color: number;           // หรือ string ถ้าใช้ id แบบ string
  image: any;              // FileList หรือ object ของ Antd Upload
  sizes: Record<string, number>; // key = size_id, value = quantity
}