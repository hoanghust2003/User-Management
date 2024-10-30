import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user_role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(username: string, password: string, role: UserRole): Promise<User> {
    const user = this.userRepository.create({ username, password, role });
    return this.userRepository.save(user);
  }
  async findOneByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateUser(id: number, username: string, role: UserRole): Promise<User> {
    await this.userRepository.update(id, { username, role });
    return this.findOne(id);
  }

  async removeUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
