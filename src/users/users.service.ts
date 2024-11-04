import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UploadImageDto } from 'src/common/dtos/uploadImages.dto';
import * as path from 'path';
import * as fs from 'fs';
import { UserRole } from 'src/entities/user_role.enum';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  
  ) {}

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }
  async findOneByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  async updateProfileImage(userId: number, uploadImageDto: UploadImageDto, file: Express.Multer.File): Promise<User> {
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
      try {
        fs.unlinkSync(user.profileImage);
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

    return user; // Trả về thông tin user đã cập nhật
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateUser(id: number, username: string): Promise<User> {
    await this.userRepository.update(id, { username});
    return this.findOne(id);
  }
  async updatePassword(id: number, oldpassword: string, newpassword: string): Promise<User> {
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

  async assignAdminRole(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = UserRole.ADMIN;
    return this.userRepository.save(user);
  }
  
  async removeAdminRole(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = UserRole.USER;
    return this.userRepository.save(user);
  }
  async createSuperAdmin(username: string, password:string): Promise<User> {
    
    // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
    const hashedPassword = await bcrypt.hash(password, process.env.SALT_ROUNDS || 10);
    const user = await this.userRepository.create({
    username: username,
    password: hashedPassword,
    role: UserRole.SUPER_ADMIN})
    return this.userRepository.save(user);
  }
}

