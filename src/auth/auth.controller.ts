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
import { AuthDto } from './dto/auth.dto';
import { Permission } from 'src/common/decorator/permission.decorator';
import { AuthGuard } from './guards/auth.guard';
import { Permissions } from 'src/common/enums/permissions.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() authDto: AuthDto) {
    return await this.authService.signIn(authDto.username, authDto.password);
  }

  @UseGuards(AuthGuard, PermissionGuard)
  @Post('signup')
  @Permission(Permissions.REGISTER) 
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(@Body() authDto: AuthDto) {
    return await this.authService.signUp(authDto);
  }
}
