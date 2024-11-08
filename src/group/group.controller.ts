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
import { GroupPermission } from '../entities/group-permission.entity';
import { UserGroup } from '../entities/user-group.entity';
import { Permission } from '../common/decorator/permission.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PermissionArrayDto } from './dto/permissions-array.dto';
import { Permissions } from 'src/common/enums/permissions.enum';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  // Get a list of all groups
  @Get()
  @Permission(Permissions.VIEW_LIST_GROUPS)
  async findAll(): Promise<Group[]> {
    return await this.groupService.findAll();
  }
  // Create a new group
  @Post()
  @Permission(Permissions.CREATE_GROUP)
  async createGroup(@Body() createGroupDto: CreateGroupDto): Promise<Group> {
    return await this.groupService.createGroup(createGroupDto.name, createGroupDto.description);
  }

  // Get information about a specific group
  @Get(':id')
  @Permission(Permissions.VIEW_GROUP)
  async getGroup(@Param('id', new ParseIntPipe()) id: number): Promise<Object> {
    return await this.groupService.findGroupById(id);
  }

  // Update a group
  @Put(':id')
  @Permission(Permissions.UPDATE_GROUP)
  async updateGroup(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updateGroupDto: UpdateGroupDto
  ): Promise<Group> {
    return await this.groupService.updateGroup(id, updateGroupDto.name, updateGroupDto.description);
  }

  // Delete a group
  @Delete(':id')
  @Permission(Permissions.DELETE_GROUP)
  async removeGroup(@Param('id', new ParseIntPipe()) id: number): Promise<void> {
    await this.groupService.removeGroup(id);
  }

  // Add a member to a group
  @Post(':groupId/users/:userId')
  @Permission(Permissions.ADD_MEMBER_TO_GROUP)
  async addMemberToGroup(
    @Param('groupId', new ParseIntPipe()) groupId: number,
    @Param('userId', new ParseIntPipe()) userId: number,
  ): Promise<UserGroup> {
    return await this.groupService.addMemberToGroup(groupId, userId);
  }

  // Remove a member from a group
  @Delete(':groupId/users/:userId')
  @Permission(Permissions.REMOVE_MEMBER_FROM_GROUP)
  async removeMemberFromGroup(
    @Param('groupId', new ParseIntPipe()) groupId: number,
    @Param('userId', new ParseIntPipe()) userId : number,
  ): Promise<void> { 
    await this.groupService.removeMemberFromGroup(groupId, userId);
  }

  // Add permissions to a group
  @Post(':groupId/permissions')
  @Permission(Permissions.ADD_PERMISSION_TO_GROUP)
  async addPermissionToGroup(
    @Param('groupId', new ParseIntPipe()) groupId: number,
    @Body('permissions') permissionArrayDto: PermissionArrayDto,
  ): Promise<GroupPermission[]> {
    return await this.groupService.addPermissionToGroup(groupId, permissionArrayDto.permissions);
  }

  // Remove permissions from a group
  @Delete(':groupId/permissions')
  @Permission(Permissions.REMOVE_PERMISSION_FROM_GROUP)
  async removePermissionFromGroup(
    @Param('groupId', new ParseIntPipe()) groupId: number,
    @Body('permissions') permissionArrayDto: PermissionArrayDto,
  ): Promise<void> {
    await this.groupService.removePermissionFromGroup(groupId, permissionArrayDto.permissions);
  }
}
