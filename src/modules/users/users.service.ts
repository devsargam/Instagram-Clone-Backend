import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignupDto } from 'src/modules/auth/dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { changePasswordDto } from './dto';
import { compare, hash } from 'bcrypt';
import { changeUsernameDto } from './dto/change-username.dto';
import { IJwtUser } from 'src/shared/interfaces';
import { editProfileDto } from './dto/edit-profile.dto';
import { S3Service } from '../s3/s3.service';
import { randomUUID as uuid } from 'crypto';
import * as sharp from 'sharp';

export interface IUserFromDb {
  id: string;
  email: string;
  username: string;
  password: string;
  isVerified: boolean;
}

@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async getUserByEmail(email: string): Promise<IUserFromDb> {
    return await this.prismaService.user.findFirst({
      where: {
        email,
      },
    });
  }

  async getUserByUsername(username: string): Promise<IUserFromDb> {
    return await this.prismaService.user.findFirst({
      where: {
        username,
      },
    });
  }

  async getUserById(id: string): Promise<IUserFromDb> {
    return await this.prismaService.user.findFirst({
      where: { id },
    });
  }

  async verifyUser(id: string): Promise<IUserFromDb> {
    try {
      return await this.prismaService.user.update({
        where: { id },
        data: {
          isVerified: true,
        },
      });
    } catch (e) {
      // If user is not found with the token throw
      throw new NotFoundException('Invalid token');
    }
  }

  async resetPassword(
    username: string,
    newPassword: string,
  ): Promise<IUserFromDb> {
    return await this.prismaService.user.update({
      where: { username },
      data: {
        password: newPassword,
      },
    });
  }

  async editProfile(user: IJwtUser, body: editProfileDto) {
    type IAccountEnum = 'PUBLIC' | 'PRIVATE';
    type IGenderEnum = 'MALE' | 'FEMALE' | 'PREFER_NOT_SAY';
    const { bio, accountType, gender, receiveMarkettingEmails, website } = body;

    await this.prismaService.userPreferences.update({
      where: {
        userId: user.id,
      },
      data: {
        bio,
        website,
        accountType: accountType as IAccountEnum,
        gender: gender as IGenderEnum,
        receiveMarkettingEmails,
        userId: user.id,
      },
    });

    return {
      message: 'Preferences updated sucessfully',
      status: 201,
    };
  }

  async getProfile(user: IJwtUser) {
    const userPrefernces = await this.prismaService.userPreferences.findFirst({
      where: {
        userId: user.id,
      },
      select: {
        bio: true,
        website: true,
        gender: true,
        accountType: true,
        receiveMarkettingEmails: true,
      },
    });

    return userPrefernces;
  }

  async changePassword(id: string, body: changePasswordDto) {
    const { password, new_password } = body;
    const user = await this.prismaService.user.findFirst({ where: { id } });
    if (!user) {
      throw new ForbiddenException('Invalid id');
    }
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      throw new ForbiddenException('Wrong password');
    }
    const hashingRounds = 10;
    const hashedPassword = await hash(new_password, hashingRounds);
    await this.prismaService.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return {
      message: 'Password changed sucessfully',
      status: 201,
    };
  }

  async changeUsername(id: string, body: changeUsernameDto) {
    const { new_username, password } = body;
    const userFromDb = await this.prismaService.user.findFirst({
      where: { id },
    });

    if (!userFromDb) {
      throw new ForbiddenException('Invalid id');
    }
    const isMatch = await compare(password, userFromDb.password);
    if (!isMatch) {
      throw new ForbiddenException('Wrong password');
    }
    const userExists = await this.prismaService.user.findFirst({
      where: {
        username: new_username,
      },
    });

    if (userExists) {
      throw new ConflictException('User with same username already exists');
    }

    return await this.prismaService.user.update({
      where: { id },
      data: { username: new_username },
      select: {
        id: true,
        username: true,
        isVerified: true,
      },
    });
  }

  async createUser({
    email,
    password,
    username,
  }: SignupDto): Promise<IUserFromDb> {
    const newUser = await this.prismaService.user.create({
      data: {
        email,
        password,
        username,
        UserPreferences: {
          create: {},
        },
      },
    });
    return newUser;
  }

  async follow(username: string, user: IJwtUser) {
    if (user.username === username)
      throw new BadRequestException('You cannot follow yourself');
    try {
      const userFromDb = await this.prismaService.user.update({
        where: {
          username: username,
        },
        data: {
          followedBy: {
            connect: {
              id: user.id,
            },
          },
        },
        select: {
          followedBy: true,
          following: true,
        },
      });

      return userFromDb;
    } catch {
      throw new NotFoundException('User not found');
    }
  }

  async unfollow(username: string, user: IJwtUser) {
    if (user.username === username)
      throw new BadRequestException('You cannot unfollow yourself');
    try {
      const userFromDb = await this.prismaService.user.update({
        where: {
          username: username,
        },
        data: {
          followedBy: {
            disconnect: {
              id: user.id,
            },
          },
        },
        select: {
          followedBy: true,
          following: true,
        },
      });

      return userFromDb;
    } catch {
      throw new NotFoundException('User not found');
    }
  }

  async getFollowers(username: string) {
    try {
      const userFromDb = await this.prismaService.user.findFirst({
        where: {
          username: username,
        },
        select: {
          followedBy: true,
        },
      });
      return userFromDb.followedBy;
    } catch {
      throw new NotFoundException('User not found');
    }
  }

  async getFollowing(username: string) {
    try {
      const userFromDb = await this.prismaService.user.findFirst({
        where: {
          username: username,
        },
        select: {
          following: true,
        },
      });

      return userFromDb.following;
    } catch {
      throw new NotFoundException('User not found');
    }
  }

  async getCurrentUser(id: string) {
    const user = await this.prismaService.user.findFirst({
      where: { id },
      select: {
        email: true,
        username: true,
        id: true,
        displayPictureUrl: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findProfile(username: string, user: IJwtUser) {
    const userFromDb = await this.prismaService.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
        username: true,
        displayPictureUrl: true,
        UserPreferences: {
          select: {
            accountType: true,
            bio: true,
            gender: true,
            website: true,
          },
        },
        _count: {
          select: { createdPosts: true, followedBy: true, following: true },
        },
      },
    });

    const isFollowedByUser = await this.prismaService.user.findFirst({
      where: {
        username: user.username,
        following: {
          some: {
            username: username,
          },
        },
      },
    });

    if (!userFromDb) {
      throw new NotFoundException('User Not Found');
    }

    return { ...userFromDb, isFollowedByUser: !!isFollowedByUser };
  }

  async uploadDp(file: Express.Multer.File, user: IJwtUser) {
    const transformedImage = await this.transformImage(file.buffer);
    const imageUUID = uuid();
    await this.s3Service.uploadImage(transformedImage, `${imageUUID}.png`);
    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        displayPictureUrl: this.s3Service.getImageUrl(imageUUID),
        displayPictureKey: imageUUID,
      },
    });
    return {
      message: 'Image uploaded',
    };
  }

  async getDp(user: IJwtUser) {
    const { displayPictureUrl } = await this.prismaService.user.findFirst({
      where: {
        id: user.id,
      },
      select: {
        displayPictureUrl: true,
        displayPictureKey: true,
      },
    });
    if (!displayPictureUrl) {
      throw new NotFoundException('No DP found');
    }
    return { displayPictureUrl };
  }

  private async transformImage(image: Buffer) {
    console.log(478);
    return await sharp(image).resize(478, 478).toBuffer();
  }
}
