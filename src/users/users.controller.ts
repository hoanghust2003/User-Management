import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UserService } from './users.service';
import { User } from '../entities/user.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserRole } from '../entities/user_role.enum';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() body: { username: string; password: string; role: UserRole }): Promise<User> {
    return this.userService.createUser(body.username, body.password, body.role);
  }
  @UseGuards(AuthGuard)
  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() body: { username: string; role: UserRole }): Promise<User> {
    return this.userService.updateUser(id, body.username, body.role);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.userService.removeUser(id);
  }
}
