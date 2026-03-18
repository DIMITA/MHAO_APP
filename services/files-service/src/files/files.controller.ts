import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { FilesService } from './files.service';

interface UploadPayload {
  file: {
    buffer: Buffer | string;
    originalname: string;
    mimetype: string;
  };
  folder: string;
  userId: string;
}

@Controller()
export class FilesController {
  private readonly logger = new Logger(FilesController.name);

  constructor(private readonly filesService: FilesService) {}

  @MessagePattern('files.upload')
  async upload(@Payload() payload: UploadPayload): Promise<object> {
    try {
      const { file, folder, userId } = payload;
      return await this.filesService.upload(file, folder, userId);
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.logger.error('files.upload error', error);
      throw new RpcException({ statusCode: 500, message: 'Internal server error' });
    }
  }

  @MessagePattern('files.delete')
  async delete(
    @Payload() payload: { key: string; userId: string },
  ): Promise<{ success: boolean; message: string }> {
    try {
      return await this.filesService.delete(payload.key, payload.userId);
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.logger.error('files.delete error', error);
      throw new RpcException({ statusCode: 500, message: 'Internal server error' });
    }
  }

  @MessagePattern('files.get_presigned_url')
  async getPresignedUrl(
    @Payload() payload: { key: string; expiresIn?: number },
  ): Promise<object> {
    try {
      return await this.filesService.getPresignedUrl(payload.key, payload.expiresIn);
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.logger.error('files.get_presigned_url error', error);
      throw new RpcException({ statusCode: 500, message: 'Internal server error' });
    }
  }

  @MessagePattern('files.get_public_url')
  getPublicUrl(@Payload() payload: { key: string }): object {
    try {
      return this.filesService.getPublicUrl(payload.key);
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.logger.error('files.get_public_url error', error);
      throw new RpcException({ statusCode: 500, message: 'Internal server error' });
    }
  }
}
