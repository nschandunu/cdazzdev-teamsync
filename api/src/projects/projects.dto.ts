import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'New Mobile App' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false, example: 'React Native rebuild' })
  @IsString()
  @IsOptional()
  description?: string;
}