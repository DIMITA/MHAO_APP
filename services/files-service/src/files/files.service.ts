import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { MinioService } from './minio.service';

interface UploadFileDto {
  buffer: Buffer | string;
  originalname: string;
  mimetype: string;
}

interface UploadResult {
  key: string;
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

interface PresignedUrlResult {
  url: string;
  expiresAt: Date;
}

const ALLOWED_MIMETYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf']);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(private readonly minioService: MinioService) {}

  private validateFile(file: UploadFileDto, bufferSize: number): void {
    if (!ALLOWED_MIMETYPES.has(file.mimetype)) {
      throw new RpcException({
        statusCode: 400,
        message: `File type "${file.mimetype}" is not allowed. Allowed types: jpg, jpeg, png, webp, pdf`,
      });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      throw new RpcException({
        statusCode: 400,
        message: `File extension "${ext}" is not allowed. Allowed extensions: .jpg, .jpeg, .png, .webp, .pdf`,
      });
    }

    if (bufferSize > MAX_FILE_SIZE_BYTES) {
      throw new RpcException({
        statusCode: 413,
        message: `File size ${(bufferSize / (1024 * 1024)).toFixed(2)}MB exceeds maximum allowed size of 10MB`,
      });
    }
  }

  async upload(
    file: UploadFileDto,
    folder: string,
    userId: string,
  ): Promise<UploadResult> {
    if (!file || !file.buffer) {
      throw new RpcException({ statusCode: 400, message: 'File buffer is required' });
    }

    if (!folder || !userId) {
      throw new RpcException({ statusCode: 400, message: 'Folder and userId are required' });
    }

    const rawBuffer = Buffer.isBuffer(file.buffer)
      ? file.buffer
      : Buffer.from(file.buffer as string, 'base64');

    this.validateFile(file, rawBuffer.length);

    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueId = uuidv4();
    const filename = `${uniqueId}${ext}`;
    const key = `${folder}/${userId}/${filename}`;
    const bucket = this.minioService.getBucket();

    try {
      await this.minioService.putObject(bucket, key, rawBuffer, rawBuffer.length, file.mimetype);
    } catch (error) {
      this.logger.error(`Failed to upload file ${key}`, error);
      throw new RpcException({ statusCode: 500, message: 'Failed to upload file to storage' });
    }

    const url = `${this.minioService.getEndpointUrl()}/${bucket}/${key}`;

    this.logger.log(
      `File uploaded: ${key} (${rawBuffer.length} bytes) by user ${userId}`,
    );

    return {
      key,
      url,
      filename,
      size: rawBuffer.length,
      mimetype: file.mimetype,
    };
  }

  async delete(key: string, userId: string): Promise<{ success: boolean; message: string }> {
    if (!key || !userId) {
      throw new RpcException({ statusCode: 400, message: 'Key and userId are required' });
    }

    const keyParts = key.split('/');
    if (keyParts.length < 2 || keyParts[1] !== userId) {
      throw new RpcException({
        statusCode: 403,
        message: 'You do not have permission to delete this file',
      });
    }

    const bucket = this.minioService.getBucket();
    const exists = await this.minioService.objectExists(bucket, key);

    if (!exists) {
      throw new RpcException({ statusCode: 404, message: 'File not found' });
    }

    try {
      await this.minioService.removeObject(bucket, key);
    } catch (error) {
      this.logger.error(`Failed to delete file ${key}`, error);
      throw new RpcException({ statusCode: 500, message: 'Failed to delete file from storage' });
    }

    this.logger.log(`File deleted: ${key} by user ${userId}`);
    return { success: true, message: `File ${key} deleted successfully` };
  }

  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<PresignedUrlResult> {
    if (!key) {
      throw new RpcException({ statusCode: 400, message: 'File key is required' });
    }

    if (expiresIn < 1 || expiresIn > 604800) {
      throw new RpcException({
        statusCode: 400,
        message: 'expiresIn must be between 1 and 604800 seconds (7 days)',
      });
    }

    const bucket = this.minioService.getBucket();
    const exists = await this.minioService.objectExists(bucket, key);

    if (!exists) {
      throw new RpcException({ statusCode: 404, message: 'File not found' });
    }

    let url: string;
    try {
      url = await this.minioService.presignedGetObject(bucket, key, expiresIn);
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL for ${key}`, error);
      throw new RpcException({ statusCode: 500, message: 'Failed to generate presigned URL' });
    }

    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return { url, expiresAt };
  }

  getPublicUrl(key: string): { url: string } {
    if (!key) {
      throw new RpcException({ statusCode: 400, message: 'File key is required' });
    }

    const bucket = this.minioService.getBucket();
    const baseUrl = this.minioService.getEndpointUrl();
    const url = `${baseUrl}/${bucket}/${key}`;

    return { url };
  }
}
