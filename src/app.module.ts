import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { User } from './entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';
import { UserGroup } from './entities/user_group.entity';
import { Group } from './entities/group.entity';
import { GroupPermission } from './entities/group_permission.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ConfigModule sẽ là module toàn cục
    }), // Nạp các biến từ file .env
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User, UserGroup, Group, GroupPermission],
      synchronize: true,
      
    }),
    UsersModule,
    AuthModule,
    GroupModule,
  ],
})
export class AppModule {}
