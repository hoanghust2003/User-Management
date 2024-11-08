// update-group.dto.ts
import { IsString, IsOptional, Length } from 'class-validator';

export class UpdateGroupDto {
  @IsString()
  @Length(3, 50)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @Length(0, 255)
  description?: string;
}
