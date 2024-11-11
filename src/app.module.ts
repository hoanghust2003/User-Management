import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ormConfig } from './config/ormconfig';

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
    UsersModule,
    AuthModule,
    GroupModule,
  ],
})
export class AppModule {}
