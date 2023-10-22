import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findAll(user: IJwtUser) {
    return await this.prismaService.post.findMany({
      where: {
        authorId: user.id,
      },
    });
  }

  async findOne(id: string) {
    return await this.prismaService.post.findFirstOrThrow({
      where: {
        id: id,
      },
    });
  }

  update(id: number) {
    return `This action updates a #${id} post`;
  }

  async remove(id: string, user: IJwtUser) {
    try {
      return await this.prismaService.post.delete({
        where: {
          id: id,
          authorId: user.id,
        },
      });
    } catch {
      throw new NotFoundException('Post not found');
    }
  }
}
