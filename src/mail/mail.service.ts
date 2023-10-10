import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUserFromDb } from 'src/users/users.service';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendUserConfirmation(user: IUserFromDb, token: string) {
    const serverUrl = this.configService.get<string>('SERVER_URL');
    const url = `${serverUrl}/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Test App',
      text: `<a href='${url}'>Click Here!</a>`,
    });
  }
}
