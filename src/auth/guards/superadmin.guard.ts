import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthService } from '../auth.service'; // hoặc đường dẫn thích hợp

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = await this.authService.findOne(request.user.sub); // Người dùng đã đăng nhập


    if (user.role === 'superadmin') {
      return true; // Nếu là SuperAdmin, cho phép truy cập
    }

    throw new ForbiddenException('You do not have permission to access this resource');
  }
}
