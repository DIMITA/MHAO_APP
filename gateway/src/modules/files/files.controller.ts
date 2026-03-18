import {
  Controller,
  Post,
  Delete,
  Param,
  Inject,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICE_TOKENS } from '../../config/microservices.config';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@Controller('files')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
export class FilesController {
  constructor(
    @Inject(MICROSERVICE_TOKENS.FILES_SERVICE)
    private readonly filesClient: ClientProxy,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async upload(
    @UploadedFile() file: Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return firstValueFrom(
      this.filesClient.send('files.upload', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        buffer: file.buffer.toString('base64'),
        size: file.size,
        uploadedBy: user.sub,
      }),
    );
  }

  @Delete(':key')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('key') key: string, @CurrentUser() user: JwtPayload) {
    return firstValueFrom(
      this.filesClient.send('files.delete', { key, userId: user.sub }),
    );
  }
}
