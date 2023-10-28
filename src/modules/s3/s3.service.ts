import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import { IJwtUser } from 'src/shared/interfaces';

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = configService.getOrThrow('AWS_S3_BUCKET_NAME');
    this.region = configService.getOrThrow('AWS_S3_REGION');
    this.accessKeyId = configService.getOrThrow('AWS_ACCESS_KEY_ID');
    this.secretAccessKey = configService.getOrThrow('AWS_SECRET_ACCESS_KEY');

    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });
  }

  private async transformImage(image: Buffer) {
    return await sharp(image).resize(320, 320).toBuffer();
  }

  async uploadFile(file: Express.Multer.File, user: IJwtUser) {
    const { buffer } = file;
    const transformedImage = await this.transformImage(buffer);
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: `${user.username}.png`,
        Body: transformedImage,
        ContentType: 'image/png',
      });

      await this.client.send(command);
    } catch {
      throw new InternalServerErrorException();
    }
  }

  getImageUrl(key: string) {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}.png`;
  }
}
