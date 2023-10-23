import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { IJwtUser } from 'src/shared/interfaces';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private prismaService: PrismaService) {}

  async create(user: IJwtUser, createPostDto: CreatePostDto) {
    const newPost = await this.prismaService.post.create({
      data: {
        ...createPostDto,
        authorId: user.id,
      },
    });
    return newPost;
  }

  async findAll(user: IJwtUser) {
    const posts = await this.prismaService.post.findMany({
      where: {
        authorId: user.id,
      },
    });
    if (!posts.length) {
      throw new NotFoundException('No post exists');
    }
    return posts;
  }

  async findOne(id: string) {
    try {
      return await this.prismaService.post.findFirstOrThrow({
        where: {
          id: id,
        },
      });
    } catch {
      throw new NotFoundException('Post not found');
    }
  }

  async update(id: string, updatePostDto: UpdatePostDto, user: IJwtUser) {
    try {
      return await this.prismaService.post.update({
        where: {
          id: id,
          authorId: user.id,
        },
        data: {
          ...updatePostDto,
        },
      });
    } catch {
      throw new NotFoundException('Post not found');
    }
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

  async like(id: string, user: IJwtUser) {
    try {
      await this.prismaService.user.update({
        where: {
          id: user.id,
        },
        data: {
          likedPosts: {
            connect: [
              {
                id: id,
              },
            ],
          },
        },
      });
      return {
        message: 'Post liked successfully',
        postId: id,
        timestamp: new Date(),
      };
    } catch {
      throw new NotFoundException('Post not found');
    }
  }

  async removeLike(id: string, user: IJwtUser) {
    try {
      await this.prismaService.user.update({
        where: {
          id: user.id,
        },
        data: {
          likedPosts: {
            disconnect: [
              {
                id: id,
              },
            ],
          },
        },
      });
      return {
        message: 'Post disliked successfully',
        postId: id,
        timestamp: new Date(),
      };
    } catch {
      throw new NotFoundException('Post not found');
    }
  }

  async savePost(id: string, user: IJwtUser) {
    try {
      await this.prismaService.user.update({
        where: {
          id: user.id,
        },
        data: {
          savedPosts: {
            connect: {
              id: id,
            },
          },
        },
      });

      return {
        message: 'Post saved successfully',
        postId: id,
        timestamp: new Date(),
      };
    } catch {
      throw new NotFoundException('Post not found');
    }
  }

  async unsavePost(id: string, user: IJwtUser) {
    try {
      await this.prismaService.user.update({
        where: {
          id: user.id,
        },
        data: {
          savedPosts: {
            disconnect: {
              id: id,
            },
          },
        },
      });

      return {
        message: 'Post unsaved successfully',
        postId: id,
        timestamp: new Date(),
      };
    } catch {
      throw new NotFoundException('Post not found');
    }
  }
}
