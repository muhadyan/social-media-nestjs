import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { AuthMiddleware } from './middleware';
import { SharedModule } from './shared/shared.module';

dotenv.config();
@Module({
  imports: [
    UsersModule,
    PostsModule,
    SharedModule,
    JwtModule,
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'v1/users/signup', method: RequestMethod.POST },
        { path: 'v1/users/login', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
