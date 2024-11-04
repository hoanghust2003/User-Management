import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { UserRole } from 'src/entities/user_role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private authService: AuthService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Người dùng đã đăng nhập
    const requiredPermission = this.reflector.get<Permissions>('permission', context.getHandler());

    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!user) {
      throw new UnauthorizedException('You must be logged in to access this resource');
    }
    const user_object = await this.authService.findOne(user.sub);
    // Nếu không có yêu cầu permission, cho phép truy cập
    if (!requiredPermission) {
      return true; 
    }

    // Nếu là Admin, cho phép truy cập  
    if (user_object.role == 'admin'|| user_object.role == 'superadmin') {
      return true; 
    }

    // Kiểm tra xem người dùng có thuộc nhóm nào có quyền không
    const hasPermission = await this.authService.hasPermission(user.id, requiredPermission);
    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}
