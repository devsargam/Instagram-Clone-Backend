import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { S3Service } from '../s3/s3.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService, S3Service],
})
export class PostsModule {}
