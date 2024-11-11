import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthService } from '../auth.service'; // hoặc đường dẫn thích hợp
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = await this.authService.findOne(request.user.sub);

    if (user.role === UserRole.SUPER_ADMIN) {
      return true; 
    }

    throw new ForbiddenException('You do not have permission to access this resource');
  }
}
