import { SetMetadata } from '@nestjs/common';
import { Permissions } from 'src/common/enums/permissions.enum';

export const PERMISSION_KEY = 'permission';
export const Permission = (permission: Permissions) => SetMetadata(PERMISSION_KEY, permission);
