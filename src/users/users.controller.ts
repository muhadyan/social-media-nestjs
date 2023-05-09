import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  UploadedFile,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { LogInDto, SignUpDto, UpdateUserDto } from './dto';
import { BasicResponse } from 'src/interfaces';

@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  @HttpCode(200)
  signUp(@Body() signUpDto: SignUpDto): Promise<BasicResponse> {
    return this.usersService.signUp(signUpDto);
  }

  @Post('login')
  @HttpCode(200)
  logIn(@Body() logInDto: LogInDto): Promise<BasicResponse> {
    return this.usersService.logIn(logInDto);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('photo'))
  update(
    @Param('id') id: string,
    // @UploadedFile() file: ParameterDecorator,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }
}
