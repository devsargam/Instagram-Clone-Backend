import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { IJwtUser } from 'src/interfaces';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prismaService: PrismaService) {}

  async create(user: IJwtUser, createPostDto: CreatePostDto) {
    const { title, caption } = createPostDto;
    const newPost = await this.prismaService.post.create({
      data: {
        caption: caption,
        title: title,
        authorId: user.id,
      },
    });
    return newPost;
  }

  findAll() {
    return `This action returns all posts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
