import { OmitType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LogInDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class SignUpDto extends LogInDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class UpdateUserDto extends OmitType(SignUpDto, ['password'] as const) {
  @IsString()
  @IsNotEmpty()
  fullname: string;
}
