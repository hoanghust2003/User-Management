import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UploadImageDto } from 'src/common/dtos/uploadImages.dto';
import path from 'path';
import * as fs from 'fs';


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

    const uploadPath = path.resolve(__dirname, '../../uploads');
    // Tạo thư mục để lưu ảnh nếu chưa tồn tại
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }

    // Tạo tên file duy nhất (có thể sử dụng thư viện như uuid hoặc nanoid để tạo tên file)
    const fileName = `${userId}-${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadPath, fileName);

    // Lưu file vào thư mục uploads
    fs.writeFileSync(filePath, file.buffer);

    // Cập nhật đường dẫn ảnh cho user
    user.profileImage = filePath; 
    await this.userRepository.save(user);

    return user;
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

  async removeUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

}
