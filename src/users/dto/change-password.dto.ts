import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: 'The old password of the user' })
  @IsString()
  @IsNotEmpty()
  @Length(8, undefined)
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
  @Matches(/[\W_]/, { message: 'Password must contain at least one special character.' })
  oldpassword: string;

  @ApiProperty({ description: 'The new password of the user' })
  @IsString()
  @IsNotEmpty()
  @Length(8, undefined)
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
  @Matches(/[\W_]/, { message: 'Password must contain at least one special character.' })
  newpassword: string;
}