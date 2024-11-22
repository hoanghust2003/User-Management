import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UploadImageDto } from 'src/users/dto/upload-image.dto';
import * as path from 'path';
import * as fs from 'fs';
import { UserRole } from 'src/common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserGroup } from 'src/entities/user-group.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserGroup)
    private userGroupRepository: Repository<UserGroup>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  private readonly USER_CACHE_KEY = 'user:';
  private readonly USERS_CACHE_KEY = 'users';
  private readonly GROUP_INFO_CACHE_KEY = 'group-info:';
  private readonly USER_CACHE_TTL = 60000;
  private readonly USERS_CACHE_TTL = 120000;
  
  async findAll(): Promise<User[]> {
    const cachedUsers = await this.cacheManager.get<User[]>(this.USERS_CACHE_KEY);
    if (cachedUsers) {
      return cachedUsers;
    }

    const users = await this.userRepository.find();
    
    await this.cacheManager.set(this.USERS_CACHE_KEY, users, this.USERS_CACHE_TTL);
    return users;
  }

  async findOne(id: number): Promise<User> {
    // await this.cacheManager.reset();
    const cacheKey = this.USER_CACHE_KEY + id;
    const cachedUser = await this.cacheManager.get(cacheKey);


    if(cachedUser) {
      return cachedUser;
    }
    
    const user = await this.userRepository.findOne({ where: { id } });

    if (user) {
      await this.cacheManager.set(cacheKey, user, this.USER_CACHE_TTL);
    } 

    return user;
  }

  async updateUser(id: number, username: string): Promise<User> {
    await this.userRepository.update(id, { username});
    // Invalidate caches
    await this.cacheManager.del(`${this.USER_CACHE_KEY}${id}`);
    await this.cacheManager.del(`/api/users/${id}`);
    await this.cacheManager.del(this.USERS_CACHE_KEY);
    await this.cacheManager.del(`/api/users`);
    for(const groupId of await this.findGroupsByUserId(id)) {
      await this.cacheManager.del(`${this.GROUP_INFO_CACHE_KEY}${groupId}`);
      await this.cacheManager.del(`/api/groups/${groupId}`);
    }
    return await this.findOne(id);
  }
  async updatePassword(id: number, oldpassword: string, newpassword: string): Promise<User> {
    const user = await this.userRepository
    .createQueryBuilder('user')
    .addSelect('user.password') // Lấy thêm cột password
    .where('user.id = :id', { id : id })
    .getOne();
    const isMatch = await bcrypt.compare(oldpassword, user.password);
    if (!isMatch) {
      throw new NotFoundException('Old password is not correct');
    }
    const encodednewpassword = await bcrypt.hash(newpassword, process.env.SALT_ROUNDS || 10);
    await this.userRepository.update(id, { password: encodednewpassword});     
    return await this.findOne(id);
  }
  // Get a list of groups that a user belongs to
  async findGroupsByUserId(userId: number): Promise<number[]> {
    const userGroups = await this.userGroupRepository.find({
      where: { user: {id: userId} }, 
      relations: ['groups'] 
    });
    if (!userGroups || userGroups.length === 0) {
      throw new NotFoundException('No groups found for this user');
    }

    return userGroups.map((userGroup) => userGroup.group.id);
  }

  async updateProfileImage(userId: number, uploadImageDto: UploadImageDto, file: Express.Multer.File): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const uploadPath = process.env.UPLOADS_DIR;

    // Make sure upload directory exists
    try {
      await fs.promises.mkdir(uploadPath, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }

    // Check if user already has a profile image
    if (user.profileImage) {
      // Remove old profile image if exists
      const oldImagePath = path.join(uploadPath, user.profileImage);
      try {
        await fs.promises.unlink(oldImagePath);
      } catch (error) {
        console.error('Error deleting old profile image:', error);
      }
    }

    // Make unique file's name
    const fileName = `${userId}-${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadPath, fileName);

    // save file 
    await fs.promises.writeFile(filePath, file.buffer);

    // Update new profileImage
    user.profileImage = fileName; 
    await this.userRepository.save(user);

    // Invalidate caches
    await this.cacheManager.del(`${this.USER_CACHE_KEY}${userId}`);
    await this.cacheManager.del(`/api/users/${userId}`);
    await this.cacheManager.del(this.USERS_CACHE_KEY);
    await this.cacheManager.del(`/api/users`);
    
    for(const groupId of await this.findGroupsByUserId(userId)) {
      await this.cacheManager.del(`${this.GROUP_INFO_CACHE_KEY}${groupId}`);
      await this.cacheManager.del(`/api/groups/${groupId}`);
    }

    return await this.findOne(userId); 
  }

  async removeUser(id: number): Promise<void> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    // Invalidate caches
    await this.cacheManager.del(`${this.USER_CACHE_KEY}${id}`);
    await this.cacheManager.del(`/api/users/${id}`);
    await this.cacheManager.del(this.USERS_CACHE_KEY);
    await this.cacheManager.del(`/api/users`);
    for(const groupId of await this.findGroupsByUserId(id)) {
      await this.cacheManager.del(`${this.GROUP_INFO_CACHE_KEY}${groupId}`);
      await this.cacheManager.del(`/api/groups/${groupId}`);
    }
    await this.userRepository.delete(id);    
  }

  async assignAdminRole(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = UserRole.ADMIN;
    await this.userRepository.save(user);

    // Invalidate caches
    await this.cacheManager.del(`${this.USER_CACHE_KEY}${userId}`);
    await this.cacheManager.del(`/api/users/${userId}`);
    await this.cacheManager.del(this.USERS_CACHE_KEY);
    await this.cacheManager.del(`/api/users`);
    for(const groupId of await this.findGroupsByUserId(userId)) {
      await this.cacheManager.del(`${this.GROUP_INFO_CACHE_KEY}${groupId}`);
      await this.cacheManager.del(`/api/groups/${groupId}`);
    }
    return await this.findOne(userId);
  }
  
  async removeAdminRole(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = UserRole.USER;
    this.userRepository.save(user);

    // Invalidate caches
    await this.cacheManager.del(`${this.USER_CACHE_KEY}${userId}`);
    await this.cacheManager.del(`/api/users/${userId}`);
    await this.cacheManager.del(this.USERS_CACHE_KEY);
    await this.cacheManager.del(`/api/users`);
    for(const groupId of await this.findGroupsByUserId(userId)) {
      await this.cacheManager.del(`${this.GROUP_INFO_CACHE_KEY}${groupId}`);
      await this.cacheManager.del(`/api/groups/${groupId}`);
    }

    return await this.findOne(userId);
  }
}

