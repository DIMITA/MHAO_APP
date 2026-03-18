import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MtnMomoService } from './mtn-momo.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, MtnMomoService],
})
export class PaymentsModule {}
