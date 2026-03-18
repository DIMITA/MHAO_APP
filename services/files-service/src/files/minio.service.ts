import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: Minio.Client;
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly port: number;
  private readonly useSSL: boolean;

  constructor(private readonly configService: ConfigService) {
    this.endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
    this.port = parseInt(this.configService.get<string>('MINIO_PORT', '9009'), 10);
    this.useSSL = this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true';
    this.bucket = this.configService.get<string>('MINIO_BUCKET', 'mhao-files');

    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY', 'mhao_minio');
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY', 'minio_secret');

    this.client = new Minio.Client({
      endPoint: this.endpoint,
      port: this.port,
      useSSL: this.useSSL,
      accessKey,
      secretKey,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.createBucketIfNotExists(this.bucket);
    this.logger.log(`MinIO connected to ${this.endpoint}:${this.port}, bucket: ${this.bucket}`);
  }

  getBucket(): string {
    return this.bucket;
  }

  getEndpointUrl(): string {
    const protocol = this.useSSL ? 'https' : 'http';
    return `${protocol}://${this.endpoint}:${this.port}`;
  }

  async createBucketIfNotExists(bucketName: string): Promise<void> {
    try {
      const exists = await this.client.bucketExists(bucketName);
      if (!exists) {
        await this.client.makeBucket(bucketName, 'us-east-1');
        this.logger.log(`Bucket "${bucketName}" created`);
      } else {
        this.logger.log(`Bucket "${bucketName}" already exists`);
      }
    } catch (error) {
      this.logger.error(`Failed to check/create bucket "${bucketName}"`, error);
      throw error;
    }
  }

  async putObject(
    bucketName: string,
    key: string,
    buffer: Buffer,
    size: number,
    contentType: string,
  ): Promise<void> {
    try {
      await this.client.putObject(bucketName, key, buffer, size, {
        'Content-Type': contentType,
        'Cache-Control': 'max-age=31536000',
      });
      this.logger.log(`Uploaded object: ${key} (${size} bytes, ${contentType})`);
    } catch (error) {
      this.logger.error(`Failed to upload object: ${key}`, error);
      throw error;
    }
  }

  async removeObject(bucketName: string, key: string): Promise<void> {
    try {
      await this.client.removeObject(bucketName, key);
      this.logger.log(`Removed object: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to remove object: ${key}`, error);
      throw error;
    }
  }

  async presignedGetObject(bucketName: string, key: string, expiry: number): Promise<string> {
    try {
      const url = await this.client.presignedGetObject(bucketName, key, expiry);
      this.logger.log(`Generated presigned URL for: ${key} (expires in ${expiry}s)`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL for: ${key}`, error);
      throw error;
    }
  }

  async objectExists(bucketName: string, key: string): Promise<boolean> {
    try {
      await this.client.statObject(bucketName, key);
      return true;
    } catch {
      return false;
    }
  }

  async setBucketPolicy(bucketName: string): Promise<void> {
    const policy = JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/profiles/*`],
        },
      ],
    });

    try {
      await this.client.setBucketPolicy(bucketName, policy);
      this.logger.log(`Public read policy set for bucket: ${bucketName}/profiles/*`);
    } catch (error) {
      this.logger.error(`Failed to set bucket policy for: ${bucketName}`, error);
      throw error;
    }
  }
}
