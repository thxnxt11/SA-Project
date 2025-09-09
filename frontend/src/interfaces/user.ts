
import type { DepartmentInterface } from "./department";
import type { GenderInterface } from "./gender";
import type { PositionInterface } from "./position";
import type { RoleInterface } from "./role";

export interface UserInterface {
  ID?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  age?: number;
  birthday?: string; // "YYYY-MM-DD"
  address?: string;
  gender_id?: number;
  phone_number?: string;
  role_id?: number;
  department_id?: number;
  position_id?: number;

  department?: DepartmentInterface;
  position?: PositionInterface;
  role?: RoleInterface;
  gender?:GenderInterface

}
export interface UpdateUserPayload {
  first_name: string;
  last_name: string;
  email: string;
  birthday: string; // "YYYY-MM-DD"
  phone_number?: string;
  address?: string;
  gender_id: number;
  role_id: number;
  department_id: number;
  position_id: number;
}
export interface CreateUserInterface {
  first_name: string;
  last_name: string;
  email: string;
  birthday: string; // "YYYY-MM-DD"
  phone_number?: string;
  address?: string;
  gender_id: number;
  role_id: number;
  department_id: number;
  position_id: number;
}
