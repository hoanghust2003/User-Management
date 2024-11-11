import { UserRole } from "../enums/user-role.enum";

export interface UserInfo {
  id: number;
  username: string;
  role: UserRole;
  ImagePath: string;
}
