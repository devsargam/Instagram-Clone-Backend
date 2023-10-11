import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: `smtp://
        ${config.get('GOOGLE_AUTH_USERNAME')}:
        ${config.get('GOOGLE_AUTH_PASSWORD')}
        @smtp.gmail.com`,
      }),
    }),
  ],
  providers: [MailService, ConfigService],
  exports: [MailService],
})
export class MailModule {}
