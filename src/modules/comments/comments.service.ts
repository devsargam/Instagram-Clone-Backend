import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { IJwtUser } from 'src/shared/interfaces';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    postId: string,
    createCommentDto: CreateCommentDto,
    user: IJwtUser,
  ) {
    try {
      return await this.prismaService.post.update({
        where: {
          id: postId,
        },
        data: {
          comments: {
            create: {
              content: createCommentDto.content,
              commentUserId: user.id,
            },
          },
        },
      });
    } catch {
      throw new NotFoundException('Post not found');
    }
  }

  findAll(user: IJwtUser) {
    return this.prismaService.user.findFirst({
      where: {
        id: user.id,
      },
      select: {
        comments: true,
      },
    });
  }

  async findOne(id: string) {
    try {
      return await this.prismaService.comment.findFirstOrThrow({
        where: {
          id: id,
        },
      });
    } catch {
      throw new NotFoundException('Commment not found');
    }
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, user: IJwtUser) {
    try {
      return await this.prismaService.comment.update({
        where: {
          id: id,
          commentUserId: user.id,
        },
        data: {
          content: updateCommentDto.content,
        },
      });
    } catch {
      throw new ForbiddenException('Something wrong happened');
    }
  }

  async remove(id: string, user: IJwtUser) {
    try {
      return await this.prismaService.comment.delete({
        where: {
          id: id,
          commentUserId: user.id,
        },
      });
    } catch {
      throw new ForbiddenException('Something wrong happened');
    }
  }

  async getPostComments(postId: string) {
    try {
      const comments = await this.prismaService.comment.findMany({
        where: {
          postId: postId,
        },
        select: {
          content: true,
          commenedBy: {
            select: {
              username: true,
              displayPictureUrl: true,
            },
          },
        },
      });
      return comments ?? [];
    } catch {
      throw new ForbiddenException('Something went wrong');
    }
  }
}
