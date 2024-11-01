import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Group } from '../entities/group.entity';
import { User } from '../entities/user.entity';
import { GroupPermission } from 'src/entities/group_permission.entity';
import { UserGroup } from 'src/entities/user_group.entity';


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

  // Xem thông tin nhóm
  async findGroupById(id: number): Promise<Object> {
    const group = await this.groupRepository.findOne({ where: { id }});
    if (!group) {
      throw new Error('Group not found');
    }
    // Tìm danh sách thành viên của nhóm
    const userGroups = await this.userGroupRepository.find({ where: { group: { id } }, relations: ['user'] });
    const members = userGroups.map(userGroup => userGroup.user);

    // Tìm danh sách quyền của nhóm
    const groupPermissions = await this.groupPermissionRepository.find({ where: { group: { id } } });
    const permissions = groupPermissions.map(permission => permission.permission);

    // Tạo đối tượng trả về
    const groupInfo = {
        group,
        members,
        permissions,
    };
    return groupInfo;
  }

  // Thêm nhóm
  async createGroup(name: string, description: string): Promise<Group> {
    const group = this.groupRepository.create({ name , description});
    return this.groupRepository.save(group);
  }

  // Sửa nhóm
  async updateGroup(id: number, name: string, description: string): Promise<Group> {
    await this.groupRepository.update(id, { name, description });
    return this.groupRepository.findOne({where: {id}});
  }

  // Xóa nhóm
  async removeGroup(id: number): Promise<void> {
    await this.groupRepository.delete(id);
  }

  // Thêm thành viên vào nhóm
  async addMemberToGroup(groupId: number, userId: number): Promise<UserGroup> {
    const group = await this.groupRepository.findOne({where: {id: groupId}});
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user && group) {
      const user_group = this.userGroupRepository.create({user, group});
      return this.userGroupRepository.save(user_group);
    }
    throw new Error('Group or User not found');
  }

  // Xóa thành viên khỏi nhóm
  async removeMemberFromGroup(groupId: number, userId: number): Promise<void> {
    const userGroup = await this.userGroupRepository.findOne({
      where: { group: { id: groupId }, user: { id: userId } },
    });
  
    if (!userGroup) {
      throw new Error('User is not a member of this group');
    }
  
    // Xóa bản ghi UserGroup
    await this.userGroupRepository.delete(userGroup.id);
  }

  // Thêm quyền cho nhóm
  async addPermissionToGroup(groupId: number, permissions: Permissions[]): Promise<GroupPermission[]> {
    const group = await this.groupRepository.findOne({where: {id: groupId}});

    if (!group) {
      throw new Error('Group not found');
    }

    const addedPermissions: GroupPermission[] = [];

    for (const permission of permissions) {
      // Kiểm tra xem quyền đã tồn tại trong nhóm chưa
      const existingPermission = await this.groupPermissionRepository.findOne({
        where: { group: { id: groupId }, permission: permission as unknown as string},
      });

      // Nếu quyền chưa tồn tại, tạo và lưu quyền mới
      if (!existingPermission) {
        const newPermission = this.groupPermissionRepository.create({ group, permission: permission as unknown as string });
        const savedPermission = await this.groupPermissionRepository.save(newPermission);
        addedPermissions.push(savedPermission);
      }
    }

    return addedPermissions;
  }

  // Xóa quyền khỏi nhóm
  async removePermissionFromGroup(groupId: number, permissions: Permissions[]): Promise<void> {
    const group = await this.groupRepository.findOne({where: {id: groupId}});

    if (!group) {
      throw new Error('Group not found');
    }

    // Tìm quyền cần xóa trong nhóm
    for (const permission of permissions) {
      
    const permissionToRemove = await this.groupPermissionRepository.findOne({
      where: { permission: permission as unknown as string, group: { id: groupId } },
    });

    if (!permissionToRemove) {
      throw new Error('Permission not found in this group');
    }

    // Xóa quyền khỏi nhóm
    await this.groupPermissionRepository.delete(permissionToRemove.id);
    }
  }

}