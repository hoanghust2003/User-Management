import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UploadImageDto } from 'src/common/dtos/uploadImages.dto';
import * as path from 'path';
import * as fs from 'fs';
import { UserRole } from 'src/entities/user-role.enum';
import * as bcrypt from 'bcrypt';


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

  async updateProfileImage(userId: number, uploadImageDto: UploadImageDto, file: Express.Multer.File): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const uploadPath = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');
    
    // Tạo thư mục để lưu ảnh nếu chưa tồn tại
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }

    // Kiểm tra xem user có ảnh đại diện trước đó không
    if (user.profileImage) {
      // Xóa ảnh cũ nếu tồn tại
      const oldImagePath = path.join(uploadPath, user.profileImage);
      try {
        fs.unlinkSync(oldImagePath);
      } catch (error) {
        console.error('Error deleting old profile image:', error);
      }
    }

    // Tạo tên file duy nhất cho ảnh mới
    const fileName = `${userId}-${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadPath, fileName);

    // Lưu file vào thư mục uploads
    fs.writeFileSync(filePath, file.buffer);

    // Cập nhật đường dẫn ảnh mới cho user
    user.profileImage = fileName; 
    await this.userRepository.save(user);

    // console.log('user: ', user);

    return this.findOne(userId); // Trả về thông tin user đã cập nhật
  }

  async findAll(): Promise<any[]> {
    const users = await this.userRepository.find({
      select: ['id', 'username', 'role', 'profileImage'],
    });

    // Thêm trường ImagePath cho mỗi user
    return users.map(user => ({
      id: user.id,
      username: user.username,
      role: user.role,
      ImagePath: `http://localhost:${process.env.PORT}/uploads/${user.profileImage}`, // Tạo đường dẫn đầy đủ cho profileImage
    }));
  }

  async findOne(id: number): Promise<any> {
    const user = await this.userRepository.findOne({ 
      select: ['id', 'username', 'role', 'profileImage'],
      where: { id } 
    });
    if (user) {
      return {
        id: user.id,
        username: user.username,
        role: user.role,
        ImagePath: `http://localhost:${process.env.PORT}/uploads/${user.profileImage}`, // Trả về đường dẫn ảnh thay vì profileImage
      };
    } else {
      return null; 
    }
  }

  async updateUser(id: number, username: string): Promise<any> {
    await this.userRepository.update(id, { username});
    return this.findOne(id);
  }
  async updatePassword(id: number, oldpassword: string, newpassword: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id}});
    const isMatch = await bcrypt.compare(oldpassword, user.password);
    if (!isMatch) {
      throw new NotFoundException('Old password is not correct');
    }
    const encodednewpassword = await bcrypt.hash(newpassword, process.env.SALT_ROUNDS || 10);
    await this.userRepository.update(id, { password: encodednewpassword}); 
    return this.findOne(id);
  }

  async removeUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async assignAdminRole(userId: number): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = UserRole.ADMIN;
    this.userRepository.save(user);
    return this.findOne(userId);
  }
  
  async removeAdminRole(userId: number): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = UserRole.USER;
    this.userRepository.save(user);
    return this.findOne(userId);
  }
}

