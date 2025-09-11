import type { ColorInterface } from "./color";
import type { SizeInterface} from "./size";
import type { ProductInterface} from "./product"

export interface VariantInterface {
    id?: number
    ProductID?:	number    
    Product?:   ProductInterface
    color?:	    ColorInterface
    size?:      SizeInterface
    quantity?:  number
    picture?:   string    
}