import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { UserService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { GroupPermission } from 'src/entities/group-permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthDto } from './dto/auth.dto'; // Import DTO
import * as bcrypt from 'bcrypt'; // Import bcrypt để mã hóa mật khẩu
import { User } from 'src/entities/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(GroupPermission)
    private groupPermissionRepository: Repository<GroupPermission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private readonly HAS_PERMISSION_CACHE_KEY = ':has-permission:';
  private readonly USERS_CACHE_KEY = 'users';
  private readonly CACHE_TTL = 30000;

  async signIn(
    username: string, 
    password: string
  ): Promise<{ access_token: string }> {
    const user = await this.userRepository
    .createQueryBuilder('user')
    .addSelect('user.password')
    .where('user.username = :username', { username: username })
    .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if the password is correct
    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, sub: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(authDto: AuthDto): Promise<User> {
    const { username, password } = authDto;

    // Check if the username already exists
    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Encrypt the password
    const hashedPassword = await bcrypt.hash(password, process.env.SALT_ROUNDS || 10);

    // Save the user to the database
    const userData: Partial<User> = {
      username,
      password: hashedPassword,
    };

    const user = this.userRepository.create(userData);
    const savedUser = await this.userRepository.save(user);

    await this.cacheManager.del(this.USERS_CACHE_KEY);
    await this.cacheManager.del(`/api/users`);
    return savedUser;
  }

  // Check if a user has a specific permission
  async hasPermission(userId: number, permission: Permissions): Promise<boolean> {
    // Check if the result is in the cache
    const cacheKey = userId + this.HAS_PERMISSION_CACHE_KEY + permission;
    const cachedResult = await this.cacheManager.get<boolean>(cacheKey);
    if (cachedResult !== undefined) {
      return cachedResult;
    }
    const result = await this.groupPermissionRepository
      .createQueryBuilder('groupPermission')
      .innerJoin('groupPermission.group', 'group')
      .innerJoin('group.userGroups', 'userGroup')
      .where('userGroup.user.id = :userId', { userId })
      .andWhere('groupPermission.permission = :permission', { permission })
      .getOne();

    // Save the result to the cache
    await this.cacheManager.set(cacheKey, !!result, this.CACHE_TTL);
    return !!result;
  }
  
}
