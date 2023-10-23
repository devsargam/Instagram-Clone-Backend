import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { GetUser } from 'src/decorators/get-user.decorator';
import { IJwtUser } from 'src/interfaces';
import { CreatePostDto, UpdatePostDto } from './dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto, @GetUser() user: IJwtUser) {
    return this.postsService.create(user, createPostDto);
  }

  @Get()
  findAll(@GetUser() user: IJwtUser) {
    return this.postsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @GetUser() user: IJwtUser,
  ) {
    return this.postsService.update(id, updatePostDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: IJwtUser) {
    return this.postsService.remove(id, user);
  }
}
