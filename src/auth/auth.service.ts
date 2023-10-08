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

  private async hashPassword(password: string) {
    const hashingRounds = 10;
    return await bcrypt.hash(password, hashingRounds);
  }

  async validateUser(username: string, password: string) {
    const user = await this.userService.getUserByUsername(username);

    if (user && (await bcrypt.compare(password, user.password))) {
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
    const userExists = await this.userService.getUserByEmail(email);
    if (userExists) {
      throw new ConflictException('User already exists', {
        cause: 'Duplicate email or username',
        description: 'User with same email or username already exists in db',
      });
    }

    const hashedPassword = await this.hashPassword(password);

    const newUser = await this.userService.createUser({
      username,
      email,
      password: hashedPassword,
    });

    delete newUser.password;
    return newUser;
  }
}
