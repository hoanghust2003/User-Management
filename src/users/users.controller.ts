import { Body, Controller, Delete, Get, Param, Post, Put, Request, UploadedFile, UseGuards, UseInterceptors, ParseIntPipe } from '@nestjs/common';
import { UserService } from './users.service';
import { User } from '../entities/user.entity';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadImageDto } from 'src/common/dtos/uploadImages.dto';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { Permission } from 'src/common/decorator/permission.decorator';
import { SuperAdminGuard } from 'src/auth/guards/superadmin.guard';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Permission('view_list_users')
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('me')
  getProfile(@Request() req) {
    const id = req.user.sub;
    return this.userService.findOne(id);
  }

  @Put('me/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@Request() req, @UploadedFile() file: Express.Multer.File, @Body() uploadImageDto: UploadImageDto) {
    const userId = req.user.sub; // Lấy userId từ request
    return this.userService.updateProfileImage(userId, uploadImageDto, file); // Truyền userId, uploadImageDto, và file
  }

  @Put('me')
  async updateProfile(@Request() req, @Body() body: { username: string }): Promise<User> {
    const id = req.user.sub;
    return this.userService.updateUser(id, body.username);
  }

  @Put('me/password')
  async changeProfilePassword(@Request() req, @Body() body: { oldpassword: string, newpassword: string }): Promise<User> {
    const id = req.user.sub;
    return this.userService.updatePassword(id, body.oldpassword, body.newpassword);
  }

  @Delete('me')
  async removeProfile(@Request() req): Promise<void> {
    const id = req.user.sub;
    return this.userService.removeUser(id);
  }

  @Put(':id/image')
  @UseInterceptors(FileInterceptor('image'))
  @Permission('update_other_user_image') // Quyền cập nhật hình ảnh của người dùng khác
  async changeAvatarOfOtherUser(
    @Param('id', ParseIntPipe) userId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadImageDto: UploadImageDto
  ) {
    return this.userService.updateProfileImage(userId, uploadImageDto, file); // Truyền userId, uploadImageDto, và file
  }

  @Get(':id')
  @Permission('view_user') // Quyền xem thông tin người dùng
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @Permission('update_user') // Quyền cập nhật thông tin người dùng
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: { username: string }): Promise<User> {
    return this.userService.updateUser(id, body.username);
  }

  @Put(':id/password')
  @Permission('change_user_password') // Quyền thay đổi mật khẩu của người dùng
  async changePassword(@Param('id', ParseIntPipe) id: number, @Body() body: { oldpassword: string, newpassword: string }): Promise<User> {
    return this.userService.updatePassword(id, body.oldpassword, body.newpassword);
  }

  @Delete(':id')
  @Permission('delete_user') // Quyền xóa người dùng
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.removeUser(id);
  }

  @UseGuards(SuperAdminGuard)
  @Put(':id/roles/admin')
  async addRole(@Param('id', ParseIntPipe) id: number, @Body('roles') roles: string[]): Promise<User> {
    return this.userService.assignAdminRole(id);
  }

  @UseGuards(SuperAdminGuard)
  @Delete(':id/roles/admin')
  async removeRole(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.removeAdminRole(id);
  }

  @Post('superadmin')
  async createSuperAdmin(@Body() body: { username: string, password: string }): Promise<User> {
    return this.userService.createSuperAdmin(body.username, body.password);
  }
}
