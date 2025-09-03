import type { CategoryInterface } from "./category";
import type { VariantInterface } from "./variant";

export interface ProductInterface {
  ProductID?: number,
  ProductName?: string;
  Category?: CategoryInterface;
  Minimum?: number;
  ProductDetail?: string;
  ProductPrice?: number;
  Variants?: VariantInterface[];  // ต้องเป็น array
  Total?: number;                 // สำหรับรวมจำนวน variant
  Sales?: number;
}