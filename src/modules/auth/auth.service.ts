import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { MailService } from 'src/modules/mail/mail.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SigninDto, SignupDto } from './dto';
import { IUserPaylaod } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  private async createHash(stringToHash: string): Promise<string> {
    const hashingRounds = 10;
    return await bcrypt.hash(stringToHash, hashingRounds);
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

  async signin({
    username,
    password,
  }: SigninDto): Promise<{ access_token: string }> {
    const userFromDb = await this.userService.getUserByUsername(username);
    // Throw error if user is not found in db
    if (!userFromDb) {
      throw new NotFoundException('User not found');
    }

    // Throw error if user has not verified email
    if (!userFromDb.isVerified) {
      this.mailService.sendUserConfirmation(userFromDb, userFromDb.id);
      throw new ForbiddenException(
        'Message user not verified. Check your mail',
      );
    }

    const passwordMatch = await bcrypt.compare(password, userFromDb.password);
    if (!passwordMatch) {
      // Throw error if password doesn't match
      throw new BadRequestException('Username or Password is wrong');
    }

    // Return JWT token
    return this.signToken(userFromDb.id, userFromDb.username);
  }

  async signup({ username, email, password }: SignupDto) {
    const userExists = await this.userService.getUserByEmail(email);
    if (userExists) {
      throw new ConflictException('User already exists', {
        cause: 'Duplicate email or username',
        description: 'User with same email or username already exists in db',
      });
    }

    const hashedPassword = await this.createHash(password);

    const newUser = await this.userService.createUser({
      username,
      email,
      password: hashedPassword,
    });

    delete newUser.password;
    this.mailService.sendUserConfirmation(newUser, newUser.id);
    return {
      message: 'Verification mail sent. Check your mail',
      status: 201,
    };
  }

  async verifyToken(token: string) {
    const verifiedUser = await this.userService.verifyUser(token);
    delete verifiedUser.password;
    return verifiedUser;
  }

  async forgotPassword(username: string) {
    const userFromDb = await this.userService.getUserByUsername(username);
    if (!userFromDb) {
      throw new ForbiddenException('User does not exists');
    }
    const uniqueString =
      username + this.configService.get<string>('FORGOT_PASSWORD_SECRET');
    const hashedString = await this.createHash(uniqueString);
    this.mailService.sendUserForgotInstructions(userFromDb, hashedString);
    return {
      message: 'Forgot password mail was sent to associated email',
      status: 201,
    };
  }

  async verifyForgotPass(token: string, username: string) {
    const userFromDb = await this.userService.getUserByUsername(username);

    if (!userFromDb) {
      throw new ForbiddenException('Something went wrong');
    }
    const stringToCompare =
      username + this.configService.get<string>('FORGOT_PASSWORD_SECRET');
    const isEqual = await bcrypt.compare(stringToCompare, token);
    if (!isEqual) {
      throw new ForbiddenException('Something went wrong');
    }
    const newPassword = randomBytes(15).toString('hex');
    const newHashedPassword = await this.createHash(newPassword);
    await this.userService.resetPassword(username, newHashedPassword);

    this.mailService.sendUserPasswordReset(userFromDb, newPassword);
    return {
      message: 'Password has been reset. Check your mail',
      status: '200',
    };
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
