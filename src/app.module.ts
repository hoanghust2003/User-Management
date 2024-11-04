import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { User } from './entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';
import { UserGroup } from './entities/user_group.entity';
import { Group } from './entities/group.entity';
import { GroupPermission } from './entities/group_permission.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST, // hoặc địa chỉ của MySQL server
      port: Number(process.env.DATABASE_PORT) || 3306, // Sử dụng 3306 làm giá trị mặc định nếu không có DATABASE_PORT
      username: process.env.DATABASE_USER, // tên đăng nhập
      password: process.env.DATABASE_PASSWORD, // mật khẩu
      database: process.env.DATABASE_NAME, // tên cơ sở dữ liệu
      entities: [User, UserGroup, Group, GroupPermission], // đường dẫn tới các entity
      synchronize: true, // Cài đặt này sẽ tự động đồng bộ hóa các thay đổi entity vào database
    }),
    UsersModule,
    AuthModule,
    GroupModule,
  ],
})
export class AppModule {}
