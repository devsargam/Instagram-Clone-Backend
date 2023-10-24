import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { IJwtUser } from 'src/shared/interfaces';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':postId')
  create(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: IJwtUser,
  ) {
    return this.commentsService.create(postId, createCommentDto, user);
  }

  @Get()
  findAll(@GetUser() user: IJwtUser) {
    return this.commentsService.findAll(user);
  }

  @Get(':commmentId')
  findOne(@Param('commentId') id: string) {
    return this.commentsService.findOne(id);
  }

  @Patch(':commentId')
  update(
    @Param('commentId') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser() user: IJwtUser,
  ) {
    return this.commentsService.update(id, updateCommentDto, user);
  }

  @Delete(':commentId')
  remove(@Param('commentId') id: string, @GetUser() user: IJwtUser) {
    return this.commentsService.remove(id, user);
  }
}
