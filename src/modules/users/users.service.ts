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

export interface IUserFromDb {
  id: string;
  email: string;
  username: string;
  password: string;
  isVerified: boolean;
}

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

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

  async follow(userId: string, user: IJwtUser) {
    if (user.id === userId)
      throw new BadRequestException('You cannot follow yourself');
    try {
      const userFromDb = await this.prismaService.user.update({
        where: {
          id: userId,
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

  async unfollow(userId: string, user: IJwtUser) {
    if (user.id === userId)
      throw new BadRequestException('You cannot unfollow yourself');
    try {
      const userFromDb = await this.prismaService.user.update({
        where: {
          id: userId,
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

  async getFollowers(userId: string) {
    try {
      const userFromDb = await this.prismaService.user.findFirst({
        where: {
          id: userId,
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

  async getFollowing(userId: string) {
    try {
      const userFromDb = await this.prismaService.user.findFirst({
        where: {
          id: userId,
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
}
