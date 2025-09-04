import type { ColorInterface } from "./color";
import type { SizeInterface} from "./size";
import type { ProductInterface} from "./product"

export interface VariantInterface {
    variant_id?: number;
    ProductID?:	number    
    product?:   ProductInterface
    color?:	    ColorInterface
    size?:      SizeInterface
    picture?:   string    
    stock: number;
}