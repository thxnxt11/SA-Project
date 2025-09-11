import type { CartItemInterface } from "./cartitem";

export interface Cart {
  id: number;
  items: CartItemInterface[];
  user: number;
}