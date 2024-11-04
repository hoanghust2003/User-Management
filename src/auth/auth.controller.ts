import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PermissionGuard } from './guards/permission.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from '../common/dtos/register.dto';
import { Permission } from 'src/common/decorator/permission.decorator';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    // console.log('Đang cố gắng đăng nhập với dữ liệu:', signInDto);

    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @UseGuards(AuthGuard, PermissionGuard)
  @Post('users')
  @Permission('register') 
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.signUp(registerDto);
  }
}
