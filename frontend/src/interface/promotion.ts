
export interface PromotionInterface {
  ID?: number;
  promotion_name?: string;
  promotion_description?: string;
  promotion_type?: number;
  promotion_code?: string;
  discount?: number;
  start_date?: string;
  end_date?: string;
  limit?: number;
  used_count?: number;
  promotion_status?: "active" | "inactive"; // 'active' | 'inactive'
  organizer_id?: number;
  concert_id?: number;
}