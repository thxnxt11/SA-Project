import type { CategoryInterface } from "./category";
import type { VariantInterface } from "./variant";

export interface ProductInterface {
  id?: number,
  product_name?: string;
  Category?: CategoryInterface;
  minimum?: number;
  product_detail?: string;
  product_price?: number;
  variants?: VariantInterface[];  
  total?: number;                 
  sales?: number;
}