import type { ConcertInterface } from "./concert";
import type { PromotionTypeInterface } from "./promotion_type";
import type { UserInterface } from "./user";

export interface PromotionInterface {
  ID?: number;
  promotion_name?: string;
  promotion_description?: string;
  promotion_type_id?: number;
  PromotionType?: PromotionTypeInterface;
  promotion_code?: string;
  discount?: number;
  start_date?: string;
  end_date?: string;
  limit?: number;
  used_count?: number;
  promotion_status?: "active" | "inactive"; // 'active' | 'inactive'
  user_id?: number;
  creat_by?: UserInterface;
  concert_id?: number;
  concert?: ConcertInterface;
}
