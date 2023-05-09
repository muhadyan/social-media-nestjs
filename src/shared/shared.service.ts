import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SharedDecodedToken {
  constructor(private jwtService: JwtService) {}

  getUserIdFromToken(header: ParameterDecorator): string {
    try {
      const token = header['authorization'].split(' ')[1];
      const decodedToken = this.jwtService.decode(token);
      const userID = decodedToken['userID'];

      return userID;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
