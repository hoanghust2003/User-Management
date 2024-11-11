import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { GroupService } from './group.service';
import { Group } from '../entities/group.entity';
import { UserGroup } from '../entities/user-group.entity';
import { Permission } from '../common/decorator/permission.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PermissionArrayDto } from './dto/permissions-array.dto';
import { Permissions } from 'src/common/enums/permissions.enum';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('groups')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  @Permission(Permissions.VIEW_LIST_GROUPS)
  @ApiOperation({ summary: 'Get all groups' })
  @ApiResponse({ status: 200, description: 'Return all groups.' })
  async findAll(): Promise<Group[]> {
    return await this.groupService.findAll();
  }

  @Post()
  @Permission(Permissions.CREATE_GROUP)
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({ status: 201, description: 'Group created successfully.' })
  async createGroup(@Body() createGroupDto: CreateGroupDto): Promise<object> {
    return await this.groupService.createGroup(createGroupDto.name, createGroupDto.description);
  }

  @Get(':id')
  @Permission(Permissions.VIEW_GROUP)
  @ApiOperation({ summary: 'Get a group by ID' })
  @ApiResponse({ status: 200, description: 'Return the group by ID.' })
  async getGroup(@Param('id', new ParseIntPipe()) id: number): Promise<object> {
    return await this.groupService.findGroupById(id);
  }

  @Put(':id')
  @Permission(Permissions.UPDATE_GROUP)
  @ApiOperation({ summary: 'Update a group by ID' })
  @ApiResponse({ status: 200, description: 'Group updated successfully.' })
  async updateGroup(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updateGroupDto: UpdateGroupDto
  ): Promise<object> {
    return await this.groupService.updateGroup(id, updateGroupDto.name, updateGroupDto.description);
  }

  @Delete(':id')
  @Permission(Permissions.DELETE_GROUP)
  @ApiOperation({ summary: 'Delete a group by ID' })
  @ApiResponse({ status: 200, description: 'Group deleted successfully.' })
  async removeGroup(@Param('id', new ParseIntPipe()) id: number): Promise<void> {
    await this.groupService.removeGroup(id);
  }

  @Post(':groupId/users/:userId')
  @Permission(Permissions.ADD_MEMBER_TO_GROUP)
  @ApiOperation({ summary: 'Add a member to a group' })
  @ApiResponse({ status: 201, description: 'Member added to group successfully.' })
  async addMemberToGroup(
    @Param('groupId', new ParseIntPipe()) groupId: number,
    @Param('userId', new ParseIntPipe()) userId: number,
  ): Promise<UserGroup> {
    return await this.groupService.addMemberToGroup(groupId, userId);
  }

  @Delete(':groupId/users/:userId')
  @Permission(Permissions.REMOVE_MEMBER_FROM_GROUP)
  @ApiOperation({ summary: 'Remove a member from a group' })
  @ApiResponse({ status: 200, description: 'Member removed from group successfully.' })
  async removeMemberFromGroup(
    @Param('groupId', new ParseIntPipe()) groupId: number,
    @Param('userId', new ParseIntPipe()) userId: number,
  ): Promise<void> {
    await this.groupService.removeMemberFromGroup(groupId, userId);
  }

  @Post(':groupId/permissions')
  @Permission(Permissions.ADD_PERMISSION_TO_GROUP)
  @ApiOperation({ summary: 'Add permissions to a group' })
  @ApiResponse({ status: 201, description: 'Permissions added to group successfully.' })
  async addPermissionToGroup(
    @Param('groupId', new ParseIntPipe()) groupId: number,
    @Body('permissions') permissionArrayDto: PermissionArrayDto,
  ): Promise<object> {
    return await this.groupService.addPermissionToGroup(groupId, permissionArrayDto.permissions);
  }

  @Delete(':groupId/permissions')
  @Permission(Permissions.REMOVE_PERMISSION_FROM_GROUP)
  @ApiOperation({ summary: 'Remove permissions from a group' })
  @ApiResponse({ status: 200, description: 'Permissions removed from group successfully.' })
  async removePermissionFromGroup(
    @Param('groupId', new ParseIntPipe()) groupId: number,
    @Body('permissions') permissionArrayDto: PermissionArrayDto,
  ): Promise<void> {
    await this.groupService.removePermissionFromGroup(groupId, permissionArrayDto.permissions);
  }
}