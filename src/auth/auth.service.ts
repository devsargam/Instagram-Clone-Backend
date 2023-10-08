import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignupDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
    private userService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, password: string) {
    const hashingRounds = 10;

    const user = await this.userService.getUserByUsername(username);
    if (
      user &&
      // TODO: Fix this ASAP
      // user.password === (await bcrypt.hash(password, hashingRounds))
      user.password
    ) {
      const { password, ...result } = user;
      console.log(result);
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
      }),
    };
  }

  async signup({ username, email, password }: SignupDto) {
    const userExists = await this.prismaService.user.findFirst({
      where: { email },
    });
    if (userExists) {
      throw new ConflictException('User already exists', {
        cause: 'Duplicate email or username',
        description: 'User with same email or username already exists in db',
      });
    }
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
