import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Comment, Like, Post } from './schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePostDto, UpdatePostDto } from './dto';
import { BasicQuery, BasicResponse } from 'src/interfaces';
import { Follow, User } from 'src/users/schemas';
import { CreateCommentDto } from './dto/comment.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Follow.name) private followModel: Model<Follow>,
    @InjectModel(Like.name) private likeModel: Model<Like>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    userID: string,
  ): Promise<BasicResponse> {
    try {
      const existUser = await this.userModel.findById(userID);
      if (!existUser) {
        throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
      }

      // upload to S3

      const createPost: Post = {
        user_id: userID,
        title: createPostDto.title,
        caption: createPostDto.caption,
        photo: null, // should be aws photo url
        likes: 0,
        comments: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const createdPost = await new this.postModel(createPost).save();
      if (!createdPost) {
        throw new HttpException(
          'Error when insert to database',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const resp: BasicResponse = {
        statusCode: HttpStatus.OK,
        message: 'Post successfully created',
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
    userID: string,
    updatePostDto: UpdatePostDto,
    // file: ParameterDecorator,
  ): Promise<BasicResponse> {
    try {
      const existPost = await this.postModel.findById(id);
      if (!existPost) {
        throw new HttpException('Post does not exist', HttpStatus.NOT_FOUND);
      }
      if (existPost.user_id != userID) {
        throw new HttpException(
          'You are unauthorized to update this post',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // upload to S3

      updatePostDto.updated_at = new Date();
      const updatedPost = await this.postModel.findByIdAndUpdate(id, {
        $set: { ...updatePostDto },
      });
      if (!updatedPost) {
        throw new HttpException(
          'Error when update to database',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const resp: BasicResponse = {
        statusCode: HttpStatus.OK,
        message: 'Post successfully updated',
      };

      return resp;
    } catch (error) {
      if (!error.status) {
        error.status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
      throw new HttpException(error.message, error.status);
    }
  }

  async delete(id: string, userID: string): Promise<BasicResponse> {
    try {
      const existPost = await this.postModel.findById(id);
      if (!existPost) {
        throw new HttpException('Post does not exist', HttpStatus.NOT_FOUND);
      }
      if (existPost.user_id != userID) {
        throw new HttpException(
          'You are unauthorized to delete this post',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const deletedPost = await this.postModel.findByIdAndDelete(id);
      if (!deletedPost) {
        throw new HttpException(
          'Error when delete to database',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const resp: BasicResponse = {
        statusCode: HttpStatus.OK,
        message: 'Post successfully deleted',
      };

      return resp;
    } catch (error) {
      if (!error.status) {
        error.status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
      throw new HttpException(error.message, error.status);
    }
  }

  async findAllMine(userID: string, query: BasicQuery): Promise<BasicResponse> {
    try {
      let skip = 0;
      let page = 1;
      let limit = 10;
      let filter = {
        user_id: userID,
      };

      if (query.search) {
        filter = Object.assign(filter, {
          title: { $regex: query.search, $options: 'i' },
        });
      }

      if (query.limit) {
        limit = parseInt(query.limit);
      }

      if (query.page) {
        page = parseInt(query.page);
        skip = (page - 1) * limit;
      }

      const data = await this.postModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort('created_at');

      const total = await this.postModel.count(filter);

      const resp: BasicResponse = {
        statusCode: HttpStatus.OK,
        message: 'Success',
        data: data,
        meta: {
          total: total,
          page: page,
          last_page: Math.ceil(total / limit),
        },
      };

      return resp;
    } catch (error) {
      if (!error.status) {
        error.status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
      throw new HttpException(error.message, error.status);
    }
  }

  async findAllFollow(
    userID: string,
    query: BasicQuery,
  ): Promise<BasicResponse> {
    try {
      let skip = 0;
      let page = 1;
      let limit = 10;
      let usersFollowed = [];

      const follows = await this.followModel.find({ user_id: userID });
      if (follows.length == 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Success',
          data: [],
        };
      }

      follows.forEach((e) => {
        usersFollowed.push(e.follow);
      });

      let filter = {
        user_id: { $in: usersFollowed },
      };

      if (query.search) {
        filter = Object.assign(filter, {
          title: { $regex: query.search, $options: 'i' },
        });
      }

      if (query.limit) {
        limit = parseInt(query.limit);
      }

      if (query.page) {
        page = parseInt(query.page);
        skip = (page - 1) * limit;
      }

      const data = await this.postModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort('created_at');

      const total = await this.postModel.count(filter);

      const resp: BasicResponse = {
        statusCode: HttpStatus.OK,
        message: 'Success',
        data: data,
        meta: {
          total: total,
          page: page,
          last_page: Math.ceil(total / limit),
        },
      };

      return resp;
    } catch (error) {
      if (!error.status) {
        error.status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
      throw new HttpException(error.message, error.status);
    }
  }

  async like(id: string, userID: string): Promise<BasicResponse> {
    try {
      const post = await this.postModel.findById(id);
      if (!post) {
        throw new HttpException('Post does not exist', HttpStatus.NOT_FOUND);
      }

      const isLiked = await this.likeModel.findOne({
        post_id: id,
        liked_by: userID,
      });
      if (isLiked) {
        throw new HttpException('Post already liked', HttpStatus.CONFLICT);
      }

      const likeCounted = await this.postModel.findByIdAndUpdate(id, {
        $set: { likes: post.likes + 1 },
      });
      if (!likeCounted) {
        throw new HttpException(
          'Error when update to table post',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const like: Like = {
        post_id: id,
        liked_by: userID,
      };

      const liked = await new this.likeModel(like).save();
      if (!liked) {
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

  async unlike(id: string, userID: string): Promise<BasicResponse> {
    try {
      const post = await this.postModel.findById(id);
      if (!post) {
        throw new HttpException('Post does not exist', HttpStatus.NOT_FOUND);
      }

      const unlike = await this.likeModel.findOneAndDelete({
        post_id: id,
        liked_by: userID,
      });
      if (!unlike) {
        throw new HttpException('Post already unliked', HttpStatus.CONFLICT);
      }

      const unlikeCounted = await this.postModel.findByIdAndUpdate(id, {
        $set: { likes: post.likes - 1 },
      });
      if (!unlikeCounted) {
        throw new HttpException(
          'Error when update to table post',
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

  async comment(
    id: string,
    userID: string,
    createCommentDto: CreateCommentDto,
  ): Promise<BasicResponse> {
    try {
      const post = await this.postModel.findById(id);
      if (!post) {
        throw new HttpException('Post does not exist', HttpStatus.NOT_FOUND);
      }

      const commentCounted = await this.postModel.findByIdAndUpdate(id, {
        $set: { comments: post.comments + 1 },
      });
      if (!commentCounted) {
        throw new HttpException(
          'Error when update to table post',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const comment: Comment = {
        post_id: id,
        commented_by: userID,
        comment: createCommentDto.comment,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const createdComment = await new this.commentModel(comment).save();
      if (!createdComment) {
        throw new HttpException(
          'Error when insert to database',
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
}
