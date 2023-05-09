import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  Headers,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { LogInDto, SignUpDto, UpdateUserDto } from './dto';
import { BasicResponse } from 'src/interfaces';
import { SharedDecodedToken } from 'src/shared/shared.service';

@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private sharedDecodedToken: SharedDecodedToken,
  ) {}

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
    @Headers() header: ParameterDecorator,
  ): Promise<BasicResponse> {
    try {
      const userID = this.sharedDecodedToken.getUserIdFromToken(header);

      if (id != userID) {
        throw new HttpException(
          'You are unauthorized to update this profile',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return this.usersService.update(id, updateUserDto);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post(':id/follow')
  @HttpCode(200)
  follow(
    @Param('id') id: string,
    @Headers() header: ParameterDecorator,
  ): Promise<BasicResponse> {
    try {
      const userID = this.sharedDecodedToken.getUserIdFromToken(header);

      if (id == userID) {
        throw new HttpException(
          'Can not follow yourself',
          HttpStatus.BAD_REQUEST,
        );
      }

      return this.usersService.follow(id, userID);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post(':id/unfollow')
  @HttpCode(200)
  unfollow(
    @Param('id') id: string,
    @Headers() header: ParameterDecorator,
  ): Promise<BasicResponse> {
    try {
      const userID = this.sharedDecodedToken.getUserIdFromToken(header);

      if (id == userID) {
        throw new HttpException(
          'Can not unfollow yourself',
          HttpStatus.BAD_REQUEST,
        );
      }

      return this.usersService.unfollow(id, userID);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
