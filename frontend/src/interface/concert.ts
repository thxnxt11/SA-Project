export interface ConcertInterface {
    concert_id?: string;
    concert_name?: string;
    artist? : string;
    venue? : string;
    show_date?: string; // "YYYY-MM-DD"
    onsale_date?: string; // "YYYY-MM-DD"
    offsale_date?: string; // "YYYY-MM-DD"
    refchart? : string;
}
