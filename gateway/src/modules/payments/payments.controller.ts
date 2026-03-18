import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICE_TOKENS } from '../../config/microservices.config';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@Controller('payments')
@UseInterceptors(TransformInterceptor)
export class PaymentsController {
  constructor(
    @Inject(MICROSERVICE_TOKENS.PAYMENTS_SERVICE)
    private readonly paymentsClient: ClientProxy,
  ) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.CREATED)
  async initiate(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return firstValueFrom(
      this.paymentsClient.send('payments.initiate', { ...body, clientId: user.sub }),
    );
  }

  @Post('mobile-money/callback')
  @HttpCode(HttpStatus.OK)
  async mobileMoneyCb(
    @Body() body: Record<string, unknown>,
    @Headers('x-webhook-secret') secret: string,
  ) {
    return firstValueFrom(
      this.paymentsClient.send('payments.mobile_money_callback', { ...body, secret }),
    );
  }

  @Post(':id/release/:milestoneId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.OK)
  async releaseMilestone(
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return firstValueFrom(
      this.paymentsClient.send('payments.release_milestone', {
        paymentId: id,
        milestoneId,
        clientId: user.sub,
      }),
    );
  }

  @Get(':id/status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return firstValueFrom(
      this.paymentsClient.send('payments.get_status', { id, userId: user.sub, role: user.role }),
    );
  }
}
