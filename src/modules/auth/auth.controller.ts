import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/public-route.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod.pipe';
import { SigninDto, SignupDto, signinSchema, signupSchema } from './dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/signup')
  @UsePipes(new ZodValidationPipe(signupSchema))
  @HttpCode(201)
  async signup(@Body() signupDto: SignupDto) {
    return await this.authService.signup(signupDto);
  }

  @Public()
  @Post('/login')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(signinSchema))
  async login(@Body() signinDto: SigninDto) {
    return await this.authService.signin(signinDto);
  }

  @Public()
  @Get('/confirm')
  async verifyToken(@Query() { token }: { token: string }) {
    return await this.authService.verifyToken(token);
  }

  @Public()
  @Get('/forgotpass')
  async forgotPassword(@Query() { username }: { username: string }) {
    return await this.authService.forgotPassword(username);
  }

  @Public()
  @Get('/forgotpass/verify')
  async verifyForgotPass(
    @Query() { code, user }: { code: string; user: string },
  ) {
    return await this.authService.verifyForgotPass(code, user);
  }

  @Get('/profile')
  async profile(@GetUser() user: { id: string; username: string }) {
    return user;
  }
}
