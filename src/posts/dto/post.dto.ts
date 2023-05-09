import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  caption: string;

  @IsDate()
  @IsOptional()
  updated_at: Date;
}

export class UpdatePostDto extends CreatePostDto {}
