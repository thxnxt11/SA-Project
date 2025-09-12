import type { GenderInterface } from "./gender";

export interface UserInterface {
  ID?: number;
  first_name?: string | undefined;
  last_name?: string | undefined;
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
  gender?: GenderInterface;

}
export interface DepartmentInterface {
  ID?: number;
  department?: string;
}

export interface PositionInterface {
  ID?: number;
  position?: string;
}

export interface RoleInterface {
  ID?: number;
  role?: string; 
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
