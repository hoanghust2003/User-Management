import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { In, Repository } from 'typeorm';
import { GroupPermission } from 'src/entities/group_permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserGroup } from 'src/entities/user_group.entity';
import { RegisterDto } from '../common/dtos/register.dto'; // Import DTO
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
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(registerDto: RegisterDto): Promise<void> {
    const { username, password } = registerDto;

    // Kiểm tra xem tên đăng nhập đã tồn tại chưa
    const existingUser = await this.userService.findOneByUsername(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Lưu người dùng mới vào cơ sở dữ liệu
    await this.userService.createUser({
      username,
      password: hashedPassword,
    });
  }

  async findOne(id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  // Kiểm tra xem người dùng có quyền hay không
  async hasPermission(userId: number, permission: Permissions): Promise<boolean> {
    // Lấy tất cả UserGroup của người dùng
    const userGroups = await this.userGroupRepository.find({
      where: { user: { id: userId } },
      relations: ['group'],
    });

    // Lấy tất cả permissions của các group mà user thuộc về
    const groupIds = userGroups.map(ug => ug.group.id);
    
    // Tìm các permission trong bảng GroupPermission cho các group đó
    const permissions = await this.groupPermissionRepository.find({
      where: { group: { id: In(groupIds) }, permission: permission as unknown as string },
    });

    // Nếu tìm thấy quyền thì trả về true, ngược lại trả về false
    return permissions.length > 0;
  }
}
