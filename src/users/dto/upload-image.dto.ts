// src/users/dto/upload-image.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadImageDto {
  @IsString()
  @IsNotEmpty()
  image: any; 
}
