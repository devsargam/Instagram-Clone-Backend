import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { IJwtUser } from 'src/shared/interfaces';

@Injectable()
export class FeedService {
  constructor(private readonly prismaService: PrismaService) {}

  async getFeed(user: IJwtUser) {
    const posts = this.prismaService.post.findMany({
      select: {
        id: true,
      },
      where: {
        author: {
          followedBy: {
            some: {
              id: user.id,
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'asc',
      },
    });

    return posts;
  }

  async getSuggestions(user: IJwtUser) {
    try {
      const users = await this.prismaService.user.findMany({
        where: {
          id: {
            not: user.id,
          },
          followedBy: {
            none: {
              id: user.id,
            },
          },
          isVerified: true,
        },
        orderBy: {
          followedBy: { _count: 'desc' },
        },
        select: {
          id: true,
          username: true,
          displayPictureUrl: true,
        },
        take: 5,
      });

      return users ?? [];
    } catch {
      throw new NotFoundException('Not Found');
    }
  }
}
