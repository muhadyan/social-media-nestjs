import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Follow, FollowSchema, User, UserSchema } from 'src/users/schemas';
import {
  Comment,
  CommentSchema,
  Like,
  LikeSchema,
  Post,
  PostSchema,
} from './schemas';
import { SharedDecodedToken } from 'src/shared/shared.service';

@Module({
  imports: [
    JwtModule,
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: Follow.name, schema: FollowSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService, SharedDecodedToken],
})
export class PostsModule {}
