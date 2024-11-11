import { IsArray, IsEnum } from 'class-validator';
import { Permissions } from 'src/common/enums/permissions.enum';
import { ApiProperty } from '@nestjs/swagger';

export class PermissionArrayDto {
  @ApiProperty({ description: 'Array of permissions', enum: Permissions, isArray: true })
  @IsArray()
  @IsEnum(Permissions, { each: true })
  permissions: Permissions[];
}