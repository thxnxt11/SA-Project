import type { ShowDateInterface } from "./showdate";

export interface ConcertInterface {
  ID: number;
  concert_name: string;
  artist?: string;
  venue?: string;
  onsale_date?: string; // "YYYY-MM-DD"
  offsale_date?: string; // "YYYY-MM-DD"
  concert_poster_url: string;
  chart_image: string;
  ShowDates?: ShowDateInterface[];
}
