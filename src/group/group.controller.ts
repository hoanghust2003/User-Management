import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { GroupService } from './group.service';
import { Group } from '../entities/group.entity';
import { GroupPermission } from '../entities/group_permission.entity';
import { UserGroup } from '../entities/user_group.entity';

@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  // Tạo nhóm
  @Post()
  async createGroup(@Body() body: {name: string, description: string}): Promise<Group> {
    return this.groupService.createGroup(body.name, body.description);
  }

  // Xem thông tin nhóm
  @Get(':id')
  async getGroup(@Param('id') id: number): Promise<Object> {
    return this.groupService.findGroupById(id);
  }

  // Sửa nhóm
  @Put(':id')
  async updateGroup(@Param('id') id: number, @Body() body: {name: string, description: string}): Promise<Group> {
    return this.groupService.updateGroup(id, body.name, body.description);
  }

  // Xóa nhóm
  @Delete(':id')
  async removeGroup(@Param('id') id: number): Promise<void> {
    await this.groupService.removeGroup(id);
  }

  // Thêm thành viên vào nhóm
  @Post(':groupId/users/:userId')
  async addMemberToGroup(
    @Param('groupId') groupId: number,
    @Param('userId') userId: number,
  ): Promise<UserGroup> {
    return this.groupService.addMemberToGroup(groupId, userId);
  }

  // Xóa thành viên khỏi nhóm
  @Delete(':groupId/users/:userId')
  async removeMemberFromGroup(
    @Param('groupId') groupId: number,
    @Param('userId') userId: number,
  ): Promise<void> {
    await this.groupService.removeMemberFromGroup(groupId, userId);
  }

  // Thêm quyền cho nhóm
  @Post(':groupId/permissions')
  async addPermissionToGroup(
    @Param('groupId') groupId: number,
    @Body('permissions') permissions: Permissions[],
  ): Promise<GroupPermission[]> {
    return this.groupService.addPermissionToGroup(groupId, permissions);
  }

  // Xóa quyền khỏi nhóm
  @Delete(':groupId/permissions')
  async removePermissionFromGroup(
    @Param('groupId') groupId: number,
    @Body('permissions') permissions: Permissions[],
  ): Promise<void> {
    await this.groupService.removePermissionFromGroup(groupId, permissions);
  }
}
