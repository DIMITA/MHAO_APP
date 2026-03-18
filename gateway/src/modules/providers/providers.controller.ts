import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Inject,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICE_TOKENS } from '../../config/microservices.config';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@Controller('providers')
@UseInterceptors(TransformInterceptor)
export class ProvidersController {
  constructor(
    @Inject(MICROSERVICE_TOKENS.PROJECTS_SERVICE)
    private readonly projectsClient: ClientProxy,
  ) {}

  @Get()
  async findAll() {
    return firstValueFrom(this.projectsClient.send('providers.find_all', {}));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.projectsClient.send('providers.find_one', { id }));
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.OK)
  async requestVerification(
    @CurrentUser() user: JwtPayload,
    @Body() body: Record<string, unknown>,
  ) {
    return firstValueFrom(
      this.projectsClient.send('providers.request_verification', {
        ...body,
        providerId: user.sub,
      }),
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: Record<string, unknown>,
  ) {
    return firstValueFrom(
      this.projectsClient.send('providers.update', { id, ...body, userId: user.sub }),
    );
  }
}
