import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IUserFromDb, UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SigninDto, SignupDto } from './dto';
import { IUserPaylaod } from './jwt.strategy';

type IUserFromDbWithoutPassword = Omit<IUserFromDb, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const hashingRounds = 10;
    return await bcrypt.hash(password, hashingRounds);
  }

  async login(user: IUserPaylaod): Promise<{
    access_token: string;
  }> {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
      }),
    };
  }

  async signin({ username, password }: SigninDto): Promise<{
    access_token: string;
  }> {
    const userFromDb = await this.userService.getUserByUsername(username);
    if (!userFromDb) {
      throw new NotFoundException('User not found');
    }

    const passwordMatch = await bcrypt.compare(password, userFromDb.password);
    if (!passwordMatch) {
      throw new BadRequestException('Username or Password is wrong');
    }

    return this.signToken(userFromDb.id, userFromDb.username);
  }

  async signup({
    username,
    email,
    password,
  }: SignupDto): Promise<IUserFromDbWithoutPassword> {
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

  private async signToken(
    id: string,
    username: string,
  ): Promise<{ access_token: string }> {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN');
    const paylaod = { sub: id, username };

    const token = await this.jwtService.signAsync(paylaod, {
      expiresIn: jwtExpiresIn,
      secret: jwtSecret,
    });

    return {
      access_token: token,
    };
  }
}
