import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenArray: string[] = req.headers['authorization'].split(' ');
      this.jwtService.verify(tokenArray[1], {
        secret: process.env.JWT_TOKEN_SECRET,
      });
      next();
    } catch (error) {
      if (error.message === 'jwt expired') {
        throw new HttpException('Sesi is over', HttpStatus.FORBIDDEN);
      } else if (error.message === 'invalid token') {
        throw new HttpException('Token is not valid', HttpStatus.FORBIDDEN);
      }
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }
}
