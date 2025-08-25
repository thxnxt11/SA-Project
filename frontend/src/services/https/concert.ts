
import axios from "axios";
import type { ConcertInterface } from "../../interface/concert";
import type { VenueOptions } from "../../interface/venue";

const API_URL = "http://localhost:8000/organizer";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};


export async function getAllConcerts(): Promise<ConcertInterface[]> {
  const res = await axios.get(`${API_URL}/concerts`, { headers: authHeader() });
  return res.data;
}

export async function venueoption (): Promise<VenueOptions[]>{
  const res = await axios.get(`${API_URL}/venues/option`, { headers: authHeader() });
  return res.data
}


export async function addConcerts(data: Partial<ConcertInterface>) {
  const res = await axios.post(`${API_URL}/concerts`, data, { headers: authHeader() });
  return res.data;
}


export async function updateConcert(id: string | number, data: Partial<ConcertInterface>) {
  const res = await axios.put(`${API_URL}/concerts/${id}`, data, { headers: authHeader() });
  return res.data;
}


export async function deleteConcert(id: string | number) {
  const res = await axios.delete(`${API_URL}/concerts/${id}`, { headers: authHeader() });
  return res.data;
}

