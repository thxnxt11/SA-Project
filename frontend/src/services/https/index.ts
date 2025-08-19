import type { PromotionInterface } from "../../interface/promotion";
import axios from "axios";

const apiUrl = "http://localhost:8000/organizer";
const publicUrl = "http://localhost:8000/api";
async function CreatePromotion(data: PromotionInterface) {
  return await axios
    .post(`${apiUrl}/promotion/add`, data)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetAllPromotion() {
  return await axios
    .get(`${apiUrl}/promotion`)
    .then((res) => res)
    .catch((e) => e.response);
}

// แก้ไข: GetPromotionByID ควรใช้ GET ไม่ใช่ PUT
async function GetPromotionByID(id: number) {
  return await axios
    .get(`${apiUrl}/promotion/${id}`)
    .then((res) => res)
    .catch((e) => e.response);
}

// เพิ่ม: UpdatePromotion function
async function UpdatePromotionByID(id: number, data: PromotionInterface) {
  return await axios
    .put(`${apiUrl}/promotion/${id}`, data)
    .then((res) => res)
    .catch((e) => e.response);
}

async function DeletePromotionByID(id: string) {
  return await axios
    .delete(`${apiUrl}/promotion/${id}`)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetAllPromotionTypes() {
  return await axios
    .get(`${publicUrl}/promotions`)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetAllConcerts() {
  return await axios
    .get(`${publicUrl}/concerts`)
    .then((res) => res)
    .catch((e) => e.response);
}

// async function GetConcertByID(id: string) {
//   return await axios
//     .get(`${publicUrl}/concert/${id}`)
//     .then((res) => res)
//     .catch((e) => e.response);
// }

export {
  CreatePromotion,
  GetAllPromotion,
  GetPromotionByID,
  UpdatePromotionByID,
  DeletePromotionByID,
  GetAllPromotionTypes,
  GetAllConcerts,
  // GetConcertByID,
};
