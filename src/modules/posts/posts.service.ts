import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { IJwtUser } from 'src/shared/interfaces';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UpdatePostDto } from './dto/update-post.dto';
import { randomUUID as uuid } from 'crypto';
import { S3Service } from '../s3/s3.service';
import * as sharp from 'sharp';

@Injectable()
export class PostsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    user: IJwtUser,
    createPostDto: CreatePostDto,
    images: Express.Multer.File[],
  ) {
    const imageKeys: string[] = [];
    const imageUrls: string[] = [];
    for (const image of images) {
      const imgUUID = uuid();
      imageKeys.push(imgUUID);
      imageUrls.push(this.s3Service.getImageUrl(imgUUID));
      const optimizedImg = await this.transformImage(image.buffer);
      this.s3Service.uploadImage(optimizedImg, `${imgUUID}.png`);
    }
    const newPost = await this.prismaService.post.create({
      data: {
        ...createPostDto,
        authorId: user.id,
        imagesKey: imageKeys,
        imagesUrl: imageUrls,
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
          id,
        },
        select: {
          id: true,
          title: true,
          caption: true,
          imagesUrl: true,
          author: {
            select: {
              id: true,
              username: true,
              displayPictureUrl: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
          createdAt: true,
          updatedAt: true,
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
      const removedPost = await this.prismaService.post.delete({
        where: {
          id: id,
          authorId: user.id,
        },
      });

      for (const key of removedPost.imagesKey) {
        await this.s3Service.removeImage(key);
      }

      return removedPost;
    } catch {
      throw new NotFoundException('Post not found');
    }
  }

  async getParticularUserPosts(username: string) {
    const posts = await this.prismaService.post.findMany({
      where: {
        author: {
          username: username,
        },
      },
      select: {
        id: true,
        title: true,
        caption: true,
        imagesUrl: true,
        author: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!posts) {
      return [];
    }

    return posts;
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

  async isLiked(id: string, user: IJwtUser) {
    try {
      const likedPost = await this.prismaService.user.findFirst({
        where: {
          id: user.id,
          likedPosts: {
            some: {
              id: id,
            },
          },
        },
      });

      if (likedPost) {
        return {
          liked: true,
        };
      }
      return {
        liked: false,
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

  private async transformImage(image: Buffer) {
    return await sharp(image).resize(320, 320).toBuffer();
  }
}
