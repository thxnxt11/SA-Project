export interface Venueinterface{
    VenueName?: string;
	Location?:  string;
	VenueCapacity?: number;
	VenueTypeID?:   number;
	VenueStatusID?: number;

}

export type VenueOptions = {
  id: number;
  venue_name: string;
};