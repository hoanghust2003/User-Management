import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { GroupPermission } from 'src/entities/group-permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserGroup } from 'src/entities/user-group.entity';
import { AuthDto } from './dto/auth.dto'; // Import DTO
import * as bcrypt from 'bcrypt'; // Import bcrypt để mã hóa mật khẩu
import { User } from 'src/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(GroupPermission)
    private groupPermissionRepository: Repository<GroupPermission>,
    @InjectRepository(UserGroup)
    private userGroupRepository: Repository<UserGroup>,
  ) {}

  async signIn(
    username: string, 
    password: string
  ): Promise<{ access_token: string }> {
    const user = await this.userService.findOneByUsername(username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Kiểm tra mật khẩu đã được mã hóa
    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, sub: user.id };
    // console.log(process.env.JWT_SECRET);
    return {
      access_token: await this.jwtService.signAsync(payload, { secret: process.env.JWT_SECRET }),
    };
  }

  async signUp(authDto: AuthDto): Promise<void> {
    const { username, password } = authDto;

    // Kiểm tra xem tên đăng nhập đã tồn tại chưa
    const existingUser = await this.userService.findOneByUsername(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
    const hashedPassword = await bcrypt.hash(password, process.env.SALT_ROUNDS || 10);

    // Lưu người dùng mới vào cơ sở dữ liệu
    await this.userService.createUser({
      username,
      password: hashedPassword,
    });
  }

  async findOne(id: number): Promise<User> {
    return await this.userService.findOne(id);
  }

  // Kiểm tra xem người dùng có quyền hay không
  async hasPermission(userId: number, permission: Permissions): Promise<boolean> { 
    const result = await this.groupPermissionRepository
      .createQueryBuilder('groupPermission')
      .innerJoin('groupPermission.group', 'group')
      .innerJoin('group.userGroups', 'userGroup')
      .where('userGroup.user.id = :userId', { userId })
      .andWhere('groupPermission.permission = :permission', { permission })
      .getOne();
  
    // Nếu tìm thấy quyền, trả về true, nếu không trả về false
    return !!result;
  }
  
}
