import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '../entities/group.entity';
import { GroupPermission } from '../entities/group_permission.entity';
import { UserGroup } from 'src/entities/user_group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Group, GroupPermission, UserGroup])],
  controllers: [GroupController],
  providers: [GroupService]
})
export class GroupModule {}
