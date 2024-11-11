import { IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGroupDto {
  @ApiProperty({ description: 'The name of the group', required: false })
  @IsString()
  @Length(3, 50)
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'The description of the group', required: false })
  @IsString()
  @IsOptional()
  @Length(0, 255)
  description?: string;
}