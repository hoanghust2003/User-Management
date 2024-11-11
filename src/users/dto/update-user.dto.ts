import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: 'The username of the user' })
  @IsString()
  @IsNotEmpty()
  username: string;
}