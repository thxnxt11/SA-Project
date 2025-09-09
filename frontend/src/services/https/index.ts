import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";
import type { PromotionInterface } from "../../interface/promotion";
import type { ConcertInterface } from "../../interface/concert";
import type { ShowDatesInterface } from "../../interface/showdate";
import type { VenueOptions } from "../../interface/venue";
import type { ZoneInterface } from "../../interface/zone";

const ORGANIZER_API_URL = "http://localhost:8000/organizer";
const PUBLIC_API_URL = "http://localhost:8000/api";

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

// Promotion APIs
export const promotionAPI = {
  create: (data: PromotionInterface) =>
    Post(`${ORGANIZER_API_URL}/promotion/add`, data),
  getAll: () => Get(`${ORGANIZER_API_URL}/promotion`),
  getById: (id: number) => Get(`${ORGANIZER_API_URL}/promotion/${id}`),
  update: (id: number, data: PromotionInterface) =>
    Update(`${ORGANIZER_API_URL}/promotion/${id}`, data),
  delete: (id: number) => Delete(`${ORGANIZER_API_URL}/promotion/${id}`),
  getAllTypes: () => Get(`${PUBLIC_API_URL}/promotions`, false),
};

// Concert APIs
export const concertAPI = {
  getAll: () => Get(`${PUBLIC_API_URL}/concerts`, false),
  getById: (id: number) => Get(`${PUBLIC_API_URL}/concert/${id}`, false),
  create: async (data: Partial<ConcertInterface>) => {
    const r = await Post(`${PUBLIC_API_URL}/concerts`, data);
    return r?.data;
  },
  update: async (id: number | string, data: Partial<ConcertInterface>) => {
    const r = await Update(`${PUBLIC_API_URL}/concerts/${id}`, data);
    return r?.data;
  },
  delete: async (id: number | string) => {
    const r = await Delete(`${PUBLIC_API_URL}/concerts/${id}`);
    return r?.data;
  },
};

export const seatAPI = {
  getByZoneId: (id: number) => Get(`${PUBLIC_API_URL}/zone/${id}/seats`, false),
  getbyzoneid: async (id: number | string) => {
    const r = await Get(`${PUBLIC_API_URL}/seatzone/${id}`);
    return r?.data;
  },

  updatebyid: async (
    id: number | string,
    seat_id: number | string,
    data: { seatavailable_status: string }
  ) => {
    const r = await Update(
      `${PUBLIC_API_URL}/seatzone/${id}/seat/${seat_id}`,
      data
    );
    return r?.data;
  },

  deletebyid: async (id: number | string) => {
    const r = await Delete(`${PUBLIC_API_URL}/seatzone/${id}`);
    return r?.data;
  },

  addbyid: async (id: number | string) => {
    const r = await Post(`${PUBLIC_API_URL}/seatzone/${id}`, {});
    return r?.data;
  },
};

export const ShowDateAPI = {
  getZonesByShowDateId: (id: number) =>
    Get(`${PUBLIC_API_URL}/showdate/${id}/zones`, false),
  add: async (data: Partial<ShowDatesInterface>) => {
    const r = await Post(`${PUBLIC_API_URL}/showdate`, data);
    return r?.data;
  },

  update: async (id: number | string, data: Partial<ShowDatesInterface>) => {
    const r = await Update(`${PUBLIC_API_URL}/showdate/${id}`, data);
    return r?.data;
  },
  delete: async (id: number | string) => {
    const r = await Delete(`${PUBLIC_API_URL}/showdate/${id}`);
    return r?.data;
  },
};

export async function venueoption(): Promise<VenueOptions[]> {
  const res = await axios.get(`${PUBLIC_API_URL}/venues/option`);
  return res.data;
}

export const zoneApi = {
  getconbyuser: async (user_id: number | string) => {
    const r = await Get(`${PUBLIC_API_URL}/zoneconcert/${user_id}`);
    return r?.data;
  },

  getshowbycon: async (id: number | string) => {
    const r = await Get(`${PUBLIC_API_URL}/zoneshowdate/${id}`);
    return r?.data;
  },

  getzonebyshow: async (id: number | string) => {
    const r = await Get(`${PUBLIC_API_URL}/zone/${id}`);
    return r?.data;
  },

  add: async (data: Partial<ZoneInterface>) => {
    const r = await Post(`${PUBLIC_API_URL}/zone`, data);
    return r?.data; // created Zone
  },

  update: async (id: number | string, data: Partial<ZoneInterface>) => {
    const r = await Update(`${PUBLIC_API_URL}/zone/${id}`, data);
    return r?.data;
  },

  delete: async (id: number | string) => {
    const r = await Delete(`${PUBLIC_API_URL}/zone/${id}`);
    return r?.data;
  },

  getzonetype: async () => {
    const r = await Get(`${PUBLIC_API_URL}/zonetype`);
    return r?.data;
  },
};
