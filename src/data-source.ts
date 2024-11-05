import { DataSource } from "typeorm";
import { User } from "./entities/user.entity";
import { UserGroup } from "./entities/user_group.entity";
import { Group } from "./entities/group.entity";
import { GroupPermission } from "./entities/group_permission.entity";

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [User, UserGroup, Group, GroupPermission],
  synchronize: false,
});