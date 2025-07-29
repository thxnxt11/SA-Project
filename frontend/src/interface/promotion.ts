export interface PromotionInterface {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;

  promotion_name: string;
  promotion_description: string;
  promotion_type_id: number;
  promotion_type?: PromotionType;

  promotion_code: string;
  discount: number;

  start_date: string;
  end_date: string;

  limit: number;
  used_count: number;
  Promotion_status: string; // 'active' | 'inactive'

  organizer_id: number;
  organizer?: Organizer;

  concert_id: number;
  concert?: Concert;
}