import { IsString, Length } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @Length(3, 50)
  name: string;

  @IsString()
  @Length(0, 255)
  description: string;
}
