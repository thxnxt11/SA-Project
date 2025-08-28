import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";
import type { ConcertInterface } from "../../interface/concert";
import type { ShowDatesInterface } from "../../interface/showdate";
import type { VenueOptions } from "../../interface/venue";

const API_URL = "http://localhost:8000/organizer";

const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((row) => row.startsWith(`${name}=`));

  if (cookie) {
    let AccessToken = decodeURIComponent(cookie.split("=")[1]);
    AccessToken = AccessToken.replace(/\\/g, "").replace(/"/g, "");
    return AccessToken ? AccessToken : null;
  }
  return null;
};

const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${getCookie(
      "0195f494-feaa-734a-92a6-05739101ede9"
    )}`,
    "Content-Type": "application/json",
  },
});

const getConfigWithoutAuth = () => ({
  headers: {
    "Content-Type": "application/json",
  },
});

export const Post = async (
  url: string,
  data: any,
  requireAuth: boolean = true
): Promise<AxiosResponse | any> => {
  // const config = getConfigWithoutAuth();
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
  return await axios
    .post(url, data, config)
    .then((res) => res)
    .catch((error: AxiosError) => {
      if (error?.response?.status === 401) {
        localStorage.clear();
        window.location.reload();
      }
      return error.response;
    });
};

export const Get = async (
  url: string,
  requireAuth: boolean = true
): Promise<AxiosResponse | any> => {
  // const config = getConfigWithoutAuth();
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
  return await axios
    .get(url, config)
    .then((res) => res)
    .catch((error: AxiosError) => {
      if (error?.message === "Network Error") {
        return error.response;
      }
      if (error?.response?.status === 401) {
        localStorage.clear();
        window.location.reload();
      }
      return error.response;
    });
};

export const Update = async (
  url: string,
  data: any,
  requireAuth: boolean = true
): Promise<AxiosResponse | any> => {
  // const config = getConfigWithoutAuth();
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
  return await axios
    .put(url, data, config)
    .then((res) => res)
    .catch((error: AxiosError) => {
      if (error?.response?.status === 401) {
        localStorage.clear();
        window.location.reload();
      }
      return error.response;
    });
};

export const Delete = async (
  url: string,
  requireAuth: boolean = true
): Promise<AxiosResponse | any> => {
  // const config = getConfigWithoutAuth();
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
  return await axios
    .delete(url, config)
    .then((res) => res)
    .catch((error: AxiosError) => {
      if (error?.response?.status === 401) {
        localStorage.clear();
        window.location.reload();
      }
      return error.response;
    });
};


const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};



export const Concerts = {
  add: async (data: Partial<ConcertInterface>) => {
    const r = await Post(`${API_URL}/concerts`, data);
    return r?.data;
  },
  getAll: async (): Promise<ConcertInterface[]> => {
    const r = await Get(`${API_URL}/concerts`);
    return r?.data;
  },
  update: async (id: number | string, data: Partial<ConcertInterface>) => {
    const r = await Update(`${API_URL}/concerts/${id}`, data);
    return r?.data;
  },
  delete: async (id: number | string) => {
    const r = await Delete(`${API_URL}/concerts/${id}`);
    return r?.data;
  },
};

export const Showdate = {
  add: async (data: Partial<ShowDatesInterface>) => {
    const r = await Post(`${API_URL}/showdate`, data);
    return r?.data;
  },

  update: async (id: number | string, data: Partial<ShowDatesInterface>) => {
    const r = await Update(`${API_URL}/showdate/${id}`, data);
    return r?.data;
  },
  delete: async (id: number | string) => {
    const r = await Delete(`${API_URL}/showdate/${id}`);
    return r?.data;
  },
};


export async function venueoption (): Promise<VenueOptions[]>{
  const res = await axios.get(`${API_URL}/venues/option`, { headers: authHeader() });
  return res.data
}



export async function addShowdate(data: Partial<ShowDatesInterface>) {
  const res = await axios.post(`${API_URL}/showdate`, data, { headers: authHeader() });
  return res.data;
}


export async function updateShowdate(id: string | number, data: Partial<ShowDatesInterface>) {
  const res = await axios.put(`${API_URL}/showdate/${id}`, data, { headers: authHeader() });
  return res.data;
}


export async function deleteShowdate(id: string | number) {
  const res = await axios.delete(`${API_URL}/showdate/${id}`, { headers: authHeader() });
  return res.data;
}


