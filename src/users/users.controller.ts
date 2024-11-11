import { Body, Controller, Delete, Get, Param, Put, Request, UploadedFile, UseGuards, UseInterceptors, ParseIntPipe } from '@nestjs/common';
import { UserService } from './users.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadImageDto } from 'src/users/dto/upload-image.dto';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { Permission } from 'src/common/decorator/permission.decorator';
import { SuperAdminGuard } from 'src/auth/guards/superadmin.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Permissions } from 'src/common/enums/permissions.enum';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Permission(Permissions.VIEW_LIST_USERS) 
  async findAll(): Promise<object[]> {
    return await this.userService.findAll();
  }

  @Get('me')
  async getProfile(@Request() req) {
    const id = req.user.sub;
    return await this.userService.findOne(id);
  }

  @Put('me/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@Request() req, @UploadedFile() file: Express.Multer.File, @Body() uploadImageDto: UploadImageDto) {
    const userId = req.user.sub; 
    return await this.userService.updateProfileImage(userId, uploadImageDto, file); // Truyền userId, uploadImageDto, và file
  }

  @Put('me')
  async updateProfile(@Request() req, @Body() updateUserDto : UpdateUserDto): Promise<object> {
    const id = req.user.sub;
    return await this.userService.updateUser(id, updateUserDto.username);
  }

  @Put('me/password')
  async changeProfilePassword(@Request() req, @Body() changePasswordDto : ChangePasswordDto): Promise<object> {
    const id = req.user.sub;
    return await this.userService.updatePassword(id, changePasswordDto.oldpassword, changePasswordDto.newpassword);
  }

  @Delete('me')
  async removeProfile(@Request() req): Promise<void> {
    const id = req.user.sub;
    return await this.userService.removeUser(id);
  }

  @Put(':id/image')
  @UseInterceptors(FileInterceptor('image'))
  @Permission(Permissions.UPDATE_OTHER_USER_IMAGE) 
  async changeAvatarOfOtherUser(
    @Param('id', ParseIntPipe) userId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadImageDto: UploadImageDto
  ) {
    return await this.userService.updateProfileImage(userId, uploadImageDto, file); 
  }

  @Get(':id')
  @Permission(Permissions.VIEW_OTHER_USER) 
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<object> {
    return await this.userService.findOne(id);
  }

  @Put(':id')
  @Permission(Permissions.UPDATE_OTHER_USER) 
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto): Promise<object> {
    return await this.userService.updateUser(id, updateUserDto.username);
  }

  @Put(':id/password')
  @Permission(Permissions.CHANGE_OTHER_USER_PASSWORD) 
  async changePassword(@Param('id', ParseIntPipe) id: number, @Body() changePasswordDto : ChangePasswordDto): Promise<object> {
    return await this.userService.updatePassword(id, changePasswordDto.oldpassword, changePasswordDto.newpassword);
  }

  @Delete(':id')
  @Permission(Permissions.DELETE_OTHER_USER)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.userService.removeUser(id);
  }

  @UseGuards(SuperAdminGuard)
  @Put(':id/roles/admin')
  async addRole(@Param('id', ParseIntPipe) id: number): Promise<object> {
    return await this.userService.assignAdminRole(id);
  }

  @UseGuards(SuperAdminGuard)
  @Delete(':id/roles/admin')
  async removeRole(@Param('id', ParseIntPipe) id: number): Promise<object> {
    return await this.userService.removeAdminRole(id);
  }
}
