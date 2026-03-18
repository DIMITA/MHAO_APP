import {
  Controller,
  Get,
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

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@UseInterceptors(TransformInterceptor)
export class AdminController {
  constructor(
    @Inject(MICROSERVICE_TOKENS.ADMIN_SERVICE)
    private readonly adminClient: ClientProxy,
  ) {}

  @Get('providers/pending')
  async getPendingProviders(@CurrentUser() _user: JwtPayload) {
    return firstValueFrom(this.adminClient.send('admin.providers.pending', {}));
  }

  @Patch('providers/:id/verify')
  @HttpCode(HttpStatus.OK)
  async verifyProvider(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: JwtPayload,
  ) {
    return firstValueFrom(
      this.adminClient.send('admin.providers.verify', { id, ...body, adminId: user.sub }),
    );
  }

  @Get('disputes')
  async getDisputes() {
    return firstValueFrom(this.adminClient.send('admin.disputes.list', {}));
  }

  @Patch('disputes/:id/resolve')
  @HttpCode(HttpStatus.OK)
  async resolveDispute(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: JwtPayload,
  ) {
    return firstValueFrom(
      this.adminClient.send('admin.disputes.resolve', { id, ...body, adminId: user.sub }),
    );
  }

  @Get('stats')
  async getStats() {
    return firstValueFrom(this.adminClient.send('admin.stats', {}));
  }
}
