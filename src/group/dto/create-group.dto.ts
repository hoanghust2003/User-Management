import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ description: 'The name of the group' })
  @IsString()
  @Length(3, 50)
  name: string;

  @ApiProperty({ description: 'The description of the group' })
  @IsString()
  @Length(0, 255)
  description: string;
}