import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LogInDto, SignUpDto, UpdateUserDto } from './dto';
import { BasicResponse, LoginReponse } from 'src/interfaces';
import { Follow, User } from './schemas';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Follow.name) private followModel: Model<Follow>,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<BasicResponse> {
    try {
      const existEmail = await this.userModel.findOne({
        email: signUpDto.email,
      });
      if (existEmail) {
        throw new HttpException('Email already exist', HttpStatus.CONFLICT);
      }

      const existUsername = await this.userModel.findOne({
        username: signUpDto.username,
      });
      if (existUsername) {
        throw new HttpException(
          'Username is already exist',
          HttpStatus.CONFLICT,
        );
      }

      const hash = await bcrypt.hash(signUpDto.password, 10);

      const createUser: User = {
        email: signUpDto.email,
        username: signUpDto.username,
        password: hash,
        fullname: null,
        photo: null,
      };

      const createdUser = await new this.userModel(createUser).save();
      if (!createdUser) {
        throw new HttpException(
          'Error when insert to database',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const resp: BasicResponse = {
        statusCode: HttpStatus.OK,
        message: `Account ${signUpDto.username} successfully created. Please login!`,
      };

      return resp;
    } catch (error) {
      if (!error.status) {
        error.status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
      throw new HttpException(error.message, error.status);
    }
  }

  async logIn(logInDto: LogInDto): Promise<BasicResponse> {
    try {
      const existUser = await this.userModel.findOne({
        $or: [{ username: logInDto.username }, { email: logInDto.username }],
      });
      if (!existUser) {
        throw new HttpException(
          'Username or email does not exist',
          HttpStatus.NOT_FOUND,
        );
      }

      const passMatch = await bcrypt.compare(
        logInDto.password,
        existUser.password,
      );
      if (!passMatch) {
        throw new HttpException(
          'The password you entered is incorrect',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const payload = {
        userID: existUser.id,
        username: existUser.username,
        email: existUser.email,
        fullname: existUser.fullname,
      };

      const token = this.jwtService.sign(payload, {
        secret: process.env.JWT_TOKEN_SECRET,
        expiresIn: process.env.JWT_TOKEN_EXPIRE,
      });

      const loginResp: LoginReponse = {
        userID: existUser.id,
        token: token,
      };

      const resp: BasicResponse = {
        statusCode: HttpStatus.OK,
        message: 'Login succes',
        data: loginResp,
      };

      return resp;
    } catch (error) {
      if (!error.status) {
        error.status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
      throw new HttpException(error.message, error.status);
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    // file: ParameterDecorator,
  ): Promise<BasicResponse> {
    try {
      const existEmail = await this.userModel.findOne({
        email: updateUserDto.email,
      });
      if (existEmail && existEmail.id != id) {
        throw new HttpException('Email already exist', HttpStatus.CONFLICT);
      }

      const existUsername = await this.userModel.findOne({
        username: updateUserDto.username,
      });
      if (existUsername && existUsername.id != id) {
        throw new HttpException(
          'Username is already exist',
          HttpStatus.CONFLICT,
        );
      }

      // upload to S3

      const updatedUser = await this.userModel.findByIdAndUpdate(id, {
        $set: { ...updateUserDto },
      });
      if (!updatedUser) {
        throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
      }

      const resp: BasicResponse = {
        statusCode: HttpStatus.OK,
        message: `Account ${updateUserDto.username} successfully updated`,
      };

      return resp;
    } catch (error) {
      if (!error.status) {
        error.status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
      throw new HttpException(error.message, error.status);
    }
  }

  async follow(id: string, userID: string): Promise<BasicResponse> {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
      }

      const isFollowed = await this.followModel.findOne({
        user_id: userID,
        follow: id,
      });
      if (isFollowed) {
        throw new HttpException('User already followed', HttpStatus.CONFLICT);
      }

      const follow: Follow = {
        user_id: userID,
        follow: id,
      };

      const followed = await new this.followModel(follow).save();
      if (!followed) {
        throw new HttpException(
          'Error when insert to table like',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const resp: BasicResponse = {
        statusCode: HttpStatus.OK,
        message: 'Success',
      };

      return resp;
    } catch (error) {
      if (!error.status) {
        error.status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
      throw new HttpException(error.message, error.status);
    }
  }

  async unfollow(id: string, userID: string): Promise<BasicResponse> {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
      }

      const unfollow = await this.followModel.findOneAndDelete({
        user_id: userID,
        follow: id,
      });
      if (!unfollow) {
        throw new HttpException('User already unfollowed', HttpStatus.CONFLICT);
      }

      const resp: BasicResponse = {
        statusCode: HttpStatus.OK,
        message: 'Success',
      };

      return resp;
    } catch (error) {
      if (!error.status) {
        error.status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
      throw new HttpException(error.message, error.status);
    }
  }
}
