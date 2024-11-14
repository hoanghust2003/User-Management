import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ormConfig } from './config/ormconfig';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    TypeOrmModule.forRoot(ormConfig),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Adjust path as needed
      serveRoot: '/uploads', // URL path to access images
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore as any,
      host: 'localhost', // Địa chỉ Redis server
      port: 6379, // Cổng Redis server
    }),
    UsersModule,
    AuthModule,
    GroupModule,
  ],
})
export class AppModule {}
