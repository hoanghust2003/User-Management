import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { GroupService } from './group.service';
import { Group } from '../entities/group.entity';
import { GroupPermission } from '../entities/group_permission.entity';
import { UserGroup } from '../entities/user_group.entity';
import { Permission } from  '../common/decorator/permission.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  // Tạo nhóm
  @Post()
  @Permission('create_group') // Quyền tạo nhóm
  async createGroup(@Body() body: {name: string, description: string}): Promise<Group> {
    return this.groupService.createGroup(body.name, body.description);
  }

  // Xem thông tin nhóm
  @Get(':id')
  @Permission('view_group') // Quyền xem thông tin nhóm
  async getGroup(@Param('id') id: number): Promise<Object> {
    return this.groupService.findGroupById(id);
  }

  // Sửa nhóm
  @Put(':id')
  @Permission('update_group') // Quyền cập nhật nhóm
  async updateGroup(@Param('id') id: number, @Body() body: {name: string, description: string}): Promise<Group> {
    return this.groupService.updateGroup(id, body.name, body.description);
  }

  // Xóa nhóm
  @Delete(':id')
  @Permission('delete_group') // Quyền xóa nhóm
  async removeGroup(@Param('id') id: number): Promise<void> {
    await this.groupService.removeGroup(id);
  }

  // Thêm thành viên vào nhóm
  @Post(':groupId/users/:userId')
  @Permission('add_member_to_group') // Quyền thêm thành viên vào nhóm
  async addMemberToGroup(
    @Param('groupId') groupId: number,
    @Param('userId') userId: number,
  ): Promise<UserGroup> {
    return this.groupService.addMemberToGroup(groupId, userId);
  }

  // Xóa thành viên khỏi nhóm
  @Delete(':groupId/users/:userId')
  @Permission('remove_member_from_group') // Quyền xóa thành viên khỏi nhóm
  async removeMemberFromGroup(
    @Param('groupId') groupId: number,
    @Param('userId') userId: number,
  ): Promise<void> {
    await this.groupService.removeMemberFromGroup(groupId, userId);
  }

  // Thêm quyền cho nhóm
  @Post(':groupId/permissions')
  @Permission('add_permission_to_group') // Quyền thêm quyền cho nhóm
  async addPermissionToGroup(
    @Param('groupId') groupId: number,
    @Body('permissions') permissions: Permissions[],
  ): Promise<GroupPermission[]> {
    return this.groupService.addPermissionToGroup(groupId, permissions);
  }

  // Xóa quyền khỏi nhóm
  @Delete(':groupId/permissions')
  @Permission('remove_permission_from_group') // Quyền xóa quyền khỏi nhóm
  async removePermissionFromGroup(
    @Param('groupId') groupId: number,
    @Body('permissions') permissions: Permissions[],
  ): Promise<void> {
    await this.groupService.removePermissionFromGroup(groupId, permissions);
  }
}
