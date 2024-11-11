import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Express } from 'express';

export class UploadImageDto {
  @ApiProperty({ description: 'The image file', type: 'string', format: 'binary' })
  @IsNotEmpty()
  image: Express.Multer.File;
}