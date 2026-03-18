import { Injectable, Logger } from '@nestjs/common';
import { RpcException, ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { MtnMomoService } from './mtn-momo.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ReleaseMilestoneDto } from './dto/release-milestone.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private notificationsClient: ClientProxy;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mtnMomoService: MtnMomoService,
  ) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const url = new URL(redisUrl);

    this.notificationsClient = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: {
        host: url.hostname,
        port: parseInt(url.port) || 6379,
        password: url.password || undefined,
      },
    });
  }

  async initiate(clientId: string, dto: InitiatePaymentDto) {
    const { projectId, quoteId, phoneNumber, provider, milestones } = dto;

    // Verify the quote exists, is ACCEPTED, and belongs to client's project
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        project: true,
        provider: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!quote) {
      throw new RpcException({
        statusCode: 404,
        message: `Quote with id ${quoteId} not found`,
      });
    }

    if (quote.status !== 'ACCEPTED') {
      throw new RpcException({
        statusCode: 400,
        message: 'Payment can only be initiated for an ACCEPTED quote',
      });
    }

    if (quote.projectId !== projectId) {
      throw new RpcException({
        statusCode: 400,
        message: 'Quote does not belong to the specified project',
      });
    }

    if (quote.project.clientId !== clientId) {
      throw new RpcException({
        statusCode: 403,
        message: 'You do not have permission to initiate payment for this project',
      });
    }

    // Check if a payment already exists for this project
    const existingPayment = await this.prisma.payment.findUnique({
      where: { projectId },
    });

    if (existingPayment) {
      throw new RpcException({
        statusCode: 409,
        message: 'A payment already exists for this project',
      });
    }

    // Validate milestones total equals quote amount
    const totalMilestones = milestones.reduce(
      (sum, m) => sum + m.amount,
      0,
    );

    const tolerance = 0.01; // Allow small floating-point tolerance
    if (Math.abs(totalMilestones - quote.amount) > tolerance) {
      throw new RpcException({
        statusCode: 400,
        message: `Milestone amounts total (${totalMilestones}) must equal quote amount (${quote.amount})`,
      });
    }

    // Simulate MTN MoMo payment call
    const externalId = uuidv4();
    const momoResult = await this.simulateMtnMomoPayment(
      phoneNumber,
      quote.amount,
      externalId,
    );

    // Create Payment record in transaction with Milestones
    const payment = await this.prisma.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
        data: {
          projectId,
          quoteId,
          escrowAmount: quote.amount,
          releasedAmount: 0,
          mobileMoneyRef: momoResult.referenceId,
          mobileMoneyPhone: phoneNumber,
          mobileMoneyProv: provider as any,
          status: 'IN_ESCROW',
          milestones: {
            create: milestones.map((m) => ({
              title: m.title,
              description: m.description,
              amount: m.amount,
              order: m.order,
              status: 'PENDING',
            })),
          },
        },
        include: {
          milestones: {
            orderBy: { order: 'asc' },
          },
          project: {
            select: {
              id: true,
              title: true,
              clientId: true,
              status: true,
            },
          },
        },
      });

      return newPayment;
    });

    // Notify provider about payment in escrow
    try {
      this.notificationsClient.emit('notifications.payment_in_escrow', {
        providerId: quote.providerId,
        clientId,
        projectId,
        paymentId: payment.id,
        amount: quote.amount,
        projectTitle: quote.project.title,
      });
    } catch (err) {
      this.logger.warn('Failed to emit payment_in_escrow notification', err);
    }

    return payment;
  }

  async handleCallback(data: {
    referenceId: string;
    status: string;
    payload: any;
    signature?: string;
  }) {
    const { referenceId, status, payload, signature } = data;

    // Validate signature (basic MVP validation)
    const isValid = this.mtnMomoService.validateCallbackSignature(
      payload,
      signature,
    );

    if (!isValid) {
      throw new RpcException({
        statusCode: 401,
        message: 'Invalid callback signature',
      });
    }

    // Find payment by mobileMoneyRef
    const payment = await this.prisma.payment.findFirst({
      where: { mobileMoneyRef: referenceId },
      include: {
        project: {
          select: { id: true, clientId: true },
        },
      },
    });

    if (!payment) {
      this.logger.warn(
        `Callback received for unknown referenceId: ${referenceId}`,
      );
      return { received: true, matched: false };
    }

    // Update payment status based on callback
    let newPaymentStatus = payment.status;

    if (status === 'SUCCESSFUL' && payment.status === 'PENDING') {
      newPaymentStatus = 'IN_ESCROW';
    } else if (status === 'FAILED') {
      newPaymentStatus = 'FAILED';
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newPaymentStatus,
        callbackData: payload,
      },
      include: {
        milestones: true,
      },
    });

    // Emit notification for payment status change
    try {
      this.notificationsClient.emit('notifications.payment_callback', {
        clientId: payment.project.clientId,
        projectId: payment.projectId,
        paymentId: payment.id,
        status: newPaymentStatus,
      });
    } catch (err) {
      this.logger.warn('Failed to emit payment_callback notification', err);
    }

    return { received: true, matched: true, payment: updatedPayment };
  }

  async releaseMilestone(
    clientId: string,
    dto: ReleaseMilestoneDto,
  ) {
    const { paymentId, milestoneId } = dto;

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        milestones: { orderBy: { order: 'asc' } },
        project: {
          select: {
            id: true,
            clientId: true,
            title: true,
          },
        },
      },
    });

    if (!payment) {
      throw new RpcException({
        statusCode: 404,
        message: `Payment with id ${paymentId} not found`,
      });
    }

    // Verify client owns the project
    if (payment.project.clientId !== clientId) {
      throw new RpcException({
        statusCode: 403,
        message: 'You do not have permission to release milestones for this payment',
      });
    }

    if (payment.status !== 'IN_ESCROW' && payment.status !== 'PARTIALLY_RELEASED') {
      throw new RpcException({
        statusCode: 400,
        message: `Cannot release milestone for payment with status ${payment.status}`,
      });
    }

    const milestone = payment.milestones.find((m) => m.id === milestoneId);

    if (!milestone) {
      throw new RpcException({
        statusCode: 404,
        message: `Milestone with id ${milestoneId} not found in payment`,
      });
    }

    if (milestone.status !== 'PENDING' && milestone.status !== 'APPROVED') {
      throw new RpcException({
        statusCode: 400,
        message: `Cannot release a milestone with status ${milestone.status}`,
      });
    }

    // Update milestone to PAID and recalculate released amount
    const newReleasedAmount = payment.releasedAmount + milestone.amount;

    // Check if all milestones will be paid
    const otherUnpaid = payment.milestones.filter(
      (m) => m.id !== milestoneId && m.status !== 'PAID',
    );
    const allPaid = otherUnpaid.length === 0;

    const updatedPayment = await this.prisma.$transaction(async (tx) => {
      // Mark milestone as PAID
      await tx.milestone.update({
        where: { id: milestoneId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });

      // Update payment released amount and status
      const paymentUpdate = await tx.payment.update({
        where: { id: paymentId },
        data: {
          releasedAmount: newReleasedAmount,
          status: allPaid ? 'RELEASED' : 'PARTIALLY_RELEASED',
        },
        include: {
          milestones: { orderBy: { order: 'asc' } },
          project: {
            select: { id: true, title: true, clientId: true },
          },
        },
      });

      // If all milestones paid, set project to COMPLETED
      if (allPaid) {
        await tx.project.update({
          where: { id: payment.projectId },
          data: { status: 'COMPLETED' },
        });
      }

      return paymentUpdate;
    });

    // Get provider info to send notification
    const quote = await this.prisma.quote.findFirst({
      where: { id: payment.quoteId },
      select: { providerId: true },
    });

    // Notify provider about milestone release
    try {
      this.notificationsClient.emit('notifications.milestone_released', {
        providerId: quote?.providerId,
        clientId,
        projectId: payment.projectId,
        paymentId: payment.id,
        milestoneId,
        milestoneTitle: milestone.title,
        amount: milestone.amount,
        projectTitle: payment.project.title,
        allPaid,
      });
    } catch (err) {
      this.logger.warn('Failed to emit milestone_released notification', err);
    }

    return updatedPayment;
  }

  async getStatus(id: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        milestones: { orderBy: { order: 'asc' } },
        project: {
          select: {
            id: true,
            title: true,
            clientId: true,
            status: true,
          },
        },
      },
    });

    if (!payment) {
      throw new RpcException({
        statusCode: 404,
        message: `Payment with id ${id} not found`,
      });
    }

    // Verify user has access (client or provider of this project)
    const isClient = payment.project.clientId === userId;

    if (!isClient) {
      // Check if user is the provider via quote
      const isProvider = await this.prisma.quote.findFirst({
        where: {
          id: payment.quoteId,
          providerId: userId,
        },
      });

      if (!isProvider) {
        throw new RpcException({
          statusCode: 403,
          message: 'You do not have access to this payment',
        });
      }
    }

    return payment;
  }

  /**
   * Simulates an MTN MoMo payment for MVP.
   * Logs the call and returns a mock successful response.
   * In production, this would call the real MTN MoMo Collections API.
   */
  async simulateMtnMomoPayment(
    phoneNumber: string,
    amount: number,
    externalId: string,
  ): Promise<{ referenceId: string; status: 'SUCCESSFUL' }> {
    this.logger.log(
      `[MOMO SIMULATION] Initiating payment: phone=${phoneNumber}, amount=${amount}, externalId=${externalId}`,
    );

    const result = await this.mtnMomoService.requestToPay(
      phoneNumber,
      amount,
      'XOF',
      externalId,
    );

    this.logger.log(
      `[MOMO SIMULATION] Payment result: referenceId=${result.referenceId}, status=${result.status}`,
    );

    return {
      referenceId: result.referenceId,
      status: 'SUCCESSFUL',
    };
  }
}
