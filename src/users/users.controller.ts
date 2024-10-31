import { Body, Controller, Delete, Get, Param, Post, Put, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './users.service';
import { User } from '../entities/user.entity';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadImageDto } from 'src/common/dtos/uploadImages.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  // @UseGuards(AuthPermissionGuard)
  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Post('upload-image/:id') 
@UseInterceptors(FileInterceptor('image'))
async uploadImage(@Param('id') userId: number, @UploadedFile() file: Express.Multer.File, @Body() uploadImageDto: UploadImageDto) {
    return this.userService.updateProfileImage(userId, uploadImageDto, file); // Truyền userId, uploadImageDto, và file
}
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() body: { username: string }): Promise<User> {
    return this.userService.updateUser(id, body.username);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.userService.removeUser(id);
  }
}
