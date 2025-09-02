import type { CategoryInterface } from "./category";
import type { VariantInterface } from "./variant";

export interface ProductInterface {
  ProductName?: string;
  Category?: CategoryInterface;
  Minimum?: number;
  ProductDetail?: string;
  ProductPrice?: number;
  Variants?: VariantInterface;
}