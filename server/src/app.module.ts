import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost', // hoặc địa chỉ của MySQL server
      port: 3306, // cổng mặc định của MySQL
      username: 'root', // tên đăng nhập
      password: 'zA12012003@', // mật khẩu
      database: 'user_management', // tên cơ sở dữ liệu
      entities: [User], // đường dẫn tới các entity
      synchronize: true, // Cài đặt này sẽ tự động đồng bộ hóa các thay đổi entity vào database
    }),
    UsersModule,
  ],
})
export class AppModule {}
