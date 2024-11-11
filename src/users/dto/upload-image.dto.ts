import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadImageDto {
  @ApiProperty({ description: 'The image file' })
  @IsString()
  @IsNotEmpty()
  image: any;
}