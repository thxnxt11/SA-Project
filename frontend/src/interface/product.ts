import type { CategoryInterface } from "./category";
import type { VariantInterface } from "./variant";

export interface ProductInterface {
  id?: number,
  product_name?: string;
  category?: CategoryInterface;
  minimum?: number;
  product_detail?: string;
  product_price?: number;
  variants?: VariantInterface[];  // ต้องเป็น array
  total?: number;                 // สำหรับรวมจำนวน variant
  sales?: number;
}