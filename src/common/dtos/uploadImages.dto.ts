// src/users/dto/upload-image.dto.ts
import { IsNotEmpty } from 'class-validator';

export class UploadImageDto {
  @IsNotEmpty()
  image: any; // Type can be more specific based on your needs
}
