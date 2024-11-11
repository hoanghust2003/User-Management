import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { PermissionGuard } from './guards/permission.guard';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Permission } from 'src/common/decorator/permission.decorator';
import { AuthGuard } from './guards/auth.guard';
import { Permissions } from 'src/common/enums/permissions.enum';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'User logged in successfully.' })
  async signIn(@Body() authDto: AuthDto) {
    return await this.authService.signIn(authDto.username, authDto.password);
  }

  @UseGuards(AuthGuard, PermissionGuard)
  @Post('signup')
  @Permission(Permissions.REGISTER)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  async register(@Body() authDto: AuthDto) {
    return await this.authService.signUp(authDto);
  }
}