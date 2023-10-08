import { Injectable } from '@nestjs/common';
import { SignupDto } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async getUserByEmail(email: string) {
    return await this.prismaService.user.findFirst({
      where: {
        email,
      },
    });
  }

  async getUserByUsername(username: string) {
    return await this.prismaService.user.findFirst({
      where: {
        username,
      },
    });
  }

  async createUser({ email, password, username }: SignupDto) {
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
