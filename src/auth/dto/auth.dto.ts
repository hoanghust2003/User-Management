import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({ description: 'The username of the user' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'The password of the user' })
  @IsString()
  @IsNotEmpty()
  @Length(8, undefined)
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
  @Matches(/[\W_]/, { message: 'Password must contain at least one special character.' })
  password: string;
}