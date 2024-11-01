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
      host: 'localhost', // hoặc địa chỉ của MySQL server
      port: 3306, // cổng mặc định của MySQL
      username: 'root', // tên đăng nhập
      password: '12345678', // mật khẩu
      database: 'my_database', // tên cơ sở dữ liệu
      entities: [User, UserGroup, Group, GroupPermission], // đường dẫn tới các entity
      synchronize: true, // Cài đặt này sẽ tự động đồng bộ hóa các thay đổi entity vào database
    }),
    UsersModule,
    AuthModule,
    GroupModule,
  ],
})
export class AppModule {}
