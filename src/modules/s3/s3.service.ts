import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new S3Client({
      region: configService.getOrThrow('AWS_S3_REGION'),
      credentials: {
        accessKeyId: configService.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucketName = configService.getOrThrow('AWS_S3_BUCKET_NAME');
  }

  async transformImage(image: Buffer) {
    return await sharp(image).resize(320, 320).toBuffer();
  }

  async uploadFile(file: Express.Multer.File) {
    const { originalname, buffer } = file;
    const transformedImage = await this.transformImage(buffer);
    console.log(transformedImage);
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: originalname,
        Body: transformedImage,
        ContentType: 'image/png',
      });

      const res = await this.client.send(command);
      console.log(res);
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
