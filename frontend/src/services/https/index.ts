import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";
// import type { PromotionInterface } from "../../interface/promotion";
import type {ProductInterface} from "../../interface/product";
import type { PromotionInterface } from "../../interface/promotion";

const ORGANIZER_API_URL = "http://localhost:8000/organizer";
const PUBLIC_API_URL = "http://localhost:8000/api";
// const BASE_URL = "http://localhost:8000";

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
  validateCode: (data: { code: string; target: string; concert_id?: number }) =>
    Post(`${PUBLIC_API_URL}/promotion/validate`, data, false),
  getConcertByuserId: (user_id: number | string | undefined) =>
    Get(`${PUBLIC_API_URL}/concert/${user_id}/user`),
};

// Concert APIs
export const concertAPI = {
  getAll: () => Get(`${PUBLIC_API_URL}/concerts`, false),
  getById: (id: number) => Get(`${PUBLIC_API_URL}/concert/${id}`, false),
};

export const seatAPI = {
  getByZoneId: (id: number) => Get(`${PUBLIC_API_URL}/zone/${id}/seats`, false),
};

export const ShowDateAPI = {
  getZonesByShowDateId: (id: number) =>
    Get(`${PUBLIC_API_URL}/showdate/${id}/zones`, false),
};

export const uploadAPI = {
  upload: (data: FormData) => axios.post(`${PUBLIC_API_URL}/upload`, data),
  uploadReceipt: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return await axios.post(`${PUBLIC_API_URL}/upload/order-receipt`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadProductImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return await axios.post(`${PUBLIC_API_URL}/upload/product`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// Fetch categories
export const categoriesAPI = {
  getAllCategories: () => Get(`${PUBLIC_API_URL}/categories`, false),
};
// Fetch colors
export const colorsAPI ={
  getAllColors : () => Get(`${PUBLIC_API_URL}/colors`, false),}
;
// Fetch sizes
export const sizesAPI = {
  getAllSizes : () => Get(`${PUBLIC_API_URL}/sizes`, false)
};
// Fetch sizes
export const actionAPI = {
  getAllSizes : () => Get(`${PUBLIC_API_URL}/action`, false)
};

// Create product
export const productsAPI = {
  createProduct : (payload: any) => Post(`${PUBLIC_API_URL}/products`, payload),
  getAllProducts : () => Get(`${PUBLIC_API_URL}/products`, false),
  getByProductID : (ID: number) => Get(`${PUBLIC_API_URL}/products/${ID}`, false),
  update: (id: number, payload: any) => {
    return axios.put(`${PUBLIC_API_URL}/products/${id}`, payload);
  },
  deleteByID: (id: number) => Delete(`${PUBLIC_API_URL}/products/${id}`, false),
};

export const variantAPI = {
  deleteByID: (id: number) => Delete(`${PUBLIC_API_URL}/variant/${id}`),
}

export const movementsAPI = {
  getAllProducts : () => Get(`${PUBLIC_API_URL}/stockmovements`, false),
  create: (data: any) => axios.post("/stock-movements", data),
};

export const cartAPI = {
  addToCart: (payload: { user_id: number; variant_id: number; quantity: number }) => {
    return axios.post(`${PUBLIC_API_URL}/cart/add`, payload);
  },
  getCartByUserID: (user_id: number) => {
    return axios.get(`${PUBLIC_API_URL}/cart/${user_id}`);
  },  
  updateCartItem: (item_id: number, quantity: number) => {
    return axios.put(`${PUBLIC_API_URL}/cart/item/${item_id}`, { quantity });
  },
  removeCartItem: (item_id: number) => {
    return axios.delete(`${PUBLIC_API_URL}/cart/item/${item_id}`);
  },
  updateCartItemSelected: (id: number, selected: boolean) =>
    axios.patch(`${PUBLIC_API_URL}/cart/items/${id}/select`, { selected }),
};

export const paymentOrderAPI = {
  createPaymentOrder: (data: any) => axios.post(`${PUBLIC_API_URL}/payment-orders/create`, data),
  getAllPaymentMethods: () => axios.get(`${PUBLIC_API_URL}/payment-orders/methods`),
  getPaymentOrderById: (id: number) => axios.get(`${PUBLIC_API_URL}/payment-orders/${id}`),

  updatePaymentOrder: (id: number, data: any) => axios.put(`${PUBLIC_API_URL}/payment-orders/${id}`, data),
  expirePaymentOrder: (id: number) => axios.put(`${PUBLIC_API_URL}/payment-orders/${id}/expire`),
};
