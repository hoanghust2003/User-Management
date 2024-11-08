import { IsArray, IsEnum } from 'class-validator';
import { Permissions } from 'src/common/enums/permissions.enum';

export class PermissionArrayDto {
  @IsArray()
  @IsEnum(Permissions, { each: true })
  permissions: Permissions[];
}
