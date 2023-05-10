import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { S3 } from 'aws-sdk';
import * as url from 'url';

@Injectable()
export class SharedService {
  constructor(private jwtService: JwtService) {}

  getUserIdFromToken(header: ParameterDecorator): string {
    try {
      const token = header['authorization'].split(' ')[1];
      const decodedToken = this.jwtService.decode(token);
      const userID = decodedToken['userID'];

      return userID;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async uploadFile(
    imageBuffer: Buffer,
    fileName: string,
  ): Promise<S3.ManagedUpload.SendData> {
    const s3 = new S3();
    return await s3
      .upload({
        Bucket: process.env.BUCKET_NAME,
        Body: imageBuffer,
        Key: `${Date.now()}-${fileName}`,
        ACL: 'public-read',
      })
      .promise();
  }

  async deleteFile(fileUrl: string): Promise<any> {
    const s3 = new S3();
    const parsedUrl = url.parse(fileUrl);
    const key = decodeURIComponent(parsedUrl.pathname.split('/').pop());
    return await s3
      .deleteObject({
        Bucket: process.env.BUCKET_NAME,
        Key: key,
      })
      .promise();
  }
}
