import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Equal, In, Repository } from 'typeorm';
import { Group } from '../entities/group.entity';
import { User } from '../entities/user.entity';
import { GroupPermission } from 'src/entities/group-permission.entity';
import { UserGroup } from 'src/entities/user-group.entity';
import path from 'path';


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

  // Lấy danh sách nhóm
  async findAll(): Promise<Group[]> {
    return this.groupRepository.find();
  }
  // Xem thông tin nhóm
  async findGroupById(id: number): Promise<Object> {
    const group = await this.groupRepository.findOne({ where: { id }});
    if (!group) {
      throw new Error('Group not found');
    }
    // Tìm danh sách thành viên của nhóm
    const userGroups = await this.userGroupRepository.find({ where: { group: { id } }, relations: ['user'] });
    const members = userGroups.map(userGroup => {
      const user = userGroup.user;
  
      // Trả về các trường cần thiết của user, bao gồm ImagePath
      return {
        id: user.id,
        username: user.username,
        role: user.role,
        ImagePath: `http://localhost:${process.env.PORT}/uploads/${user.profileImage}`, // Trả về đường dẫn ảnh
      };
    });

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
  async createGroup(name: string, description: string): Promise<any> {
    const group = this.groupRepository.create({ name , description});
    await this.groupRepository.save(group);
    return this.findGroupById(group.id);
  }

  // Sửa nhóm
  async updateGroup(id: number, name: string, description: string): Promise<any> {
    await this.groupRepository.update(id, { name, description });
    return this.findGroupById(id);
  }

  // Xóa nhóm
  async removeGroup(id: number): Promise<void> {
    await this.groupRepository.delete(id);
  }

  // Thêm thành viên vào nhóm
  async addMemberToGroup(groupId: number, userId: number): Promise<UserGroup> {
    // Kiểm tra xem nhóm và người dùng có tồn tại không
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    const user = await this.userRepository.findOne({ where: { id: userId } });
  
    if (!group || !user) {
      throw new Error('Group or User not found');
    }
  
    // Kiểm tra xem người dùng đã có trong nhóm chưa
    const existingUserGroup = await this.userGroupRepository.findOne({
      where: { user: { id: userId }, group: { id: groupId } },
    });
  
    if (existingUserGroup) {
      throw new Error('User is already a member of this group');
    }
  
    // Nếu người dùng chưa có trong nhóm, tiến hành thêm
    const userGroup = this.userGroupRepository.create({ user, group });
    return this.userGroupRepository.save(userGroup);
  }

  // Xóa thành viên khỏi nhóm
  async removeMemberFromGroup(groupId: number, userId: number): Promise<any> {
    const userGroup = await this.userGroupRepository.findOne({
      where: { group: { id: groupId }, user: { id: userId } },
    });
  
    if (!userGroup) {
      throw new Error('User is not a member of this group');
    }
  
    // Xóa bản ghi UserGroup
    await this.userGroupRepository.delete(userGroup.id);
    return this.findGroupById(groupId);
  }

  // Thêm quyền cho nhóm
  async addPermissionToGroup(groupId: number, permissions: Permissions[]): Promise<any> {
    const group = await this.groupRepository.findOne({where: {id: groupId}});

    if (!group) {
      throw new Error('Group not found');
    }

    const addedPermissions: GroupPermission[] = [];

    for (const permission of permissions) {
      // Kiểm tra xem quyền đã tồn tại trong nhóm chưa
      const existingPermission = await this.groupPermissionRepository.findOne({
        where: { group: { id: groupId }, permission: In([permission])},
      });

      // Nếu quyền chưa tồn tại, tạo và lưu quyền mới
      if (!existingPermission) {
        const newPermission = this.groupPermissionRepository.create({ group, permission } as unknown as DeepPartial<GroupPermission>);
        const savedPermission = await this.groupPermissionRepository.save(newPermission);
        addedPermissions.push(savedPermission);
      }
    }

    return this.findGroupById(groupId);
  }

  // Xóa quyền khỏi nhóm
  async removePermissionFromGroup(groupId: number, permissions: Permissions[]): Promise<any> {
    const group = await this.groupRepository.findOne({where: {id: groupId}});

    if (!group) {
      throw new Error('Group not found');
    }

    // Tìm quyền cần xóa trong nhóm
    for (const permission of permissions) {
      
    const permissionToRemove = await this.groupPermissionRepository.findOne({
      where: { permission: In([permission]), group: { id: groupId } },
    });

    if (!permissionToRemove) {
      throw new Error('Permission not found in this group');
    }

    // Xóa quyền khỏi nhóm
    await this.groupPermissionRepository.delete(permissionToRemove.id);
    }
    return this.findGroupById(groupId);
  }

}