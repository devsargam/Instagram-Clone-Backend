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

  async sendUserForgotInstructions(user: IUserFromDb, token: string) {
    const serverUrl = this.configService.get<string>('SERVER_URL');
    const url = `${serverUrl}/auth/forgotpass?code=${token}`;

    await this.transporter.sendMail({
      to: user.email,
      subject: 'Instagram Password Reset',
      html: `<h1>Dear Instagram User</h1>
            We have received a request to reset your instagram password
            <br>
            username: ${user.username}
            Please click <a href=${url}>here</a> to reset your password

            The Instagram Team
      `,
    });
  }
}
