import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UserGroup } from '../entities/user-group.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PermissionGuard } from 'src/auth/guards/permission.guard';


@Module({
  imports: [TypeOrmModule.forFeature([User, UserGroup]), forwardRef(() => AuthModule)],
  providers: [UserService, PermissionGuard],
  controllers: [UserController],
  exports: [UserService],
})
export class UsersModule {}
