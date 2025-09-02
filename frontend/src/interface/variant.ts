import type { ColorInterface } from "./color";
import type { SizeInterface} from "./size";
import type { ProductInterface} from "./product"

export interface VariantInterface {
    ProductID?:	number    
    Product?:   ProductInterface
    Color?:	    ColorInterface
    Size?:      SizeInterface
    Quantity?:  number
    Picture?:   string    
}