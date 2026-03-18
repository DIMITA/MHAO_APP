import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ReleaseMilestoneDto } from './dto/release-milestone.dto';

@Controller()
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern('payments.initiate')
  async initiate(
    @Payload() payload: { clientId: string; dto: InitiatePaymentDto },
  ) {
    this.logger.log(
      `payments.initiate called for client: ${payload.clientId}, project: ${payload.dto.projectId}`,
    );
    return this.paymentsService.initiate(payload.clientId, payload.dto);
  }

  @MessagePattern('payments.callback')
  async handleCallback(
    @Payload()
    payload: {
      referenceId: string;
      status: string;
      payload: any;
      signature?: string;
    },
  ) {
    this.logger.log(
      `payments.callback called for referenceId: ${payload.referenceId}`,
    );
    return this.paymentsService.handleCallback(payload);
  }

  @MessagePattern('payments.release_milestone')
  async releaseMilestone(
    @Payload() payload: { clientId: string; dto: ReleaseMilestoneDto },
  ) {
    this.logger.log(
      `payments.release_milestone called for client: ${payload.clientId}, ` +
        `payment: ${payload.dto.paymentId}, milestone: ${payload.dto.milestoneId}`,
    );
    return this.paymentsService.releaseMilestone(payload.clientId, payload.dto);
  }

  @MessagePattern('payments.get_status')
  async getStatus(@Payload() payload: { id: string; userId: string }) {
    this.logger.log(
      `payments.get_status called for payment: ${payload.id}, user: ${payload.userId}`,
    );
    return this.paymentsService.getStatus(payload.id, payload.userId);
  }
}
