import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Headers,
  HttpCode,
  UseInterceptors,
  Put,
  Query,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto';
import { BasicResponse, BasicQuery } from 'src/interfaces';
import { SharedService } from 'src/shared/shared.service';
import { CreateCommentDto } from './dto/comment.dto';

@Controller({ path: 'posts', version: '1' })
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private sharedService: SharedService,
  ) {}

  @Post()
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('photo'))
  create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: ParameterDecorator,
    @Headers() header: ParameterDecorator,
  ): Promise<BasicResponse> {
    const userID = this.sharedService.getUserIdFromToken(header);
    return this.postsService.create(createPostDto, userID, file);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('photo'))
  update(
    @Param('id') id: string,
    @UploadedFile() file: ParameterDecorator,
    @Body() updatePostDto: UpdatePostDto,
    @Headers() header: ParameterDecorator,
  ): Promise<BasicResponse> {
    const userID = this.sharedService.getUserIdFromToken(header);
    return this.postsService.update(id, userID, updatePostDto, file);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @Headers() header: ParameterDecorator,
  ): Promise<BasicResponse> {
    const userID = this.sharedService.getUserIdFromToken(header);
    return this.postsService.delete(id, userID);
  }

  @Get('mine')
  findAllMine(
    @Query() query: BasicQuery,
    @Headers() header: ParameterDecorator,
  ): Promise<BasicResponse> {
    const userID = this.sharedService.getUserIdFromToken(header);
    return this.postsService.findAllMine(userID, query);
  }

  @Get('follow')
  findAllFollow(
    @Query() query: BasicQuery,
    @Headers() header: ParameterDecorator,
  ): Promise<BasicResponse> {
    const userID = this.sharedService.getUserIdFromToken(header);
    return this.postsService.findAllFollow(userID, query);
  }

  @Post(':id/like')
  @HttpCode(200)
  like(
    @Param('id') id: string,
    @Headers() header: ParameterDecorator,
  ): Promise<BasicResponse> {
    const userID = this.sharedService.getUserIdFromToken(header);
    return this.postsService.like(id, userID);
  }

  @Post(':id/unlike')
  @HttpCode(200)
  unlike(
    @Param('id') id: string,
    @Headers() header: ParameterDecorator,
  ): Promise<BasicResponse> {
    const userID = this.sharedService.getUserIdFromToken(header);
    return this.postsService.unlike(id, userID);
  }

  @Post(':id/comment')
  @HttpCode(200)
  comment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @Headers() header: ParameterDecorator,
  ): Promise<BasicResponse> {
    const userID = this.sharedService.getUserIdFromToken(header);
    return this.postsService.comment(id, userID, createCommentDto);
  }
}
