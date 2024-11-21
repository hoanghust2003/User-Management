import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { Group } from '../entities/group.entity';
import { User } from '../entities/user.entity';
import { GroupPermission } from 'src/entities/group-permission.entity';
import { UserGroup } from 'src/entities/user-group.entity';
import { Permissions } from 'src/common/enums/permissions.enum';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private readonly GROUPS_CACHE_KEY = 'groups';
  private readonly GROUP_INFO_CACHE_KEY = 'group-info:';
  private readonly HAS_PERMISSION_CACHE_KEY = ':has-permission:';
  private readonly GROUP_CACHE_TTL = 120000;

  // Get a list of all groups
  async findAll(): Promise<Group[]> {
    // Try to get from cache first
    const cachedGroups = await this.cacheManager.get<Group[]>(this.GROUPS_CACHE_KEY);
    if (cachedGroups) {
      return cachedGroups;
    }

    const groups = await this.groupRepository.find();
    // Cache the result
    await this.cacheManager.set(this.GROUPS_CACHE_KEY, groups, this.GROUP_CACHE_TTL);
    return groups;
  }

  // Get information about a specific group
  async findGroupById(id: number): Promise<object> {
    // Try to get from cache first
    const cacheKey = this.GROUP_INFO_CACHE_KEY + id;
    const cachedGroupInfo = await this.cacheManager.get<object>(cacheKey);
    if (cachedGroupInfo) {
      return cachedGroupInfo;
    }

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
    // Save to cache
    await this.cacheManager.set(cacheKey, groupInfo, this.GROUP_CACHE_TTL);

    return groupInfo;
  }

  // Create a new group
  async createGroup(name: string, description: string): Promise<object> {
    const group = await this.groupRepository.create({ name , description});
    await this.groupRepository.save(group);
    // Invalidate groups cache
    await this.cacheManager.del(this.GROUPS_CACHE_KEY);
    await this.cacheManager.del(`/api/groups`);
    return await this.findGroupById(group.id);
  }

  // Update a group
  async updateGroup(id: number, name: string, description: string): Promise<object> {
    await this.groupRepository.update(id, { name, description });

    // Invalidate caches
    await this.cacheManager.del(`${this.GROUP_INFO_CACHE_KEY}${id}`);
    await this.cacheManager.del(`/api/groups/${id}`);
    await this.cacheManager.del(this.GROUPS_CACHE_KEY);
    await this.cacheManager.del(`/api/groups`);

    return await this.findGroupById(id);
  }

  //find members of a group
  async findMembersByGroupId(id: number): Promise<number[]> {
    const userGroups = await this.userGroupRepository.find({ where: { group: { id } }, relations: ['user'] });
    const members = userGroups.map(userGroup => {
      const user = userGroup.user;
      // Return only necessary user information
      return user.id;
    });
    return members;
  }

  //find permissions of a group
  async findPermissionsByGroupId(id: number): Promise<Permissions[]> {
    const groupPermissions = await this.groupPermissionRepository.find({ where: { group: { id } } });
    const permissions = groupPermissions.map(permission => permission.permission);
    return permissions;
  }

  // Delete a group
  async removeGroup(id: number): Promise<void> {
    //Invalidate userPermission cache
    for (const idmember of await this.findMembersByGroupId(id)) {
      for (const permission of await this.findPermissionsByGroupId(id)) {
        await this.cacheManager.del(`${idmember}${this.HAS_PERMISSION_CACHE_KEY}${permission}`);
      }
    }
    // Remove group
    await this.groupRepository.delete(id);

    // Invalidate group and list group caches
    await this.cacheManager.del(`${this.GROUP_INFO_CACHE_KEY}${id}`);
    await this.cacheManager.del(`/api/groups/${id}`);
    await this.cacheManager.del(this.GROUPS_CACHE_KEY);
    await this.cacheManager.del(`/api/groups`);
  }

  // Get a list of all permissions
  async getPermissions(): Promise<Permissions[]> {
    const permissions = Object.values(Permissions) as Permissions[];
    return permissions;
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

    // Invalidate group info cache
    await this.cacheManager.del(`${this.GROUP_INFO_CACHE_KEY}${groupId}`);
    await this.cacheManager.del(`/api/groups/${groupId}`);


    // Invalidate userPermission cache   
    for (const permission of await this.findPermissionsByGroupId(groupId)) {
      await this.cacheManager.del(`${userId}${this.HAS_PERMISSION_CACHE_KEY}${permission}`);
    }

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

    // Invalidate group info cache
    await this.cacheManager.del(`${this.GROUP_INFO_CACHE_KEY}${groupId}`);
    await this.cacheManager.del(`/api/groups/${groupId}`);

    // Invalidate userPermission cache   
    for (const permission of await this.findPermissionsByGroupId(groupId)) {
      await this.cacheManager.del(`${userId}${this.HAS_PERMISSION_CACHE_KEY}${permission}`);
    }

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

    // Invalidate group info cache
    await this.cacheManager.del(`${this.GROUP_INFO_CACHE_KEY}${groupId}`);
    await this.cacheManager.del(`/api/groups/${groupId}`);
    // Invalidate userPermission cache
    for (const idmember of await this.findMembersByGroupId(groupId)) {
      for (const permission of permissions) {
        await this.cacheManager.del(`${idmember}${this.HAS_PERMISSION_CACHE_KEY}${permission}`);
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

    // Invalidate group info cache
    await this.cacheManager.del(`${this.GROUP_INFO_CACHE_KEY}${groupId}`);
    await this.cacheManager.del(`/api/groups/${groupId}`);
    // Invalidate userPermission cache
    for (const idmember of await this.findMembersByGroupId(groupId)) {
      for (const permission of permissions) {
        await this.cacheManager.del(`${idmember}${this.HAS_PERMISSION_CACHE_KEY}${permission}`);
      }
    }

    return await this.findGroupById(groupId);
  }

}