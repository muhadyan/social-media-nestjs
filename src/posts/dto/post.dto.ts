import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  caption: string;
}

export class UpdatePostDto extends CreatePostDto {
  @IsString()
  @IsOptional()
  photo: string;

  @IsDate()
  @IsOptional()
  updated_at: Date;
}
