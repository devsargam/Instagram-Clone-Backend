import { Injectable, NotFoundException } from '@nestjs/common';
import { SignupDto } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/prisma.service';

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
      },
    });
    return newUser;
  }
}
