export interface ConcertInterface {
    id?: number;
    concert_name?: string;
    artist? : string;
    venue? : string; 
    onsale_date?: string; // "YYYY-MM-DD"
    offsale_date?: string; // "YYYY-MM-DD"
    chart_image? : string;
}
