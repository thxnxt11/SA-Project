import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";
import type { PromotionInterface } from "../../interface/promotion";

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
  const config = getConfigWithoutAuth();
  // const config = requireAuth ? getConfig() : getConfigWithoutAuth();
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
  const config = getConfigWithoutAuth();
  // const config = requireAuth ? getConfig() : getConfigWithoutAuth();
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
  const config = getConfigWithoutAuth();
  // const config = requireAuth ? getConfig() : getConfigWithoutAuth();
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
  const config = getConfigWithoutAuth();
  // const config = requireAuth ? getConfig() : getConfigWithoutAuth();
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
};
