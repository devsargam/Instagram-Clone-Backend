import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUserFromDb } from 'src/users/users.service';
import { Transporter, createTransport } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = createTransport(`smtp://
        ${configService.get('GOOGLE_AUTH_USERNAME')}:
        ${configService.get('GOOGLE_AUTH_PASSWORD')}
        @smtp.gmail.com`);
  }

  async sendUserConfirmation(user: IUserFromDb, token: string) {
    const serverUrl = this.configService.get<string>('SERVER_URL');
    const url = `${serverUrl}/auth/confirm?token=${token}`;

    await this.transporter.sendMail({
      to: user.email,
      subject: 'Welcome to Test App',
      html: `<a href='${url}'>Click Here!</a>`,
    });
  }
}
