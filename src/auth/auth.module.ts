import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [UsersModule, JwtModule.register({})],
  providers: [AuthService, JwtStrategy, MailService],
  controllers: [AuthController],
})
export class AuthModule {}
