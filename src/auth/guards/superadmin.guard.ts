import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UserService } from 'src/users/users.service';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = await this.userService.findOne(request.user.sub);

    if (user.role === UserRole.SUPER_ADMIN) {
      return true; 
    }

    throw new ForbiddenException('You do not have permission to access this resource');
  }
}
