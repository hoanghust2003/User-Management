import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { Group } from '../entities/group.entity';
import { GroupPermission } from '../entities/group_permission.entity';
import { UserGroup } from '../entities/user_group.entity';
import { Permission } from '../common/decorator/permission.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  // Get a list of all groups
  @Get()
  @Permission('view_list_groups')
  async findAll(): Promise<Group[]> {
    return this.groupService.findAll();
  }
  // Create a new group
  @Post()
  @Permission('create_group')
  async createGroup(@Body() body: { name: string; description: string }): Promise<Group> {
    return this.groupService.createGroup(body.name, body.description);
  }

  // Get information about a specific group
  @Get(':id')
  @Permission('view_group')
  async getGroup(@Param('id', new ParseIntPipe()) id: number): Promise<Object> {
    return this.groupService.findGroupById(id);
  }

  // Update a group
  @Put(':id')
  @Permission('update_group')
  async updateGroup(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: { name: string; description: string },
  ): Promise<Group> {
    return this.groupService.updateGroup(id, body.name, body.description);
  }

  // Delete a group
  @Delete(':id')
  @Permission('delete_group')
  async removeGroup(@Param('id', new ParseIntPipe()) id: number): Promise<void> {
    await this.groupService.removeGroup(id);
  }

  // Add a member to a group
  @Post(':groupId/users/:userId')
  @Permission('add_member_to_group')
  async addMemberToGroup(
    @Param('groupId', new ParseIntPipe()) groupId: number,
    @Param('userId', new ParseIntPipe()) userId: number,
  ): Promise<UserGroup> {
    return this.groupService.addMemberToGroup(groupId, userId);
  }

  // Remove a member from a group
  @Delete(':groupId/users/:userId')
  @Permission('remove_member_from_group')
  async removeMemberFromGroup(
    @Param('groupId', new ParseIntPipe()) groupId: number,
    @Param('userId', new ParseIntPipe()) userId: number,
  ): Promise<void> {
    await this.groupService.removeMemberFromGroup(groupId, userId);
  }

  // Add permissions to a group
  @Post(':groupId/permissions')
  @Permission('add_permission_to_group')
  async addPermissionToGroup(
    @Param('groupId', new ParseIntPipe()) groupId: number,
    @Body('permissions') permissions: Permissions[],
  ): Promise<GroupPermission[]> {
    return this.groupService.addPermissionToGroup(groupId, permissions);
  }

  // Remove permissions from a group
  @Delete(':groupId/permissions')
  @Permission('remove_permission_from_group')
  async removePermissionFromGroup(
    @Param('groupId', new ParseIntPipe()) groupId: number,
    @Body('permissions') permissions: Permissions[],
  ): Promise<void> {
    await this.groupService.removePermissionFromGroup(groupId, permissions);
  }
}
