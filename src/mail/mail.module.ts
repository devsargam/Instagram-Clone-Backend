import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: 'Gmail',
          secure: false,
          auth: {
            user: config.get('GOOGLE_AUTH_USERNAME'),
            pass: config.get('GOOGLE_AUTH_PASSWORD'),
          },
        },
        defaults: {
          from: `"No Reply" <${config.get('GOOGLE_AUTH_USERNAME')}>`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
})
export class MailModule {}
