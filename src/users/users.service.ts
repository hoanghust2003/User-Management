import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UploadImageDto } from 'src/users/dto/upload-image.dto';
import * as path from 'path';
import * as fs from 'fs';
import { UserRole } from 'src/common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';
import { UserInfo } from 'src/common/interface/user-info.interface';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  
  ) {}

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }
  async findOneByUsername(username: string): Promise<User> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async updateProfileImage(userId: number, uploadImageDto: UploadImageDto, file: Express.Multer.File): Promise<object> {
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

    // console.log('user: ', user);

    return await this.findOne(userId); 
  }

  async findAll(): Promise<object[]> {
    const users = await this.userRepository.find({
      select: ['id', 'username', 'role', 'profileImage'],
    });

    return users.map(user => ({
      id: user.id,
      username: user.username,
      role: user.role,
      //change profileImage to ImagePath
      ImagePath: `http://localhost:${process.env.PORT}/uploads/${user.profileImage}`, // Tạo đường dẫn đầy đủ cho profileImage
    }));
  }

  async findOne(id: number): Promise<UserInfo> {
    const user = await this.userRepository.findOne({ 
      select: ['id', 'username', 'role', 'profileImage'],
      where: { id } 
    });
    if (user) {
      return {
        "id": user.id,
        "username": user.username,
        "role": user.role,
        "ImagePath": `http://localhost:${process.env.PORT}/uploads/${user.profileImage}`, // Trả về đường dẫn ảnh thay vì profileImage
      };
    } else {
      return null; 
    }
  }

  async updateUser(id: number, username: string): Promise<object> {
    await this.userRepository.update(id, { username});
    return await this.findOne(id);
  }
  async updatePassword(id: number, oldpassword: string, newpassword: string): Promise<object> {
    const user = await this.userRepository.findOne({ where: { id}});
    const isMatch = await bcrypt.compare(oldpassword, user.password);
    if (!isMatch) {
      throw new NotFoundException('Old password is not correct');
    }
    const encodednewpassword = await bcrypt.hash(newpassword, process.env.SALT_ROUNDS || 10);
    await this.userRepository.update(id, { password: encodednewpassword}); 
    return await this.findOne(id);
  }

  async removeUser(id: number): Promise<void> {
    
    await this.userRepository.delete(id);
  }

  async assignAdminRole(userId: number): Promise<object> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = UserRole.ADMIN;
    await this.userRepository.save(user);
    return await this.findOne(userId);
  }
  
  async removeAdminRole(userId: number): Promise<object> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = UserRole.USER;
    this.userRepository.save(user);
    return await this.findOne(userId);
  }
}

