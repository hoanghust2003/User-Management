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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { User } from 'src/entities/user.entity';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Permission(Permissions.VIEW_LIST_USERS)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users.' })
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get profile of the logged-in user' })
  @ApiResponse({ status: 200, description: 'Return the profile of the logged-in user.' })
  async getProfile(@Request() req): Promise<User> {
    const id = req.user.sub;
    return await this.userService.findOne(id);
  }

  @Put('me/image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Upload profile image' })
  @ApiResponse({ status: 200, description: 'Profile image uploaded successfully.' })
  @ApiConsumes('multipart/form-data')
  async uploadImage(@Request() req, @UploadedFile() file: Express.Multer.File, @Body() uploadImageDto: UploadImageDto): Promise<User> {
    const userId = req.user.sub;
    return await this.userService.updateProfileImage(userId, uploadImageDto, file);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    const id = req.user.sub;
    return await this.userService.updateUser(id, updateUserDto.username);
  }

  @Put('me/password')
  @ApiOperation({ summary: 'Change profile password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully.' })
  async changeProfilePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto): Promise<User> {
    const id = req.user.sub;
    return await this.userService.updatePassword(id, changePasswordDto.oldpassword, changePasswordDto.newpassword);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete profile' })
  @ApiResponse({ status: 200, description: 'Profile deleted successfully.' })
  async removeProfile(@Request() req): Promise<void> {
    const id = req.user.sub;
    const user = await this.userService.findOne(id);
    if (user.role === 'superadmin') {
      throw new Error('Superadmin cannot be deleted.');
    }
    await this.userService.removeUser(id);
  }

  @Put(':id/image')
  @UseInterceptors(FileInterceptor('image'))
  @Permission(Permissions.UPDATE_OTHER_USER_IMAGE)
  @ApiOperation({ summary: 'Change avatar of another user' })
  @ApiResponse({ status: 200, description: 'Avatar changed successfully.' })
  @ApiConsumes('multipart/form-data')
  async changeAvatarOfOtherUser(
    @Param('id', ParseIntPipe) userId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadImageDto: UploadImageDto
  ): Promise<User> {
    return await this.userService.updateProfileImage(userId, uploadImageDto, file);
  }

  @Get(':id')
  @Permission(Permissions.VIEW_OTHER_USER)
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'Return the user by ID.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return await this.userService.findOne(id);
  }

  @Put(':id')
  @Permission(Permissions.UPDATE_OTHER_USER)
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return await this.userService.updateUser(id, updateUserDto.username);
  }

  @Put(':id/password')
  @Permission(Permissions.CHANGE_OTHER_USER_PASSWORD)
  @ApiOperation({ summary: 'Change password of another user' })
  @ApiResponse({ status: 200, description: 'Password changed successfully.' })
  async changePassword(@Param('id', ParseIntPipe) id: number, @Body() changePasswordDto: ChangePasswordDto): Promise<User> {
    return await this.userService.updatePassword(id, changePasswordDto.oldpassword, changePasswordDto.newpassword);
  }

  @Delete(':id')
  @Permission(Permissions.DELETE_OTHER_USER)
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.userService.removeUser(id);
  }

  @UseGuards(SuperAdminGuard)
  @Put(':id/roles/admin')
  @ApiOperation({ summary: 'Assign admin role to a user' })
  @ApiResponse({ status: 200, description: 'Admin role assigned successfully.' })
  async addRole(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return await this.userService.assignAdminRole(id);
  }

  @UseGuards(SuperAdminGuard)
  @Delete(':id/roles/admin')
  @ApiOperation({ summary: 'Remove admin role from a user' })
  @ApiResponse({ status: 200, description: 'Admin role removed successfully.' })
  async removeRole(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return await this.userService.removeAdminRole(id);
  }
}