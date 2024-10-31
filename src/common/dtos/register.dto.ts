import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, undefined) // Độ dài tối thiểu 8 ký tự
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' }) // Có ít nhất 1 chữ cái viết hoa
  @Matches(/[\W_]/, { message: 'Password must contain at least one special character.' }) // Có ít nhất 1 ký tự đặc biệt
  password: string;
}
