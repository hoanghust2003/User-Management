import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { Group } from '../entities/group.entity';
import { User } from '../entities/user.entity';
import { GroupPermission } from 'src/entities/group-permission.entity';
import { UserGroup } from 'src/entities/user-group.entity';
import { Permissions } from 'src/common/enums/permissions.enum';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(GroupPermission)
    private groupPermissionRepository: Repository<GroupPermission>,
    @InjectRepository(UserGroup)
    private userGroupRepository: Repository<UserGroup>,
  
  ) {}

  // Get a list of all groups
  async findAll(): Promise<Group[]> {
    return await this.groupRepository.find();
  }
  // Get information about a specific group
  async findGroupById(id: number): Promise<object> {
    const group = await this.groupRepository.findOne({ where: { id }});
    if (!group) {
      throw new Error('Group not found');
    }
    // Get a list of members in the group
    const userGroups = await this.userGroupRepository.find({ where: { group: { id } }, relations: ['user'] });
    const members = userGroups.map(userGroup => {
      const user = userGroup.user;
  
      // Return only necessary user information
      return {
        id: user.id,
        username: user.username,
        role: user.role,
        ImagePath: `http://localhost:${process.env.PORT}/uploads/${user.profileImage}`, // Trả về đường dẫn ảnh
      };
    });

    // Find all permissions of the group
    const groupPermissions = await this.groupPermissionRepository.find({ where: { group: { id } } });
    const permissions = groupPermissions.map(permission => permission.permission);

    const groupInfo = {
        group,
        members,
        permissions,
    };
    return groupInfo;
  }

  // Create a new group
  async createGroup(name: string, description: string): Promise<object> {
    const group = await this.groupRepository.create({ name , description});
    await this.groupRepository.save(group);
    return await this.findGroupById(group.id);
  }

  // Update a group
  async updateGroup(id: number, name: string, description: string): Promise<object> {
    await this.groupRepository.update(id, { name, description });
    return await this.findGroupById(id);
  }

  // Delete a group
  async removeGroup(id: number): Promise<void> {
    await this.groupRepository.delete(id);
  }

  // Add a member to a group
  async addMemberToGroup(groupId: number, userId: number): Promise<object> {
    // Kiểm tra xem nhóm và người dùng có tồn tại không
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    const user = await this.userRepository.findOne({ where: { id: userId } });
  
    if (!group || !user) {
      throw new Error('Group or User not found');
    }
  
    // Check if the user is already a member of the group
    const existingUserGroup = await this.userGroupRepository.findOne({
      where: { user: { id: userId }, group: { id: groupId } },
    });
  
    if (existingUserGroup) {
      throw new Error('User is already a member of this group');
    }
  
    // If the user is not a member of the group, create a new UserGroup record
    const userGroup = await this.userGroupRepository.create({ user, group });
    await this.userGroupRepository.save(userGroup);
    return await this.findGroupById(groupId);
  }

  // Delete a member from a group
  async removeMemberFromGroup(groupId: number, userId: number): Promise<object> {
    const userGroup = await this.userGroupRepository.findOne({
      where: { group: { id: groupId }, user: { id: userId } },
    });
  
    if (!userGroup) {
      throw new Error('User is not a member of this group');
    }

    await this.userGroupRepository.delete(userGroup.id);
    return await this.findGroupById(groupId);
  }

  // Add some permissions to a group
  async addPermissionToGroup(groupId: number, permissions: Permissions[]): Promise<object> {
    const group = await this.groupRepository.findOne({where: {id: groupId}});

    if (!group) {
      throw new Error('Group not found');
    }

    

    for (const permission of permissions) {
      // Check if the permission already exists in the group
      const existingPermission = await this.groupPermissionRepository.findOne({
        where: { group: { id: groupId }, permission: In([permission])},
      });

      // If the permission does not exist, create a new GroupPermission record
      if (!existingPermission) {
        const newPermission = await this.groupPermissionRepository.create({ group, permission } as unknown as DeepPartial<GroupPermission>);
        await this.groupPermissionRepository.save(newPermission);
      }
    }
    return await this.findGroupById(groupId);
  }

  // Remove some permissions from a group
  async removePermissionFromGroup(groupId: number, permissions: Permissions[]): Promise<object> {
    const group = await this.groupRepository.findOne({where: {id: groupId}});

    if (!group) {
      throw new Error('Group not found');
    }

    // Find the permission in the group
    for (const permission of permissions) {
      
    const permissionToRemove = await this.groupPermissionRepository.findOne({
      where: { permission: In([permission]), group: { id: groupId } },
    });

    if (!permissionToRemove) {
      throw new Error('Permission not found in this group');
    }

    // Remove the permission from the group
    await this.groupPermissionRepository.delete(permissionToRemove.id);
    }
    return await this.findGroupById(groupId);
  }

}