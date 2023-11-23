import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { IJwtUser } from 'src/shared/interfaces';
import {
  CreatePostDto,
  UpdatePostDto,
  createPostSchema,
  updatePostSchema,
} from './dto';
import { ZodValidationPipe } from 'src/common/pipes/zod.pipe';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createPostSchema))
  @UseInterceptors(FilesInterceptor('images', 10))
  create(
    @Body() createPostDto: CreatePostDto,
    @GetUser() user: IJwtUser,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.postsService.create(user, createPostDto, images);
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
  @UsePipes(new ZodValidationPipe(updatePostSchema))
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

  @Get('/users/:username')
  async getParticularUserPosts(@Param('username') username: string) {
    return this.postsService.getParticularUserPosts(username);
  }

  @Post(':id/like')
  like(@Param('id') id: string, @GetUser() user: IJwtUser) {
    return this.postsService.like(id, user);
  }

  @Get(':id/isLiked')
  isLike(@Param('id') id: string, @GetUser() user: IJwtUser) {
    return this.postsService.isLiked(id, user);
  }

  @Post(':id/removelike')
  removeLike(@Param('id') id: string, @GetUser() user: IJwtUser) {
    return this.postsService.removeLike(id, user);
  }

  @Post(':id/add-to-save')
  savePost(@Param('id') id: string, @GetUser() user: IJwtUser) {
    return this.postsService.savePost(id, user);
  }

  @Post(':id/remove-from-saved')
  unsavePost(@Param('id') id: string, @GetUser() user: IJwtUser) {
    return this.postsService.unsavePost(id, user);
  }
}
