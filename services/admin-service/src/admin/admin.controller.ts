import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { AdminService } from './admin.service';

type VerifyAction = 'VERIFY' | 'REJECT';
type DisputeResolution = 'REFUND' | 'RELEASE' | 'PARTIAL';

@Controller()
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  @MessagePattern('admin.get_pending_providers')
  async getPendingProviders(
    @Payload() payload: { page?: number; limit?: number },
  ): Promise<object> {
    try {
      return await this.adminService.getPendingProviders(payload);
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.logger.error('admin.get_pending_providers error', error);
      throw new RpcException({ statusCode: 500, message: 'Internal server error' });
    }
  }

  @MessagePattern('admin.verify_provider')
  async verifyProvider(
    @Payload()
    payload: {
      providerId: string;
      adminId: string;
      action: VerifyAction;
      reason?: string;
    },
  ): Promise<object> {
    try {
      const { providerId, adminId, action, reason } = payload;
      return await this.adminService.verifyProvider(providerId, adminId, action, reason);
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.logger.error('admin.verify_provider error', error);
      throw new RpcException({ statusCode: 500, message: 'Internal server error' });
    }
  }

  @MessagePattern('admin.get_disputes')
  async getDisputes(
    @Payload() payload: { page?: number; limit?: number },
  ): Promise<object> {
    try {
      return await this.adminService.getDisputes(payload);
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.logger.error('admin.get_disputes error', error);
      throw new RpcException({ statusCode: 500, message: 'Internal server error' });
    }
  }

  @MessagePattern('admin.resolve_dispute')
  async resolveDispute(
    @Payload()
    payload: {
      projectId: string;
      adminId: string;
      resolution: DisputeResolution;
      reason: string;
    },
  ): Promise<object> {
    try {
      const { projectId, adminId, resolution, reason } = payload;
      return await this.adminService.resolveDispute(projectId, adminId, resolution, reason);
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.logger.error('admin.resolve_dispute error', error);
      throw new RpcException({ statusCode: 500, message: 'Internal server error' });
    }
  }

  @MessagePattern('admin.get_stats')
  async getStats(): Promise<object> {
    try {
      return await this.adminService.getStats();
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.logger.error('admin.get_stats error', error);
      throw new RpcException({ statusCode: 500, message: 'Internal server error' });
    }
  }
}
