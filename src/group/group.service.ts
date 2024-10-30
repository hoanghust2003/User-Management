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
  async findGroupById(id: number): Promise<Group> {
    return this.groupRepository.findOne({ where: { id }, relations: ['members', 'permissions'] });
  }

  // Thêm nhóm
  async createGroup(name: string): Promise<Group> {
    const group = this.groupRepository.create({ name });
    const per_gr = this.groupPermissionRepository.create({ group, permission: 'read' });
    return this.groupRepository.save(group);
  }

  // Sửa nhóm
  async updateGroup(id: number, name: string): Promise<Group> {
    await this.groupRepository.update(id, { name });
    return this.findGroupById(id);
  }

  // Xóa nhóm
  async removeGroup(id: number): Promise<void> {
    await this.groupRepository.delete(id);
  }

  // Thêm thành viên vào nhóm
  async addMemberToGroup(groupId: number, userId: number): Promise<UserGroup> {
    const group = await this.findGroupById(groupId);
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
  async addPermissionToGroup(groupId: number, permission: string): Promise<GroupPermission> {
    const group = await this.findGroupById(groupId);
    if (group) {
      const perm = this.groupPermissionRepository.create({ group, permission});
      return this.groupRepository.save(group);
    }
    throw new Error('Group or Permission not found');
  }

  // Xóa quyền khỏi nhóm
  async removePermissionFromGroup(groupId: number, permissionId: number): Promise<Group> {
    const group = await this.findGroupById(groupId);
    group.permissions = group.permissions.filter((perm) => perm.id !== permissionId);
    return this.groupRepository.save(group);
  }
}
