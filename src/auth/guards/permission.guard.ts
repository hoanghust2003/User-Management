import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private authService: AuthService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    
    const request = context.switchToHttp().getRequest();
    const user = request.user; 
    const requiredPermission = this.reflector.get<Permissions>('permission', context.getHandler());

    // Check if the user is logged in
    if (!user) {
      throw new UnauthorizedException('You must be logged in to access this resource');
    }
    const user_object = await this.authService.findOne(user.sub);
    // If no permission is required, allow access
    if (!requiredPermission) {
      return true; 
    }

    // If the user is an admin or super admin, allow access  
    if (user_object.role === UserRole.ADMIN || user_object.role === UserRole.SUPER_ADMIN) {
      return true; 
    }

    // Check if the user has the required permission
    const hasPermission = await this.authService.hasPermission(user.sub, requiredPermission);
    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}
