import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Group } from './entities/group.entity';
import { GroupPermission } from './entities/group-permission.entity';
import { UserGroup } from './entities/user-group.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [User, Group, GroupPermission, UserGroup], // Các entity của bạn
  migrations: ['src/migration/*.ts'], // Thư mục lưu migrations
  synchronize: false, // Để 'false' nếu bạn muốn dùng migrations thay vì tự động đồng bộ
  logging: true,
});
