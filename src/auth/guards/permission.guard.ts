import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UserService } from 'src/users/users.service';
import { AuthService } from '../auth.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    
    const request = context.switchToHttp().getRequest();
    const user = request.user; 
    const requiredPermission = this.reflector.get<Permissions>('permission', context.getHandler());

    // Check if the user is logged in
    if (!user) {
      throw new UnauthorizedException('You must be logged in to access this resource');
    }

    // If no permission is required, allow access
    if (!requiredPermission) {
      return true; 
    }

    const user_object = await this.userService.findOne(user.sub);

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
