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

  async sendUserPasswordReset(user: IUserFromDb, newPassword: string) {
    await this.transporter.sendMail({
      to: user.email,
      subject: 'Instagram Password Has Been Reset',
      html: `<h1>Dear Instagram User</h1>
            Your Instagram passowrd reset was sucessful<br>
            Your new Password is: <b>${newPassword}</b><br>
            <br>
            <h2>The Instagram Team</h2>
            `,
    });
  }

  async sendUserForgotInstructions(user: IUserFromDb, token: string) {
    const serverUrl = this.configService.get<string>('SERVER_URL');
    const url = `${serverUrl}/auth/forgotpass/verify?code=${token}&user=${user.username}`;

    await this.transporter.sendMail({
      to: user.email,
      subject: 'Instagram Password Reset',
      html: `<h1>Dear Instagram User</h1>
            <p>We have received a request to reset your instagram password</p>
            <br>
            <p>username: <strong>${user.username}</strong><br></p>
            <p>Please click <strong><a href=${url}>here</a></strong> to reset your password</p><br>
            <br>
            <h2>The Instagram Team</h2>
      `,
    });
  }
}
