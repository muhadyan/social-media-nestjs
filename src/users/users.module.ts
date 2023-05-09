import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Follow, FollowSchema, User, UserSchema } from './schemas';
import { SharedDecodedToken } from 'src/shared/shared.service';

@Module({
  imports: [
    JwtModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Follow.name, schema: FollowSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, SharedDecodedToken],
})
export class UsersModule {}
