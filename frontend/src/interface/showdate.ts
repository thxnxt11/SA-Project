import type { ZoneInterface } from "./zone";

export interface ShowDatesInterface {
    ID?: number;
    concert_id?: number; 
    vanue_id?: number; 
    show_date: string; 
    Zones?: ZoneInterface[]; 
}